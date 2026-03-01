"use client";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, lazy, Suspense } from "react";
import { useGetAdminProductDescriptions } from "@/hooks/api/useGetAdminProductDescriptions";
import { useGetAdminProductInstructions } from "@/hooks/api/useGetAdminProductInstructions";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import {
  ProductLoading,
  ProductError,
} from "@/components/product/ProductLoadingStates";
import { ProductHeader } from "@/components/product/ProductHeader";
import { MarkdownRenderer } from "@/components/product/MarkdownRenderer";
import { loadAdminRemoteComponent } from "@/components/product/adminRemoteComponentLoader";
import { useUserType } from "@/hooks/auth/useUserType";
import { toast } from "sonner";

export const Route = createFileRoute("/admin-product/$shortname/$")({
  component: AdminProductPage,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adminRemoteComponentCache = new Map<string, React.ComponentType<any>>();

function getAdminRemoteComponent(shortname: string) {
  if (!adminRemoteComponentCache.has(shortname)) {
    adminRemoteComponentCache.set(
      shortname,
      lazy(() => loadAdminRemoteComponent(shortname)),
    );
  }
  return adminRemoteComponentCache.get(shortname)!;
}

function AdminProductPage() {
  const { t } = useTranslation();
  const { shortname } = Route.useParams();
  const navigate = useNavigate();
  const [markdownContent, setMarkdownContent] = useState("");
  const [markdownLoading, setMarkdownLoading] = useState(false);
  const { currentLanguage } = useLanguage();
  const { userType, isLoading: userTypeLoading, callsign } = useUserType();

  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
  } = useGetAdminProductDescriptions(currentLanguage);
  const { data: instructionsData } = useGetAdminProductInstructions(shortname);

  const product = products.find((p) => p.shortname === shortname);

  // Redirect non-admin users
  useEffect(() => {
    if (!userTypeLoading && userType !== "admin") {
      toast.error(t("adminTools.forbiddenAdminAccess"));
      navigate({ to: "/" });
    }
  }, [userType, userTypeLoading, navigate, t]);

  useEffect(() => {
    if (productsLoading) {
      return;
    }

    if (!productsLoading && !product) {
      navigate({ to: "/admin-tools", search: { type: "services" } });
      return;
    }

    if (product?.component?.type === "markdown" && product.component.ref) {
      setMarkdownLoading(true);
      // Fetch markdown from the admin-ui protected path
      fetch(product.component.ref)
        .then((res) => res.text())
        .then((text) => {
          setMarkdownContent(text);
          setMarkdownLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load admin markdown:", err);
          setMarkdownLoading(false);
        });
    }
  }, [product, navigate, productsLoading, products]);

  const handleClose = () => {
    window.close();
    setTimeout(() => {
      if (!window.closed) {
        navigate({ to: "/admin-tools", search: { type: "services" } });
      }
    }, 100);
  };

  if (userTypeLoading) {
    return <ProductLoading message={t("product.loadingProducts")} />;
  }

  if (!userTypeLoading && userType !== "admin") {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6 text-center py-12">
        <h1 className="text-6xl font-bold text-destructive">403</h1>
        <p className="text-xl text-muted-foreground">
          {t("adminTools.forbiddenAdminAccess")}
        </p>
      </div>
    );
  }

  if (productsLoading) {
    return <ProductLoading message={t("product.loadingProducts")} />;
  }

  if (productsError) {
    return (
      <ProductError
        onGoHome={() =>
          navigate({ to: "/admin-tools", search: { type: "services" } })
        }
      />
    );
  }

  if (!product) {
    return <ProductLoading message={t("product.notFoundRedirect")} />;
  }

  const Remote = getAdminRemoteComponent(shortname);

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
                meta={{
                  theme: import.meta.env.VITE_THEME,
                  callsign: callsign,
                }}
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
