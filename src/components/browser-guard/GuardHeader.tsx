import { LanguageSwitcher } from "@/components/auth/LanguageSwitcher";

interface GuardHeaderProps {
  deployment: string;
  logoUrl?: string;
  isMobile?: boolean;
}

export function GuardHeader({
  deployment,
  logoUrl,
  isMobile,
}: GuardHeaderProps) {
  if (isMobile) {
    return (
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex-1">
          <div className="text-center space-y-4 mt-2">
            <div className="flex items-center gap-2 mb-2">
              {logoUrl && (
                <img src={logoUrl} alt="Logo" className="h-8 w-auto" />
              )}
              <span className="text-xs md:text-2xl font-bold">
                {deployment}
              </span>
            </div>
          </div>
        </div>
        <div className="shrink-0">
          <LanguageSwitcher />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 border-b border-border">
      <div className="flex-">
        <div className="text-center space-y-4 mt-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            {logoUrl && <img src={logoUrl} alt="Logo" className="h-8 w-auto" />}
            <span className="text-xs font-bold">{deployment}</span>
          </div>
        </div>
      </div>
      <div className="shrink-0">
        <LanguageSwitcher />
      </div>
    </div>
  );
}
