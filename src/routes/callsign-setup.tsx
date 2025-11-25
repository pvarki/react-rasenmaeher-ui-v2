"use client";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useLoginCodeStore } from "@/store/LoginCodeStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/auth/LanguageSwitcher";
import useHealthCheck from "@/hooks/helpers/useHealthcheck";
import { LoginHeader } from "@/components/auth/LoginHeader";
import { CallsignForm } from "@/components/callsign-setup";
import { useCallsignSetup } from "@/hooks/auth/useCallsignSetup";

export const Route = createFileRoute("/callsign-setup")({
  component: CallsignSetupPage,
});

function CallsignSetupPage() {
  const navigate = useNavigate();
  const { code, codeType } = useLoginCodeStore();
  const { deployment } = useHealthCheck();
  const { t } = useTranslation();

  const { errorMessage, isLoading, submitCallsign, clearError } =
    useCallsignSetup({
      code: code || "",
      codeType,
    });

  useEffect(() => {
    if (!code || !codeType) {
      navigate({ to: "/login" });
    }
  }, [code, codeType, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md space-y-8">
        <LoginHeader deployment={deployment} />
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl font-bold text-center">
              {t("callsignSetup.title")}
            </CardTitle>
            <CardDescription className="text-center">
              {codeType === "admin"
                ? t("callsignSetup.usingAdmin", { code })
                : t("callsignSetup.usingInvite", { code })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CallsignForm
              onSubmit={submitCallsign}
              onBack={() => navigate({ to: "/login" })}
              errorMessage={errorMessage}
              onErrorClear={clearError}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CallsignSetupPage;
