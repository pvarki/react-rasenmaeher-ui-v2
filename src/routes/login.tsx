"use client";

import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { LoginHeader } from "@/components/auth/LoginHeader";
import { LoginForm } from "@/components/auth/LoginForm";
import { LanguageSwitcher } from "@/components/auth/LanguageSwitcher";
import useHealthCheck from "@/hooks/helpers/useHealthcheck";

interface LoginSearch {
  code?: string;
}

export const Route = createFileRoute("/login")({
  component: LoginPage,
  validateSearch: (search: Record<string, unknown>): LoginSearch => {
    return {
      code: (search.code as string) || undefined,
    };
  },
});

function LoginPage() {
  const { deployment } = useHealthCheck();
  const { code: urlCode } = Route.useSearch();

  useEffect(() => {
    const host = window.location.host;
    if (host.startsWith("mtls.")) {
      const nonMtlsHost = host.replace("mtls.", "");
      window.location.href = `${window.location.protocol}//${nonMtlsHost}/error?code=mtls_fail`;
    }
  }, []);

  const protocol = window.location.protocol;
  const host = window.location.host;
  const mtlsUrl = `${protocol}//mtls.${host}/`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md space-y-8">
        <LoginHeader deployment={deployment} />
        <LoginForm mtlsUrl={mtlsUrl} initialCode={urlCode} />
      </div>
    </div>
  );
}
