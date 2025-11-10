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
  const currentDomain = window.location.hostname.replace(/^mtls\./, "");
  const keycloakUrl = `https://kc.${currentDomain}:9443/admin/RASENMAEHER/console/`;
  const { userType, isLoading: userTypeLoading, callsign } = useUserType();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userTypeLoading && !callsign) {
      toast.error("No callsign found. Please log in.");
      navigate({ to: "/login" });
    }
  }, [callsign, userTypeLoading, navigate]);

  useEffect(() => {
    const hasSeenWalkthrough = localStorage.getItem("manage-users-walkthrough");
    if (!hasSeenWalkthrough && !userTypeLoading) {
      setWalkthroughOpen(true);
      localStorage.setItem("manage-users-walkthrough", "true");
    }
  }, [userTypeLoading]);

  const {
    data: users,
    isLoading,
    refetch,
  } = useUsers({
    refetchInterval: 10000,
  });

  const promoteUserMutation = usePromoteUser({
    onSuccess: () => {
      toast.success(`${selectedUser?.callsign} promoted to administrator!`);
      setSelectedUser(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to promote user: ${error.message}`);
    },
  });

  const demoteUserMutation = useDemoteUser({
    onSuccess: () => {
      toast.success(`${selectedUser?.callsign} demoted to fighter!`);
      setSelectedUser(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to demote user: ${error.message}`);
    },
  });

  const deleteUserMutation = useDeleteUser({
    onSuccess: () => {
      toast.error(`${selectedUser?.callsign} removed from the system`);
      setSelectedUser(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to remove user: ${error.message}`);
    },
  });

  useEffect(() => {
    if (!userTypeLoading && userType !== "admin") {
      toast.error("403 Forbidden: Admin access required");
      navigate({ to: "/" });
    }
  }, [userType, userTypeLoading, navigate]);

  const administrators =
    users?.filter((u) => u.roles && u.roles.includes("admin")) || [];
  const fighters =
    users?.filter((u) => u.roles && !u.roles.includes("admin")) || [];

  const isAdmin = (user: User) => user.roles && user.roles.includes("admin");
  const isCurrentUser = (user: User) => user.callsign === callsign;

  const handlePromote = () => {
    if (!selectedUser) return;
    promoteUserMutation.mutate({ callsign: selectedUser.callsign });
  };

  const handleDemote = () => {
    if (!selectedUser) return;

    if (selectedUser.callsign === callsign) {
      toast.error("You cannot demote your own account");
      return;
    }

    demoteUserMutation.mutate({ callsign: selectedUser.callsign });
  };

  const handleRemove = () => {
    if (!selectedUser) return;

    if (selectedUser.callsign === callsign) {
      toast.error("You cannot delete your own account");
      return;
    }

    if (isAdmin(selectedUser) && administrators.length <= 1) {
      toast.error(
        "Cannot delete the last admin. At least one admin must exist.",
      );
      return;
    }

    deleteUserMutation.mutate(selectedUser.callsign);
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
        <h1 className="text-3xl font-bold">Manage Users</h1>
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
          <h1 className="text-3xl font-bold">Manage Users</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Manage users in this view.{" "}
            <span className="text-primary font-medium">Admins</span> are users
            that are able to access these user management tools.{" "}
            <span className="text-primary font-medium">Fighters</span> are basic
            users, who have access to your services.
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
            Administrators ({administrators.length})
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
              No administrators yet.
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
                    You
                  </span>
                )}
              </div>
            ))
          )}
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={fightersOpen} onOpenChange={setFightersOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-card border border-border rounded-xl hover:bg-accent/30 transition-colors">
          <span className="font-medium">Fighters ({fighters.length})</span>
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
              No fighters yet.
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
          asChild
          variant="outline"
          className="w-full bg-transparent rounded-xl"
        >
          <a href={keycloakUrl} target="_blank" rel="noopener noreferrer">
            Go to Keycloak Management Console
          </a>
        </Button>
      </div>

      <Dialog open={walkthroughOpen} onOpenChange={setWalkthroughOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>How to Manage Users</DialogTitle>
            <DialogDescription>
              Quick guide to managing your team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">
                Promoting/Demoting Users
              </h4>
              <p className="text-sm text-muted-foreground">
                Click on any user to promote fighters to admins or demote admins
                to fighters. Promoted users gain the same administrative rights
                as you.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Removing Users</h4>
              <p className="text-sm text-muted-foreground">
                Removing users will revoke their access to this Deploy App and
                all connected services. They will no longer be able to connect
                to your situation awareness service.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Important Notes</h4>
              <p className="text-sm text-muted-foreground">
                • You cannot remove or demote yourself
                <br />• At least one admin must exist at all times
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setWalkthroughOpen(false)}
              className="w-full"
            >
              Got it!
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
              <DialogTitle>Manage User</DialogTitle>
              <DialogDescription>
                Managing{" "}
                <span className="font-semibold text-foreground">
                  {selectedUser?.callsign}
                </span>
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Current role:{" "}
                <span className="font-medium text-foreground capitalize">
                  {selectedUser && isAdmin(selectedUser) ? "admin" : "fighter"}
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
                Go back
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex-1">
                    <Button
                      variant="destructive"
                      onClick={handleRemove}
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
                      {deleteUserMutation.isLoading ? "Removing..." : "Remove"}
                    </Button>
                  </span>
                </TooltipTrigger>
                {selectedUser && isCurrentUser(selectedUser) && (
                  <TooltipContent>
                    <p>You cannot remove yourself from this application</p>
                  </TooltipContent>
                )}
              </Tooltip>
              {selectedUser && !isAdmin(selectedUser) ? (
                <Button
                  onClick={handlePromote}
                  className="flex-1 bg-teal-600 hover:bg-teal-700"
                  disabled={
                    promoteUserMutation.isLoading ||
                    demoteUserMutation.isLoading ||
                    deleteUserMutation.isLoading
                  }
                >
                  {promoteUserMutation.isLoading ? "Promoting..." : "Promote"}
                </Button>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex-1">
                      <Button
                        onClick={handleDemote}
                        className="w-full bg-orange-600 hover:bg-orange-700"
                        disabled={
                          promoteUserMutation.isLoading ||
                          demoteUserMutation.isLoading ||
                          deleteUserMutation.isLoading ||
                          (selectedUser ? isCurrentUser(selectedUser) : false)
                        }
                      >
                        {demoteUserMutation.isLoading
                          ? "Demoting..."
                          : "Demote"}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {selectedUser && isCurrentUser(selectedUser) && (
                    <TooltipContent>
                      <p>You cannot demote yourself</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TooltipProvider>
    </div>
  );
}
