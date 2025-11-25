import { Search, HelpCircle, Plus, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

interface InviteCodeHeaderProps {
  filterText: string;
  onFilterChange: (value: string) => void;
  bulkMode: boolean;
  onToggleBulkMode: () => void;
  onCreateClick: () => void;
  onHelpClick: () => void;
  isCreating: boolean;
}

export function InviteCodeHeader({
  filterText,
  onFilterChange,
  bulkMode,
  onToggleBulkMode,
  onCreateClick,
  onHelpClick,
  isCreating,
}: InviteCodeHeaderProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <h1 className="text-3xl font-bold">{t("addUsers.title")}</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onHelpClick}
          className="shrink-0"
        >
          <HelpCircle className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-3">
        <Button
          onClick={onCreateClick}
          className="w-full md:w-auto bg-primary hover:bg-primary/90 h-12 md:h-12 px-6 font-semibold rounded-xl"
          disabled={isCreating}
        >
          <Plus className="w-5 h-5 mr-2" />
          <span className="hidden md:inline">
            {isCreating
              ? t("addUsers.creating")
              : t("addUsers.createNewInvite")}
          </span>
          <span className="md:hidden">
            {isCreating ? "..." : t("addUsers.create")}
          </span>
        </Button>
        <Button
          variant="outline"
          onClick={onToggleBulkMode}
          className="w-full md:w-auto h-12 px-6 font-semibold rounded-xl"
        >
          <CheckSquare className="w-5 h-5" />
          <span className="ml-2 hidden md:inline">
            {bulkMode ? t("addUsers.cancel") : t("addUsers.selectMultiple")}
          </span>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t("addUsers.filterPlaceholder")}
          value={filterText}
          onChange={(e) => onFilterChange(e.target.value)}
          className="pl-9"
        />
      </div>
    </>
  );
}
