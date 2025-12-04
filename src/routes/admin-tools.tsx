"use client";

import { createFileRoute } from "@tanstack/react-router";
import { useUserType } from "@/hooks/auth/useUserType";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import {
  Users,
  Shield,
  FileText,
  Server,
  KeyRound,
  type LucideIcon,
  ExternalLink,
} from "lucide-react";
import { KeycloakManageModal } from "@/components/KeycloakManageModal";
import { useGetAdminProductDescriptions } from "@/hooks/api/useGetAdminProductDescriptions";
import { useLanguage } from "@/hooks/useLanguage";
import { Skeleton } from "@/components/ui/skeleton";

type AdminToolsSearch = {
  type?: "users" | "services" | "all";
};

export const Route = createFileRoute("/admin-tools")({
  component: AdminToolsPage,
  validateSearch: (search: Record<string, unknown>): AdminToolsSearch => {
    const validTypes = ["users", "services", "all"];
    return {
      type: validTypes.includes(search.type as string)
        ? (search.type as "users" | "services" | "all")
        : undefined,
    };
  },
});

interface MenuItem {
  icon: LucideIcon;
  titleKey?: string;
  descKey?: string;
  title?: string;
  description?: string;
  action:
    | { type: "navigate"; to: string; search?: Record<string, unknown> }
    | { type: "external"; url: string }
    | { type: "modal"; modal: string };
}

interface MenuSection {
  titleKey: string;
  items: MenuItem[];
}

interface AdminToolCardProps {
  item: MenuItem;
  onAction: (item: MenuItem) => void;
}

function AdminToolCardSkeleton() {
  return (
    <div className="flex items-center gap-6 p-6 w-full border border-border rounded-2xl bg-card">
      <Skeleton className="w-16 h-16 rounded-xl opacity-50 animate-pulse" />
      <div className="flex flex-col flex-1 gap-2">
        <Skeleton className="h-6 w-32 opacity-50 animate-pulse" />
        <Skeleton className="h-4 w-48 opacity-50 animate-pulse" />
      </div>
    </div>
  );
}

function AdminToolCard({ item, onAction }: AdminToolCardProps) {
  const { t } = useTranslation();
  const Icon = item.icon;
  const title = item.title ?? (item.titleKey ? t(item.titleKey) : "");
  const description = item.description ?? (item.descKey ? t(item.descKey) : "");

  const content = (
    <>
      <div className="p-4 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors flex items-center justify-center">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <div className="flex flex-col">
        <h3 className="font-semibold text-xl mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </>
  );

  const className =
    "group flex items-center gap-6 p-6 w-full border border-border rounded-2xl bg-card hover:border-primary hover:shadow-lg hover:bg-card/80 transition-all duration-300 cursor-pointer";

  if (item.action.type === "external") {
    return (
      <a
        href={item.action.url}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <a onClick={() => onAction(item)} className={className}>
      {content}
    </a>
  );
}

function AdminToolsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userType, isLoading: userTypeLoading, callsign } = useUserType();
  const { type } = Route.useSearch();
  const [keycloakModalOpen, setKeycloakModalOpen] = useState(false);
  const { currentLanguage } = useLanguage();

  const { data: adminProductDescriptions, isLoading: isLoadingProducts } =
    useGetAdminProductDescriptions(currentLanguage);

  // Build dynamic menu items from admin product descriptions
  const adminProductItems: MenuItem[] = (adminProductDescriptions ?? [])
    .filter((product) => product.component.type === "link")
    .map((product) => ({
      icon: ExternalLink,
      title: product.title,
      description: product.description,
      action: {
        type: "external" as const,
        url: product.component.ref,
      },
    }));

  const typeSelectorItems: MenuItem[] = [
    {
      icon: Users,
      titleKey: "common.userManagement",
      descKey: "adminTools.userManagementDesc",
      action: {
        type: "navigate",
        to: "/admin-tools",
        search: { type: "users" },
      },
    },
    {
      icon: Server,
      titleKey: "adminTools.externalServicesSection",
      descKey: "adminTools.externalServicesDesc",
      action: {
        type: "navigate",
        to: "/admin-tools",
        search: { type: "services" },
      },
    },
  ];

  const menuSections: MenuSection[] = [
    {
      titleKey: "common.userManagement",
      items: [
        {
          icon: Users,
          titleKey: "common.manageUsers",
          descKey: "adminTools.manageUsersDesc",
          action: { type: "navigate", to: "/manage-users" },
        },
        {
          icon: FileText,
          titleKey: "common.addUsers",
          descKey: "adminTools.addUsersDesc",
          action: { type: "navigate", to: "/add-users" },
        },
        {
          icon: Shield,
          titleKey: "common.approveUsers",
          descKey: "adminTools.approveUsersDesc",
          action: { type: "navigate", to: "/approve-users" },
        },
      ],
    },
    {
      titleKey: "adminTools.toolsDesc",
      items: [
        ...adminProductItems,
        {
          icon: KeyRound,
          titleKey: "adminTools.keycloakTitle",
          descKey: "adminTools.keycloakDesc",
          action: { type: "modal", modal: "keycloak" },
        },
      ],
    },
  ];

  const handleAction = (item: MenuItem) => {
    if (item.action.type === "navigate") {
      navigate({ to: item.action.to, search: item.action.search });
    } else if (item.action.type === "modal") {
      if (item.action.modal === "keycloak") {
        setKeycloakModalOpen(true);
      }
    }
  };

  const showUserTools = type === "users" || type === "all";
  const showServiceTools = type === "services" || type === "all";
  const showTypeSelector = !type;

  useEffect(() => {
    if (!userTypeLoading && !callsign) {
      toast.error(t("approveUsers.noCallsignFound"));
      navigate({ to: "/login" });
    }
  }, [callsign, userTypeLoading, navigate, t]);

  useEffect(() => {
    if (!userTypeLoading && userType !== "admin") {
      toast.error(t("adminTools.forbiddenAdminAccess"));
      navigate({ to: "/" });
    }
  }, [userType, userTypeLoading, navigate, t]);

  if (!userTypeLoading && userType !== "admin") {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6 text-center py-12">
        <h1 className="text-6xl font-bold text-destructive">403</h1>
        <p className="text-xl text-muted-foreground">
          {t("adminTools.forbiddenAdminAccess")}
        </p>
      </div>
    );
  }

  if (userTypeLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">{t("adminTools.navLink")}</h1>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (showTypeSelector) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="space-y-8">
          <div className="space-y-3 pt-8 text-center">
            <h1 className="text-4xl font-bold">{t("adminTools.navLink")}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("adminTools.description")}
            </p>
          </div>

          <div className="grid gap-4">
            {typeSelectorItems.map((item) => (
              <AdminToolCard
                key={item.titleKey}
                item={item}
                onAction={handleAction}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const visibleSections = menuSections.filter((_, index) =>
    index === 0 ? showUserTools : showServiceTools,
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="space-y-8">
        {visibleSections.map((section) => (
          <div key={section.titleKey} className="space-y-4">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t(section.titleKey)}
            </h2>

            <div className="grid gap-4">
              {section.titleKey === "adminTools.toolsDesc" &&
              isLoadingProducts ? (
                <>
                  <AdminToolCardSkeleton />
                  <AdminToolCardSkeleton />
                  <AdminToolCardSkeleton />
                </>
              ) : (
                section.items.map((item) => (
                  <AdminToolCard
                    key={item.titleKey ?? item.title}
                    item={item}
                    onAction={handleAction}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <KeycloakManageModal
        open={keycloakModalOpen}
        onOpenChange={setKeycloakModalOpen}
      />
    </div>
  );
}
