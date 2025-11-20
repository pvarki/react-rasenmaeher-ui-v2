"use client";

import type React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Search,
  MoreVertical,
  HelpCircle,
  Plus,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useInviteCodeList } from "@/hooks/api/inviteCode/useInviteCodeList";
import { useCreateInviteCode } from "@/hooks/api/inviteCode/useCreateInviteCode";
import { useDeleteInviteCode } from "@/hooks/api/inviteCode/useDeleteInviteCode";
import { useDeactivateInviteCode } from "@/hooks/api/inviteCode/useDeactivateInviteCode";
import { useReactivateInviteCode } from "@/hooks/api/inviteCode/useReactivateInviteCode";
import { useUserType } from "@/hooks/auth/useUserType";
import { format } from "date-fns";

export const Route = createFileRoute("/add-users")({
  component: AddUsersPage,
});

function AddUsersPage() {
  const { t } = useTranslation();
  const [filterText, setFilterText] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [walkthroughOpen, setWalkthroughOpen] = useState(false);

  const { userType, isLoading: userTypeLoading, callsign } = useUserType();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userTypeLoading && !callsign) {
      toast.error(t("addUsers.messages.noCallsignError"));
      navigate({ to: "/login" });
    }
  }, [callsign, userTypeLoading, navigate, t]);

  useEffect(() => {
    const hasSeenWalkthrough = localStorage.getItem(
      `add-users-walkthrough-${callsign}`,
    );
    if (!hasSeenWalkthrough && !userTypeLoading) {
      setWalkthroughOpen(true);
      localStorage.setItem(`add-users-walkthrough-${callsign}`, "true");
    }
  }, [callsign, userTypeLoading]);

  const {
    data: inviteCodes,
    isLoading,
    refetch,
  } = useInviteCodeList({
    refetchInterval: 10000,
  });

  const createInviteCodeMutation = useCreateInviteCode({
    onSuccess: (newCode) => {
      toast.success(t("addUsers.messages.codeCreated"));
      setCreateModalOpen(false);
      refetch();
      navigate({ to: "/invite-code/$code", params: { code: newCode } });
    },
    onError: (error) => {
      toast.error(t("addUsers.messages.createError", { error: error.message }));
    },
  });

  const deleteInviteCodeMutation = useDeleteInviteCode({
    onSuccess: () => {
      toast.success(t("addUsers.messages.codeDeleted"));
      setManageDialogOpen(false);
      setSelectedCode(null);
      refetch();
    },
    onError: (error) => {
      toast.error(t("addUsers.messages.deleteError", { error: error.message }));
    },
  });

  const deactivateInviteCodeMutation = useDeactivateInviteCode({
    onSuccess: () => {
      toast.success(t("addUsers.messages.codeDeactivated"));
      setManageDialogOpen(false);
      setSelectedCode(null);
      refetch();
    },
    onError: (error) => {
      toast.error(t("addUsers.messages.deactivateError", { error: error.message }));
    },
  });

  const reactivateInviteCodeMutation = useReactivateInviteCode({
    onSuccess: () => {
      toast.success(t("addUsers.messages.codeActivated"));
      setManageDialogOpen(false);
      setSelectedCode(null);
      refetch();
    },
    onError: (error) => {
      toast.error(t("addUsers.messages.activateError", { error: error.message }));
    },
  });

  useEffect(() => {
    if (!userTypeLoading && userType !== "admin") {
      toast.error(t("addUsers.messages.forbiddenError"));
      navigate({ to: "/" });
    }
  }, [userType, userTypeLoading, navigate, t]);

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

  const filteredCodes =
    inviteCodes?.filter((invite) =>
      invite.invitecode.toLowerCase().includes(filterText.toLowerCase()),
    ) || [];

  const handleCreateInvite = () => {
    createInviteCodeMutation.mutate(undefined);
  };

  const handleDeleteCode = () => {
    if (!selectedCode) return;
    deleteInviteCodeMutation.mutate(selectedCode);
  };

  const handleToggleStatus = () => {
    if (!selectedCode) return;
    const code = inviteCodes?.find((c) => c.invitecode === selectedCode);
    if (!code) return;

    if (code.active) {
      deactivateInviteCodeMutation.mutate(selectedCode);
    } else {
      reactivateInviteCodeMutation.mutate(selectedCode);
    }
  };

  const handleCodeClick = (code: string, e: React.MouseEvent) => {
    e.preventDefault();
    navigate({ to: "/invite-code/$code", params: { code } });
  };

  const handleManageClick = (code: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedCode(code);
    setManageDialogOpen(true);
  };

  const handleBulkDelete = async () => {
    for (const code of selectedCodes) {
      await deleteInviteCodeMutation.mutateAsync(code);
    }
    toast.success(t("addUsers.messages.codesDeleted", { count: selectedCodes.length }));
    setSelectedCodes([]);
    setBulkMode(false);
    refetch();
  };

  const handleBulkDisable = async () => {
    for (const code of selectedCodes) {
      await deactivateInviteCodeMutation.mutateAsync(code);
    }
    toast.success(t("addUsers.messages.codesDisabled", { count: selectedCodes.length }));
    setSelectedCodes([]);
    setBulkMode(false);
    refetch();
  };

  const handleBulkEnable = async () => {
    for (const code of selectedCodes) {
      await reactivateInviteCodeMutation.mutateAsync(code);
    }
    toast.success(t("addUsers.messages.codesEnabled", { count: selectedCodes.length }));
    setSelectedCodes([]);
    setBulkMode(false);
    refetch();
  };

  const toggleCodeSelection = (code: string) => {
    setSelectedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

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
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{t("addUsers.title")}</h1>
          <p className="text-sm text-muted-foreground">
            <span className="text-primary font-medium">
              {t("addUsers.subtitleHighlight")}
            </span>{" "}
            {t("addUsers.subtitle")}
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

      <div className="flex flex-col md:flex-row items-center gap-3">
        <Button
          onClick={() => setCreateModalOpen(true)}
          className="w-full md:w-auto bg-primary hover:bg-primary/90 h-12 md:h-12 px-6 font-semibold rounded-xl"
          disabled={createInviteCodeMutation.isLoading}
        >
          <Plus className="w-5 h-5 mr-2" />
          <span className="hidden md:inline">
            {createInviteCodeMutation.isLoading
              ? t("addUsers.creating")
              : t("addUsers.createNewInvite")}
          </span>
          <span className="md:hidden">
            {createInviteCodeMutation.isLoading ? "..." : t("addUsers.create")}
          </span>
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setBulkMode(!bulkMode);
            setSelectedCodes([]);
          }}
          className="w-full md:w-auto h-12 px-6 font-semibold rounded-xl"
        >
          <CheckSquare className="w-5 h-5" />
          <span className="ml-2 hidden md:inline">
            {bulkMode ? t("addUsers.cancel") : t("addUsers.selectMultiple")}
          </span>
        </Button>
      </div>

      {bulkMode && selectedCodes.length > 0 && (
        <div className="flex items-center gap-2 p-4 bg-card border border-border rounded-xl">
          <span className="text-sm font-medium">
            {t("addUsers.selected", { count: selectedCodes.length })}
          </span>
          <div className="flex-1"></div>
          <Button variant="outline" size="sm" onClick={handleBulkEnable}>
            {t("addUsers.enable")}
          </Button>
          <Button variant="outline" size="sm" onClick={handleBulkDisable}>
            {t("addUsers.disable")}
          </Button>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            {t("addUsers.delete")}
          </Button>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t("addUsers.filterPlaceholder")}
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-3">
        {filteredCodes.map((invite) => (
          <div
            key={invite.invitecode}
            onClick={(e) => {
              if (bulkMode) {
                toggleCodeSelection(invite.invitecode);
              } else {
                handleCodeClick(invite.invitecode, e);
              }
            }}
            className={cn(
              "flex items-center justify-between p-5 bg-card border-2 border-border rounded-xl hover:bg-accent/50 hover:border-primary/50 transition-all cursor-pointer",
              bulkMode &&
                selectedCodes.includes(invite.invitecode) &&
                "bg-accent border-primary",
            )}
          >
            <div className="flex items-center gap-4 flex-1">
              {bulkMode && (
                <input
                  type="checkbox"
                  checked={selectedCodes.includes(invite.invitecode)}
                  onChange={() => toggleCodeSelection(invite.invitecode)}
                  className="w-5 h-5 rounded border-border"
                />
              )}
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
                onClick={(e) => handleManageClick(invite.invitecode, e)}
                className="text-muted-foreground hover:text-foreground p-2"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
      </div>

      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("addUsers.createModalTitle")}</DialogTitle>
            <DialogDescription className="pt-4 space-y-3 text-sm leading-relaxed text-left">
              <p className="font-semibold text-foreground">
                {t("addUsers.createModalWarning")}
              </p>
              <p>{t("addUsers.createModalText")}</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>{t("addUsers.createModalReason1")}</li>
                <li>{t("addUsers.createModalReason2")}</li>
              </ul>
              <p className="text-xs text-muted-foreground">
                {t("addUsers.createModalTip")}
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4 flex-col sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setCreateModalOpen(false)}
              className="flex-1 h-11"
            >
              {t("addUsers.cancel")}
            </Button>
            <Button
              onClick={handleCreateInvite}
              className="flex-1 h-11 bg-primary hover:bg-primary/90"
            >
              {t("addUsers.createModalTitle")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={walkthroughOpen} onOpenChange={setWalkthroughOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("addUsers.walkthrough.title")}</DialogTitle>
            <DialogDescription>{t("addUsers.walkthrough.description")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">{t("addUsers.walkthrough.step1Title")}</h4>
              <p className="text-sm text-muted-foreground">
                {t("addUsers.walkthrough.step1Description")}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">{t("addUsers.walkthrough.step2Title")}</h4>
              <p className="text-sm text-muted-foreground">
                {t("addUsers.walkthrough.step2Description")}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">{t("addUsers.walkthrough.step3Title")}</h4>
              <p className="text-sm text-muted-foreground">
                {t("addUsers.walkthrough.step3Description")}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">{t("addUsers.walkthrough.managingTitle")}</h4>
              <p className="text-sm text-muted-foreground">
                • {t("addUsers.walkthrough.managingBullet1")}
                <br />• {t("addUsers.walkthrough.managingBullet2")}
                <br />• {t("addUsers.walkthrough.managingBullet3")}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setWalkthroughOpen(false)}
              className="w-full"
            >
              {t("addUsers.walkthrough.gotIt")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={manageDialogOpen} onOpenChange={setManageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("addUsers.manageModalTitle")}</DialogTitle>
            <DialogDescription>
              {t("addUsers.manageModalCode")}{" "}
              <span className="font-mono font-semibold text-foreground">
                {selectedCode}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleToggleStatus}
              className="w-full bg-transparent"
              disabled={
                deactivateInviteCodeMutation.isLoading ||
                reactivateInviteCodeMutation.isLoading ||
                deleteInviteCodeMutation.isLoading
              }
            >
              {inviteCodes?.find((c) => c.invitecode === selectedCode)?.active
                ? t("addUsers.disableCode")
                : t("addUsers.enableCode")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCode}
              className="w-full"
              disabled={
                deactivateInviteCodeMutation.isLoading ||
                reactivateInviteCodeMutation.isLoading ||
                deleteInviteCodeMutation.isLoading
              }
            >
              {deleteInviteCodeMutation.isLoading
                ? t("addUsers.deleting")
                : t("addUsers.deleteCode")}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setManageDialogOpen(false)}
              className="w-full"
            >
              {t("addUsers.cancel")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
