import { useTranslation } from "react-i18next";
import { ExternalLink } from "lucide-react";

interface DownloadLink {
  name: string;
  url: string;
}

interface SupportedBrowsersListProps {
  downloadLinks: DownloadLink[];
  titleClassName?: string;
  gridClassName?: string;
}

export function SupportedBrowsersList({
  downloadLinks,
  titleClassName = "text-lg font-semibold",
  gridClassName = "grid grid-cols-1 sm:grid-cols-2 gap-3",
}: SupportedBrowsersListProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <h2 className={`${titleClassName} text-foreground`}>
        {t("browserGuard.supportedBrowsers")}
      </h2>

      <div className={gridClassName}>
        {downloadLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/30 rounded-lg transition-colors group"
          >
            <span className="font-medium text-foreground">{link.name}</span>
            <ExternalLink className="w-5 h-5 text-primary group-hover:translate-x-0.5 transition-transform" />
          </a>
        ))}
      </div>
    </div>
  );
}
