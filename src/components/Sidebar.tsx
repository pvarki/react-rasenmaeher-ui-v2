"use client";

import { cn } from "@/lib/utils";
import { ChevronDown, Globe, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
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
import { useGetProductDescriptions } from "@/hooks/api/useGetProductDescriptions";
import { SidebarProductLink } from "@/components/SidebarProductLink";
import FeedbackForm from "@/components/Feedbackform";

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
  const { data: products = [] } = useGetProductDescriptions(currentLanguage);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  // Get current path with search params
  const currentPath = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  const currentType = searchParams.get("type");

  // Check if we're on product pages
  const isProductPage = currentPath.startsWith("/product/");
  const currentProductShortname = isProductPage
    ? currentPath.split("/")[2]
    : null;

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

  const [deployappsOpen, setDeployappsOpen] = useState(isProductPage);

  useEffect(() => {
    if (!isAdminToolsSection && !isAdminToolsUsers) {
      setUserManagementOpen(false);
    } else {
      setUserManagementOpen(true);
    }
  }, [currentPath, currentType, isAdminToolsSection, isAdminToolsUsers]);

  useEffect(() => {
    if (isProductPage) {
      setDeployappsOpen(true);
    }
  }, [isProductPage]);

  return (
    <aside
      data-testid="sidebar"
      data-sidebar-open={isOpen ? "true" : "false"}
      className={cn(
        "bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col z-40",
        isMobile
          ? "absolute top-0 bottom-0 left-0 w-64"
          : isOpen
            ? "relative w-64"
            : "absolute top-0 bottom-0 left-0 w-64 -translate-x-full",
        isOpen
          ? isMobile
            ? "translate-x-0"
            : ""
          : isMobile
            ? "-translate-x-full"
            : "",
      )}
    >
      <nav className="flex-1 flex flex-col gap-6 p-4 overflow-y-auto">
        {products.length > 0 ? (
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-sidebar-foreground/50 mb-3 px-3 uppercase tracking-wider">
              {t("common.navigation")}
            </h3>
            <div
              className={cn(
                "flex items-center justify-between px-3 py-2.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent/80 rounded-lg transition-colors font-medium",
                location.pathname === "/" &&
                  "bg-sidebar-accent text-sidebar-foreground",
              )}
            >
              <Link
                data-testid="sidebar-nav-home"
                to="/"
                onClick={() => {
                  if (isMobile) onClose();
                }}
                className="flex-1 text-left"
              >
                {t("common.home")}
              </Link>
              <button
                data-testid="sidebar-deployapps-toggle"
                onClick={() => setDeployappsOpen(!deployappsOpen)}
                className="p-1 hover:bg-sidebar-accent rounded transition-colors"
              >
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform",
                    deployappsOpen && "rotate-180",
                  )}
                />
              </button>
            </div>

            {deployappsOpen && (
              <div
                data-testid="sidebar-deployapps-list"
                className="ml-3 mt-1 space-y-1 border-l border-sidebar-border pl-3"
              >
                {products.map((product) => (
                  <SidebarProductLink
                    key={product.shortname}
                    product={product}
                    isActive={currentProductShortname === product.shortname}
                    isMobile={isMobile}
                    onClose={onClose}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-sidebar-foreground/50 mb-3 px-3 uppercase tracking-wider">
              {t("common.navigation")}
            </h3>
            <Link
              data-testid="sidebar-nav-home"
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
        )}

        {userType === "admin" && (
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-sidebar-foreground/50 mb-3 px-3 uppercase tracking-wider">
              {t("common.administrators")}
            </h3>
            <Link
              data-testid="sidebar-nav-admin-tools"
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
                data-testid="sidebar-nav-user-management"
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
                data-testid="sidebar-user-management-toggle"
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
                  data-testid="sidebar-nav-manage-users"
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
                  data-testid="sidebar-nav-add-users"
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
                <Link
                  data-testid="sidebar-nav-approve-users"
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
              </div>
            )}
          </div>
        )}
        <div className="mt-auto pt-4 border-t border-sidebar-border space-y-4">
          <div className="space-y-2">
            <button
              data-testid="sidebar-feedback-button"
              onClick={() => setFeedbackOpen(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent/80 rounded-lg transition-colors font-medium"
            >
              <MessageSquare className="w-4 h-4" />
              {t("common.feedback")}
            </button>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider px-2">
              {t("common.language")}
            </label>
            <Select value={currentLanguage} onValueChange={changeLanguage}>
              <SelectTrigger
                data-testid="sidebar-language-select-trigger"
                className="h-10 bg-sidebar-accent/30 border-sidebar-accent/50"
              >
                <Globe className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem data-testid="sidebar-language-option-en" value="en">
                  English
                </SelectItem>
                <SelectItem data-testid="sidebar-language-option-fi" value="fi">
                  Suomi (Finnish)
                </SelectItem>
                <SelectItem data-testid="sidebar-language-option-sv" value="sv">
                  Svenska (Swedish)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={true}>
              <button
                data-testid="sidebar-user-info"
                data-user-callsign={callsign || ""}
                data-user-type={userType || ""}
                className="w-full flex items-center gap-3 px-2 rounded-lg transition-colors py-2"
              >
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
                    {userType === "admin"
                      ? t("common.admin")
                      : t("common.user")}
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
      </nav>
      <FeedbackForm open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </aside>
  );
}
