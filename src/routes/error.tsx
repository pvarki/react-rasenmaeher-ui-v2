"use client";

import { createFileRoute } from "@tanstack/react-router";
import { ErrorContent } from "@/components/error/ErrorContent";
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

function ErrorView() {
  const { code } = Route.useSearch();
  const { t } = useTranslation();

  const getErrorDetails = (errorCode?: string) => {
    switch (errorCode) {
      case "mtls_fail":
        return {
          title: t("error.mtls_fail.title"),
          description: t("error.mtls_fail.description"),
        };
      case "unauthorized":
        return {
          title: t("error.unauthorized.title"),
          description: t("error.unauthorized.description"),
        };
      case "not_found":
        return {
          title: t("error.not_found.title"),
          description: t("error.not_found.description"),
        };
      default:
        return {
          title: t("error.default.title"),
          description: t("error.default.description"),
        };
    }
  };

  const errorDetails = getErrorDetails(code);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <ErrorContent
          errorCode={code}
          title={errorDetails.title}
          description={errorDetails.description}
        />

        <p className="text-center text-xs text-muted-foreground/60">
          {t("error.contactSupport")}
        </p>
      </div>
    </div>
  );
}
