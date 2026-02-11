import { colors } from "../styles/theme";

export default function StatusBar({ currentState, headPos, stepCount, halted, won, running, isMobile }) {
  let statusLabel, statusColor, statusAriaLabel;
  if (halted) {
    if (won) {
      statusLabel = "\u2713 OK";
      statusColor = colors.primary;
      statusAriaLabel = "Machine completed successfully";
    } else {
      statusLabel = "\u25A0 HALT";
      statusColor = colors.danger;
      statusAriaLabel = "Machine halted";
    }
  } else if (running) {
    statusLabel = "\u25B6 RUN";
    statusColor = colors.accent;
    statusAriaLabel = "Machine running";
  } else {
    statusLabel = "\u25CF READY";
    statusColor = colors.textMuted;
    statusAriaLabel = "Machine ready";
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        display: "flex",
        gap: isMobile ? 8 : 20,
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        padding: isMobile ? "8px 10px" : "10px 20px",
        marginBottom: isMobile ? 12 : 16,
        background: colors.bgSubtle,
        border: `1px solid ${colors.borderSubtle}`,
        fontSize: isMobile ? 11 : 13,
        letterSpacing: isMobile ? 1 : 2,
      }}
    >
      <div>
        <span style={{ color: colors.textMuted }}>ST </span>
        <span
          style={{
            color: currentState === "HALT" ? colors.danger : colors.primary,
            fontWeight: 700,
            textShadow: `0 0 8px ${currentState === "HALT" ? "#ff6b6b44" : "#4fffb044"}`,
          }}
        >
          {currentState}
        </span>
      </div>
      {!isMobile && <div style={{ color: colors.borderSubtle }}>{"\u2502"}</div>}
      <div>
        <span style={{ color: colors.textMuted }}>HD </span>
        <span style={{ color: colors.accent }}>{headPos}</span>
      </div>
      {!isMobile && <div style={{ color: colors.borderSubtle }}>{"\u2502"}</div>}
      <div>
        <span style={{ color: colors.textMuted }}># </span>
        <span style={{ color: colors.accent }}>{stepCount}</span>
      </div>
      {!isMobile && <div style={{ color: colors.borderSubtle }}>{"\u2502"}</div>}
      <div>
        <span
          aria-label={statusAriaLabel}
          style={{ color: statusColor, fontWeight: 700 }}
        >
          {statusLabel}
        </span>
      </div>
    </div>
  );
}
