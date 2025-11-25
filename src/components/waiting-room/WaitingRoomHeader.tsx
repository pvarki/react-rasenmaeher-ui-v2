"use client";

import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LoginHeader } from "../auth/LoginHeader";
import useHealthCheck from "@/hooks/helpers/useHealthcheck";

interface WaitingRoomHeaderProps {
  isLoading: boolean;
  appDesc?: string;
}

export function WaitingRoomHeader({
  isLoading,
  appDesc,
}: WaitingRoomHeaderProps) {
  const { t } = useTranslation();
  const { deployment } = useHealthCheck();

  return (
    <div className="text-center space-y-3 md:space-y-4">
      <LoginHeader deployment={deployment} />
      <h2 className="text-2xl md:text-3xl font-medium text-balance mt-8">
        {t("waitingRoom.title")}
      </h2>
      <p className="text-sm md:text-base text-muted-foreground text-balance max-w-lg mx-auto leading-relaxed">
        {appDesc || t("waitingRoom.description")}
      </p>
      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{t("waitingRoom.checkingStatus")}</span>
        </div>
      )}
    </div>
  );
}
