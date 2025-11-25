"use client";

import { cn } from "@/lib/utils";
import { ChevronDown, Globe } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useUserType } from "@/hooks/auth/useUserType";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, UserSearch as UserStar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export function Sidebar({ isOpen, onClose, isMobile }: SidebarProps) {
  const location = useLocation();
  const { userType } = useUserType();
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();

  const { callsign } = useUserType();

  // Get current path with search params
  const currentPath = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  const currentType = searchParams.get("type");

  // Check if we're on admin-tools with specific type
  const isAdminToolsServices =
    currentPath === "/admin-tools" && currentType === "services";
  const isAdminToolsUsers =
    currentPath === "/admin-tools" && currentType === "users";
  const isUserManagementPage = [
    "/approve-users",
    "/manage-users",
    "/add-users",
  ].includes(currentPath);

  // Auto-open dropdown when on admin-tools or related pages
  const isAdminToolsSection =
    currentPath === "/admin-tools" || isUserManagementPage;
  const [userManagementOpen, setUserManagementOpen] = useState(
    isAdminToolsSection || isAdminToolsUsers,
  );

  return (
    <aside
      className={cn(
        "bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col z-40",
        isMobile
          ? "fixed top-16 bottom-0 left-0 w-64"
          : isOpen
            ? "relative w-64"
            : "absolute left-0 w-64 -translate-x-full",
        isOpen
          ? isMobile
            ? "translate-x-0"
            : ""
          : isMobile
            ? "-translate-x-full"
            : "",
      )}
    >
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        <div className="space-y-1">
          <h3 className="text-xs font-semibold text-sidebar-foreground/50 mb-3 px-3 uppercase tracking-wider">
            {t("common.navigation")}
          </h3>
          <Link
            to="/"
            onClick={() => isMobile && onClose()}
            className={cn(
              "block px-3 py-2.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent/80 rounded-lg transition-colors font-medium",
              location.pathname === "/" &&
                "bg-sidebar-accent text-sidebar-foreground",
            )}
          >
            {t("common.home")}
          </Link>
        </div>

        {userType === "admin" && (
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-sidebar-foreground/50 mb-3 px-3 uppercase tracking-wider">
              {t("common.administrators")}
            </h3>
            <Link
              to="/admin-tools"
              onClick={() => isMobile && onClose()}
              className={cn(
                "block px-3 py-2.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent/80 rounded-lg transition-colors font-medium",
                (isAdminToolsServices ||
                  (currentPath.endsWith("/admin-tools") && !currentType)) &&
                  "bg-sidebar-accent text-sidebar-foreground",
              )}
            >
              {t("adminTools.navLink")}
            </Link>
            <div
              className={cn(
                "flex items-center justify-between px-3 py-2.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent/80 rounded-lg transition-colors font-medium",
                (isAdminToolsUsers || isUserManagementPage) &&
                  "bg-sidebar-accent text-sidebar-foreground",
              )}
            >
              <Link
                to="/admin-tools"
                search={{ type: "users" }}
                onClick={() => {
                  if (isMobile) onClose();
                }}
                className="flex-1 text-left"
              >
                {t("common.userManagement")}
              </Link>
              <button
                onClick={() => setUserManagementOpen(!userManagementOpen)}
                className="p-1 hover:bg-sidebar-accent rounded transition-colors"
              >
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform",
                    userManagementOpen && "rotate-180",
                  )}
                />
              </button>
            </div>
            {userManagementOpen && (
              <div className="ml-3 mt-1 space-y-1 border-l border-sidebar-border pl-3">
                <Link
                  to="/approve-users"
                  onClick={() => isMobile && onClose()}
                  className={cn(
                    "block px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/60 rounded-lg transition-colors",
                    location.pathname === "/approve-users" &&
                      "bg-sidebar-accent text-sidebar-foreground font-medium",
                  )}
                >
                  {t("common.approveUsers")}
                </Link>
                <Link
                  to="/manage-users"
                  onClick={() => isMobile && onClose()}
                  className={cn(
                    "block px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/60 rounded-lg transition-colors",
                    location.pathname === "/manage-users" &&
                      "bg-sidebar-accent text-sidebar-foreground font-medium",
                  )}
                >
                  {t("common.manageUsers")}
                </Link>
                <Link
                  to="/add-users"
                  onClick={() => isMobile && onClose()}
                  className={cn(
                    "block px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/60 rounded-lg transition-colors",
                    location.pathname === "/add-users" &&
                      "bg-sidebar-accent text-sidebar-foreground font-medium",
                  )}
                >
                  {t("common.addUsers")}
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-sidebar-border bg-sidebar space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider px-2">
            {t("common.language")}
          </label>
          <Select value={currentLanguage} onValueChange={changeLanguage}>
            <SelectTrigger className="h-10 bg-sidebar-accent/30 border-sidebar-accent/50">
              <Globe className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="fi">Suomi (Finnish)</SelectItem>
              <SelectItem value="sv">Svenska (Swedish)</SelectItem>
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
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {callsign || "UNKNOWN"}
                </p>
                <p className="text-xs text-sidebar-foreground/60 capitalize">
                  {userType === "admin" ? t("common.admin") : t("common.user")}
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
  );
}
