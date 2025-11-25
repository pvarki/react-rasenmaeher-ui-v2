"use client"

import { createRootRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router"
import { Menu } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useUserType } from "@/hooks/auth/useUserType"
import { MtlsInfoModal } from "@/components/MtlsInfoModal"
import { OnboardingGuide } from "@/components/OnboardingGuide"
import { SystemStatusPopover } from "@/components/SystemStatusPopover"
import { useTranslation } from "react-i18next"
import { Sidebar } from "@/components/Sidebar"
import { getTheme } from "@/config/themes"

export const Route = createRootRoute({
  component: RootLayoutWrapper,
})

function RootLayoutWrapper() {
  return <RootLayout />
}

function BreadcrumbNav({ appName }: { appName: string }) {
  const location = useLocation()
  const { t } = useTranslation()

  const getBreadcrumbs = () => {
    const path = location.pathname
    const breadcrumbs: Array<{ label: string; href: string }> = [{ label: appName, href: "/" }]

    if (path.includes("/approve-users")) {
      breadcrumbs.push({
        label: t("adminTools.navLink"),
        href: "/admin-tools?type=users",
      })
      breadcrumbs.push({
        label: t("common.approveUsers"),
        href: "/approve-users",
      })
    } else if (path.includes("/manage-users")) {
      breadcrumbs.push({
        label: t("adminTools.navLink"),
        href: "/admin-tools?type=users",
      })
      breadcrumbs.push({
        label: t("common.manageUsers"),
        href: "/manage-users",
      })
    } else if (path.includes("/add-users")) {
      breadcrumbs.push({
        label: t("adminTools.navLink"),
        href: "/admin-tools?type=users",
      })
      breadcrumbs.push({ label: t("common.addUsers"), href: "/add-users" })
    } else if (path.includes("/admin-tools")) {
      breadcrumbs.push({
        label: t("adminTools.navLink"),
        href: "/admin-tools",
      })
    }



    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()


  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center gap-2">
          <Link to={crumb.href} className="hover:text-foreground transition-colors">
            {crumb.label}
          </Link>
          {index < breadcrumbs.length - 1 && <span>/</span>}
        </div>
      ))}
    </div>
  )
}

function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [lastSync, setLastSync] = useState<Date>(new Date())

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    const syncInterval = setInterval(() => {
      setLastSync(new Date())
    }, 60000)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      clearInterval(syncInterval)
    }
  }, [])

  return <SystemStatusPopover isOnline={isOnline} lastSync={lastSync} />
}

function RootLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mtlsModalOpen, setMtlsModalOpen] = useState(false)
  const { t } = useTranslation()
  const themeConfig = getTheme()

  const { userType, isLoading: userTypeLoading, isValidUser } = useUserType()

  useEffect(() => {
    const host = window.location.host
    const isMtlsDomain = host.startsWith("mtls.")

    if (!userTypeLoading && isValidUser && !isMtlsDomain && location.pathname === "/") {
      const mtlsHost = `mtls.${host}`
      window.location.href = `${window.location.protocol}//${mtlsHost}/`
      return
    }
  }, [userTypeLoading, isValidUser, location.pathname])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [location.pathname, isMobile])

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/waiting-room" ||
    location.pathname === "/mtls-install" ||
    location.pathname === "/callsign-setup" ||
    location.pathname === "/error" ||
    location.pathname === "/approve-user" ||
    location.pathname.startsWith("/product/")

  useEffect(() => {
    if (!userTypeLoading && isValidUser) {
      const adminPaths = ["/approve-users", "/manage-users", "/add-users", "/admin-tools"]
      const isAdminPath = adminPaths.some((path) => location.pathname.startsWith(path))

      if (isAdminPath && userType !== "admin") {
        toast.error(t("common.forbiddenAdminAccess"))
        navigate({ to: "/" })
      }
    }
  }, [userType, userTypeLoading, isValidUser, location.pathname, navigate, t])

  if (isAuthPage) {
    return <Outlet />
  }

  if (userTypeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">{t("common.authenticating")}</p>
        </div>
      </div>
    )
  }

  if (!isValidUser) {
    navigate({ to: "/login" })
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="bg-card border-b border-border px-4 md:px-6 h-16 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-foreground hover:text-foreground/80 shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            {themeConfig.assets?.logoUrl ? (
              <img src={themeConfig.assets.logoUrl || "/placeholder.svg"} alt="Logo" className="w-8 h-8 shrink-0" />
            ) : (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: themeConfig.sidebarLogo?.bgColor }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            )}
            <div className="flex flex-col text-xs leading-tight min-w-0">
              <span className="font-semibold text-foreground truncate">{themeConfig.name || "PV-Arki"}</span>
              <div className="hidden md:block">
                <BreadcrumbNav appName={themeConfig.subName || "Deploy App"} />
              </div>

              <div className="md:hidden">
                <span className="text-muted-foreground truncate">{themeConfig.subName || "Deploy App"}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <OfflineIndicator />
        </div>
      </header>

      <div className="flex-1 flex">
        {isMobile && sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 top-16" onClick={() => setSidebarOpen(false)} />
        )}

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isMobile={isMobile} />

        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-4 md:p-8 overflow-auto">
            <Outlet />
          </main>

          <footer className="border-t border-border bg-card/50 px-4 md:px-8 py-8 text-xs text-muted-foreground">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="font-semibold text-foreground text-sm">{t("common.deployApp")}</p>
                  <p className="text-muted-foreground/80">
                    {t("common.proudlyServedBy")}{" "}
                    <button
                      onClick={() => setMtlsModalOpen(true)}
                      className="text-primary hover:underline cursor-pointer bg-transparent border-none p-0"
                    >
                      {t("common.learnAboutMtls")}
                    </button>
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-foreground text-sm">{t("common.feedback")}</p>
                  <p className="text-muted-foreground/80">
                    <a
                      href="https://docs.google.com/forms/d/1BXMxeTt5TtmuhX9XsiZTH2yl-Fko-NVPUumvu40TUAM/viewform"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {t("common.letDevelopersKnow")}
                    </a>{" "}
                    {t("common.whatYouThink")}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs leading-relaxed text-muted-foreground/50">
                    {t("common.copyright")} <br></br> {t("common.rmUi")}
                  </p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>

      <MtlsInfoModal open={mtlsModalOpen} onOpenChange={setMtlsModalOpen} />
      <OnboardingGuide />
    </div>
  )
}
