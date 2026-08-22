"use client";

import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Home } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ReturnHomeButton() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Button
      onClick={() => navigate({ to: "/login" })}
      className="w-full bg-primary-light hover:bg-primary-light/90"
      variant={"outline"}
      data-testid="error-return-home-button"
    >
      <Home className="w-4 h-4 mr-2" />
      {t("error.returnHome")}
    </Button>
  );
}
