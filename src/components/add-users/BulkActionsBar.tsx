import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface BulkActionsBarProps {
  selectedCount: number;
  onEnable: () => void;
  onDisable: () => void;
  onDelete: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onEnable,
  onDisable,
  onDelete,
}: BulkActionsBarProps) {
  const { t } = useTranslation();

  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-2 p-4 bg-card border border-border rounded-xl">
      <span className="text-sm font-medium">
        {t("addUsers.selected", { count: selectedCount })}
      </span>
      <div className="flex-1"></div>
      <Button variant="outline" size="sm" onClick={onEnable}>
        {t("addUsers.enable")}
      </Button>
      <Button variant="outline" size="sm" onClick={onDisable}>
        {t("addUsers.disable")}
      </Button>
      <Button variant="destructive" size="sm" onClick={onDelete}>
        {t("addUsers.delete")}
      </Button>
    </div>
  );
}
