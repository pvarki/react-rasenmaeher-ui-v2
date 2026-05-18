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
import { ArrowLeft } from "lucide-react";
import { MarkdownRenderer } from "@/components/product/MarkdownRenderer";
import { loadRemoteComponent } from "@/components/product/remoteComponentLoader";
import { useUserType } from "@/hooks/auth/useUserType";

export const Route = createFileRoute("/product/$shortname/$")({
  component: ProductPage,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const remoteComponentCache = new Map<string, React.ComponentType<any>>();

function getRemoteComponent(shortname: string, entry: string) {
  const cacheKey = `${shortname}|${entry}`;
  if (!remoteComponentCache.has(cacheKey)) {
    remoteComponentCache.set(
      cacheKey,
      lazy(() => loadRemoteComponent(shortname, entry)),
    );
  }
  return remoteComponentCache.get(cacheKey)!;
}

function ProductPage() {
  const { t } = useTranslation();
  const { shortname } = Route.useParams();
  const navigate = useNavigate();
  const [markdownContent, setMarkdownContent] = useState("");
  const [markdownLoading, setMarkdownLoading] = useState(false);
  const { currentLanguage } = useLanguage();
  const { callsign } = useUserType();

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

    if (product?.component?.type === "markdown") {
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

  if (productsLoading) {
    return <ProductLoading message={t("product.loadingProducts")} />;
  }

  if (productsError) {
    return <ProductError onGoHome={() => navigate({ to: "/" })} />;
  }

  if (!product) {
    return <ProductLoading message={t("product.notFoundRedirect")} />;
  }

  const Remote =
    product.component.type === "component"
      ? getRemoteComponent(shortname, product.component.ref)
      : null;

  return (
    <div
      data-testid="product-page"
      data-product-shortname={shortname}
      data-product-component-type={product.component.type}
    >
      {Remote ? (
        <Suspense
          fallback={
            <div
              data-testid="product-remote-loading"
              className="text-center space-y-4 py-12 text-2xl font-bold text-foreground"
            >
              {t("product.loadingRemote")}
            </div>
          }
        >
          <Remote
            data={instructionsData?.data || {}}
            meta={{
              theme: import.meta.env.VITE_THEME,
              callsign: callsign,
            }}
            shortname={shortname}
            onNavigate={navigate}
          />
        </Suspense>
      ) : product.component.type === "markdown" ? (
        <div>
          <button
            onClick={() => navigate({ to: "/" })}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("common.home")}
          </button>
          <h1 className="text-2xl font-bold mb-6">{product.title}</h1>
          <div className="max-w-4xl">
            <MarkdownRenderer
              content={markdownContent}
              isLoading={markdownLoading}
              fallbackTitle={product.title}
              fallbackDescription={product.description}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
