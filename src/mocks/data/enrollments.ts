export interface MockEnrollment {
  callsign: string;
  approvecode: string;
  state: 0 | 1 | 2; // 0=PENDING, 1=APPROVED, 2=REJECTED
}

export const initialEnrollments: MockEnrollment[] = [
  { callsign: "JanneJaeger", approvecode: "JNNE-4821", state: 1 },
  { callsign: "fighter420", approvecode: "FGHT-7733", state: 1 },
  { callsign: "TacticalTina", approvecode: "TCTN-9912", state: 1 },
  { callsign: "SilentStrike", approvecode: "SLNT-3344", state: 1 },
  { callsign: "NorthernWolf", approvecode: "NRTH-5566", state: 1 },
  { callsign: "ReconRick", approvecode: "RCNR-1100", state: 0 },
  { callsign: "ShadowFox", approvecode: "SHDF-2288", state: 0 },
  { callsign: "IronEagle", approvecode: "IRNE-4455", state: 0 },
];
