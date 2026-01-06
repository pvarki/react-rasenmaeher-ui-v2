"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
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
import { Loader2, Key, HelpCircle } from "lucide-react";
import { useCheckCode } from "@/hooks/api/useCheckCode";
import { useLoginCodeStore } from "@/store/LoginCodeStore";
import { FormikProvider, useFormik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { LoginGuide } from "@/components/guides";

const TOKEN_REGEX = /^[A-Z0-9]{8,}$/;

interface ApiError extends Error {
  response?: {
    data?: {
      detail?: string;
    };
  };
}

interface LoginFormProps {
  mtlsUrl: string;
  initialCode?: string;
}

export function LoginForm({ mtlsUrl, initialCode }: LoginFormProps) {
  const navigate = useNavigate();
  const loginCodeStore = useLoginCodeStore();
  const [codeNotValid, setCodeNotValid] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const { t } = useTranslation();

  const CodeSchema = yup.object().shape({
    code: yup
      .string()
      .required(t("login.codeRequired"))
      .matches(TOKEN_REGEX, t("login.codeInvalid")),
  });

  const formik = useFormik({
    initialValues: {
      code: "",
    },
    validationSchema: CodeSchema,
    validateOnMount: false,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: (values: { code: string }) => {
      checkCode(values.code);
    },
  });

  const { values, setFieldValue, submitCount } = formik;

  const {
    mutate: checkCode,
    isLoading,
    isError,
    error,
  } = useCheckCode({
    onSuccess: (data) => {
      loginCodeStore.setCode(values.code);
      if (data.isAdminCodeValid) {
        loginCodeStore.setCodeType("admin");
        navigate({ to: "/callsign-setup" });
      } else if (data.isEnrollmentCodeValid) {
        loginCodeStore.setCodeType("user");
        navigate({ to: "/callsign-setup" });
      } else {
        loginCodeStore.setCodeType("unknown");
        setCodeNotValid(true);
      }
    },
    onError: (err: ApiError) => {
      const errorMessage = err.response?.data?.detail || "Unknown error";
      formik.setErrors({ code: errorMessage });
    },
  });

  // Auto-submit when initialCode is provided via URL
  useEffect(() => {
    if (initialCode) {
      void setFieldValue("code", initialCode, false);
      setTimeout(() => {
        checkCode(initialCode);
      }, 100);
    }
  }, [initialCode, setFieldValue, checkCode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const upperCaseValue = e.target.value.toUpperCase();
    setCodeNotValid(false);
    formik.setErrors({});
    void setFieldValue("code", upperCaseValue, false);
  };

  const handleInputFocus = () => {
    setCodeNotValid(false);
  };

  return (
    <>
      <LoginGuide open={showGuide} onOpenChange={setShowGuide} />

      <Card className="border-muted">
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
            >
              <HelpCircle className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <a href={mtlsUrl} className="block">
            <Button
              variant={"outline"}
              className="w-full h-14 bg-primary-light hover:bg-primary-light/90 text-base font-semibold"
              type="button"
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

          <FormikProvider value={formik}>
            <Form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">{t("login.enterCode")}</Label>
                <Field
                  as={Input}
                  id="code"
                  name="code"
                  type="text"
                  placeholder={t("login.codePlaceholder")}
                  className="font-mono h-12 text-base"
                  onFocus={handleInputFocus}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <span className="text-sm text-destructive">
                  {submitCount > 0 && <ErrorMessage name="code" />}
                  {codeNotValid && <div>{t("login.codeNotValid")}</div>}
                  {isError && (
                    <div>
                      {(error as ApiError).response?.data?.detail ||
                        t("login.codeInvalid")}
                    </div>
                  )}
                </span>
              </div>

              <Button
                type="submit"
                variant={"outline"}
                className="w-full h-14 bg-primary-light hover:bg-primary-light/90 text-base font-semibold"
                disabled={!values.code || isLoading}
              >
                {isLoading ? (
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
            </Form>
          </FormikProvider>
        </CardContent>
      </Card>
    </>
  );
}
