import * as React from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, ShieldCheck, User, ChevronDown } from "lucide-react";
import { getState, updateState, resetState } from "@/mocks/state";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/components/ui/drawer";

export function MockDemoOverlay() {
  const state = getState();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const handleSwitchRole = () => {
    const newRole = state.currentRole === "admin" ? "user" : "admin";
    updateState({ currentRole: newRole });

    if (state.currentCallsign) {
      const user = state.users.find(
        (u) => u.callsign === state.currentCallsign,
      );
      if (user) {
        if (newRole === "admin" && !user.roles.includes("admin")) {
          user.roles.push("admin");
        } else if (newRole === "user") {
          user.roles = user.roles.filter((r) => r !== "admin");
        }
        updateState({ users: state.users });
      }
    }

    window.location.reload();
  };

  const handleReset = () => {
    resetState();
    window.location.href = "/login";
  };

  const SwitchRoleButton = () =>
    state.isAuthenticated ? (
      <Button
        onClick={handleSwitchRole}
        variant="outline"
        size="sm"
        className="gap-1.5 border-orange-500/40 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20 hover:text-orange-200 hover:border-orange-400"
      >
        {state.currentRole === "admin" ? (
          <>
            <User className="w-3.5 h-3.5" />
            Switch to User
          </>
        ) : (
          <>
            <ShieldCheck className="w-3.5 h-3.5" />
            Switch to Admin
          </>
        )}
      </Button>
    ) : null;

  const ResetButton = () => (
    <Button
      onClick={handleReset}
      variant="outline"
      size="sm"
      className="gap-1.5 border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-red-200 hover:border-red-400"
    >
      <RotateCcw className="w-3.5 h-3.5" />
      Reset Demo
    </Button>
  );

  return (
    <>
      <div className="hidden sm:flex fixed top-0 left-0 right-0 z-9999 items-center justify-between px-6 py-1.5 bg-neutral-950/95 backdrop-blur-sm border-b border-neutral-800/60 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold tracking-widest uppercase text-neutral-400">
            Demo Mode
          </span>
        </div>
        <div className="flex items-center gap-2">
          <SwitchRoleButton />
          <ResetButton />
        </div>
      </div>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerTrigger asChild>
          <button className="sm:hidden fixed top-0 left-0 right-0 z-9999 flex items-center justify-center gap-1.5 px-4 py-3 bg-neutral-950/95 backdrop-blur-sm border-b border-neutral-800/60 w-full">
            <span className="text-[10px] font-semibold tracking-widest uppercase text-neutral-400">
              Demo Mode
            </span>
            <ChevronDown className="w-3 h-3 text-neutral-500" />
          </button>
        </DrawerTrigger>

        <DrawerContent className="bg-neutral-950 border-neutral-800">
          <DrawerHeader className="border-b border-neutral-800 pb-3">
            <div className="flex items-center justify-center gap-2 mb-1">
              <DrawerTitle className="text-sm font-semibold tracking-widest uppercase text-neutral-300">
                Demo Mode
              </DrawerTitle>
            </div>
            <DrawerDescription className="text-center text-xs text-neutral-500">
              Here you can switch roles or reset the demo. These actions will
              affect all users in the demo environment.
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex flex-col gap-3 p-6">
            {state.isAuthenticated && (
              <div className="flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-neutral-500 mb-1">
                  Role
                </span>
                <Button
                  onClick={() => {
                    setDrawerOpen(false);
                    handleSwitchRole();
                  }}
                  variant="outline"
                  className="w-full gap-2 border-orange-500/40 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20 hover:text-orange-200"
                >
                  {state.currentRole === "admin" ? (
                    <>
                      <User className="w-4 h-4" />
                      Switch to User
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Switch to Admin
                    </>
                  )}
                </Button>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wider text-neutral-500 mb-1">
                Session
              </span>
              <Button
                onClick={() => {
                  setDrawerOpen(false);
                  handleReset();
                }}
                variant="outline"
                className="w-full gap-2 border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-red-200"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Demo
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
