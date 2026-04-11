"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { UserTypeContext } from "./userTypeContext";

const isMock = import.meta.env.VITE_MOCK === "true";

interface AuthResponse {
  type: "mtls" | "jwt";
  userid: string;
  payload: {
    CN: string;
  };
}

interface ValidUserResponse {
  isValidUser: boolean;
  userid: string;
}

export function UserTypeFetcher({ children }: { children: ReactNode }) {
  const [userType, setUserType] = useState<"admin" | "user" | null>(
    isMock ? null : null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authType, setAuthType] = useState<"mtls" | "jwt" | null>(null);
  const [callsign, setCallsign] = useState<string | null>(null);
  const [isValidUser, setIsValidUser] = useState<boolean>(false);
  const [otpVerified, setIsOtpVerified] = useState<boolean>(false);

  const setOtpVerified = useCallback((verified: boolean) => {
    setIsOtpVerified(verified);
  }, []);

  useEffect(() => {
    // ── Mock mode: read state from sessionStorage, never call APIs ──
    if (isMock) {
      const raw = sessionStorage.getItem("rasse-mock-state");
      if (raw) {
        try {
          const mockState = JSON.parse(raw);
          if (mockState.isAuthenticated && mockState.currentCallsign) {
            setAuthType("jwt");
            setCallsign(mockState.currentCallsign);
            setIsValidUser(true);
            setUserType(mockState.currentRole || "admin");
            setIsLoading(false);
            return;
          }
        } catch {
          // ignore parse errors
        }
      }
      // Not authenticated in mock — redirect to login
      setIsLoading(false);
      setUserType(null);
      setIsValidUser(false);
      const currentPath = window.location.pathname;
      if (
        !currentPath.startsWith("/login") &&
        !currentPath.startsWith("/waiting-room") &&
        !currentPath.startsWith("/mtls-install") &&
        !currentPath.startsWith("/callsign-setup")
      ) {
        window.location.href = "/login";
      }
      return;
    }

    // ── Real mode: call APIs ──
    async function fetchUserType() {
      try {
        const jwt = localStorage.getItem("token");

        const headers = jwt ? { Authorization: `Bearer ${jwt}` } : undefined;
        const authResponse = await fetch("/api/v1/check-auth/mtls_or_jwt", {
          headers,
          credentials: "include",
        });

        if (authResponse.status === 403 || !authResponse.ok) {
          setAuthType(null);
          setIsLoading(false);
          setUserType(null);
          setIsValidUser(false);
          // Only redirect if not already on login or auth pages
          const currentPath = window.location.pathname;
          if (
            !currentPath.startsWith("/login") &&
            !currentPath.startsWith("/waiting-room") &&
            !currentPath.startsWith("/mtls-install")
          ) {
            window.location.href = "/login";
          }
          return;
        }

        const authData = (await authResponse.json()) as AuthResponse;
        setAuthType(authData.type);

        if (authData.type) {
          const validUserResponse = await fetch(
            "/api/v1/check-auth/validuser",
            { headers, credentials: "include" },
          );

          if (validUserResponse.ok) {
            const validUserData =
              (await validUserResponse.json()) as ValidUserResponse;

            setIsValidUser(true);
            setCallsign(validUserData.userid);
            setUserType("user");

            const adminResponse = await fetch(
              "/api/v1/check-auth/validuser/admin",
              {
                headers,
                credentials: "include",
              },
            );

            if (adminResponse.ok) {
              setUserType("admin");
            } else if (adminResponse.status === 403) {
              // Not an admin, keep as user
            } else {
              throw new Error(
                `Unexpected status code: ${adminResponse.status}`,
              );
            }
            setIsLoading(false);
          } else {
            setIsLoading(false);
            setUserType(null);
            setIsValidUser(false);
            const currentPath = window.location.pathname;
            if (
              !currentPath.startsWith("/login") &&
              !currentPath.startsWith("/waiting-room") &&
              !currentPath.startsWith("/mtls-install")
            ) {
              window.location.href = "/login";
            }
          }
        } else {
          setIsLoading(false);
        }
      } catch (err: unknown) {
        console.error("An error occurred while fetching user type:", err);
        if (err instanceof Error) {
          setError(`Error: ${err.message}`);
        } else {
          setError(`Error: ${String(err)}`);
        }
        setIsLoading(false);
        setUserType(null);
        setIsValidUser(false);
        const currentPath = window.location.pathname;
        if (
          !currentPath.startsWith("/login") &&
          !currentPath.startsWith("/waiting-room") &&
          !currentPath.startsWith("/mtls-install")
        ) {
          window.location.href = "/login";
        }
      }
    }

    fetchUserType().catch((err) => {
      console.error("An error occurred while fetching user type:", err);
      setIsLoading(false);
    });
  }, []);

  const value = useMemo(
    () => ({
      userType,
      isLoading,
      error,
      authType,
      otpVerified,
      setOtpVerified,
      callsign,
      isValidUser,
    }),
    [
      userType,
      isLoading,
      error,
      authType,
      otpVerified,
      setOtpVerified,
      callsign,
      isValidUser,
    ],
  );

  return (
    <UserTypeContext.Provider value={value}>
      {children}
    </UserTypeContext.Provider>
  );
}
