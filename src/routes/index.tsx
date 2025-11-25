"use client"

import { cn } from "@/lib/utils"

import type React from "react"

import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BookOpen, ExternalLink, Zap, Settings } from "lucide-react"
import { useUserType } from "@/hooks/auth/useUserType"
import { useGetProductDescriptions } from "@/hooks/api/useGetProductDescriptions"
import { MtlsInfoModal } from "@/components/MtlsInfoModal"
import { useTranslation } from "react-i18next"
import { useLanguage } from "@/hooks/useLanguage"

export const Route = createFileRoute("/")({
  component: HomePage,
})

interface Product {
  shortname: string
  title: string
  icon: string | null
  description: string
  language: string
  docs: string | null
  component: {
    type: "component" | "markdown" | "link"
    ref: string
  }
}

function getProductIcon(shortname: string) {
  const iconMap: Record<string, React.ReactNode> = {
    tak: <Zap className="w-6 h-6" />,
    taktak: <Zap className="w-6 h-6" />,
    default: <Zap className="w-6 h-6" />,
  }
  return iconMap[shortname.toLowerCase()] || iconMap.default
}

function getCleanProductTitle(title: string): string {
  const cleanedTitle = title
    .replace(/^TAKTAK:\s*/, "")
    .replace(/^TAKTAK:\s?/, "")
    .replace(/^TAK:\s*/, "")
    .replace(/^TAK:\s?/, "")
  return cleanedTitle
}

function getProductShortLabel(title: string): string {
  const match = title.match(/^([A-Z]+):\s/)
  if (match) {
    const label = match[1]
    return label.substring(0, 3)
  }
  return "APP"
}

function HomePage() {
  const navigate = useNavigate()
  const [exitDialogOpen, setExitDialogOpen] = useState(false)
  const [exitUrl, setExitUrl] = useState("")
  const [mtlsInfoOpen, setMtlsInfoOpen] = useState(false)
  const { t } = useTranslation()
  const { currentLanguage } = useLanguage()
  const { userType } = useUserType()

  const { isValidUser, callsign, isLoading: userTypeLoading } = useUserType()

  const { data: products = [], isLoading: productsLoading } = useGetProductDescriptions(currentLanguage)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) {
      return t("home.greetingMorning", { name: callsign || "User" })
    } else if (hour < 18) {
      return t("home.greetingAfternoon", { name: callsign || "User" })
    } else {
      return t("home.greetingEvening", { name: callsign || "User" })
    }
  }

  if (userTypeLoading || productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">{t("home.loadingServices")}</p>
        </div>
      </div>
    )
  }

  if (!userTypeLoading && !callsign) {
    navigate({ to: "/login" })
  }

  const handleProductClick = (product: Product) => {
    if (!isValidUser) return

    if (product.component.type === "link") {
      setExitUrl("#")
      setExitDialogOpen(true)
    } else {
      window.open(`/product/${product.shortname}`)
    }
  }

  const handleDocsClick = (docsUrl: string | null, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isValidUser || !docsUrl) return

    setExitUrl(docsUrl)
    setExitDialogOpen(true)
  }

  const handleConfirmExit = () => {
    window.open(exitUrl, "_blank")
    setExitDialogOpen(false)
    setExitUrl("")
  }

  return (
    <>
      <div className="mb-12 space-y-6">
        <div className="space-y-2 md:space-y-3">
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
            <span className="">{getGreeting()} 👋</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-4xl">{t("home.description")}</p>
          {!isValidUser && (
            <p className="text-sm text-destructive font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {t("home.authRequired")}
            </p>
          )}
        </div>

        {userType === "admin" && (
          <div className="pt-4 border-t border-border">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => navigate({ to: "/admin-tools" })}
                className="w-full sm:w-auto h-12 px-6 flex items-center justify-center gap-2 text-base font-semibold"
              >
                <Settings className="w-5 h-5" />
                {t("adminTools.navLink")}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="flex flex-col flex-1 p-6">
              <div className="mb-4">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                  {getProductShortLabel(product.title)}
                </p>
                <h3 className="text-lg md:text-xl font-bold text-foreground leading-tight">
                  {getCleanProductTitle(product.title)}
                </h3>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">{product.description}</p>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
                {product.docs && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "flex items-center justify-center rounded-lg hover:bg-accent/50 h-12 text-sm md:text-base font-medium w-full sm:flex-1",
                      !isValidUser && "opacity-50 cursor-not-allowed",
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDocsClick(product.docs, e)
                    }}
                    disabled={!isValidUser}
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    {t("home.productCard.docs")}
                  </Button>
                )}
                <Button
                  size="sm"
                  className={cn(
                    "flex items-center justify-center rounded-lg font-semibold transition-all h-12 text-sm md:text-base w-full sm:flex-1",
                    isValidUser
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : "bg-muted text-muted-foreground cursor-not-allowed",
                  )}
                  disabled={!isValidUser}
                >
                  <span className="inline-flex items-center gap-2">
                    {(product.component.type === "component" || product.component.type === "markdown") ? (
                      <>
                        <span className="flex-shrink-0">{getProductIcon(product.shortname)}</span>
                        <span>{t("home.productCard.launch")}</span>
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-5 h-5 flex-shrink-0" />
                        <span>{t("home.productCard.open")}</span>
                      </>
                    )}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={exitDialogOpen} onOpenChange={setExitDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("home.dialog.leaveTitle")}</DialogTitle>
            <DialogDescription className="pt-2">{t("home.dialog.leaveDescription")}</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <p className="text-muted-foreground break-all font-mono text-xs">{exitUrl}</p>
          </div>
          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setExitDialogOpen(false)} className="flex-1">
              {t("home.dialog.cancel")}
            </Button>
            <Button onClick={handleConfirmExit} className="flex-1">
              {t("home.dialog.continue")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MtlsInfoModal open={mtlsInfoOpen} onOpenChange={setMtlsInfoOpen} />
    </>
  )
}
