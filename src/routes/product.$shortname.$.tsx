"use client";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, lazy, Suspense } from "react";
import { useGetProductDescriptions } from "@/hooks/api/useGetProductDescriptions";
import { useGetProductInstructions } from "@/hooks/api/useGetProductInstructions";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import {
  ProductLoading,
  ProductError,
} from "@/components/product/ProductLoadingStates";
import { ProductHeader } from "@/components/product/ProductHeader";
import { MarkdownRenderer } from "@/components/product/MarkdownRenderer";
import { loadRemoteComponent } from "@/components/product/remoteComponentLoader";

export const Route = createFileRoute("/product/$shortname/$")({
  component: ProductPage,
});

function ProductPage() {
  const { t } = useTranslation();
  const { shortname } = Route.useParams();
  const navigate = useNavigate();
  const [markdownContent, setMarkdownContent] = useState("");
  const [markdownLoading, setMarkdownLoading] = useState(false);
  const { currentLanguage } = useLanguage();

  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
  } = useGetProductDescriptions(currentLanguage);
  const { data: instructionsData } = useGetProductInstructions(shortname);

  const product = products.find((p) => p.shortname === shortname);

  useEffect(() => {
    if (productsLoading) {
      return;
    }

    if (!productsLoading && !product) {
      navigate({ to: "/" });
      return;
    }

    if (product?.component?.type === "markdown" && product.component.ref) {
      setMarkdownLoading(true);
      fetch(product.component.ref)
        .then((res) => res.text())
        .then((text) => {
          setMarkdownContent(text);
          setMarkdownLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load markdown:", err);
          setMarkdownLoading(false);
        });
    }
  }, [product, navigate, productsLoading, products]);

  const handleClose = () => {
    window.close();
  };

  if (productsLoading) {
    return <ProductLoading message={t("product.loadingProducts")} />;
  }

  if (productsError) {
    return <ProductError onGoHome={() => navigate({ to: "/" })} />;
  }

  if (!product) {
    return <ProductLoading message={t("product.notFoundRedirect")} />;
  }

  const Remote = lazy(() => loadRemoteComponent(shortname));

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <ProductHeader title={product.title} onClose={handleClose} />

      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {product.component.type === "component" ? (
            <Suspense
              fallback={
                <div className="text-center space-y-4 py-12 text-2xl font-bold text-foreground">
                  {t("product.loadingRemote")}
                </div>
              }
            >
              <Remote
                data={instructionsData?.data || {}}
                shortname={shortname}
                onNavigate={navigate}
              />
            </Suspense>
          ) : product.component.type === "markdown" ? (
            <MarkdownRenderer
              content={markdownContent}
              isLoading={markdownLoading}
              fallbackTitle={product.title}
              fallbackDescription={product.description}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
