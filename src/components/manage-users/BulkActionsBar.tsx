import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface BulkActionsBarProps {
  selectedCount: number;
  hasAdminSelected: boolean;
  onPromote: () => void;
  onDemote: () => void;
  onRemove: () => void;
}

export function BulkActionsBar({
  selectedCount,
  hasAdminSelected,
  onPromote,
  onDemote,
  onRemove,
}: BulkActionsBarProps) {
  const { t } = useTranslation();

  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-2 p-4 bg-card border border-border rounded-xl">
      <span className="text-sm font-medium">
        {t("manageUsers.selected", { count: selectedCount })}
      </span>
      <div className="flex-1" />
      <Button
        variant="outline"
        size="sm"
        onClick={onPromote}
        className="bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50"
        disabled={hasAdminSelected}
        title={
          hasAdminSelected
            ? t("manageUsers.tooltips.cannotPromoteAdmins")
            : undefined
        }
      >
        {t("manageUsers.promote")}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onDemote}
        className="bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
        disabled={!hasAdminSelected}
        title={
          !hasAdminSelected
            ? t("manageUsers.tooltips.cannotDemoteNonAdmins")
            : undefined
        }
      >
        {t("manageUsers.demote")}
      </Button>
      <Button variant="destructive" size="sm" onClick={onRemove}>
        {t("manageUsers.remove")}
      </Button>
    </div>
  );
}
