import type React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BookOpen, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Product } from "./productUtils";
import {
  getProductIcon,
  getCleanProductTitle,
  getProductShortLabel,
} from "./productUtils";

interface ProductCardProps {
  product: Product;
  isValidUser: boolean;
  onProductClick: (product: Product) => void;
  onDocsClick: (docsUrl: string | null, e: React.MouseEvent) => void;
}

export function ProductCard({
  product,
  isValidUser,
  onProductClick,
  onDocsClick,
}: ProductCardProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        "group flex flex-col border border-border rounded-2xl overflow-hidden transition-all duration-300",
        isValidUser
          ? "hover:border-primary hover:shadow-xl hover:-translate-y-1 bg-card"
          : "opacity-60 bg-card",
      )}
    >
      <div className="flex flex-col flex-1 p-6">
        <div className="mb-4">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
            {getProductShortLabel(product.title)}
          </p>
          <h3 className="text-lg md:text-xl font-bold text-foreground leading-tight">
            {getCleanProductTitle(product.title)}
          </h3>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">
          {product.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
          {product.docs && (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "flex items-center justify-center rounded-lg hover:bg-accent/50 h-12 text-sm md:text-base font-medium w-full sm:flex-1 border cursor-pointer",
                !isValidUser && "opacity-50 cursor-not-allowed",
              )}
              onClick={(e) => {
                e.stopPropagation();
                onDocsClick(product.docs, e);
              }}
              disabled={!isValidUser}
            >
              <BookOpen className="w-5 h-5 mr-2" />
              {t("home.productCard.docs")}
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => onProductClick(product)}
            variant={"outline"}
            className={cn(
              "flex items-center justify-center rounded-lg font-semibold transition-all h-12 text-sm md:text-base w-full sm:flex-1 cursor-pointer",
              isValidUser
                ? "bg-primary-light hover:bg-primary-light/90 text-primary-foreground"
                : "bg-muted text-muted-foreground cursor-not-allowed",
            )}
            disabled={!isValidUser}
          >
            <span className="inline-flex items-center gap-2">
              {product.component.type === "component" ||
              product.component.type === "markdown" ? (
                <>
                  <span className="shrink-0">
                    {getProductIcon(product.shortname)}
                  </span>
                  <span>{t("home.productCard.launch")}</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-5 h-5 shrink-0" />
                  <span>{t("home.productCard.open")}</span>
                </>
              )}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
