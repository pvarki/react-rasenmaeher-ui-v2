"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useNavigate } from "@tanstack/react-router"
import { Home } from "lucide-react"
import { useTranslation } from "react-i18next"

interface ErrorContentProps {
  errorCode?: string
  title: string
  description: string
}

export function ErrorContent({ errorCode, title, description }: ErrorContentProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center text-3xl">
          ⚠️
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          {errorCode && (
            <p className="text-sm text-muted-foreground font-mono bg-muted/50 rounded px-3 py-1 inline-block">
              Code: {errorCode.toUpperCase()}
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <CardDescription className="text-center text-sm leading-relaxed">{description}</CardDescription>

        <Button onClick={() => navigate({ to: "/login" })} className="w-full" size="default">
          <Home className="w-4 h-4 mr-2" />
          {t("error.returnHome")}
        </Button>
      </CardContent>
    </Card>
  )
}
