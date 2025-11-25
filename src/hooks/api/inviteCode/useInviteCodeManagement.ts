import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useInviteCodeList } from "@/hooks/api/inviteCode/useInviteCodeList";
import { useCreateInviteCode } from "@/hooks/api/inviteCode/useCreateInviteCode";
import { useDeleteInviteCode } from "@/hooks/api/inviteCode/useDeleteInviteCode";
import { useDeactivateInviteCode } from "@/hooks/api/inviteCode/useDeactivateInviteCode";
import { useReactivateInviteCode } from "@/hooks/api/inviteCode/useReactivateInviteCode";
import { useUserType } from "@/hooks/auth/useUserType";

export function useInviteCodeManagement() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userType, isLoading: userTypeLoading, callsign } = useUserType();

  const [filterText, setFilterText] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [walkthroughOpen, setWalkthroughOpen] = useState(false);

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
      toast.error(
        t("addUsers.messages.deactivateError", { error: error.message })
      );
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
      toast.error(
        t("addUsers.messages.activateError", { error: error.message })
      );
    },
  });

  // Auth checks
  useEffect(() => {
    if (!userTypeLoading && !callsign) {
      toast.error(t("addUsers.messages.noCallsignError"));
      navigate({ to: "/login" });
    }
  }, [callsign, userTypeLoading, navigate, t]);

  useEffect(() => {
    if (!userTypeLoading && userType !== "admin") {
      toast.error(t("addUsers.messages.forbiddenError"));
      navigate({ to: "/" });
    }
  }, [userType, userTypeLoading, navigate, t]);

  // Walkthrough on first visit
  useEffect(() => {
    const hasSeenWalkthrough = localStorage.getItem(
      `add-users-walkthrough-${callsign}`
    );
    if (!hasSeenWalkthrough && !userTypeLoading) {
      setWalkthroughOpen(true);
      localStorage.setItem(`add-users-walkthrough-${callsign}`, "true");
    }
  }, [callsign, userTypeLoading]);

  // Reset selected code when dialog closes
  useEffect(() => {
    if (!manageDialogOpen) {
      setSelectedCode(null);
    }
  }, [manageDialogOpen]);

  const filteredCodes =
    inviteCodes?.filter((invite) =>
      invite.invitecode.toLowerCase().includes(filterText.toLowerCase())
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

  const handleCodeClick = (code: string) => {
    navigate({ to: "/invite-code/$code", params: { code } });
  };

  const handleManageClick = (code: string) => {
    setSelectedCode(code);
    setManageDialogOpen(true);
  };

  const handleBulkDelete = async () => {
    for (const code of selectedCodes) {
      await deleteInviteCodeMutation.mutateAsync(code);
    }
    toast.success(
      t("addUsers.messages.codesDeleted", { count: selectedCodes.length })
    );
    setSelectedCodes([]);
    setBulkMode(false);
    refetch();
  };

  const handleBulkDisable = async () => {
    for (const code of selectedCodes) {
      await deactivateInviteCodeMutation.mutateAsync(code);
    }
    toast.success(
      t("addUsers.messages.codesDisabled", { count: selectedCodes.length })
    );
    setSelectedCodes([]);
    setBulkMode(false);
    refetch();
  };

  const handleBulkEnable = async () => {
    for (const code of selectedCodes) {
      await reactivateInviteCodeMutation.mutateAsync(code);
    }
    toast.success(
      t("addUsers.messages.codesEnabled", { count: selectedCodes.length })
    );
    setSelectedCodes([]);
    setBulkMode(false);
    refetch();
  };

  const toggleCodeSelection = (code: string) => {
    setSelectedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const toggleBulkMode = () => {
    setBulkMode(!bulkMode);
    setSelectedCodes([]);
  };

  return {
    // State
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
    // Data
    inviteCodes,
    filteredCodes,
    isLoading,
    userTypeLoading,
    userType,
    callsign,
    // Mutations loading states
    isCreating: createInviteCodeMutation.isLoading,
    isDeleting: deleteInviteCodeMutation.isLoading,
    isTogglingStatus:
      deactivateInviteCodeMutation.isLoading ||
      reactivateInviteCodeMutation.isLoading,
    // Handlers
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
  };
}
