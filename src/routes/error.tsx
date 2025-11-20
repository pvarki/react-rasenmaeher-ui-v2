"use client";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Home } from "lucide-react";
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
  const navigate = useNavigate();
  const { code } = Route.useSearch();
  const { t } = useTranslation();

  const getErrorDetails = (errorCode?: string) => {
    switch (errorCode) {
      case "mtls_fail":
        return {
          title: t("error.mtls_fail.title"),
          description: t("error.mtls_fail.description"),
          icon: t("error.mtls_fail.icon"),
          bgGradient: "from-red-500/10 to-orange-500/10",
          borderColor: "border-red-500/30",
        };
      case "unauthorized":
        return {
          title: t("error.unauthorized.title"),
          description: t("error.unauthorized.description"),
          icon: t("error.unauthorized.icon"),
          bgGradient: "from-yellow-500/10 to-orange-500/10",
          borderColor: "border-yellow-500/30",
        };
      case "not_found":
        return {
          title: t("error.not_found.title"),
          description: t("error.not_found.description"),
          icon: t("error.not_found.icon"),
          bgGradient: "from-blue-500/10 to-purple-500/10",
          borderColor: "border-blue-500/30",
        };
      default:
        return {
          title: t("error.default.title"),
          description: t("error.default.description"),
          icon: t("error.default.icon"),
          bgGradient: "from-red-500/10 to-pink-500/10",
          borderColor: "border-red-500/30",
        };
    }
  };

  const errorDetails = getErrorDetails(code);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-muted p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Decorative elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <Card
          className={`border ${errorDetails.borderColor} bg-linear-to-br ${errorDetails.bgGradient}`}
        >
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-foreground/5 rounded-full flex items-center justify-center text-4xl">
              {errorDetails.icon}
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold">
                {errorDetails.title}
              </CardTitle>
              {code && (
                <p className="text-sm text-muted-foreground font-mono bg-muted/50 rounded px-3 py-1 inline-block">
                  {t("error.errorCode", { code: code.toUpperCase() })}
                </p>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <CardDescription className="text-center text-base leading-relaxed">
              {errorDetails.description}
            </CardDescription>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => navigate({ to: "/" })}
                className="w-full flex-1"
                size="default"
              >
                <Home className="w-4 h-4 mr-2" />
                {t("error.returnHome")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground/60">
          {t("error.contactSupport")}
        </p>
      </div>
    </div>
  );
}
