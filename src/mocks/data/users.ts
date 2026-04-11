export interface MockUser {
  callsign: string;
  roles: string[];
  extre: unknown;
}

export const initialUsers: MockUser[] = [
  { callsign: "JanneJaeger", roles: ["admin"], extre: null },
  { callsign: "fighter420", roles: [], extre: null },
  { callsign: "TacticalTina", roles: [], extre: null },
  { callsign: "SilentStrike", roles: [], extre: null },
  { callsign: "NorthernWolf", roles: ["admin"], extre: null },
];
