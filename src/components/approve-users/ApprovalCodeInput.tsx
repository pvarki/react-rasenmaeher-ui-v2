import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface ApprovalCodeInputProps {
  approvalCode: string;
  onCodeChange: (code: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function ApprovalCodeInput({
  approvalCode,
  onCodeChange,
  onSubmit,
  disabled = false,
}: ApprovalCodeInputProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      {/* Desktop: Individual character inputs */}
      <div className="hidden md:flex gap-1.5 justify-start flex-wrap">
        {Array.from({ length: 8 }).map((_, i) => (
          <input
            key={i}
            type="text"
            maxLength={1}
            className={cn(
              "w-10 h-12 border-2 border-border rounded-lg text-center text-lg font-bold",
              "focus:border-primary focus:outline-none transition-colors",
              "bg-input text-foreground",
            )}
            value={approvalCode[i] || ""}
            onChange={(e) => {
              const newCode = approvalCode.split("");
              newCode[i] = e.target.value.toUpperCase();
              onCodeChange(newCode.join(""));

              if (e.target.value && i < 7) {
                const nextInput = e.currentTarget
                  .nextElementSibling as HTMLInputElement;
                nextInput?.focus();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !approvalCode[i] && i > 0) {
                const prevInput = e.currentTarget
                  .previousElementSibling as HTMLInputElement;
                prevInput?.focus();
              }
              if (e.key === "Enter") {
                onSubmit();
              }
            }}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Mobile: Single text input */}
      <input
        type="text"
        maxLength={8}
        placeholder={t("approveUsers.enterCode8Char")}
        className={cn(
          "md:hidden w-full px-3 py-2 border-2 border-border rounded-lg text-center text-lg font-bold",
          "focus:border-primary focus:outline-none transition-colors",
          "bg-input text-foreground",
        )}
        value={approvalCode}
        onChange={(e) => onCodeChange(e.target.value.toUpperCase())}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSubmit();
          }
        }}
        disabled={disabled}
      />

      <p className="text-xs text-muted-foreground text-center">
        {t("approveUsers.enterCode8Char")}
      </p>
    </div>
  );
}
