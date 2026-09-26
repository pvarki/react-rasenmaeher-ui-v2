import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CallsignForm } from "@/components/callsign-setup/CallsignForm";
import { EnrollmentLayout } from "@/components/enrollment/EnrollmentLayout";
import { useEnroll } from "@/hooks/api/enrollment/useEnroll";
import { ApiError } from "@/lib/api";

const ERROR_KEYS: Record<number, string> = {
  404: "callsignSetup.errors.inviteInvalid",
  409: "callsignSetup.errors.alreadyInUse",
  422: "callsignSetup.validation.pattern",
};

const errorKey = (error: Error) =>
  (error instanceof ApiError && ERROR_KEYS[error.status]) ||
  "callsignSetup.errors.unexpected";

export const Route = createFileRoute("/callsign-setup")({
  component: CallsignSetupPage,
  validateSearch: (search: Record<string, unknown>): { code: string } => ({
    code: typeof search.code === "string" ? search.code : "",
  }),
  beforeLoad: ({ search }) => {
    if (!search.code) throw redirect({ to: "/login" });
  },
});

function CallsignSetupPage() {
  const navigate = useNavigate();
  const { code } = Route.useSearch();
  const { t } = useTranslation();

  const {
    mutate: enroll,
    isPending,
    error,
  } = useEnroll({
    onSuccess: (status) =>
      navigate({ to: status.approved ? "/mtls-install" : "/waiting-room" }),
  });

  return (
    <EnrollmentLayout>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl font-bold text-center">
            {t("callsignSetup.title")}
          </CardTitle>
          <CardDescription className="text-center">
            {t("callsignSetup.usingInvite", { code })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CallsignForm
            onSubmit={(callsign) => enroll({ code, callsign })}
            onBack={() => navigate({ to: "/login" })}
            error={error ? t(errorKey(error)) : undefined}
            isPending={isPending}
          />
        </CardContent>
      </Card>
    </EnrollmentLayout>
  );
}
