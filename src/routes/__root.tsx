"use client";

import {
  createRootRoute,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useUserType } from "@/hooks/auth/useUserType";
import { MtlsInfoModal } from "@/components/MtlsInfoModal";
import { useTranslation } from "react-i18next";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsTablet } from "@/hooks/use-tablet";

export const Route = createRootRoute({
  component: RootLayoutWrapper,
});

function RootLayoutWrapper() {
  return <RootLayout />;
}

function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebar-open");
    if (saved !== null) return saved === "true";
    return window.innerWidth >= 768;
  });
  const [mtlsModalOpen, setMtlsModalOpen] = useState(false);
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  const { userType, isLoading: userTypeLoading, isValidUser } = useUserType();

  const toggleSidebar = (open: boolean) => {
    setSidebarOpen(open);
    if (!isMobile && !isTablet) {
      localStorage.setItem("sidebar-open", String(open));
    }
  };

  useEffect(() => {
    const host = window.location.host;
    const isMtlsDomain = host.startsWith("mtls.");

    if (
      !userTypeLoading &&
      isValidUser &&
      !isMtlsDomain &&
      location.pathname === "/"
    ) {
      const certDownloaded = localStorage.getItem("cert_downloaded") === "true";

      if (!certDownloaded) {
        navigate({ to: "/mtls-install" });
        return;
      }

      const mtlsHost = `mtls.${host}`;
      window.location.href = `${window.location.protocol}//${mtlsHost}/`;
      return;
    }
  }, [userTypeLoading, isValidUser, location.pathname, navigate]);

  useEffect(() => {
    if (isMobile || isTablet) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile, isTablet]);

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/waiting-room" ||
    location.pathname === "/mtls-install" ||
    location.pathname === "/callsign-setup" ||
    location.pathname === "/error" ||
    location.pathname === "/approve-user";

  const isProductPage = location.pathname.startsWith("/product/");

  useEffect(() => {
    if (!userTypeLoading && isValidUser) {
      const adminPaths = [
        "/approve-users",
        "/manage-users",
        "/add-users",
        "/admin-tools",
      ];
      const isAdminPath = adminPaths.some((path) =>
        location.pathname.startsWith(path),
      );

      if (isAdminPath && userType !== "admin") {
        toast.error(t("common.forbiddenAdminAccess"));
        navigate({ to: "/" });
      }
    }
  }, [userType, userTypeLoading, isValidUser, location.pathname, navigate, t]);

  if (isAuthPage) {
    return <Outlet />;
  }

  if (userTypeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">{t("common.authenticating")}</p>
        </div>
      </div>
    );
  }

  if (!isValidUser) {
    navigate({ to: "/login" });
    return null;
  }

  return (
    <div className="h-dvh flex flex-col bg-background text-foreground">
      <Header
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => toggleSidebar(!sidebarOpen)}
      />

      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {isMobile && sidebarOpen && (
          <div
            className="absolute inset-0 bg-black/50 z-40"
            onClick={() => toggleSidebar(false)}
          />
        )}

        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => toggleSidebar(false)}
          isMobile={isMobile}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <main className="flex-1 overflow-y-auto flex flex-col">
            <div
              className={`flex-1 ${isProductPage ? "p-2 md:p-4" : "p-4 md:p-8"}`}
            >
              <Outlet />
            </div>
            {!isProductPage && (
              <Footer onMtlsInfoClick={() => setMtlsModalOpen(true)} />
            )}
          </main>
        </div>
      </div>

      <MtlsInfoModal open={mtlsModalOpen} onOpenChange={setMtlsModalOpen} />
    </div>
  );
}
