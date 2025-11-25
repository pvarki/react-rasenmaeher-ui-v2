"use client";

import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useInviteCodeManagement } from "@/hooks/api/inviteCode/useInviteCodeManagement";
import { InviteCodeHeader } from "@/components/add-users/InviteCodeHeader";
import { InviteCodeItem } from "@/components/add-users/InviteCodeItem";
import { BulkActionsBar } from "@/components/add-users/BulkActionsBar";
import {
  CreateInviteDialog,
  ManageCodeDialog,
  WalkthroughDialog,
} from "@/components/add-users/InviteCodeDialogs";
interface InviteCode {
  invitecode: string;
  active: boolean;
  owner_cs?: string;
  created?: string;
}

export const Route = createFileRoute("/add-users")({
  component: AddUsersPage,
});

function AddUsersPage() {
  const { t } = useTranslation();
  const {
    filterText,
    setFilterText,
    createModalOpen,
    setCreateModalOpen,
    selectedCode,
    manageDialogOpen,
    setManageDialogOpen,
    selectedCodes,
    bulkMode,
    walkthroughOpen,
    setWalkthroughOpen,
    inviteCodes,
    filteredCodes,
    isLoading,
    userTypeLoading,
    userType,
    callsign,
    isCreating,
    isDeleting,
    isTogglingStatus,
    handleCreateInvite,
    handleDeleteCode,
    handleToggleStatus,
    handleCodeClick,
    handleManageClick,
    handleBulkDelete,
    handleBulkDisable,
    handleBulkEnable,
    toggleCodeSelection,
    toggleBulkMode,
  } = useInviteCodeManagement();

  if (!userTypeLoading && userType !== "admin") {
    return (
      <div className="max-w-4xl mx-auto space-y-6 text-center py-12">
        <h1 className="text-6xl font-bold text-destructive">403</h1>
        <p className="text-xl text-muted-foreground">
          {t("addUsers.forbidden")}
        </p>
      </div>
    );
  }

  if (isLoading || userTypeLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">{t("addUsers.title")}</h1>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <InviteCodeHeader
        filterText={filterText}
        onFilterChange={setFilterText}
        bulkMode={bulkMode}
        onToggleBulkMode={toggleBulkMode}
        onCreateClick={() => setCreateModalOpen(true)}
        onHelpClick={() => setWalkthroughOpen(true)}
        isCreating={isCreating}
      />

      {bulkMode && (
        <BulkActionsBar
          selectedCount={selectedCodes.length}
          onEnable={handleBulkEnable}
          onDisable={handleBulkDisable}
          onDelete={handleBulkDelete}
        />
      )}

      <div className="space-y-3">
        {filteredCodes.map((invite: InviteCode) => (
          <InviteCodeItem
            key={invite.invitecode}
            invite={invite}
            callsign={callsign ?? undefined}
            bulkMode={bulkMode}
            isSelected={selectedCodes.includes(invite.invitecode)}
            onCodeClick={(code: string, e: React.MouseEvent) => {
              e.preventDefault();
              handleCodeClick(code);
            }}
            onManageClick={(code: string, e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              handleManageClick(code);
            }}
            onToggleSelection={toggleCodeSelection}
          />
        ))}
      </div>

      <CreateInviteDialog
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onConfirm={handleCreateInvite}
      />

      <WalkthroughDialog
        open={walkthroughOpen}
        onOpenChange={setWalkthroughOpen}
      />

      <ManageCodeDialog
        open={manageDialogOpen}
        onOpenChange={setManageDialogOpen}
        selectedCode={selectedCode}
        inviteCodes={inviteCodes}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeleteCode}
        isDeleting={isDeleting}
        isTogglingStatus={isTogglingStatus}
      />
    </div>
  );
}
