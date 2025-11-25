import type React from "react";
import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

interface InviteCode {
  invitecode: string;
  active: boolean;
  owner_cs?: string;
  created?: string;
}

interface InviteCodeItemProps {
  invite: InviteCode;
  callsign?: string;
  bulkMode: boolean;
  isSelected: boolean;
  onCodeClick: (code: string, e: React.MouseEvent) => void;
  onManageClick: (code: string, e: React.MouseEvent) => void;
  onToggleSelection: (code: string) => void;
}

export function InviteCodeItem({
  invite,
  callsign,
  bulkMode,
  isSelected,
  onCodeClick,
  onManageClick,
  onToggleSelection,
}: InviteCodeItemProps) {
  const { t } = useTranslation();

  const handleClick = (e: React.MouseEvent) => {
    if (bulkMode) {
      onToggleSelection(invite.invitecode);
    } else {
      if (invite.active !== true) return;
      onCodeClick(invite.invitecode, e);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "flex items-center justify-between p-5 bg-card border-2 border-border rounded-xl hover:bg-accent/50 hover:border-primary/50 transition-all",
        bulkMode && isSelected && "bg-accent border-primary",
        invite.active !== true ? "cursor-not-allowed" : "cursor-pointer",
      )}
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-lg">
              {invite.invitecode}
            </span>
            <span
              className={cn(
                "text-xs font-bold uppercase px-3 py-0.5 rounded-full",
                invite.active
                  ? "text-green-600 bg-green-100 dark:bg-green-900/30"
                  : "text-gray-500 bg-gray-100 dark:bg-gray-800",
              )}
            >
              {t(`addUsers.${invite.active ? "active" : "inactive"}`)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {invite.owner_cs === callsign
              ? t("addUsers.createdByYou", {
                  date: invite.created
                    ? format(new Date(invite.created), "MMM d, yyyy")
                    : "",
                })
              : t("addUsers.createdBy", {
                  creator: invite.owner_cs,
                  date: invite.created
                    ? format(new Date(invite.created), "MMM d, yyyy")
                    : "",
                })}
          </p>
        </div>
      </div>
      {!bulkMode && (
        <button
          onClick={(e) => onManageClick(invite.invitecode, e)}
          className="text-muted-foreground hover:text-foreground p-2"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
