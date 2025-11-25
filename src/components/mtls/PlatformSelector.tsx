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
}

export function PlatformSelector({
  value,
  onValueChange,
}: PlatformSelectorProps) {
  const { t } = useTranslation();

  const osOptions = [
    { label: t("mtlsInstall.os.Windows"), value: "Windows" },
    { label: t("mtlsInstall.os.MacOS"), value: "MacOS" },
    { label: t("mtlsInstall.os.Linux"), value: "Linux" },
    { label: t("mtlsInstall.os.Android"), value: "Android" },
    { label: t("mtlsInstall.os.iOS"), value: "iOS" },
  ];

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">
        {t("mtlsInstall.choosePlatform")}
      </label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full md:w-80 mt-1.5">
          <SelectValue placeholder={t("mtlsInstall.selectPlaceholder")} />
        </SelectTrigger>
        <SelectContent>
          {osOptions.map((os) => (
            <SelectItem key={os.value} value={os.value}>
              {os.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
