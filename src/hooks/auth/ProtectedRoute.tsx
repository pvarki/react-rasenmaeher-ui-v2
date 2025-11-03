import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUserType } from "./useUserType";

interface Props {
  children: React.ReactNode;
  allowedUserTypes?: Array<"admin" | "user" | null>;
  requireAuthType?: "jwt" | "mtls" | null;
  requireValidUser?: boolean;
  requireOtpVerified?: boolean;
}

export function ProtectedRoute({
  children,
  allowedUserTypes = ["admin", "user", null],
  requireAuthType,
  requireValidUser = false,
  requireOtpVerified = false,
}: Props) {
  const { userType, isLoading, authType, isValidUser, callsign, otpVerified } =
    useUserType();
  const location = useLocation();
  const currentPath = location.pathname;

  // Debugging logs
  console.log(`Current authType: ${authType || "null"}`);
  console.log(`Current userType: ${userType || "null"}`);
  console.log(`Current path: ${currentPath}`);

  if (isLoading) {
    return null;
  }

  const determineTargetPath = () => {
    if (currentPath === "/" || currentPath === "/login") {
      if (authType === "mtls") {
        if (userType === "admin") {
          return "/";
        } else if (userType === "user" && callsign) {
          return `/app/users/${callsign}`;
        }
      } else if (authType === "jwt" && !userType) {
        return "/login/enrollment";
      } else if (authType === "jwt" && userType) {
        return "/login/createmtls";
      }
      return "/login";
    }
    if (
      (requireAuthType && authType !== requireAuthType) ||
      (allowedUserTypes.length > 0 && !allowedUserTypes.includes(userType))
    ) {
      return "/";
    }
    return currentPath;
  };

  const targetPath = determineTargetPath();
  console.log(`Target path: ${targetPath}`);

  if (isLoading) {
    return null;
  }

  if (!isLoading && currentPath !== targetPath) {
    console.log(`Redirecting to target path: ${targetPath}`);
    return <Navigate to={targetPath} replace />;
  }

  // Additional conditions for redirecting
  if (requireOtpVerified && !otpVerified) {
    console.log("OTP verification required but not verified");
    return <Navigate to="/login" replace />;
  }

  if (requireAuthType && authType !== requireAuthType) {
    console.log(
      `Required auth type is ${requireAuthType} but current auth type is ${
        requireAuthType || "jwt"
      }`,
    );
    return <Navigate to="/" replace />;
  }

  if (requireValidUser && !isValidUser) {
    console.log(
      `Valid user required but current state is ${isValidUser.toString()}`,
    );
    if (!callsign) {
      return <Navigate to="/login/callsign" replace />;
    }
    if (!isValidUser) {
      return <Navigate to="/login/enrollment" replace />;
    }
  }

  if (userType && !allowedUserTypes.includes(userType)) {
    console.log(`User type ${userType} not allowed`);
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
