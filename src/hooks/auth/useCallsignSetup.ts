import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useLoginAsAdmin } from "@/hooks/api/firstuser/useLoginAsAdmin";
import { useInitEnrollment } from "@/hooks/api/firstuser/useInitEnrollment";

interface StatusCodeError extends Error {
  statusCode?: number;
}

interface UseCallsignSetupOptions {
  code: string;
  codeType: "admin" | "user" | "unknown" | null;
}

export function useCallsignSetup({ code, codeType }: UseCallsignSetupOptions) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCommonError = (error: StatusCodeError) => {
    setIsSubmitting(false);
    if (error.statusCode === 400) {
      setErrorMessage(t("callsignSetup.errors.alreadyInUse"));
    } else {
      setErrorMessage(t("callsignSetup.errors.unexpected"));
    }
  };

  const clearError = () => setErrorMessage("");

  const { mutate: loginAsAdmin, isLoading: isLoadingAdmin } = useLoginAsAdmin({
    onSuccess: (jwt, variables) => {
      localStorage.setItem("token", jwt);
      localStorage.setItem("callsign", variables.callsign);
      navigate({ to: "/mtls-install" });
    },
    onError: handleCommonError,
  });

  const { mutate: initEnrollment, isLoading: isLoadingEnrollment } =
    useInitEnrollment({
      onSuccess: (data) => {
        localStorage.setItem("token", data.jwt);
        localStorage.setItem("approveCode", data.approvecode);
        localStorage.setItem("callsign", data.callsign);
        navigate({ to: "/waiting-room" });
      },
      onError: handleCommonError,
    });

  const submitCallsign = (callsign: string) => {
    setIsSubmitting(true);
    setErrorMessage("");

    if (codeType === "admin") {
      loginAsAdmin({ callsign, code });
    } else if (codeType === "user") {
      initEnrollment({ callsign, invite_code: code });
    }
  };

  const isLoading = isSubmitting || isLoadingAdmin || isLoadingEnrollment;

  return {
    errorMessage,
    isLoading,
    submitCallsign,
    clearError,
  };
}
