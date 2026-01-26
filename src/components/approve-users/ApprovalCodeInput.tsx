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
  const CODE_LENGTH = 8;
  const paddedCode = (approvalCode || "").padEnd(CODE_LENGTH, " ");
  const codeArray = paddedCode.split("");

  const updateCodeAtIndex = (index: number, value: string) => {
    const newCodeArray = [...codeArray];
    newCodeArray[index] = value;
    onCodeChange(newCodeArray.join(""));
  };

  return (
    <div className="space-y-2">
      {/* Desktop: Individual character inputs */}
      <div className="hidden md:flex gap-1.5 justify-start flex-wrap">
        {codeArray.map((char, i) => (
          <input
            key={i}
            type="text"
            maxLength={1}
            className={cn(
              "w-10 h-12 border-2 border-border rounded-lg text-center text-lg font-bold",
              "focus:border-primary focus:outline-none transition-colors",
              "bg-input text-foreground",
              "caret-transparent",
            )}
            value={char === " " ? "" : char}
            onChange={(e) => {
              const val = e.target.value.toUpperCase();
              const newCodeArray = [...codeArray];
              newCodeArray[i] = val || " ";
              onCodeChange(newCodeArray.join(""));
              if (val && i < codeArray.length - 1) {
                const nextInput = e.currentTarget
                  .nextElementSibling as HTMLInputElement;
                nextInput?.focus();
              }
            }}
            onKeyDown={(e) => {
              const isEmpty = char === " ";

              if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                e.preventDefault();
                updateCodeAtIndex(i, e.key.toUpperCase());
                if (i < codeArray.length - 1) {
                  const nextInput = e.currentTarget
                    .nextElementSibling as HTMLInputElement;
                  nextInput?.focus();
                }
                return;
              }

              if (e.key === "ArrowLeft" && i > 0) {
                e.preventDefault();
                const prevInput = e.currentTarget
                  .previousElementSibling as HTMLInputElement;
                prevInput?.focus();
                return;
              }
              if (e.key === "ArrowRight" && i < codeArray.length - 1) {
                e.preventDefault();
                const nextInput = e.currentTarget
                  .nextElementSibling as HTMLInputElement;
                nextInput?.focus();
                return;
              }

              if (e.key === "Backspace") {
                if (!isEmpty) {
                  e.preventDefault();
                  updateCodeAtIndex(i, " ");
                } else if (i > 0) {
                  e.preventDefault();
                  updateCodeAtIndex(i - 1, " ");
                  const prevInput = e.currentTarget
                    .previousElementSibling as HTMLInputElement;
                  prevInput?.focus();
                }
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
        maxLength={CODE_LENGTH}
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
