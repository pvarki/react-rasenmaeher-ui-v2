import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCleanProductTitle } from "@/components/home/productUtils";
import type { ProductDescription } from "@/hooks/api/useGetProductDescriptions";

interface SidebarProductLinkProps {
  product: ProductDescription;
  isActive: boolean;
  isMobile: boolean;
  onClose: () => void;
}

export function SidebarProductLink({
  product,
  isActive,
  isMobile,
  onClose,
}: SidebarProductLinkProps) {
  const title = getCleanProductTitle(product.title);
  const handleClick = () => {
    if (isMobile) onClose();
  };

  if (product.component.type === "link") {
    return (
      <a
        data-testid="sidebar-product-link"
        data-product-shortname={product.shortname}
        data-product-external="true"
        href={product.component.ref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="flex items-center justify-between gap-2 px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/60 rounded-lg transition-colors"
      >
        <span className="truncate">{title}</span>
        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
      </a>
    );
  }

  return (
    <Link
      data-testid="sidebar-product-link"
      data-product-shortname={product.shortname}
      to="/product/$shortname"
      params={{ shortname: product.shortname }}
      onClick={handleClick}
      className={cn(
        "block px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/60 rounded-lg transition-colors",
        isActive && "bg-sidebar-accent text-sidebar-foreground font-medium",
      )}
    >
      {title}
    </Link>
  );
}
