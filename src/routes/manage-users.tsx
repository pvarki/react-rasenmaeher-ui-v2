"use client";

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useUsers } from "@/hooks/api/useUsers";
import { usePromoteUser } from "@/hooks/api/usePromoteUser";
import { useDemoteUser } from "@/hooks/api/useDemoteUser";
import { useDeleteUser } from "@/hooks/api/useDeleteUser";
import { useUserType } from "@/hooks/auth/useUserType";
import { useNavigate } from "@tanstack/react-router";
import { TypeConfirmationModal } from "@/components/ConfirmationModals";
import { KeycloakManageModal } from "@/components/KeycloakManageModal";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/manage-users")({
  component: ManageUsersPage,
});

interface User {
  callsign: string;
  roles: string[];
}

function ManageUsersPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [administratorsOpen, setAdministratorsOpen] = useState(true);
  const [fightersOpen, setFightersOpen] = useState(true);
  const [walkthroughOpen, setWalkthroughOpen] = useState(false);
  const [keycloakModalOpen, setKeycloakModalOpen] = useState(false);
  const [promoteConfirmOpen, setPromoteConfirmOpen] = useState(false);
  const [demoteConfirmOpen, setDemoteConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const { userType, isLoading: userTypeLoading, callsign } = useUserType();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!userTypeLoading && !callsign) {
      toast.error(t("manageUsers.messages.noCandidateFound"));
      navigate({ to: "/login" });
    }
  }, [callsign, userTypeLoading, navigate, t]);

  useEffect(() => {
    const walkthroughKey = `manage-users-walkthrough-${callsign}`;
    const hasSeenWalkthrough = localStorage.getItem(walkthroughKey);
    if (!hasSeenWalkthrough && !userTypeLoading) {
      setWalkthroughOpen(true);
      localStorage.setItem(walkthroughKey, "true");
    }
  }, [userTypeLoading, callsign]);

  useEffect(() => {
    if (!userTypeLoading && userType !== "admin") {
      toast.error(t("manageUsers.forbidden"));
      navigate({ to: "/" });
    }
  }, [userType, userTypeLoading, navigate, t]);

  const {
    data: users,
    isLoading,
    refetch,
  } = useUsers({
    refetchInterval: 10000,
  });

  const promoteUserMutation = usePromoteUser({
    onSuccess: () => {
      toast.success(
        t("manageUsers.messages.promoted", { callsign: selectedUser?.callsign }),
      );
      setSelectedUser(null);
      setPromoteConfirmOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(
        t("manageUsers.messages.promoteFailed", { error: error.message }),
      );
    },
  });

  const demoteUserMutation = useDemoteUser({
    onSuccess: () => {
      toast.success(
        t("manageUsers.messages.demoted", { callsign: selectedUser?.callsign }),
      );
      setSelectedUser(null);
      setDemoteConfirmOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(
        t("manageUsers.messages.demoteFailed", { error: error.message }),
      );
    },
  });

  const deleteUserMutation = useDeleteUser({
    onSuccess: () => {
      toast.error(
        t("manageUsers.messages.removed", { callsign: selectedUser?.callsign }),
      );
      setSelectedUser(null);
      setDeleteConfirmOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(
        t("manageUsers.messages.removeFailed", { error: error.message }),
      );
    },
  });

  const administrators =
    users?.filter((u) => u.roles && u.roles.includes("admin")) || [];
  const fighters =
    users?.filter((u) => u.roles && !u.roles.includes("admin")) || [];

  const isAdmin = (user: User) => user.roles && user.roles.includes("admin");
  const isCurrentUser = (user: User) => user.callsign === callsign;

  const handlePromoteClick = () => {
    if (!selectedUser) return;
    setPromoteConfirmOpen(true);
  };

  const handlePromoteConfirm = () => {
    if (!selectedUser) return;
    promoteUserMutation.mutate({ callsign: selectedUser.callsign });
  };

  const handleDemoteClick = () => {
    if (!selectedUser) return;
    if (selectedUser.callsign === callsign) {
      toast.error(t("manageUsers.messages.cannotDemoteOwn"));
      return;
    }
    setDemoteConfirmOpen(true);
  };

  const handleDemoteConfirm = () => {
    if (!selectedUser) return;
    demoteUserMutation.mutate({ callsign: selectedUser.callsign });
  };

  const handleRemoveClick = () => {
    if (!selectedUser) return;

    if (selectedUser.callsign === callsign) {
      toast.error(t("manageUsers.messages.cannotDeleteOwn"));
      return;
    }

    if (isAdmin(selectedUser) && administrators.length <= 1) {
      toast.error(t("manageUsers.messages.cannotDeleteLastAdmin"));
      return;
    }

    setDeleteConfirmOpen(true);
  };

  const handleRemoveConfirm = () => {
    if (!selectedUser) return;
    deleteUserMutation.mutate(selectedUser.callsign);
  };

  if (!userTypeLoading && userType !== "admin") {
    return (
      <div className="max-w-4xl mx-auto space-y-6 text-center py-12">
        <h1 className="text-6xl font-bold text-destructive">403</h1>
        <p className="text-xl text-muted-foreground">
          {t("manageUsers.forbidden")}
        </p>
      </div>
    );
  }

  if (isLoading || userTypeLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">{t("manageUsers.title")}</h1>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{t("manageUsers.title")}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("manageUsers.description", {
              admins: t("manageUsers.adminHighlight"),
              fighters: t("manageUsers.fighterHighlight"),
            })}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setWalkthroughOpen(true)}
          className="shrink-0"
        >
          <HelpCircle className="w-5 h-5" />
        </Button>
      </div>

      <Collapsible
        open={administratorsOpen}
        onOpenChange={setAdministratorsOpen}
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-card border border-border rounded-xl hover:bg-accent/30 transition-colors">
          <span className="font-medium">
            {t("manageUsers.administrators")} ({administrators.length})
          </span>
          <ChevronDown
            className={cn(
              "w-5 h-5 transition-transform",
              administratorsOpen && "rotate-180",
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-2">
          {administrators.length === 0 ? (
            <div className="p-6 bg-card border border-border rounded-xl text-sm text-muted-foreground text-center">
              {t("manageUsers.noAdministrators")}
            </div>
          ) : (
            administrators.map((user) => (
              <div
                key={user.callsign}
                className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => setSelectedUser(user)}
              >
                <span className="text-sm font-medium">{user.callsign}</span>
                {isCurrentUser(user) && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    {t("manageUsers.you")}
                  </span>
                )}
              </div>
            ))
          )}
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={fightersOpen} onOpenChange={setFightersOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-card border border-border rounded-xl hover:bg-accent/30 transition-colors">
          <span className="font-medium">
            {t("manageUsers.fighters")} ({fighters.length})
          </span>
          <ChevronDown
            className={cn(
              "w-5 h-5 transition-transform",
              fightersOpen && "rotate-180",
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-2">
          {fighters.length === 0 ? (
            <div className="p-6 bg-card border border-border rounded-xl text-sm text-muted-foreground text-center">
              {t("manageUsers.noFighters")}
            </div>
          ) : (
            fighters.map((user) => (
              <div
                key={user.callsign}
                className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => setSelectedUser(user)}
              >
                <span className="text-sm font-medium">{user.callsign}</span>
              </div>
            ))
          )}
        </CollapsibleContent>
      </Collapsible>

      <div>
        <Button
          onClick={() => setKeycloakModalOpen(true)}
          className="w-full bg-primary hover:bg-primary/90 h-12 rounded-xl text-base font-semibold"
        >
          {t("manageUsers.keycloakButton")}
        </Button>
      </div>

      <Dialog open={walkthroughOpen} onOpenChange={setWalkthroughOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("manageUsers.walkthrough.title")}</DialogTitle>
            <DialogDescription>
              {t("manageUsers.walkthrough.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">
                {t("manageUsers.walkthrough.promotingTitle")}
              </h4>
              <p className="text-sm text-muted-foreground">
                {t("manageUsers.walkthrough.promotingDesc")}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">
                {t("manageUsers.walkthrough.removingTitle")}
              </h4>
              <p className="text-sm text-muted-foreground">
                {t("manageUsers.walkthrough.removingDesc")}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">
                {t("manageUsers.walkthrough.notesTitle")}
              </h4>
              <p className="text-sm text-muted-foreground">
                • {t("manageUsers.walkthrough.note1")}
                <br />• {t("manageUsers.walkthrough.note2")}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setWalkthroughOpen(false)}
              className="w-full"
            >
              {t("manageUsers.walkthrough.gotIt")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TooltipProvider>
        <Dialog
          open={!!selectedUser}
          onOpenChange={() => setSelectedUser(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("manageUsers.userDialog.title")}</DialogTitle>
              <DialogDescription>
                {t("common.managing")}{" "}
                <span className="font-semibold text-foreground">
                  {selectedUser?.callsign}
                </span>
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                {t("manageUsers.userDialog.currentRole")}{" "}
                <span className="font-medium text-foreground capitalize">
                  {selectedUser && isAdmin(selectedUser)
                    ? t("common.admin")
                    : t("common.user")}
                </span>
              </p>
            </div>
            <DialogFooter className="flex-row gap-2 sm:justify-between">
              <Button
                variant="ghost"
                onClick={() => setSelectedUser(null)}
                className="flex-1"
                disabled={
                  promoteUserMutation.isLoading ||
                  demoteUserMutation.isLoading ||
                  deleteUserMutation.isLoading
                }
              >
                {t("manageUsers.userDialog.goBack")}
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex-1">
                    <Button
                      variant="destructive"
                      onClick={handleRemoveClick}
                      className="w-full"
                      disabled={
                        promoteUserMutation.isLoading ||
                        demoteUserMutation.isLoading ||
                        deleteUserMutation.isLoading ||
                        !!(selectedUser && isCurrentUser(selectedUser)) ||
                        !!(
                          selectedUser &&
                          isAdmin(selectedUser) &&
                          administrators.length <= 1
                        )
                      }
                    >
                      {deleteUserMutation.isLoading
                        ? t("manageUsers.userDialog.removing")
                        : t("manageUsers.userDialog.remove")}
                    </Button>
                  </span>
                </TooltipTrigger>
                {selectedUser && isCurrentUser(selectedUser) && (
                  <TooltipContent>
                    <p>{t("manageUsers.tooltips.cannotRemove")}</p>
                  </TooltipContent>
                )}
              </Tooltip>
              {selectedUser && !isAdmin(selectedUser) ? (
                <Button
                  onClick={handlePromoteClick}
                  className="flex-1 bg-teal-600 hover:bg-teal-700"
                  disabled={
                    promoteUserMutation.isLoading ||
                    demoteUserMutation.isLoading ||
                    deleteUserMutation.isLoading
                  }
                >
                  {promoteUserMutation.isLoading
                    ? t("manageUsers.userDialog.promoting")
                    : t("manageUsers.userDialog.promote")}
                </Button>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex-1">
                      <Button
                        onClick={handleDemoteClick}
                        className="w-full bg-orange-600 hover:bg-orange-700"
                        disabled={
                          promoteUserMutation.isLoading ||
                          demoteUserMutation.isLoading ||
                          deleteUserMutation.isLoading ||
                          (selectedUser ? isCurrentUser(selectedUser) : false)
                        }
                      >
                        {demoteUserMutation.isLoading
                          ? t("manageUsers.userDialog.demoting")
                          : t("manageUsers.userDialog.demote")}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {selectedUser && isCurrentUser(selectedUser) && (
                    <TooltipContent>
                      <p>{t("manageUsers.tooltips.cannotDemote")}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TooltipProvider>

      <TypeConfirmationModal
        open={promoteConfirmOpen}
        onOpenChange={setPromoteConfirmOpen}
        title={t("manageUsers.confirmModals.promote.title")}
        description={t(
          "manageUsers.confirmModals.promote.description",
          { callsign: selectedUser?.callsign },
        )}
        requiredText={t("manageUsers.confirmModals.promote.requiredText")}
        onConfirm={handlePromoteConfirm}
        isLoading={promoteUserMutation.isLoading}
      />

      <TypeConfirmationModal
        open={demoteConfirmOpen}
        onOpenChange={setDemoteConfirmOpen}
        title={t("manageUsers.confirmModals.demote.title")}
        description={t(
          "manageUsers.confirmModals.demote.description",
          { callsign: selectedUser?.callsign },
        )}
        requiredText={t("manageUsers.confirmModals.demote.requiredText")}
        onConfirm={handleDemoteConfirm}
        isLoading={demoteUserMutation.isLoading}
      />

      <TypeConfirmationModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={t("manageUsers.confirmModals.remove.title")}
        description={t(
          "manageUsers.confirmModals.remove.description",
          { callsign: selectedUser?.callsign?.toUpperCase() },
        )}
        requiredText={selectedUser?.callsign?.toUpperCase() || ""}
        onConfirm={handleRemoveConfirm}
        isLoading={deleteUserMutation.isLoading}
        isDangerous={true}
      />

      <KeycloakManageModal
        open={keycloakModalOpen}
        onOpenChange={setKeycloakModalOpen}
      />
    </div>
  );
}
