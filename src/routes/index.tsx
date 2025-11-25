"use client";

import type React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useUserType } from "@/hooks/auth/useUserType";
import { useGetProductDescriptions } from "@/hooks/api/useGetProductDescriptions";
import { MtlsInfoModal } from "@/components/MtlsInfoModal";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import {
  ProductCard,
  ExitConfirmDialog,
  HomeGreeting,
  AdminToolsSection,
  type Product,
} from "@/components/home";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [exitUrl, setExitUrl] = useState("");
  const [mtlsInfoOpen, setMtlsInfoOpen] = useState(false);
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { userType, isValidUser, callsign, isLoading: userTypeLoading } = useUserType();

  const { data: products = [], isLoading: productsLoading } =
    useGetProductDescriptions(currentLanguage);

  if (userTypeLoading || productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">{t("home.loadingServices")}</p>
        </div>
      </div>
    );
  }

  if (!userTypeLoading && !callsign) {
    navigate({ to: "/login" });
  }

  const handleProductClick = (product: Product) => {
    if (!isValidUser) return;

    if (product.component.type === "link") {
      setExitUrl("#");
      setExitDialogOpen(true);
    } else {
      window.open(`/product/${product.shortname}`);
    }
  };

  const handleDocsClick = (docsUrl: string | null, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isValidUser || !docsUrl) return;

    setExitUrl(docsUrl);
    setExitDialogOpen(true);
  };

  const handleConfirmExit = () => {
    window.open(exitUrl, "_blank");
    setExitDialogOpen(false);
    setExitUrl("");
  };

  return (
    <>
      <div className="mb-12 space-y-6">
        <HomeGreeting callsign={callsign} isValidUser={isValidUser} />

        {userType === "admin" && (
          <AdminToolsSection onNavigate={() => navigate({ to: "/admin-tools" })} />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product: Product) => (
          <ProductCard
            key={product.shortname}
            product={product}
            isValidUser={isValidUser}
            onProductClick={handleProductClick}
            onDocsClick={handleDocsClick}
          />
        ))}
      </div>

      <ExitConfirmDialog
        open={exitDialogOpen}
        onOpenChange={setExitDialogOpen}
        exitUrl={exitUrl}
        onConfirm={handleConfirmExit}
      />

      <MtlsInfoModal open={mtlsInfoOpen} onOpenChange={setMtlsInfoOpen} />
    </>
  );
}
