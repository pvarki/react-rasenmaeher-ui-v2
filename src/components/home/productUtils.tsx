import type React from "react";
import { Zap } from "lucide-react";

export interface Product {
  shortname: string;
  title: string;
  icon: string | null;
  description: string;
  language: string;
  docs: string | null;
  component: {
    type: "component" | "markdown" | "link";
    ref: string;
  };
}

export function getProductIcon(shortname: string): React.ReactNode {
  const iconMap: Record<string, React.ReactNode> = {
    tak: <Zap className="w-6 h-6" />,
    taktak: <Zap className="w-6 h-6" />,
    default: <Zap className="w-6 h-6" />,
  };
  return iconMap[shortname.toLowerCase()] || iconMap.default;
}

export function getCleanProductTitle(title: string): string {
  return title
    .replace(/^TAKTAK:\s*/, "")
    .replace(/^TAKTAK:\s?/, "")
    .replace(/^TAK:\s*/, "")
    .replace(/^TAK:\s?/, "");
}

export function getProductShortLabel(title: string): string {
  const match = title.match(/^([A-Z]+):\s/);
  if (match) {
    const label = match[1];
    return label.substring(0, 3);
  }
  return "APP";
}
