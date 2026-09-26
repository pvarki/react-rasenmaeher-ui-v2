import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { EnrollmentLayout } from "@/components/enrollment/EnrollmentLayout";

interface LoginSearch {
  code?: string;
  /** "off" on an invite link whose creator does not want guides popping up. */
  guides?: string;
}

export const Route = createFileRoute("/login")({
  component: LoginPage,
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    code: typeof search.code === "string" ? search.code : undefined,
    guides: typeof search.guides === "string" ? search.guides : undefined,
  }),
});

function LoginPage() {
  const { code } = Route.useSearch();

  useEffect(() => {
    const host = window.location.host;
    if (host.startsWith("mtls.")) {
      const nonMtlsHost = host.replace("mtls.", "");
      window.location.href = `${window.location.protocol}//${nonMtlsHost}/error?code=mtls_fail`;
    }
  }, []);

  const mtlsUrl = `${window.location.protocol}//mtls.${window.location.host}/`;

  return (
    <EnrollmentLayout>
      <LoginForm mtlsUrl={mtlsUrl} initialCode={code} />
    </EnrollmentLayout>
  );
}
