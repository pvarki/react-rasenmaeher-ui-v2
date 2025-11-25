"use client";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUserType } from "@/hooks/auth/useUserType";
import { TypeConfirmationModal } from "@/components/ConfirmationModals";
import { useTranslation } from "react-i18next";
import { useUserManagement } from "@/hooks/api/useUserManagement";
import {
  UserList,
  BulkActionsBar,
  UserManagementDialog,
  WalkthroughDialog,
} from "@/components/manage-users";

export const Route = createFileRoute("/manage-users")({
  component: ManageUsersPage,
});

function ManageUsersPage() {
  const [administratorsOpen, setAdministratorsOpen] = useState(true);
  const [fightersOpen, setFightersOpen] = useState(false);
  const [walkthroughOpen, setWalkthroughOpen] = useState(false);

  const { userType, isLoading: userTypeLoading, callsign } = useUserType();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    administrators,
    fighters,
    isLoading,
    selectedUser,
    setSelectedUser,
    selectedUsers,
    bulkMode,
    bulkAction,
    hasAdminSelected,
    promoteConfirmOpen,
    setPromoteConfirmOpen,
    demoteConfirmOpen,
    setDemoteConfirmOpen,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    bulkConfirmOpen,
    setBulkConfirmOpen,
    promoteUserMutation,
    demoteUserMutation,
    deleteUserMutation,
    isAdmin,
    isCurrentUser,
    toggleUserSelection,
    toggleBulkMode,
    handlePromoteClick,
    handlePromoteConfirm,
    handleDemoteClick,
    handleDemoteConfirm,
    handleRemoveClick,
    handleRemoveConfirm,
    handleBulkPromote,
    handleBulkDemote,
    handleBulkRemove,
    confirmBulkAction,
  } = useUserManagement({ currentCallsign: callsign });

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

  const handleAdministratorsOpen = (open: boolean) => {
    setAdministratorsOpen(open);
    if (open) setFightersOpen(false);
  };

  const handleFightersOpen = (open: boolean) => {
    setFightersOpen(open);
    if (open) setAdministratorsOpen(false);
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

  const isMutating =
    promoteUserMutation.isLoading ||
    demoteUserMutation.isLoading ||
    deleteUserMutation.isLoading;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <h1 className="text-3xl font-bold">{t("manageUsers.title")}</h1>
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

      <div className="flex gap-3">
        <Button
          variant={bulkMode ? "default" : "outline"}
          onClick={toggleBulkMode}
          className="rounded-xl"
        >
          {bulkMode ? t("manageUsers.exitBulkMode") : t("manageUsers.bulkMode")}
        </Button>
      </div>

      {bulkMode && (
        <BulkActionsBar
          selectedCount={selectedUsers.length}
          hasAdminSelected={hasAdminSelected}
          onPromote={handleBulkPromote}
          onDemote={handleBulkDemote}
          onRemove={handleBulkRemove}
        />
      )}

      <UserList
        title={t("manageUsers.administrators")}
        users={administrators}
        open={administratorsOpen}
        onOpenChange={handleAdministratorsOpen}
        emptyMessage={t("manageUsers.noAdministrators")}
        bulkMode={bulkMode}
        selectedUsers={selectedUsers}
        currentCallsign={callsign}
        onUserClick={setSelectedUser}
        onUserSelect={toggleUserSelection}
      />

      <UserList
        title={t("manageUsers.fighters")}
        users={fighters}
        open={fightersOpen}
        onOpenChange={handleFightersOpen}
        emptyMessage={t("manageUsers.noFighters")}
        bulkMode={bulkMode}
        selectedUsers={selectedUsers}
        currentCallsign={callsign}
        onUserClick={setSelectedUser}
        onUserSelect={toggleUserSelection}
      />

      <WalkthroughDialog
        open={walkthroughOpen}
        onOpenChange={setWalkthroughOpen}
      />

      <UserManagementDialog
        user={selectedUser}
        onOpenChange={() => setSelectedUser(null)}
        isAdmin={selectedUser ? isAdmin(selectedUser) : false}
        isCurrentUser={selectedUser ? isCurrentUser(selectedUser) : false}
        administratorsCount={administrators.length}
        isLoading={isMutating}
        onPromote={handlePromoteClick}
        onDemote={handleDemoteClick}
        onRemove={handleRemoveClick}
      />

      <TypeConfirmationModal
        open={promoteConfirmOpen}
        onOpenChange={setPromoteConfirmOpen}
        title={t("manageUsers.confirmModals.promote.title")}
        description={t("manageUsers.confirmModals.promote.description", {
          callsign: selectedUser?.callsign,
        })}
        onConfirm={handlePromoteConfirm}
        isLoading={promoteUserMutation.isLoading}
      />

      <TypeConfirmationModal
        open={demoteConfirmOpen}
        onOpenChange={setDemoteConfirmOpen}
        title={t("manageUsers.confirmModals.demote.title")}
        description={t("manageUsers.confirmModals.demote.description", {
          callsign: selectedUser?.callsign,
        })}
        onConfirm={handleDemoteConfirm}
        isLoading={demoteUserMutation.isLoading}
      />

      <TypeConfirmationModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={t("manageUsers.confirmModals.remove.title")}
        description={t("manageUsers.confirmModals.remove.description", {
          callsign: selectedUser?.callsign,
        })}
        onConfirm={handleRemoveConfirm}
        isLoading={deleteUserMutation.isLoading}
      />

      <TypeConfirmationModal
        open={bulkConfirmOpen}
        onOpenChange={setBulkConfirmOpen}
        title={t(`manageUsers.confirmModals.bulk${bulkAction}.title`, "Confirm Action")}
        description={t(`manageUsers.confirmModals.bulk${bulkAction}.description`, "Are you sure?")}
        onConfirm={confirmBulkAction}
        isLoading={false}
      />
    </div>
  );
}
