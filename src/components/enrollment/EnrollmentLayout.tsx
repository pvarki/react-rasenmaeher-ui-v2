import type { ReactNode } from "react";
import { LanguageSwitcher } from "@/components/auth/LanguageSwitcher";
import { LoginHeader } from "@/components/auth/LoginHeader";
import useHealthCheck from "@/hooks/helpers/useHealthcheck";

export function EnrollmentLayout({ children }: { children: ReactNode }) {
  const { deployment } = useHealthCheck();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md space-y-8">
        <LoginHeader deployment={deployment} />
        {children}
      </div>
    </div>
  );
}
