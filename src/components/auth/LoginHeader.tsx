"use client";
import { getTheme } from "@/config/themes";

interface LoginHeaderProps {
  deployment?: string;
}

export function LoginHeader({ deployment }: LoginHeaderProps) {
  const theme = getTheme();

  return (
    <div className="text-center space-y-4 ">
      <div className="flex items-center justify-center gap-2 mb-2">
        {theme.assets?.logoUrl && (
          <img src={theme.assets.logoUrl} alt="Logo" className="h-8 w-8" />
        )}
        <h1 className="text-2xl font-bold">{deployment}</h1>
      </div>
      <p className="text-muted-foreground text-sm">{theme.name}</p>
    </div>
  );
}
