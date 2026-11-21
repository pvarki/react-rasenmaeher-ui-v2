import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Copy, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  chooseConnectorFile,
  connectorFileUrl,
  connectorManifestUrl,
  connectorSystemLabel,
  detectSystem,
  pythonCommand,
  type ConnectorFile,
  type ConnectorManifest,
} from "@/lib/mdmConnectorFiles";

/** The install row on the MDM page and the dialog it opens. */
export function ConnectorDialog({
  manifest,
  onCopy,
}: {
  manifest: ConnectorManifest;
  onCopy: (text: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const [here] = useState(() => detectSystem(navigator));
  const [chosen, setChosen] = useState<ConnectorFile | null>(() =>
    chooseConnectorFile(manifest.files, here),
  );
  const download = useRef<HTMLAnchorElement>(null);
  const at = connectorManifestUrl();

  // A system's name never breaks inside, so "macOS (Apple Silicon)" stays whole
  const system = (file: ConnectorFile) =>
    connectorSystemLabel(file, manifest.files)?.replace(/ /g, " ") ??
    t("mdm.connectorAnySystem");
  // Choosing only changes what the one download button is for; focus follows
  const choose = (file: ConnectorFile) => {
    setChosen(file);
    requestAnimationFrame(() => download.current?.focus());
  };
  const size = (file: ConnectorFile) =>
    new Intl.NumberFormat(i18n.language, {
      maximumFractionDigits: 1,
    }).format(file.size / 1_000_000);

  const steps = chosen
    ? (t(`mdm.connectorSteps.${chosen.os}`, {
        returnObjects: true,
      }) as string[])
    : [];

  return (
    <Dialog>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <DialogTrigger asChild>
          <Button data-testid="mdm-install-connector" variant="outline">
            <Download className="w-4 h-4 mr-2 shrink-0" />
            {t("mdm.installConnector")}
          </Button>
        </DialogTrigger>
        <span className="text-sm text-muted-foreground">
          {t("mdm.installConnectorNote")}
        </span>
      </div>
      <DialogContent
        data-testid="mdm-connector-dialog"
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto"
      >
        <DialogHeader className="text-left">
          <DialogTitle>{t("mdm.connectorTitle")}</DialogTitle>
          <DialogDescription>{t("mdm.connectorDesc")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">
            {t("mdm.connectorWorksWith")}
          </span>
          {manifest.mdms.map((mdm) => (
            <Badge key={mdm.name} variant="secondary">
              {mdm.title}
            </Badge>
          ))}
        </div>

        <div className="space-y-2">
          {chosen && (
            <Button asChild className="h-auto! w-full whitespace-normal! py-2">
              <a
                ref={download}
                data-testid="mdm-connector-download"
                href={connectorFileUrl(at, chosen.file)}
                download={chosen.file}
              >
                <Download className="w-4 h-4 mr-2 shrink-0" />
                {chosen.os === "any"
                  ? t("mdm.connectorDownloadAny", { size: size(chosen) })
                  : t("mdm.connectorDownload", {
                      system: system(chosen),
                      size: size(chosen),
                    })}
              </a>
            </Button>
          )}
          {manifest.files.length > (chosen ? 1 : 0) && (
            <div className="text-sm">
              <p className="text-muted-foreground">{t("mdm.connectorOther")}</p>
              <ul className="flex flex-wrap gap-x-4 gap-y-1">
                {manifest.files
                  .filter((file) => file !== chosen)
                  .map((file) => (
                    <li key={file.file}>
                      <button
                        type="button"
                        data-testid="mdm-connector-other"
                        className="text-left underline underline-offset-2 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                        onClick={() => choose(file)}
                      >
                        {system(file)}
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>

        {chosen && (
          <div className="space-y-1 text-sm">
            <p className="font-medium">{t("mdm.connectorThen")}</p>
            <ol
              data-testid="mdm-connector-steps"
              className="list-decimal space-y-1 pl-5"
            >
              {steps.map((line, i) => (
                <li key={i}>
                  {line}
                  {chosen.os === "any" && i === 0 && (
                    <code className="block mt-1 font-mono break-all rounded bg-muted px-2 py-1">
                      {pythonCommand(chosen, here)}
                    </code>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}

        {chosen && (
          <div className="border-t border-border pt-3 text-xs text-muted-foreground space-y-1">
            <p>{t("mdm.connectorVersion", { version: manifest.version })}</p>
            <div className="flex items-start gap-1">
              <span className="shrink-0 pt-1.5">{t("mdm.connectorSha")}</span>
              <span
                data-testid="mdm-connector-sha256"
                className="min-w-0 flex-1 font-mono break-all pt-1.5"
              >
                {chosen.sha256}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                aria-label={t("mdm.copy")}
                onClick={() => onCopy(chosen.sha256)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
