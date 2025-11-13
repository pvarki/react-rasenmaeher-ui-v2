"use client";

import { cn } from "@/lib/utils";

import type React from "react";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookOpen, ExternalLink, Zap } from "lucide-react";
import { useUserType } from "@/hooks/auth/useUserType";
import { useGetProductDescriptions } from "@/hooks/api/useGetProductDescriptions";
import { MtlsInfoModal } from "@/components/MtlsInfoModal";

export const Route = createFileRoute("/")({
  component: HomePage,
});

interface Product {
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

function HomePage() {
  const navigate = useNavigate();
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [exitUrl, setExitUrl] = useState("");
  const [mtlsInfoOpen, setMtlsInfoOpen] = useState(false);

  const { isValidUser, callsign, isLoading: userTypeLoading } = useUserType();

  const { data: products = [], isLoading: productsLoading } =
    useGetProductDescriptions("en");

  if (userTypeLoading || productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your services...</p>
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
      <div className="mb-12 space-y-3 flex items-start justify-between">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome to Deploy App
          </h2>
          <p className="text-lg text-muted-foreground max-w-4xl">
            Access your tactical services and tools. Select a service below to
            get started.
          </p>
          {!isValidUser && (
            <p className="text-sm text-destructive font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              You must be authenticated to access services. Please log in.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product: Product) => (
          <div
            key={product.shortname}
            onClick={() => handleProductClick(product)}
            className={cn(
              "group flex flex-col border border-border rounded-2xl overflow-hidden transition-all duration-300",
              isValidUser
                ? "hover:border-primary hover:shadow-xl hover:-translate-y-1 cursor-pointer bg-card"
                : "opacity-60 cursor-not-allowed bg-card",
            )}
          >
            {product.icon && (
              <div className="relative h-48 w-full overflow-hidden flex items-center justify-center bg-linear-to-br">
                <img
                  src={product.icon}
                  alt={product.title}
                  className={cn(
                    "w-full h-full object-cover transition-all duration-500",
                    "group-hover:scale-105",
                  )}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-linear-to-t from-card/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
              </div>
            )}

            <div className="flex flex-col flex-1 p-6">
              <div className="mb-4">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                  {product.shortname.toUpperCase()}
                </p>
                <h3 className="text-xl font-bold text-foreground">
                  {product.title}
                </h3>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">
                {product.description}
              </p>

              <div className="flex gap-2 pt-4 border-t border-border">
                {product.docs && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "flex-1 rounded-lg hover:bg-accent/50 h-11 md:h-12 text-sm md:text-base font-medium",
                      !isValidUser && "opacity-50 cursor-not-allowed",
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDocsClick(product.docs, e);
                    }}
                    disabled={!isValidUser}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    DOCS
                  </Button>
                )}
                <Button
                  size="sm"
                  className={cn(
                    "flex-1 rounded-lg font-medium transition-all h-11 md:h-12 text-sm md:text-base",
                    isValidUser
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : "bg-muted text-muted-foreground cursor-not-allowed",
                  )}
                  disabled={!isValidUser}
                >
                  {product.component.type === "component" ? (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      LAUNCH
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      OPEN
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={exitDialogOpen} onOpenChange={setExitDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Leave Deploy App?</DialogTitle>
            <DialogDescription className="pt-2">
              You are about to open an external page. Are you sure you want to
              continue?
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <p className="text-muted-foreground break-all font-mono text-xs">
              {exitUrl}
            </p>
          </div>
          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setExitDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmExit} className="flex-1">
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MtlsInfoModal open={mtlsInfoOpen} onOpenChange={setMtlsInfoOpen} />
    </>
  );
}
