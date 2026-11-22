"""Put a released ODMDM connector folder beside the built app, as the MDM page offers it

    python3 -I docker/mdm_connector.py URL SHA256 DIST
    python3 -I docker/mdm_connector.py --self-test

Fetches the connector release's archive from URL (http or https), refuses it unless its SHA-256
is SHA256, and writes the plain files of its one folder, mdm-connector/, to DIST/mdm-connector/.
Nothing else in the archive is accepted: no links, no other folder, no name that is not a bare
file name, and every file but connector.json must be one that connector.json names, with the
size and SHA-256 it gives, so the page shows exactly the bytes it serves.

--self-test runs every refusal against archives made in memory, in a temporary folder it
removes, without the network; the image build runs it before the script is used.
"""

import hashlib
import hmac
import io
import json
import re
import sys
import tarfile
import tempfile
import urllib.parse
import urllib.request
from collections.abc import Callable
from pathlib import Path

FOLDER = "mdm-connector"
MANIFEST = "connector.json"
#: The UI's own rule for a file's name (src/lib/mdmConnectorFiles.ts)
FILE_NAME = re.compile(r"[A-Za-z0-9_+-][A-Za-z0-9._+-]{0,119}")
SHA256 = re.compile(r"[0-9a-f]{64}")
#: Far more than the connector's files for every system together
MAX_ARCHIVE_BYTES = 1_000_000_000


class ConnectorError(Exception):
    """An archive that is not exactly the connector's folder"""


def fetch(url: str) -> bytes:
    """The archive's bytes, from http or https only"""
    if urllib.parse.urlsplit(url).scheme not in ("http", "https"):
        raise ConnectorError(f"{url} is not an http or https address")
    with urllib.request.urlopen(url, timeout=120) as response:
        data = response.read(MAX_ARCHIVE_BYTES + 1)
    if len(data) > MAX_ARCHIVE_BYTES:
        raise ConnectorError(f"{url} is larger than {MAX_ARCHIVE_BYTES} bytes")
    return data


def files_of(archive: bytes) -> dict[str, bytes]:
    """Each plain file of the archive's mdm-connector/ folder by its bare name"""
    files: dict[str, bytes] = {}
    with tarfile.open(fileobj=io.BytesIO(archive), mode="r:*") as tar:
        for member in tar:
            name = member.name.removeprefix("./").rstrip("/")
            if member.isdir() and name == FOLDER:
                continue
            folder, _, bare = name.partition("/")
            if not member.isfile() or folder != FOLDER or not FILE_NAME.fullmatch(bare) or bare in files:
                raise ConnectorError(f"{member.name!r} is not a plain file of {FOLDER}/")
            extracted = tar.extractfile(member)
            if extracted is None:
                raise ConnectorError(f"{member.name!r} cannot be read")
            files[bare] = extracted.read()
    return files


def check(files: dict[str, bytes]) -> None:
    """Every file is one that connector.json names, as it names it, and it names none missing"""
    if MANIFEST not in files:
        raise ConnectorError(f"{FOLDER}/{MANIFEST} is missing")
    manifest = json.loads(files[MANIFEST])
    named = {entry["file"]: entry for entry in manifest["files"]}
    if len(named) != len(manifest["files"]):
        raise ConnectorError(f"{MANIFEST} names a file twice")
    if set(named) != set(files) - {MANIFEST}:
        raise ConnectorError(f"{MANIFEST} names {sorted(named)}, the folder holds {sorted(set(files) - {MANIFEST})}")
    for name, entry in named.items():
        if entry["size"] != len(files[name]) or entry["sha256"] != hashlib.sha256(files[name]).hexdigest():
            raise ConnectorError(f"{name} is not the file {MANIFEST} describes")


def unpack(archive: bytes, expected: str, dist: Path) -> Path:
    """Write the archive's folder to DIST/mdm-connector/ if it has the SHA-256 expected and passes every check"""
    if not SHA256.fullmatch(expected):
        raise ConnectorError(f"{expected!r} is not a lower-case hex SHA-256")
    actual = hashlib.sha256(archive).hexdigest()
    if not hmac.compare_digest(actual, expected):
        raise ConnectorError(f"the archive has SHA-256 {actual}, not {expected}")
    files = files_of(archive)
    check(files)
    target = dist / FOLDER
    target.mkdir(mode=0o755)
    for name, data in files.items():
        (target / name).write_bytes(data)
        (target / name).chmod(0o644)
    return target


def _archive(entries: list[tuple[str, bytes | None, bytes]]) -> bytes:
    """A .tar.gz of (name, contents, type) entries; contents None makes a directory"""
    buffer = io.BytesIO()
    with tarfile.open(fileobj=buffer, mode="w:gz") as tar:
        for name, data, kind in entries:
            info = tarfile.TarInfo(name)
            if data is None:
                info.type, info.mode = tarfile.DIRTYPE, 0o755
                tar.addfile(info)
            elif kind != tarfile.REGTYPE:
                info.type, info.linkname = kind, data.decode()
                tar.addfile(info)
            else:
                info.size = len(data)
                tar.addfile(info, io.BytesIO(data))
    return buffer.getvalue()


def _manifest(files: dict[str, bytes], **override: dict[str, object]) -> bytes:
    """connector.json naming FILES as the release does, with OVERRIDE's entries changed or added"""
    entries = {
        name: {"file": name, "size": len(data), "sha256": hashlib.sha256(data).hexdigest()}
        for name, data in files.items()
    }
    for name, fields in override.items():
        entries.setdefault(name, {"file": name}).update(fields)
    return json.dumps({"version": "0.0.0", "files": list(entries.values())}).encode()


