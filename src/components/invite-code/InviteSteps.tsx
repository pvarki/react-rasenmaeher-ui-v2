import { useTranslation } from "react-i18next";

export function InviteSteps() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <p>
        <span className="text-primary font-semibold">
          1. {t("inviteCode.steps.show")}
        </span>
      </p>
      <p>
        <span className="text-primary font-semibold">
          2. {t("inviteCode.steps.alternative")}
        </span>{" "}
        {t("inviteCode.steps.copyButtonHint")}
      </p>
      <p>
        <span className="text-primary font-semibold">
          3. {t("inviteCode.steps.print")}
        </span>{" "}
        {t("inviteCode.steps.printHint")}
      </p>
      <p>
        <span className="text-primary font-semibold">
          4. {t("inviteCode.steps.callsign")}
        </span>
      </p>
      <p>
        <span className="text-primary font-semibold">
          5. {t("inviteCode.steps.waiting")}
        </span>
      </p>
      <p>
        <span className="text-primary font-semibold">
          6. {t("inviteCode.steps.approve")}
        </span>{" "}
        {t("inviteCode.steps.approveHint")}
      </p>
    </div>
  );
}
