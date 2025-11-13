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
import { Home } from "lucide-react";

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
          icon: "🔐",
          bgGradient: "from-red-500/10 to-orange-500/10",
          borderColor: "border-red-500/30",
        };
      case "unauthorized":
        return {
          title: "Unauthorized Access",
          description: "You do not have permission to access this resource.",
          icon: "🚫",
          bgGradient: "from-yellow-500/10 to-orange-500/10",
          borderColor: "border-yellow-500/30",
        };
      case "not_found":
        return {
          title: "Page Not Found",
          description:
            "The page you are looking for does not exist or has been moved.",
          icon: "🔍",
          bgGradient: "from-blue-500/10 to-purple-500/10",
          borderColor: "border-blue-500/30",
        };
      default:
        return {
          title: "Something went wrong!",
          description:
            "An unexpected error occurred. Please try again or contact support if the problem persists.",
          icon: "⚠️",
          bgGradient: "from-red-500/10 to-pink-500/10",
          borderColor: "border-red-500/30",
        };
    }
  };

  const errorDetails = getErrorDetails(code);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-muted p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Decorative elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <Card
          className={`border ${errorDetails.borderColor} bg-linear-to-br ${errorDetails.bgGradient}`}
        >
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-foreground/5 rounded-full flex items-center justify-center text-4xl">
              {errorDetails.icon}
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold">
                {errorDetails.title}
              </CardTitle>
              {code && (
                <p className="text-sm text-muted-foreground font-mono bg-muted/50 rounded px-3 py-1 inline-block">
                  Error: {code.toUpperCase()}
                </p>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <CardDescription className="text-center text-base leading-relaxed">
              {errorDetails.description}
            </CardDescription>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => navigate({ to: "/" })}
                className="w-full flex-1"
                size="default"
              >
                <Home className="w-4 h-4 mr-2" />
                Return Home
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground/60">
          If you need further assistance, please contact support.
        </p>
      </div>
    </div>
  );
}
