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

/**
 * Products are inconsistent about prefixing their title with their own name
 * (e.g. "TAK: Team Awareness Kit" vs plain "MediaMTX"). Strip the prefix when
 * it matches the shortname so every card shows a bare product name.
 */
export function getCleanProductTitle(title: string, shortname: string): string {
  const prefix = `${shortname.toLowerCase()}:`;
  if (title.toLowerCase().startsWith(prefix)) {
    return title.slice(prefix.length).trimStart();
  }
  return title;
}