def self_test() -> int:
    """Every refusal, and the one good case, against archives made in memory"""
    zip_name, pyz_name = "odmdm-connector-0.0.0+1-macos-arm64.zip", "odmdm-connector-0.0.0+1.pyz"
    good = {zip_name: b"zip bytes", pyz_name: b"pyz bytes"}
    reg = tarfile.REGTYPE

    def folder(manifest: bytes, *extra: tuple[str, bytes | None, bytes]) -> bytes:
        files = [(f"{FOLDER}/{name}", data, reg) for name, data in good.items()]
        return _archive([(FOLDER, None, reg), (f"{FOLDER}/{MANIFEST}", manifest, reg), *files, *extra])

    plain = _manifest(good)
    twice = json.loads(plain)
    twice["files"].append(twice["files"][-1])
    cases: dict[str, bytes] = {
        "a symbolic link": folder(plain, (f"{FOLDER}/evil", b"/etc/passwd", tarfile.SYMTYPE)),
        "a hard link": folder(plain, (f"{FOLDER}/evil", f"{FOLDER}/{pyz_name}".encode(), tarfile.LNKTYPE)),
        "a nested path": folder(plain, (f"{FOLDER}/sub/x", b"x", reg)),
        "a parent path": folder(plain, (f"{FOLDER}/../x", b"x", reg)),
        "an absolute path": folder(plain, (f"/{FOLDER}/x", b"x", reg)),
        "a second top-level folder": folder(plain, ("other", None, reg), ("other/x", b"x", reg)),
        "a file the manifest does not name": folder(plain, (f"{FOLDER}/extra.zip", b"x", reg)),
        "a manifest naming a missing file": folder(_manifest(good, **{"gone.zip": {"size": 1, "sha256": "0" * 64}})),
        "a manifest naming a file twice": folder(json.dumps(twice).encode()),
        "a wrong size": folder(_manifest(good, **{pyz_name: {"size": len(good[pyz_name]) + 1}})),
        "a wrong per-file SHA-256": folder(_manifest(good, **{pyz_name: {"sha256": "0" * 64}})),
        "a name outside the pattern": folder(plain, (f"{FOLDER}/.hidden", b"x", reg)),
        "a duplicate": folder(plain, (f"{FOLDER}/{pyz_name}", good[pyz_name], reg)),
        "no manifest": _archive([(f"{FOLDER}/{name}", data, reg) for name, data in good.items()]),
    }
    good_archive = folder(plain)
    good_sha = hashlib.sha256(good_archive).hexdigest()
    checks: list[tuple[str, Callable[[Path], object]]] = [
        (f"refuses {what}", lambda dist, archive=archive: unpack(archive, hashlib.sha256(archive).hexdigest(), dist))
        for what, archive in cases.items()
    ]
    checks += [
        ("refuses a wrong archive SHA-256", lambda dist: unpack(good_archive, "0" * 64, dist)),
        ("refuses an upper-case SHA-256", lambda dist: unpack(good_archive, good_sha.upper(), dist)),
        ("refuses an address that is not http or https", lambda _dist: fetch("file:///etc/passwd")),
    ]
    failed = 0
    with tempfile.TemporaryDirectory(prefix="mdm-connector-self-test-") as scratch:
        for number, (what, run) in enumerate(checks):
            dist = Path(scratch) / str(number)
            dist.mkdir()
            try:
                run(dist)
            except ConnectorError:
                if any(dist.iterdir()):
                    failed += 1
                    print(f"FAIL {what}: refused, but wrote {sorted(p.name for p in dist.iterdir())}", file=sys.stderr)
                continue
            except Exception as error:  # noqa: BLE001 -- any other failure is a refusal the script does not make
                failed += 1
                print(f"FAIL {what}: {type(error).__name__}: {error}", file=sys.stderr)
                continue
            failed += 1
            print(f"FAIL {what}: accepted", file=sys.stderr)
        dist = Path(scratch) / "good"
        dist.mkdir()
        try:
            target = unpack(good_archive, good_sha, dist)
            written = {path.name: path.read_bytes() for path in target.iterdir()}
            if written != {**good, MANIFEST: plain} or any(p.stat().st_mode & 0o777 != 0o644 for p in target.iterdir()):
                raise ConnectorError(f"wrote {sorted(written)}, not the folder's files as 0644")
        except ConnectorError as error:
            failed += 1
            print(f"FAIL accepts the good folder: {error}", file=sys.stderr)
    total = len(checks) + 1
    if failed:
        print(f"mdm-connector self-test: {failed} of {total} cases FAILED", file=sys.stderr)
        return 1
    print(f"mdm-connector self-test: {total} cases passed (the good folder, {len(checks)} refusals)")
    return 0


def main(argv: list[str]) -> int:
    """Fetch, verify and unpack, or say why not"""
    if argv[1:] == ["--self-test"]:
        return self_test()
    if len(argv) != 4:
        print(__doc__, file=sys.stderr)
        return 2
    url, expected, dist = argv[1], argv[2], Path(argv[3])
    try:
        if not SHA256.fullmatch(expected):
            raise ConnectorError(f"{expected!r} is not a lower-case hex SHA-256")
        target = unpack(fetch(url), expected, dist)
    except (ConnectorError, OSError, tarfile.TarError, ValueError, KeyError, TypeError) as error:
        print(f"mdm-connector: {url}: {error}", file=sys.stderr)
        return 1
    print(f"mdm-connector: {len(list(target.iterdir()))} files of {url} ({expected}) in {target}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
