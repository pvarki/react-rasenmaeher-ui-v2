"use client";

import type React from "react";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useCallback, useEffect } from "react";
import { useLoginAsAdmin } from "../hooks/api/firstuser/useLoginAsAdmin";
import { useLoginCodeStore } from "../store/LoginCodeStore";
import { useInitEnrollment } from "../hooks/api/firstuser/useInitEnrollment";
import { FormikProvider, useFormik, Form } from "formik";
import * as yup from "yup";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Alert, AlertDescription } from "../components/ui/alert";
import { AlertCircle } from "lucide-react";
import { getTheme } from "@/config/themes";

interface StatusCodeError extends Error {
  statusCode?: number;
}

export const Route = createFileRoute("/callsign-setup")({
  component: CallsignSetupPage,
});

function CallsignSetupPage() {
  const navigate = useNavigate();
  const { code, codeType } = useLoginCodeStore();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const theme = getTheme();

  useEffect(() => {
    if (!code || !codeType) {
      navigate({ to: "/login" });
    }
  }, [code, codeType, navigate]);

  const CallsignSchema = yup.object().shape({
    callsign: yup
      .string()
      .required("Callsign is required")
      .min(3, "Callsign must be at least 3 characters")
      .matches(/^[a-zA-Z0-9]{3,30}$/, "Only alphanumeric characters allowed")
      .max(30, "Callsign must be at most 30 characters"),
  });

  const handleCommonError = (error: StatusCodeError) => {
    setIsSubmitting(false);
    if (error.statusCode === 400) {
      setErrorMessage("Callsign is already in use");
    } else {
      setErrorMessage("An unexpected error occurred");
    }
  };

  const { mutate: loginAsAdmin, isLoading: isLoadingAdmin } = useLoginAsAdmin({
    onSuccess: (jwt) => {
      localStorage.setItem("token", jwt);
      localStorage.setItem("callsign", formik.values.callsign);
      navigate({ to: "/mtls-install" });
    },
    onError: handleCommonError,
  });

  const { mutate: initEnrollment, isLoading: isLoadingEnrollment } =
    useInitEnrollment({
      onSuccess: (data) => {
        localStorage.setItem("token", data.jwt);
        localStorage.setItem("approveCode", data.approvecode);
        localStorage.setItem("callsign", data.callsign);
        navigate({ to: "/waiting-room" });
      },
      onError: handleCommonError,
    });

  const formik = useFormik({
    initialValues: { callsign: "" },
    validationSchema: CallsignSchema,
    onSubmit: (values) => {
      setIsSubmitting(true);
      setErrorMessage("");
      if (codeType === "admin") {
        loginAsAdmin({ callsign: values.callsign, code });
      } else if (codeType === "user") {
        initEnrollment({ callsign: values.callsign, invite_code: code });
      }
    },
  });

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setErrorMessage("");
      formik.handleChange(event);
    },
    [formik],
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            {theme.assets?.logoUrl && (
              <img
                src={theme.assets.logoUrl || "/placeholder.svg"}
                alt="Logo"
                className="h-8 w-8"
              />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Setup Your Callsign
          </CardTitle>
          <CardDescription className="text-center">
            Using {codeType === "admin" ? "admin" : "invite"} code:{" "}
            <span className="font-mono font-bold">{code}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormikProvider value={formik}>
            <Form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="callsign">Your Callsign</Label>
                <Input
                  id="callsign"
                  name="callsign"
                  type="text"
                  placeholder="Enter your callsign"
                  className="font-mono"
                  value={formik.values.callsign}
                  onChange={handleInputChange}
                />
                {formik.errors.callsign && formik.touched.callsign && (
                  <p className="text-sm text-destructive">
                    {formik.errors.callsign}
                  </p>
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
                  onClick={() => navigate({ to: "/login" })}
                  disabled={
                    isSubmitting || isLoadingAdmin || isLoadingEnrollment
                  }
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={
                    !formik.isValid ||
                    isSubmitting ||
                    isLoadingAdmin ||
                    isLoadingEnrollment
                  }
                >
                  {isSubmitting || isLoadingAdmin || isLoadingEnrollment
                    ? "Setting up..."
                    : "Continue"}
                </Button>
              </div>
            </Form>
          </FormikProvider>
        </CardContent>
      </Card>
    </div>
  );
}

export default CallsignSetupPage;
