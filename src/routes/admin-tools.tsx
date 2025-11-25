"use client"

import { createFileRoute } from "@tanstack/react-router"
import { useUserType } from "@/hooks/auth/useUserType"
import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { Users, Shield, FileText, Server, Map, KeyRound } from "lucide-react"
import { KeycloakManageModal } from "@/components/KeycloakManageModal"

type AdminToolsSearch = {
  type?: "users" | "services" | "all"
}

export const Route = createFileRoute("/admin-tools")({
  component: AdminToolsPage,
  validateSearch: (search: Record<string, unknown>): AdminToolsSearch => {
    const validTypes = ["users", "services", "all"]
    return {
      type: validTypes.includes(search.type as string) ? (search.type as "users" | "services" | "all") : undefined,
    }
  },
})

function AdminToolsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { userType, isLoading: userTypeLoading, callsign } = useUserType()
  const { type } = Route.useSearch()
  const [keycloakModalOpen, setKeycloakModalOpen] = useState(false)

  const showUserTools = type === "users" || type === "all"
  const showServiceTools = type === "services" || type === "all"
  const showTypeSelector = !type

  // Build service URLs based on current domain
  const currentDomain = window.location.hostname.replace(/^mtls\./, "")
  const blUrl = `https://bl.${currentDomain}:4626/`
  const takUrl = `https://tak.${currentDomain}:8443/`

  useEffect(() => {
    if (!userTypeLoading && !callsign) {
      toast.error(t("approveUsers.noCallsignFound"))
      navigate({ to: "/login" })
    }
  }, [callsign, userTypeLoading, navigate, t])

  useEffect(() => {
    if (!userTypeLoading && userType !== "admin") {
      toast.error(t("adminTools.forbiddenAdminAccess"))
      navigate({ to: "/" })
    }
  }, [userType, userTypeLoading, navigate, t])

  if (!userTypeLoading && userType !== "admin") {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6 text-center py-12">
        <h1 className="text-6xl font-bold text-destructive">403</h1>
        <p className="text-xl text-muted-foreground">{t("adminTools.forbiddenAdminAccess")}</p>
      </div>
    )
  }

  if (userTypeLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">{t("adminTools.navLink")}</h1>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (showTypeSelector) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="space-y-8">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold">{t("adminTools.navLink")}</h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              {t("adminTools.description")}
            </p>
          </div>

          <div className="grid gap-4">
            <button
              onClick={() => navigate({ to: "/admin-tools", search: { type: "users" } })}
              className="group flex flex-col p-6 border border-border rounded-xl bg-card hover:border-primary hover:shadow-lg hover:bg-card/80 transition-all duration-300 text-left"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-2">{t("common.userManagement")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("adminTools.userManagementDesc")}
              </p>
            </button>

            <button
              onClick={() => navigate({ to: "/admin-tools", search: { type: "services" } })}
              className="group flex flex-col p-6 border border-border rounded-xl bg-card hover:border-primary hover:shadow-lg hover:bg-card/80 transition-all duration-300 text-left"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <Server className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-2">{t("adminTools.externalServicesSection")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("adminTools.externalServicesDesc")}
              </p>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="space-y-8">
        <div className="space-y-3">

        </div>

        {showUserTools && (
          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("common.userManagement")}
            </h2>

            <div className="grid gap-4">
              <button
                onClick={() => navigate({ to: "/approve-users" })}
                className="group flex flex-col p-6 border border-border rounded-xl bg-card hover:border-primary hover:shadow-lg hover:bg-card/80 transition-all duration-300 text-left"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">{t("common.approveUsers")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("adminTools.approveUsersDesc")}
                </p>
              </button>

              <button
                onClick={() => navigate({ to: "/manage-users" })}
                className="group flex flex-col p-6 border border-border rounded-xl bg-card hover:border-primary hover:shadow-lg hover:bg-card/80 transition-all duration-300 text-left"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">{t("common.manageUsers")}</h3>
                <p className="text-sm text-muted-foreground">{t("adminTools.manageUsersDesc")}</p>
              </button>

              <button
                onClick={() => navigate({ to: "/add-users" })}
                className="group flex flex-col p-6 border border-border rounded-xl bg-card hover:border-primary hover:shadow-lg hover:bg-card/80 transition-all duration-300 text-left"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">{t("common.addUsers")}</h3>
                <p className="text-sm text-muted-foreground">{t("adminTools.addUsersDesc")}</p>
              </button>
            </div>
          </div>
        )}

        {showServiceTools && (
          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("adminTools.toolsDesc")}
            </h2>

            <div className="grid gap-4">
              <a
                href={blUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col p-6 border border-border rounded-xl bg-card hover:border-primary hover:shadow-lg hover:bg-card/80 transition-all duration-300 text-left"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Server className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {t("adminTools.blServerTitle")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("adminTools.blServerDesc")}
                </p>
              </a>

              <a
                href={takUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col p-6 border border-border rounded-xl bg-card hover:border-primary hover:shadow-lg hover:bg-card/80 transition-all duration-300 text-left"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Map className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">{t("adminTools.takServerTitle")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("adminTools.takServerDesc")}
                </p>
              </a>

              <button
                onClick={() => setKeycloakModalOpen(true)}
                className="group flex flex-col p-6 border border-border rounded-xl bg-card hover:border-primary hover:shadow-lg hover:bg-card/80 transition-all duration-300 text-left"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <KeyRound className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">{t("adminTools.keycloakTitle")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("adminTools.keycloakDesc")}
                </p>
              </button>
            </div>
          </div>
        )}
      </div>

      <KeycloakManageModal open={keycloakModalOpen} onOpenChange={setKeycloakModalOpen} />
    </div>
  )
}
