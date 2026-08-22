"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ReturnHomeButton } from "@/components/error/ReturnHomeButton";
import { useTranslation } from "react-i18next";

interface ErrorContentProps {
  errorCode?: string;
  title: string;
  description: string;
  icon?: string;
  steps?: string[];
  showHomeButton?: boolean;
}

export function ErrorContent({
  errorCode,
  title,
  description,
  icon,
  steps,
  showHomeButton = true,
}: ErrorContentProps) {
  const { t } = useTranslation();

  return (
    <Card data-testid="error-content" data-error-code={errorCode ?? ""}>
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center text-3xl">
          {icon ?? "⚠️"}
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          {errorCode && (
            <p
              className="text-sm text-muted-foreground font-mono bg-muted/50 rounded px-3 py-1 inline-block"
              data-testid="error-code"
            >
              Code: {errorCode.toUpperCase()}
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <CardDescription className="text-center text-sm leading-relaxed">
          {description}
        </CardDescription>

        {steps && steps.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">
              {t("error.troubleshootingSteps")}
            </p>
            <ol
              data-testid="error-steps"
              className="space-y-2 text-sm text-foreground list-decimal list-inside"
            >
              {steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        {showHomeButton && <ReturnHomeButton />}
      </CardContent>
    </Card>
  );
}
