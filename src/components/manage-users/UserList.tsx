import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import type { User } from "@/hooks/api/useUserManagement";

interface UserListProps {
  title: string;
  users: User[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emptyMessage: string;
  bulkMode: boolean;
  selectedUsers: string[];
  currentCallsign: string | null;
  onUserClick: (user: User) => void;
  onUserSelect: (callsign: string) => void;
}

export function UserList({
  title,
  users,
  open,
  onOpenChange,
  emptyMessage,
  bulkMode,
  selectedUsers,
  currentCallsign,
  onUserClick,
  onUserSelect,
}: UserListProps) {
  const { t } = useTranslation();

  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-card border border-border rounded-xl hover:bg-accent/30 transition-colors">
        <span className="font-medium">
          {title} ({users.length})
        </span>
        <ChevronDown
          className={cn("w-5 h-5 transition-transform", open && "rotate-180")}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-2">
        {users.length === 0 ? (
          <div className="p-6 bg-card border border-border rounded-xl text-sm text-muted-foreground text-center">
            {emptyMessage}
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.callsign}
              className={cn(
                "flex items-center gap-3 p-4 bg-card border-2 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer",
                bulkMode && selectedUsers.includes(user.callsign)
                  ? "border-primary bg-primary/5"
                  : "border-border",
              )}
              onClick={() => {
                if (bulkMode) {
                  onUserSelect(user.callsign);
                } else {
                  onUserClick(user);
                }
              }}
            >
              <span className="text-sm font-medium">{user.callsign}</span>
              {user.callsign === currentCallsign && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded ml-auto">
                  {t("manageUsers.you")}
                </span>
              )}
            </div>
          ))
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
