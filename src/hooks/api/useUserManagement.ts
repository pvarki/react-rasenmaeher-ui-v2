import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useUsers } from "@/hooks/api/useUsers";
import { usePromoteUser } from "@/hooks/api/usePromoteUser";
import { useDemoteUser } from "@/hooks/api/useDemoteUser";
import { useDeleteUser } from "@/hooks/api/useDeleteUser";

export interface User {
  callsign: string;
  roles: string[];
}

interface UseUserManagementOptions {
  currentCallsign: string | null;
}

export function useUserManagement({
  currentCallsign,
}: UseUserManagementOptions) {
  const { t } = useTranslation();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkAction, setBulkAction] = useState<
    "promote" | "demote" | "remove" | null
  >(null);

  // Confirmation states
  const [promoteConfirmOpen, setPromoteConfirmOpen] = useState(false);
  const [demoteConfirmOpen, setDemoteConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);

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
        t("manageUsers.messages.promoted", {
          callsign: selectedUser?.callsign,
        }),
      );
      setPromoteConfirmOpen(false);
      setTimeout(() => setSelectedUser(null), 150);
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
      setDemoteConfirmOpen(false);
      setTimeout(() => setSelectedUser(null), 150);
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
      setDeleteConfirmOpen(false);
      setTimeout(() => setSelectedUser(null), 150);
      refetch();
    },
    onError: (error) => {
      toast.error(
        t("manageUsers.messages.removeFailed", { error: error.message }),
      );
    },
  });

  const administrators = users?.filter((u) => u.roles?.includes("admin")) || [];
  const fighters = users?.filter((u) => !u.roles?.includes("admin")) || [];

  const isAdmin = (user: User) => user.roles?.includes("admin");
  const isCurrentUser = (user: User) => user.callsign === currentCallsign;

  const hasAdminSelected = selectedUsers.some((userCallsign) =>
    administrators.some((admin) => admin.callsign === userCallsign),
  );

  const toggleUserSelection = (userCallsign: string) => {
    if (userCallsign === currentCallsign) {
      toast.error(t("manageUsers.messages.cannotSelectSelf"));
      return;
    }
    setSelectedUsers((prev) =>
      prev.includes(userCallsign)
        ? prev.filter((c) => c !== userCallsign)
        : [...prev, userCallsign],
    );
  };

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
    if (selectedUser.callsign === currentCallsign) {
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

    if (selectedUser.callsign === currentCallsign) {
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

  const handleBulkPromote = () => {
    setBulkAction("promote");
    setBulkConfirmOpen(true);
  };

  const handleBulkDemote = () => {
    setBulkAction("demote");
    setBulkConfirmOpen(true);
  };

  const handleBulkRemove = () => {
    setBulkAction("remove");
    setBulkConfirmOpen(true);
  };

  const confirmBulkAction = async () => {
    for (const callsign of selectedUsers) {
      if (bulkAction === "promote") {
        await promoteUserMutation.mutateAsync({ callsign });
      } else if (bulkAction === "demote") {
        await demoteUserMutation.mutateAsync({ callsign });
      } else if (bulkAction === "remove") {
        await deleteUserMutation.mutateAsync(callsign);
      }
    }
    toast.success(t(`manageUsers.messages.bulk${bulkAction}Success`));
    setSelectedUsers([]);
    setBulkMode(false);
    setBulkConfirmOpen(false);
    setBulkAction(null);
    refetch();
  };

  const toggleBulkMode = () => {
    setBulkMode(!bulkMode);
    setSelectedUsers([]);
  };

  return {
    // Data
    users,
    administrators,
    fighters,
    isLoading,

    // Selection state
    selectedUser,
    setSelectedUser,
    selectedUsers,
    bulkMode,
    bulkAction,
    hasAdminSelected,

    // Confirmation states
    promoteConfirmOpen,
    setPromoteConfirmOpen,
    demoteConfirmOpen,
    setDemoteConfirmOpen,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    bulkConfirmOpen,
    setBulkConfirmOpen,

    // Mutations
    promoteUserMutation,
    demoteUserMutation,
    deleteUserMutation,

    // Helpers
    isAdmin,
    isCurrentUser,

    // Actions
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
  };
}
