"use client";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";

interface ErrorSearch {
  code?: string;
}

export const Route = createFileRoute("/error")({
  component: ErrorView,
  validateSearch: (search: Record<string, unknown>): ErrorSearch => {
    return {
      code: (search.code as string) || undefined,
    };
  },
});

function ErrorView() {
  const navigate = useNavigate();
  const { code } = Route.useSearch();

  const getErrorDetails = (errorCode?: string) => {
    switch (errorCode) {
      case "mtls_fail":
        return {
          title: "Certificate Authentication Failed",
          description:
            "Your mTLS certificate could not be verified. Please ensure you have installed the correct certificate and try again.",
          showHome: true,
        };
      case "unauthorized":
        return {
          title: "Unauthorized Access",
          description: "You do not have permission to access this resource.",
          showHome: true,
        };
      case "not_found":
        return {
          title: "Page Not Found",
          description: "The page you are looking for does not exist.",
          showHome: true,
        };
      default:
        return {
          title: "Something went wrong!",
          description:
            "An unexpected error occurred. Please try again or contact support if the problem persists.",
          showHome: true,
        };
    }
  };

  const errorDetails = getErrorDetails(code);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-destructive/50">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">
              {errorDetails.title}
            </CardTitle>
            {code && (
              <p className="text-sm text-muted-foreground font-mono">
                Error Code: {code.toUpperCase()}
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <CardDescription className="text-center text-base leading-relaxed">
            {errorDetails.description}
          </CardDescription>

          {errorDetails.showHome && (
            <Button
              onClick={() => navigate({ to: "/" })}
              className="w-full"
              size="lg"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
