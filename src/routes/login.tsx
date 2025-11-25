"use client";

import type React from "react";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
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
import { Loader2, Shield, Key } from "lucide-react";
import { useCheckCode } from "@/hooks/api/useCheckCode";
import { useLoginCodeStore } from "@/store/LoginCodeStore";
import { FormikProvider, useFormik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import { getTheme } from "@/config/themes";
import useHealthCheck from "@/hooks/helpers/useHealthcheck";
import { useTranslation } from "react-i18next";

const TOKEN_REGEX = /^[A-Z0-9]{8,}$/;

interface ApiError extends Error {
  response?: {
    data?: {
      detail?: string;
    };
  };
}

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
  const navigate = useNavigate();
  const loginCodeStore = useLoginCodeStore();
  const [codeNotValid, setCodeNotValid] = useState(false);
  const { code: urlCode } = Route.useSearch();
  const { deployment } = useHealthCheck();
  const theme = getTheme();
  const { t } = useTranslation();

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const upperCaseValue = e.target.value.toUpperCase();
    setCodeNotValid(false);
    formik.setErrors({});
    void setFieldValue("code", upperCaseValue, false);
  };

  const handleInputFocus = () => {
    setCodeNotValid(false);
  };

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

  useEffect(() => {
    if (urlCode) {
      void setFieldValue("code", urlCode, false);
      setTimeout(() => {
        checkCode(urlCode);
      }, 100);
    }
  }, [checkCode, setFieldValue, urlCode]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            {theme.assets?.logoUrl && (
              <img
                src={theme.assets.logoUrl}
                alt="Logo"
                className="h-8 w-8"
              />
            )}
            <h1 className="text-2xl font-bold">{deployment}</h1>
          </div>
          <p className="text-muted-foreground text-sm">{theme.name}</p>
        </div>

        <Card className="border-muted">
          <CardHeader>
            <CardTitle className="text-lg">{t("login.chooseMethod")}</CardTitle>
            <CardDescription>{t("login.loginDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <a href={mtlsUrl} className="block">
              <Button
                className="w-full h-14 bg-green-600 hover:bg-green-700 text-base font-semibold"
                type="button"
              >
                <Shield className="w-5 h-5 mr-2" />
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
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-base font-semibold"
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
      </div>
    </div>
  );
}
