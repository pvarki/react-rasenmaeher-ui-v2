import i18n from "@/config/i18n";

interface RemoteComponentFallbackProps {
  shortname?: string;
}

export function RemoteComponentFallback({
  shortname,
}: RemoteComponentFallbackProps) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "1rem",
        borderRadius: "8px",
        marginTop: "1rem",
        background: "#f8d7da",
        color: "#842029",
      }}
    >
      {i18n.t("product.remoteUnavailable", {
        shortname: shortname || "unknown",
      })}
    </div>
  );
}
