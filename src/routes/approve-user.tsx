"use client";
import { createFileRoute } from "@tanstack/react-router";

import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useApproveUser } from "@/hooks/api/useApproveUser";
import { Loader2 } from "lucide-react";

interface ApproveUserSearch {
  callsign?: string;
  approvalcode?: string;
}

export const Route = createFileRoute("/approve-user")({
  component: ApproveUserPage,
  validateSearch: (search: Record<string, unknown>): ApproveUserSearch => {
    return {
      callsign: (search.callsign as string) || undefined,
      approvalcode: (search.approvalcode as string) || undefined,
    };
  },
});

function ApproveUserPage() {
  const navigate = useNavigate();
  const { callsign, approvalcode } = Route.useSearch();
  const [approvalCode, setApprovalCode] = useState(approvalcode || "");

  const approveUserMutation = useApproveUser({
    onSuccess: () => {
      toast.success(`User ${callsign} approved successfully!`);
      navigate({ to: "/approve-users" });
    },
    onError: (error) => {
      toast.error(`Failed to approve user: ${error.message}`);
    },
  });

  useEffect(() => {
    if (!callsign) {
      navigate({ to: "/approve-users" });
    }
  }, [callsign, navigate]);

  const handleApprove = () => {
    if (!approvalCode.trim()) {
      toast.error("Please enter an approval code");
      return;
    }
    if (!callsign) return;
    approveUserMutation.mutate({ callsign, approvalCode });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Approve User
          </CardTitle>
          <CardDescription className="text-center">
            Approve{" "}
            <span className="font-semibold text-foreground">{callsign}</span> to
            access the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="approval-code">Approval Code</Label>
            <Input
              id="approval-code"
              value={approvalCode}
              onChange={(e) => setApprovalCode(e.target.value)}
              placeholder="Enter approval code"
              onKeyDown={(e) => e.key === "Enter" && handleApprove()}
              autoFocus
              disabled={approveUserMutation.isLoading}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate({ to: "/approve-users" })}
              disabled={approveUserMutation.isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={approveUserMutation.isLoading || !approvalCode.trim()}
            >
              {approveUserMutation.isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                "Approve"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
