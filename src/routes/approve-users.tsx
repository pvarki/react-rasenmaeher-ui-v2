"use client";

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { ChevronDown, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Camera, Scan } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useNavigate } from "@tanstack/react-router";

import { useEnrollmentList } from "@/hooks/api/useEnrollmentList";
import { useApproveUser } from "@/hooks/api/useApproveUser";
import { useRejectUser } from "@/hooks/api/useRejectUser";
import { EnrollmentState } from "@/hooks/api/model/enrollmentState";
import { useUserType } from "@/hooks/auth/useUserType";
import jsQR from "jsqr";

export const Route = createFileRoute("/approve-users")({
  component: ApproveUsersPage,
});

function ApproveUsersPage() {
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [waitingUsersOpen, setWaitingUsersOpen] = useState(true);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [approvalCode, setApprovalCode] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<number | null>(null);

  const navigate = useNavigate();
  const { userType, isLoading: userTypeLoading, callsign } = useUserType();

  useEffect(() => {
    if (!userTypeLoading && !callsign) {
      toast.error("No callsign found. Please log in.");
      navigate({ to: "/login" });
    }
  }, [callsign, userTypeLoading, navigate]);

  useEffect(() => {
    if (!userTypeLoading && userType !== "admin") {
      toast.error("403 Forbidden: Admin access required");
      navigate({ to: "/" });
    }
  }, [userType, userTypeLoading, navigate]);

  const {
    data: enrollmentList,
    isLoading,
    refetch,
  } = useEnrollmentList({
    refetchInterval: 5000,
  });
  const approveUserMutation = useApproveUser({
    onSuccess: () => {
      toast.success(`User ${selectedUser} approved successfully!`);
      setApproveDialogOpen(false);
      setApprovalCode("");
      setSelectedUser(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to approve user: ${error.message}`);
    },
  });
  const rejectUserMutation = useRejectUser({
    onSuccess: () => {
      toast.error(`User ${selectedUser} rejected`);
      setApproveDialogOpen(false);
      setApprovalCode("");
      setSelectedUser(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to reject user: ${error.message}`);
    },
  });

  const waitingUsers =
    enrollmentList?.filter((u) => u.state === EnrollmentState.PENDING) || [];

  useEffect(() => {
    if (isScannerOpen && !isScanning) {
      startScanning();
    } else if (!isScannerOpen && isScanning) {
      stopScanning();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScannerOpen]);

  const handleApproveClick = (user: string) => {
    setSelectedUser(user);
    setApproveDialogOpen(true);
  };

  const handleApprove = () => {
    if (!approvalCode.trim()) {
      toast.error("Please enter an approval code");
      return;
    }
    if (!selectedUser) return;
    approveUserMutation.mutate({ callsign: selectedUser, approvalCode });
  };

  const handleReject = () => {
    if (!selectedUser) return;
    rejectUserMutation.mutate({ callsign: selectedUser });
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      console.log("QR Code detected:", code.data);

      // Parse the QR code data - expecting format like "callsign=xxx&approvalcode=yyy"
      try {
        const url = new URL(code.data);
        const callsignParam = url.searchParams.get("callsign");
        const approvalCodeParam = url.searchParams.get("approvalcode");

        if (callsignParam && approvalCodeParam) {
          setSelectedUser(callsignParam);
          setApprovalCode(approvalCodeParam);
          setIsScannerOpen(false);
          setApproveDialogOpen(true);
          toast.success("QR code scanned successfully!");
        } else {
          toast.error("Invalid QR code format");
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        // If not a URL, try to parse as plain approval code
        setApprovalCode(code.data);
        setIsScannerOpen(false);
        toast.success("Approval code scanned!");
      }
    }
  };

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
        setScanError("");

        scanIntervalRef.current = window.setInterval(scanQRCode, 100);
      }
    } catch (err) {
      setScanError("Failed to access camera. Please check permissions.");
      console.error("Camera error:", err);
    }
  };

  const stopScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsScanning(false);
    }
  };

  if (!userTypeLoading && userType !== "admin") {
    return (
      <div className="max-w-4xl mx-auto space-y-6 text-center py-12">
        <h1 className="text-6xl font-bold text-destructive">403</h1>
        <p className="text-xl text-muted-foreground">
          Forbidden: Admin access required
        </p>
      </div>
    );
  }

  if (isLoading || userTypeLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Approve Users</h1>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Approve Users</h1>
      </div>

      <div className="space-y-4">
        <p className="text-muted-foreground">
          Users awaiting approval are displayed here.
        </p>

        <Collapsible
          open={howItWorksOpen}
          onOpenChange={setHowItWorksOpen}
          className="border border-border rounded-xl overflow-hidden"
        >
          <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-accent/30 transition-colors">
            <span className="font-medium">How it works:</span>
            <ChevronDown
              className={cn(
                "w-5 h-5 transition-transform",
                howItWorksOpen && "rotate-180",
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4 space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              <span className="text-primary font-semibold">1.</span> Users in
              the waiting room will have an{" "}
              <span className="font-medium text-foreground">approval code</span>{" "}
              and QR code displayed on their screen.
            </p>
            <p>
              <span className="text-primary font-semibold">2.</span> Click on a
              user below to open the approval dialog, or scan their QR code.
            </p>
            <p>
              <span className="text-primary font-semibold">3.</span> Enter their
              approval code and click{" "}
              <span className="font-medium text-green-600">Approve</span> to
              grant access, or{" "}
              <span className="font-medium text-destructive">Reject</span> to
              deny.
            </p>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible
          open={waitingUsersOpen}
          onOpenChange={setWaitingUsersOpen}
          className="border border-border rounded-xl overflow-hidden"
        >
          <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-accent/30 transition-colors">
            <span className="font-medium">
              Waiting Users ({waitingUsers.length})
            </span>
            <ChevronDown
              className={cn(
                "w-5 h-5 transition-transform",
                waitingUsersOpen && "rotate-180",
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-2 pb-2">
            <div className="space-y-1">
              {waitingUsers.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No users waiting for approval
                </div>
              ) : (
                waitingUsers.map((user) => (
                  <div
                    key={user.callsign}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors group"
                  >
                    <span className="font-medium">{user.callsign}</span>
                    <button
                      onClick={() => handleApproveClick(user.callsign)}
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
      </div>

      <div className="flex gap-3">
        <Drawer open={isScannerOpen} onOpenChange={setIsScannerOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              className="flex-1 rounded-xl bg-transparent"
            >
              <Camera className="w-4 h-4 mr-2" />
              Scan QR Code
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader className="pt-10">
                <DrawerTitle className="text-center">
                  <Scan className="mb-2 mx-auto size-12" />
                  <p className="text-sm">Scan approval QR code</p>
                </DrawerTitle>
                <DrawerDescription className="text-md">
                  Point your camera at the QR code from the user's waiting room
                  screen. The approval will be detected automatically.
                </DrawerDescription>
              </DrawerHeader>

              <div className="px-8">
                <div className="relative mt-6 aspect-4/5 overflow-hidden rounded-lg border border-dashed border-muted-foreground/40 bg-muted">
                  <video
                    ref={videoRef}
                    className={cn(
                      "absolute inset-0 h-full w-full object-cover",
                      !isScanning && "hidden",
                    )}
                    playsInline
                    muted
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {!isScanning && (
                    <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
                      Camera preview will appear here once started.
                    </div>
                  )}
                </div>

                {scanError && (
                  <p className="mt-3 text-sm text-destructive">{scanError}</p>
                )}
              </div>

              <DrawerFooter className="mb-7 gap-3 p-8">
                <Button
                  variant="outline"
                  onClick={() => setIsScannerOpen(false)}
                >
                  Close
                </Button>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Approve User</DialogTitle>
            <DialogDescription>
              Enter the user's approval code and press Approve.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Callsign:</Label>
              <p className="font-semibold text-lg">{selectedUser}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="approval-code">Approval Code:</Label>
              <div className="flex gap-1 sm:gap-1.5 justify-center sm:justify-start flex-wrap">
                {Array.from({ length: 8 }).map((_, i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    className={cn(
                      "w-9 h-10 sm:w-10 sm:h-12 border-2 border-border rounded-lg text-center text-base sm:text-lg font-bold",
                      "focus:border-primary focus:outline-none transition-colors",
                      "bg-input text-foreground text-sm sm:text-base",
                    )}
                    value={approvalCode[i] || ""}
                    onChange={(e) => {
                      const newCode = approvalCode.split("");
                      newCode[i] = e.target.value.toUpperCase();
                      setApprovalCode(newCode.join(""));

                      // Move to next input if not empty
                      if (e.target.value && i < 7) {
                        const nextInput = e.currentTarget
                          .nextElementSibling as HTMLInputElement;
                        nextInput?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !approvalCode[i] && i > 0) {
                        const prevInput = e.currentTarget
                          .previousElementSibling as HTMLInputElement;
                        prevInput?.focus();
                      }
                      if (e.key === "Enter") {
                        handleApprove();
                      }
                    }}
                    disabled={
                      approveUserMutation.isLoading ||
                      rejectUserMutation.isLoading
                    }
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center sm:text-left">
                Enter or scan the 8-character code
              </p>
            </div>
          </div>
          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="ghost"
              onClick={() => setApproveDialogOpen(false)}
              disabled={
                approveUserMutation.isLoading || rejectUserMutation.isLoading
              }
            >
              Go Back
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={
                approveUserMutation.isLoading || rejectUserMutation.isLoading
              }
            >
              {rejectUserMutation.isLoading ? "Rejecting..." : "Reject"}
            </Button>
            <Button
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700"
              disabled={
                approveUserMutation.isLoading || rejectUserMutation.isLoading
              }
            >
              {approveUserMutation.isLoading ? "Approving..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
