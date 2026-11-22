/** The devices Deploy App lists on its MDM page, read from the people list */

export interface MdmDevice {
  /** The name the MDM gave the device, which became its callsign */
  callsign: string;
  /** When the device's certificate stops being valid; null when Deploy App does not say */
  certEnds: Date | null;
}

interface Person {
  callsign: string;
  extra?: { mdm?: boolean } | null;
  cert_ends?: string | null;
}

/** A time Deploy App wrote, or null for none and for one that is not a time */
function readTime(value: unknown): Date | null {
  if (typeof value !== "string" || !value) return null;
  const time = new Date(value);
  return Number.isNaN(time.getTime()) ? null : time;
}

/** The people that enrolled through the MDM, as devices */
export function mdmDevices(people: Person[]): MdmDevice[] {
  return people
    .filter((person) => person.extra?.mdm)
    .map((person) => ({
      callsign: person.callsign,
      certEnds: readTime(person.cert_ends),
    }));
}
