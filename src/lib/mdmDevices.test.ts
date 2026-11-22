import { describe, expect, it } from "vitest";
import { mdmDevices } from "./mdmDevices";

describe("mdmDevices", () => {
  it("lists only what enrolled through the MDM", () => {
    const people = [
      { callsign: "OTTERHQ", extra: null },
      { callsign: "OTTER1", extra: { mdm: true } },
      { callsign: "PERSON1", extra: { mdm: false } },
      { callsign: "PERSON2" },
    ];

    expect(mdmDevices(people).map((device) => device.callsign)).toEqual([
      "OTTER1",
    ]);
  });

  it("reads when a device's certificate ends", () => {
    const [device] = mdmDevices([
      {
        callsign: "OTTER1",
        extra: { mdm: true },
        cert_ends: "2027-11-20T09:15:00+00:00",
      },
    ]);

    expect(device.certEnds?.toISOString()).toBe("2027-11-20T09:15:00.000Z");
  });

  it.each([undefined, null, "", "soon"])(
    "has no end when Deploy App says %s",
    (value) => {
      const [device] = mdmDevices([
        { callsign: "OTTER1", extra: { mdm: true }, cert_ends: value },
      ]);

      expect(device.certEnds).toBeNull();
    },
  );
});
