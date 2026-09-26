import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Loader2, Key, HelpCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LoginGuide } from "@/components/guides";
import { useCheckInvite } from "@/hooks/api/enrollment/useCheckInvite";

const CODE_PATTERN = /^[A-Z0-9]{8,}$/i;

interface LoginFormProps {
  mtlsUrl: string;
  initialCode?: string;
}

export function LoginForm({ mtlsUrl, initialCode }: LoginFormProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showGuide, setShowGuide] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { code: initialCode ?? "" } });

  const { mutate: checkInvite, isPending } = useCheckInvite({
    onSuccess: (valid, code) => {
      if (valid) {
        navigate({ to: "/callsign-setup", search: { code } });
      } else {
        setError("code", { message: t("login.codeNotValid") });
      }
    },
    onError: () => setError("code", { message: t("login.verifyFailed") }),
  });

  useEffect(() => {
    if (initialCode) checkInvite(initialCode.toUpperCase());
  }, [initialCode, checkInvite]);

  const onSubmit = handleSubmit(({ code }) => checkInvite(code.toUpperCase()));

  return (
    <>
      <LoginGuide open={showGuide} onOpenChange={setShowGuide} />

      <Card className="border-muted" data-testid="login-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                {t("login.chooseMethod")}
              </CardTitle>
              <CardDescription>{t("login.loginDesc")}</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowGuide(true)}
              className="shrink-0"
              aria-label={t("common.help")}
              data-testid="login-help-button"
            >
              <HelpCircle className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <a href={mtlsUrl} className="block" data-testid="login-cert-link">
            <Button
              variant="outline"
              className="w-full h-14 bg-primary-light hover:bg-primary-light/90 text-base font-semibold"
              type="button"
              data-testid="login-cert-button"
            >
              {t("login.certificate")}
            </Button>
          </a>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t("login.or")}
              </span>
            </div>
          </div>

          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="code">{t("login.enterCode")}</Label>
              <Input
                id="code"
                type="text"
                autoComplete="off"
                placeholder={t("login.codePlaceholder")}
                className="font-mono h-12 text-base uppercase"
                disabled={isPending}
                data-testid="login-code-input"
                {...register("code", {
                  required: t("login.codeRequired"),
                  pattern: {
                    value: CODE_PATTERN,
                    message: t("login.codeInvalid"),
                  },
                })}
              />
              <span
                className="text-sm text-destructive"
                data-testid="login-code-error"
              >
                {errors.code?.message}
              </span>
            </div>

            <Button
              type="submit"
              variant="outline"
              className="w-full h-14 bg-primary-light hover:bg-primary-light/90 text-base font-semibold"
              disabled={!watch("code") || isPending}
              data-testid="login-submit-button"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {t("login.verifying")}
                </>
              ) : (
                <>
                  <Key className="w-5 h-5 mr-2" />
                  {t("login.loginCode")}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
