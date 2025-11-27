import type React from "react";
import { useCallback } from "react";
import { FormikProvider, useFormik, Form } from "formik";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface CallsignFormProps {
  onSubmit: (callsign: string) => void;
  onBack: () => void;
  errorMessage?: string;
  onErrorClear?: () => void;
  isLoading?: boolean;
}

export function CallsignForm({
  onSubmit,
  onBack,
  errorMessage,
  onErrorClear,
  isLoading = false,
}: CallsignFormProps) {
  const { t } = useTranslation();

  const CallsignSchema = yup.object().shape({
    callsign: yup
      .string()
      .required(t("callsignSetup.validation.required"))
      .matches(/^[a-zA-Z0-9]*$/, t("callsignSetup.validation.pattern"))
      .min(3, t("callsignSetup.validation.min"))
      .max(30, t("callsignSetup.validation.max")),
  });

  const formik = useFormik({
    initialValues: { callsign: "" },
    validationSchema: CallsignSchema,
    onSubmit: (values) => {
      onSubmit(values.callsign);
    },
  });

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onErrorClear?.();
      formik.handleChange(event);
    },
    [formik, onErrorClear],
  );

  return (
    <FormikProvider value={formik}>
      <Form className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="callsign">
            {t("callsignSetup.yourCallsignLabel")}
          </Label>
          <Input
            id="callsign"
            name="callsign"
            type="text"
            placeholder={t("callsignSetup.callsignPlaceholder")}
            className="font-mono"
            value={formik.values.callsign}
            onChange={handleInputChange}
          />
          {formik.errors.callsign && (
            <p className="text-sm text-destructive">{formik.errors.callsign}</p>
          )}
          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
          >
            {t("callsignSetup.buttons.back")}
          </Button>
          <Button
            type="submit"
            variant={"outline"}
            className="flex-1 bg-primary-light hover:bg-primary-light/90"
            disabled={!formik.isValid || isLoading}
          >
            {isLoading
              ? t("callsignSetup.buttons.settingUp")
              : t("callsignSetup.buttons.continue")}
          </Button>
        </div>
      </Form>
    </FormikProvider>
  );
}
