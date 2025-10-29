import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { UserTypeContext } from "./userTypeContext";

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

interface AdminResponse {
  isAdmin: boolean;
}

export function UserTypeFetcher({ children }: { children: ReactNode }) {
  const [userType, setUserType] = useState<"admin" | "user" | null>(null);
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
    console.log("debug: Starting to fetch user type.");

    async function fetchUserType() {
      try {
        const jwt = localStorage.getItem("token");
        console.log("debug: JWT from localStorage:", jwt);

        const headers = jwt ? { Authorization: `Bearer ${jwt}` } : undefined;
        const authResponse = await fetch("/api/v1/check-auth/mtls_or_jwt", {
          headers,
        });
        console.log("debug: Response from /mtls_or_jwt:", authResponse);

        if (authResponse.status === 403) {
          console.warn("debug: Authentication failed. Status code 403.");
          setAuthType(null);
        } else if (authResponse.ok) {
          const authData = (await authResponse.json()) as AuthResponse;
          console.log("debug: User authenticated with type:", authData.type);
          setAuthType(authData.type);

          if (authData.type) {
            const validUserResponse = await fetch(
              "/api/v1/check-auth/validuser",
              { headers },
            );
            console.log("debug: Response from /validuser:", validUserResponse);

            if (validUserResponse.ok) {
              const validUserData =
                (await validUserResponse.json()) as ValidUserResponse;
              console.log("debug: Valid user data:", validUserData);
              setIsValidUser(true);
              setCallsign(validUserData.userid);
              console.log("debug: setting callsign to:", validUserData.userid);
              setUserType("user");

              const adminResponse = await fetch(
                "/api/v1/check-auth/validuser/admin",
                { headers },
              );
              console.log(
                "debug: Response from /validuser/admin:",
                adminResponse,
              );

              if (adminResponse.ok) {
                const adminData = (await adminResponse.json()) as AdminResponse;
                console.log("debug: Admin data:", adminData);
                console.log("debug: Setting userType to admin.");
                setUserType("admin");
              } else if (adminResponse.status === 403) {
                console.log("debug: User is not an admin.");
              } else {
                throw new Error(
                  `Unexpected status code: ${adminResponse.status}`,
                );
              }
            }
          }
        } else {
          throw new Error(
            `API response was not ok. Status code: ${authResponse.status}`,
          );
        }
      } catch (err: unknown) {
        console.error(
          "debug: An error occurred while fetching user type:",
          err,
        );
        if (err instanceof Error) {
          setError(`Error: ${err.message}`);
        } else {
          setError(`Error: ${String(err)}`);
        }
      } finally {
        console.log("debug: Finished fetching user type.");
        setIsLoading(false);
      }
    }

    fetchUserType().catch((err) => {
      console.error("An error occurred while fetching user type:", err);
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
