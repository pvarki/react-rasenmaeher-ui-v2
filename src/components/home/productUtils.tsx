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

export function getCleanProductTitle(title: string): string {
  return title
    .replace(/^TAKTAK:\s*/, "")
    .replace(/^TAKTAK:\s?/, "")
    .replace(/^TAK:\s*/, "")
    .replace(/^TAK:\s?/, "")
    .replace(/^MTX:\s*/, "")
    .replace(/^MTX:\s?/, "");
}

export function getProductShortLabel(title: string): string {
  const match = title.match(/^([A-Z]+):\s/);
  if (match) {
    const label = match[1];
    return label.substring(0, 3);
  }
  return "APP";
}
