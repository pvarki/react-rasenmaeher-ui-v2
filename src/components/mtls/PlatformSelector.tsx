import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface PlatformSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  /**
   * Renders the selector as a plain text link carrying this label, so the
   * guided flows can offer the same dropdown without a boxed form control
   * taking up room. The list still opens over whatever is on screen.
   */
  triggerLabel?: string;
}

export function PlatformSelector({
  value,
  onValueChange,
  triggerLabel,
}: PlatformSelectorProps) {
  const { t } = useTranslation();

  const osOptions = [
    { label: t("mtlsInstall.os.Windows"), value: "Windows" },
    { label: t("mtlsInstall.os.MacOS"), value: "MacOS" },
    { label: t("mtlsInstall.os.Linux"), value: "Linux" },
    { label: t("mtlsInstall.os.Android"), value: "Android" },
    { label: t("mtlsInstall.os.iOS"), value: "iOS" },
  ];

  const options = (
    <SelectContent>
      {osOptions.map((os) => (
        <SelectItem
          data-testid={`platform-option-${os.value.toLowerCase()}`}
          key={os.value}
          value={os.value}
        >
          {os.label}
        </SelectItem>
      ))}
    </SelectContent>
  );

  if (triggerLabel) {
    return (
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          data-testid="platform-selector-trigger"
          data-platform-value={value}
          className="h-auto w-auto gap-0 border-0 bg-transparent p-0 text-sm text-muted-foreground shadow-none focus:ring-0 focus-visible:ring-0 [&>svg]:hidden"
        >
          {triggerLabel}
        </SelectTrigger>
        {options}
      </Select>
    );
  }

  return (
    <div data-testid="platform-selector" className="space-y-3">
      <label className="text-sm font-medium">
        {t("mtlsInstall.choosePlatform")}
      </label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          data-testid="platform-selector-trigger"
          data-platform-value={value}
          className="w-full md:w-80 mt-1.5"
        >
          <SelectValue placeholder={t("mtlsInstall.selectPlaceholder")} />
        </SelectTrigger>
        <SelectContent>
          {osOptions.map((os) => (
            <SelectItem
              data-testid={`platform-option-${os.value.toLowerCase()}`}
              key={os.value}
              value={os.value}
            >
              {os.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
