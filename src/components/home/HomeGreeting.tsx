import { useTranslation } from "react-i18next";

interface HomeGreetingProps {
  callsign: string | null;
  isValidUser: boolean;
}

export function HomeGreeting({ callsign, isValidUser }: HomeGreetingProps) {
  const { t } = useTranslation();

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = callsign || "User";
    if (hour < 12) {
      return t("home.greetingMorning", { name });
    } else if (hour < 18) {
      return t("home.greetingAfternoon", { name });
    } else {
      return t("home.greetingEvening", { name });
    }
  };

  return (
    <div className="space-y-2 md:space-y-3">
      <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
        <span>{getGreeting()} 👋</span>
      </h2>
      <p className="text-base md:text-lg text-muted-foreground max-w-4xl">
        {t("home.description")}
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
          {t("home.authRequired")}
        </p>
      )}
    </div>
  );
}
