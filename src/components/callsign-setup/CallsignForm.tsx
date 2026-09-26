import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CallsignFormProps {
  onSubmit: (callsign: string) => void;
  onBack: () => void;
  error?: string;
  isPending: boolean;
}

export function CallsignForm({
  onSubmit,
  onBack,
  error,
  isPending,
}: CallsignFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onChange", defaultValues: { callsign: "" } });

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit(({ callsign }) => onSubmit(callsign))}
      noValidate
      data-testid="callsign-form"
    >
      <div className="space-y-2">
        <Label htmlFor="callsign">{t("callsignSetup.yourCallsignLabel")}</Label>
        <Input
          id="callsign"
          type="text"
          autoComplete="off"
          placeholder={t("callsignSetup.callsignPlaceholder")}
          className="font-mono"
          data-testid="callsign-input"
          {...register("callsign", {
            required: t("callsignSetup.validation.required"),
            pattern: {
              value: /^[a-zA-Z0-9]+$/,
              message: t("callsignSetup.validation.pattern"),
            },
            minLength: { value: 3, message: t("callsignSetup.validation.min") },
            maxLength: {
              value: 30,
              message: t("callsignSetup.validation.max"),
            },
          })}
        />
        {errors.callsign && (
          <p
            className="text-sm text-destructive"
            data-testid="callsign-validation-error"
          >
            {errors.callsign.message}
          </p>
        )}
        {error && (
          <Alert variant="destructive" data-testid="callsign-error-alert">
            <AlertCircle className="h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isPending}
          data-testid="callsign-back-button"
        >
          {t("callsignSetup.buttons.back")}
        </Button>
        <Button
          type="submit"
          variant="outline"
          className="flex-1 bg-primary-light hover:bg-primary-light/90"
          disabled={isPending}
          data-testid="callsign-submit-button"
        >
          {isPending
            ? t("callsignSetup.buttons.settingUp")
            : t("callsignSetup.buttons.continue")}
        </Button>
      </div>
    </form>
  );
}
