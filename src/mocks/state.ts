/**
 * Mock state manager — persists to sessionStorage so refreshes don't reset progress.
 * Resets per browser tab (clean demo experience).
 */

import { initialUsers, type MockUser } from "./data/users";
import { initialEnrollments, type MockEnrollment } from "./data/enrollments";
import { initialInviteCodes, type MockInviteCode } from "./data/inviteCodes";

const STORAGE_KEY = "rasse-mock-state";

export interface MockState {
  // Current session user
  currentCallsign: string | null;
  currentRole: "admin" | "user" | null;
  isAuthenticated: boolean;
  jwt: string | null;

  // Data
  users: MockUser[];
  enrollments: MockEnrollment[];
  inviteCodes: MockInviteCode[];

  // Counters for generating unique IDs
  inviteCounter: number;
}

function getDefaultState(): MockState {
  return {
    currentCallsign: null,
    currentRole: null,
    isAuthenticated: false,
    jwt: null,
    users: JSON.parse(JSON.stringify(initialUsers)),
    enrollments: JSON.parse(JSON.stringify(initialEnrollments)),
    inviteCodes: JSON.parse(JSON.stringify(initialInviteCodes)),
    inviteCounter: 100,
  };
}

let _state: MockState | null = null;

function load(): MockState {
  if (_state) return _state;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      _state = JSON.parse(raw) as MockState;
      return _state;
    }
  } catch {
    // corrupted — reset
  }
  _state = getDefaultState();
  save();
  return _state;
}

function save() {
  if (_state) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(_state));
  }
}

// ──── Public API ────

export function getState(): MockState {
  return load();
}

export function updateState(partial: Partial<MockState>) {
  const s = load();
  Object.assign(s, partial);
  save();
}

export function resetState() {
  _state = getDefaultState();
  save();
  // Also clear localStorage items the real app uses
  localStorage.removeItem("token");
  localStorage.removeItem("callsign");
  localStorage.removeItem("approveCode");
}

// ──── Helpers ────

export function generateMockJwt(callsign: string): string {
  // Fake JWT — just base64-encoded JSON, not cryptographically valid
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      sub: callsign,
      iss: "mock-rasenmaeher",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400,
      CN: callsign,
    }),
  );
  const sig = btoa("mock-signature");
  return `${header}.${payload}.${sig}`;
}

export function generateInviteCode(): string {
  const s = load();
  s.inviteCounter++;
  save();
  const words = [
    "ALPHA",
    "BRAVO",
    "CHARLIE",
    "DELTA",
    "ECHO",
    "FOXTROT",
    "GOLF",
    "HOTEL",
    "INDIA",
    "JULIET",
    "KILO",
    "LIMA",
  ];
  const w1 = words[Math.floor(Math.random() * words.length)];
  const w2 = words[Math.floor(Math.random() * words.length)];
  return `${w1}-${w2}-${s.inviteCounter}`;
}

export function generateApproveCode(callsign: string): string {
  const prefix = callsign.substring(0, 4).toUpperCase();
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${num}`;
}
