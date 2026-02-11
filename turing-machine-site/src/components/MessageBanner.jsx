import { colors } from "../styles/theme";

export default function MessageBanner({ message, won, isMobile }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        textAlign: "center",
        padding: isMobile ? "8px 10px" : "10px 16px",
        marginBottom: 14,
        background: won ? colors.bgSuccess : colors.bgError,
        border: `1px solid ${won ? colors.borderPrimary : colors.borderDanger}`,
        color: won ? colors.primary : colors.danger,
        fontSize: isMobile ? 11 : 13,
        fontWeight: 600,
        letterSpacing: 1,
        wordBreak: "break-word",
      }}
    >
      {message}
    </div>
  );
}
