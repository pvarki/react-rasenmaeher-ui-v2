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
import { OnboardingGuide } from "@/components/OnboardingGuide";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mtlsModalOpen, setMtlsModalOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  const { userType, isLoading: userTypeLoading, isValidUser } = useUserType();

  useEffect(() => {
    const host = window.location.host;
    const isMtlsDomain = host.startsWith("mtls.");

    if (
      !userTypeLoading &&
      isValidUser &&
      !isMtlsDomain &&
      location.pathname === "/"
    ) {
      const mtlsHost = `mtls.${host}`;
      window.location.href = `${window.location.protocol}//${mtlsHost}/`;
      return;
    }
  }, [userTypeLoading, isValidUser, location.pathname]);

  useEffect(() => {
    if (window.innerWidth >= 768) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }
  }, []);

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
    location.pathname === "/approve-user" ||
    location.pathname.startsWith("/product/");

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
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex">
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 top-16"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-4 md:p-8 overflow-auto">
            <Outlet />
          </main>

          <Footer onMtlsInfoClick={() => setMtlsModalOpen(true)} />
        </div>
      </div>

      <MtlsInfoModal open={mtlsModalOpen} onOpenChange={setMtlsModalOpen} />
      <FeedbackForm open={feedbackOpen} onOpenChange={setFeedbackOpen} />
      <OnboardingGuide />
    </div>
  );
}
