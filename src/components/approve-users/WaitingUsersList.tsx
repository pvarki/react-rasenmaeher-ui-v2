import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface WaitingUser {
  callsign: string;
}

interface WaitingUsersListProps {
  users: WaitingUser[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserClick: (callsign: string) => void;
}

export function WaitingUsersList({
  users,
  open,
  onOpenChange,
  onUserClick,
}: WaitingUsersListProps) {
  const { t } = useTranslation();

  return (
    <Collapsible
      open={open}
      onOpenChange={onOpenChange}
      className="border border-border rounded-xl overflow-hidden"
    >
      <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-accent/30 transition-colors">
        <span className="font-medium">
          {t("approveUsers.waitingUsers")} ({users.length})
        </span>
        <ChevronDown
          className={cn(
            "w-5 h-5 transition-transform",
            open && "rotate-180",
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-2 pb-2">
        <div className="space-y-1">
          {users.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              {t("approveUsers.noUsersWaiting")}
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.callsign}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors group"
              >
                <span className="font-medium">{user.callsign}</span>
                <button
                  onClick={() => onUserClick(user.callsign)}
                  className="p-2 hover:bg-accent rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
