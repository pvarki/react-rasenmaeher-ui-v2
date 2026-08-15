"use client";

import { createFileRoute } from "@tanstack/react-router";
import { ErrorContent } from "@/components/error/ErrorContent";
import { MtlsRestartGuide } from "@/components/error/MtlsRestartGuide";
import { ReturnHomeButton } from "@/components/error/ReturnHomeButton";
import { LanguageSwitcher } from "@/components/auth/LanguageSwitcher";
import { useTranslation } from "react-i18next";

interface ErrorSearch {
  code?: string;
}

export const Route = createFileRoute("/error")({
  component: ErrorView,
  validateSearch: (search: Record<string, unknown>): ErrorSearch => {
    return {
      code: (search.code as string) || undefined,
    };
  },
});

interface ErrorDetails {
  title: string;
  description: string;
  icon: string;
  steps?: string[];
}

function ErrorView() {
  const { code } = Route.useSearch();
  const { t } = useTranslation();

  const getErrorDetails = (errorCode?: string): ErrorDetails => {
    switch (errorCode) {
      case "mtls_fail":
        return {
          title: t("error.mtls_fail.title"),
          description: t("error.mtls_fail.description"),
          icon: t("error.mtls_fail.icon"),
        };
      case "unauthorized":
        return {
          title: t("error.unauthorized.title"),
          description: t("error.unauthorized.description"),
          icon: t("error.unauthorized.icon"),
        };
      case "not_found":
        return {
          title: t("error.not_found.title"),
          description: t("error.not_found.description"),
          icon: t("error.not_found.icon"),
        };
      default:
        return {
          title: t("error.default.title"),
          description: t("error.default.description"),
          icon: t("error.default.icon"),
        };
    }
  };

  const errorDetails = getErrorDetails(code);
  const isMtlsFailure = code === "mtls_fail";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div
        className={`w-full space-y-4 py-8 ${isMtlsFailure ? "max-w-xl" : "max-w-md"}`}
      >
        <div className="flex justify-end">
          <LanguageSwitcher />
        </div>

        <ErrorContent
          errorCode={code}
          title={errorDetails.title}
          description={errorDetails.description}
          icon={errorDetails.icon}
          steps={errorDetails.steps}
          showHomeButton={!isMtlsFailure}
        />

        {isMtlsFailure && (
          <>
            <MtlsRestartGuide />
            <ReturnHomeButton />
          </>
        )}
      </div>
    </div>
  );
}
