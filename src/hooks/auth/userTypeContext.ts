import { createContext } from "react";

interface UserTypeContextProps {
  userType: "admin" | "user" | null;
  isLoading: boolean;
  error: string | null;
  authType: "mtls" | "jwt" | null;
  otpVerified: boolean;
  setOtpVerified: (verified: boolean) => void;
  redirectTo?: string | null;
  callsign: string | null;
  isValidUser: boolean;
}

export const UserTypeContext = createContext<UserTypeContextProps>({
  userType: null,
  isLoading: true,
  error: null,
  authType: null,
  otpVerified: false,
  setOtpVerified: () => {
    // Placeholder function
  },
  redirectTo: null,
  callsign: null,
  isValidUser: false,
});
