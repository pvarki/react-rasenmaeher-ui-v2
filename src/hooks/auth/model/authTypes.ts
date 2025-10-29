export interface AuthResponse {
  auth?: string;
}

export interface ValidUserResponse {
  isValidUser?: boolean;
  callsign?: string;
}

export interface AdminResponse {
  isAdmin?: boolean;
}
