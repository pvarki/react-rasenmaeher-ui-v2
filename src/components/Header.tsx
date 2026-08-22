import { Link, useLocation } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getTheme } from "@/config/themes";
import { useIsMobile } from "@/hooks/use-mobile";
import { SystemStatusPopover } from "@/components/SystemStatusPopover";

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  /**
   * Collapse the header out of view to free vertical space. Only set on short
   * viewports (landscape phones), where the 4rem header is a large slice of
   * the screen.
   */
  collapsed?: boolean;
}

function BreadcrumbNav({ appName }: { appName: string }) {
  const location = useLocation();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const breadcrumbs: Array<{ label: string; href: string }> = [
      { label: appName, href: "/" },
    ];

    if (path.includes("/approve-users")) {
      breadcrumbs.push({
        label: t("adminTools.navLink"),
        href: "/admin-tools?type=users",
      });
      breadcrumbs.push({
        label: t("common.approveUsers"),
        href: "/approve-users",
      });
    } else if (path.includes("/manage-users")) {
      breadcrumbs.push({
        label: t("adminTools.navLink"),
        href: "/admin-tools?type=users",
      });
      breadcrumbs.push({
        label: t("common.manageUsers"),
        href: "/manage-users",
      });
    } else if (path.includes("/add-users")) {
      breadcrumbs.push({
        label: t("adminTools.navLink"),
        href: "/admin-tools?type=users",
      });
      breadcrumbs.push({ label: t("common.addUsers"), href: "/add-users" });
    } else if (path.includes("/admin-tools")) {
      breadcrumbs.push({
        label: t("adminTools.navLink"),
        href: "/admin-tools",
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  if (isMobile) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center gap-2">
          <Link
            to={crumb.href}
            className="hover:text-foreground transition-colors"
          >
            {crumb.label}
          </Link>
          {index < breadcrumbs.length - 1 && <span>/</span>}
        </div>
      ))}
    </div>
  );
}

export function Header({
  sidebarOpen,
  onToggleSidebar,
  collapsed = false,
}: HeaderProps) {
  const themeConfig = getTheme();

  return (
    <header
      data-testid="app-header"
      data-sidebar-open={sidebarOpen ? "true" : "false"}
      data-collapsed={collapsed ? "true" : "false"}
      aria-hidden={collapsed}
      className={`bg-card border-b border-border px-4 md:px-6 flex items-center justify-between sticky top-0 z-50 shrink-0 overflow-hidden transition-[height,opacity] duration-300 ease-out motion-reduce:transition-none ${
        collapsed
          ? "h-0 opacity-0 border-b-0 pointer-events-none"
          : "h-16 opacity-100"
      }`}
    >
      <div className="flex items-center gap-4 min-w-0">
        <button
          data-testid="sidebar-toggle-button"
          onClick={onToggleSidebar}
          className="text-foreground hover:text-foreground/80 shrink-0 p-1.5 rounded-md hover:bg-accent transition-all duration-200"
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
        >
          <div className="relative w-6 h-6">
            <Menu
              className={`w-6 h-6 absolute inset-0 transition-all duration-300`}
            />
          </div>
        </button>

        <div className="flex items-center gap-3">
          {themeConfig.assets?.logoUrl ? (
            <img
              src={themeConfig.assets.logoUrl}
              alt="Logo"
              className="h-8 w-auto shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
              <span>
                {themeConfig.name
                  ? themeConfig.name.charAt(0).toUpperCase()
                  : "P"}
              </span>
            </div>
          )}
          <div className="flex flex-col text-xs leading-tight min-w-0">
            <span className="font-semibold text-foreground truncate">
              {themeConfig.name || "PV-Arki"}
            </span>
            <div className="hidden md:block">
              <BreadcrumbNav appName={themeConfig.subName || "Deploy App"} />
            </div>
            <div className="md:hidden">
              <span className="text-muted-foreground truncate">
                {themeConfig.subName || "Deploy App"}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <SystemStatusPopover />
      </div>
    </header>
  );
}
