"use client";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { useEnrollmentList } from "@/hooks/api/useEnrollmentList";
import { useApproveUser } from "@/hooks/api/useApproveUser";
import { useRejectUser } from "@/hooks/api/useRejectUser";
import { EnrollmentState } from "@/hooks/api/model/enrollmentState";
import { useUserType } from "@/hooks/auth/useUserType";

import {
  QRScanner,
  ApproveUserDialog,
  WaitingUsersList,
  HowItWorksSection,
} from "@/components/approve-users";

export const Route = createFileRoute("/approve-users")({
  component: ApproveUsersPage,
});

function ApproveUsersPage() {
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [waitingUsersOpen, setWaitingUsersOpen] = useState(true);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [approvalCode, setApprovalCode] = useState("");

  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userType, isLoading: userTypeLoading, callsign } = useUserType();

  useEffect(() => {
    if (!userTypeLoading && !callsign) {
      toast.error(t("approveUsers.noCallsignFound"));
      navigate({ to: "/login" });
    }
  }, [callsign, userTypeLoading, navigate, t]);

  useEffect(() => {
    if (!userTypeLoading && userType !== "admin") {
      toast.error(t("approveUsers.forbidden"));
      navigate({ to: "/" });
    }
  }, [userType, userTypeLoading, navigate, t]);

  const {
    data: enrollmentList,
    isLoading,
    refetch,
  } = useEnrollmentList({
    refetchInterval: 5000,
  });

  const approveUserMutation = useApproveUser({
    onSuccess: () => {
      toast.success(
        t("approveUsers.userApprovedSuccessfully", { callsign: selectedUser }),
      );
      setApproveDialogOpen(false);
      setApprovalCode("");
      setSelectedUser(null);
      refetch();
    },
    onError: (error) => {
      toast.error(t("approveUsers.failedToApprove", { error: error.message }));
    },
  });

  const rejectUserMutation = useRejectUser({
    onSuccess: () => {
      toast.error(t("approveUsers.userRejected", { callsign: selectedUser }));
      setApproveDialogOpen(false);
      setApprovalCode("");
      setSelectedUser(null);
      refetch();
    },
    onError: (error) => {
      toast.error(t("approveUsers.failedToReject", { error: error.message }));
    },
  });

  const waitingUsers =
    enrollmentList?.filter((u) => u.state === EnrollmentState.PENDING) || [];

  const handleApproveClick = (callsign: string) => {
    setSelectedUser(callsign);
    setApproveDialogOpen(true);
  };

  const handleApprove = () => {
    if (!approvalCode.trim()) {
      toast.error(t("approveUsers.enterApprovalCodeMessage"));
      return;
    }
    if (!selectedUser) return;
    approveUserMutation.mutate({ callsign: selectedUser, approvalCode });
  };

  const handleReject = () => {
    if (!selectedUser) return;
    rejectUserMutation.mutate({ callsign: selectedUser });
  };

  const handleQRScanSuccess = (callsign: string, code: string) => {
    setSelectedUser(callsign);
    setApprovalCode(code);
    setApproveDialogOpen(true);
  };

  const handleApprovalCodeScanned = (code: string) => {
    setApprovalCode(code);
  };

  if (!userTypeLoading && userType !== "admin") {
    return (
      <div className="max-w-4xl mx-auto space-y-6 text-center py-12">
        <h1 className="text-6xl font-bold text-destructive">403</h1>
        <p className="text-xl text-muted-foreground">
          {t("approveUsers.forbidden")}
        </p>
      </div>
    );
  }

  if (isLoading || userTypeLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">{t("approveUsers.title")}</h1>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("approveUsers.title")}</h1>
      </div>

      <div className="space-y-4">
        <p className="text-muted-foreground">
          {t("approveUsers.usersAwaiting")}
        </p>

        <HowItWorksSection
          open={howItWorksOpen}
          onOpenChange={setHowItWorksOpen}
        />

        <WaitingUsersList
          users={waitingUsers}
          open={waitingUsersOpen}
          onOpenChange={setWaitingUsersOpen}
          onUserClick={handleApproveClick}
        />
      </div>

      <div className="flex gap-3">
        <QRScanner
          onScanSuccess={handleQRScanSuccess}
          onApprovalCodeScanned={handleApprovalCodeScanned}
        />
      </div>

      <ApproveUserDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        selectedUser={selectedUser}
        approvalCode={approvalCode}
        onApprovalCodeChange={setApprovalCode}
        onApprove={handleApprove}
        onReject={handleReject}
        isApproving={approveUserMutation.isLoading}
        isRejecting={rejectUserMutation.isLoading}
      />
    </div>
  );
}
