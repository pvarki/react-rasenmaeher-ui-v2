# React + TypeScript + Vite

## The ODMDM connector download

The MDM page offers the ODMDM connector for download when the image carries a connector release's
`mdm-connector/` folder. Pin one release with two build arguments, both or neither:

```bash
docker build --target k8s_nginx \
  --build-arg MDM_CONNECTOR_URL=<the release's mdm-connector archive (.tar.gz)> \
  --build-arg MDM_CONNECTOR_SHA256=<its SHA-256 from the release> .
```

The build fetches exactly that archive, fails on any other SHA-256, and unpacks only the plain
files of its `mdm-connector/` folder that `connector.json` names, with their sizes and SHA-256
(`docker/mdm_connector.py`). Without the arguments the image has no `mdm-connector/` and the page
shows no download. nginx answers 404 for a missing file there, never the app's page. The image
build first runs `python3 -I docker/mdm_connector.py --self-test`, which proves each refusal on
archives made in memory; run it the same way after changing the script.

The archive is the connector release's `mdm-connector.tar.gz`, with its SHA-256 in
`mdm-connector.tar.gz.sha256` beside it (the connector's README, 'Building and serving the files'):

```text
https://github.com/pvarki/python-odmdm-fleet/releases/download/v<version>/mdm-connector.tar.gz
https://github.com/pvarki/python-odmdm-fleet/releases/download/v<version>/mdm-connector.tar.gz.sha256
```

Pin one tag, never `latest`, and take `MDM_CONNECTOR_SHA256` from that `.sha256`. The images CI
publishes are pinned in `env` at the top of `.github/workflows/pull_request.yml` and
`push_to_main.yml`: change both values in both files together. The same
release also lists each file's SHA-256 in `SHA256SUMS`: that is what the SHA-256 the MDM page's
dialog shows can be compared with.

## Git Conventions

### Feature Branches

Use feature branches for all development work. Name them like `modular-ui/<shortened-task-name>-dev`.

**Example:**

```bash
git checkout -b modular-ui/translations-dev
```

### Conventional Commits

This project uses [Conventional Commits](https://cheatography.com/finuex/cheat-sheets/conventional-commits-1-0/) with a specific scope format.

**Scope format:** `(mod-ui/<shortened-task-name>)`

**Examples:**

```bash
feat(mod-ui/translations): added translations
fix(mod-ui/auth): resolved login timeout issue
docs(mod-ui/api): updated API documentation
```

Keep commit descriptions short but descriptive enough for others to understand what was done.

### Code Quality

- Avoid accumulating 300+ `#FIXME` or `#TODO` comments
- If you need to add a temporary fix or TODO, create a GitHub issue and link to it
- Fix issues immediately rather than deferring them

**Recommended reading:** [Git Best Practices](https://github.com/pvarki/markdown-pvarki-best_practises/blob/main/git.md)

### Versioning

Versioning is handled with [bump-my-version](https://github.com/callowayproject/bump-my-version). To increment, use `bump-my-version bump <patch/minor/major>`.

You can use `bump-my-version show-bump` to see how each option would affect the version.

#### Pre-Commit

Hooks are managed via [prek](https://github.com/j178/prek) using the shared
config from
[pvarki/config-ci-library](https://github.com/pvarki/config-ci-library/tree/typescript-config).
prek is included as a dev dependency, so after `pnpm install` run:

```bash
pnpm exec prek install
```

To run all hooks against every file:

```bash
pnpm exec prek run --all-files
```
