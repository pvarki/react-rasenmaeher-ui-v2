export interface MockInviteCode {
  invitecode: string;
  active: boolean;
  owner_cs: string;
  created: string;
}

export const initialInviteCodes: MockInviteCode[] = [
  {
    invitecode: "ALPHA-BRAVO-7742",
    active: true,
    owner_cs: "JanneJaeger",
    created: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    invitecode: "CHARLIE-DELTA-9981",
    active: true,
    owner_cs: "JanneJaeger",
    created: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    invitecode: "ECHO-FOXTROT-1234",
    active: false,
    owner_cs: "NorthernWolf",
    created: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    invitecode: "GOLF-HOTEL-5566",
    active: true,
    owner_cs: "NorthernWolf",
    created: new Date(Date.now() - 3600000).toISOString(),
  },
];
