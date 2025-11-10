"use client";

import {
  createRootRoute,
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { ChevronDown, Menu, User, UserSearch as UserStar } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useUserType } from "@/hooks/auth/useUserType";
import { getTheme } from "@/config/themes";
import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createRootRoute({
  component: RootLayoutWrapper,
});

function RootLayoutWrapper() {
  return <RootLayout />;
}

function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userManagementOpen, setUserManagementOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const {
    userType,
    isLoading: userTypeLoading,
    callsign,
    isValidUser,
  } = useUserType();

  const themeConfig = getTheme();

  useEffect(() => {
    const host = window.location.host;
    const isMtlsDomain = host.startsWith("mtls.");

    if (
      !userTypeLoading &&
      isValidUser &&
      !isMtlsDomain &&
      location.pathname === "/"
    ) {
      // User is authenticated but on non-mTLS domain, redirect to mTLS domain
      const mtlsHost = `mtls.${host}`;
      window.location.href = `${window.location.protocol}//${mtlsHost}/`;
      return;
    }
  }, [userTypeLoading, isValidUser, location.pathname]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/waiting-room" ||
    location.pathname === "/mtls-install" ||
    location.pathname === "/callsign-setup" ||
    location.pathname === "/error" ||
    location.pathname === "/approve-user" ||
    location.pathname.startsWith("/product/");

  useEffect(() => {
    if (!userTypeLoading && isValidUser) {
      const adminPaths = ["/approve-users", "/manage-users", "/add-users"];
      const isAdminPath = adminPaths.some((path) =>
        location.pathname.startsWith(path),
      );

      if (isAdminPath && userType !== "admin") {
        toast.error("403 Forbidden: Admin access required");
        navigate({ to: "/" });
      }
    }
  }, [userType, userTypeLoading, isValidUser, location.pathname, navigate]);

  if (isAuthPage) {
    return <Outlet />;
  }

  if (userTypeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isValidUser) {
    navigate({ to: "/login" });
    return null;
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col z-50",
          isMobile
            ? "fixed inset-y-0 left-0 w-64"
            : sidebarOpen
              ? "relative w-64"
              : "absolute left-0 w-64 -translate-x-full",
          sidebarOpen
            ? isMobile
              ? "translate-x-0"
              : ""
            : isMobile
              ? "-translate-x-full"
              : "",
        )}
      >
        <div className="p-6 border-b border-sidebar-border flex items-center gap-3">
          {themeConfig.assets?.logoUrl ? (
            <img
              src={themeConfig.assets.logoUrl}
              alt="Logo"
              className="w-10 h-12"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: themeConfig.sidebarLogo?.bgColor }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="w-6 h-6 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          )}
          <div className="flex flex-col text-xs leading-tight">
            <span className="font-semibold text-sidebar-foreground text-[11px]">
              {themeConfig.name || "PV-Arki"}
            </span>
            <span className="text-sidebar-foreground/60">
              {themeConfig.subName || "Deploy App UI"}
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-sidebar-foreground/50 mb-3 px-3 uppercase tracking-wider">
              Navigation
            </h3>
            <Link
              to="/"
              className={cn(
                "block px-3 py-2.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent/80 rounded-lg transition-colors font-medium",
                location.pathname === "/" &&
                  "bg-sidebar-accent text-sidebar-foreground",
              )}
            >
              Home
            </Link>
          </div>

          {userType === "admin" && (
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-sidebar-foreground/50 mb-3 px-3 uppercase tracking-wider">
                Administrators
              </h3>
              <button
                onClick={() => setUserManagementOpen(!userManagementOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent/80 rounded-lg transition-colors font-medium"
              >
                <span>User Management</span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform",
                    userManagementOpen && "rotate-180",
                  )}
                />
              </button>
              {userManagementOpen && (
                <div className="ml-3 mt-1 space-y-1 border-l border-sidebar-border pl-3">
                  <Link
                    to="/approve-users"
                    className={cn(
                      "block px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/60 rounded-lg transition-colors",
                      location.pathname === "/approve-users" &&
                        "bg-sidebar-accent text-sidebar-foreground font-medium",
                    )}
                  >
                    Approve Users
                  </Link>
                  <Link
                    to="/manage-users"
                    className={cn(
                      "block px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/60 rounded-lg transition-colors",
                      location.pathname === "/manage-users" &&
                        "bg-sidebar-accent text-sidebar-foreground font-medium",
                    )}
                  >
                    Manage Users
                  </Link>
                  <Link
                    to="/add-users"
                    className={cn(
                      "block px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/60 rounded-lg transition-colors",
                      location.pathname === "/add-users" &&
                        "bg-sidebar-accent text-sidebar-foreground font-medium",
                    )}
                  >
                    Add Users
                  </Link>
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-sidebar-border bg-sidebar space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider px-2">
              Language
            </label>
            <Select>
              <SelectTrigger className="h-10 bg-sidebar-accent/30 border-sidebar-accent/50">
                <Globe className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fi">Finnish</SelectItem>
                <SelectItem value="sv">Swedish</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={true}>
              <button className="w-full flex items-center gap-3 px-2 hover:bg-sidebar-accent/80 rounded-lg transition-colors py-2">
                <div className="w-9 h-9 bg-sidebar-accent rounded-full flex items-center justify-center shrink-0">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-sidebar-foreground truncate uppercase">
                    {callsign || "USER"}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60 capitalize">
                    {userType || "user"}
                  </p>
                </div>

                {userType === "admin" ? (
                  <UserStar className="w-4 h-4 text-green-400" />
                ) : (
                  <User className="w-4 h-4 text-blue-400" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56"
            ></DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-card border-b border-border px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-foreground hover:text-foreground/80"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold tracking-tight">Deploy App</h1>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>

        <footer className="border-t border-border p-4 text-center text-xs text-muted-foreground">
          COPYRIGHT 2025 Deploy App PV Arki
        </footer>
      </div>
    </div>
  );
}
