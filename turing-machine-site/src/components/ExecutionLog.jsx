import { useState } from "react";
import { BLANK } from "../constants/challenges";
import { colors, font } from "../styles/theme";

export default function ExecutionLog({ history, lastStepResult, stepCount, isMobile }) {
  const [expanded, setExpanded] = useState(false);

  if (stepCount === 0 && !lastStepResult) return null;

  const recentHistory = history.slice(-10).reverse();

  const content = (
    <div
      role="log"
      aria-label="Execution history"
      style={{
        maxHeight: 200,
        overflowY: "auto",
        fontSize: isMobile ? 10 : 11,
        lineHeight: 1.8,
      }}
    >
      {lastStepResult && (
        <div
          aria-live="polite"
          style={{
            padding: "3px 8px",
            color: colors.primary,
            background: colors.bgHighlight,
            fontWeight: 600,
          }}
        >
          #{stepCount}: {lastStepResult}
        </div>
      )}
      {recentHistory.map((entry, i) => (
        <div
          key={stepCount - 1 - i}
          style={{
            padding: "2px 8px",
            color: colors.textMuted,
            borderBottom: `1px solid ${colors.borderFaint}`,
          }}
        >
          #{entry.stepCount}: state={entry.currentState}, head={entry.headPos}, read=
          {(entry.tape[entry.headPos] || BLANK) === BLANK ? "blank" : entry.tape[entry.headPos]}
        </div>
      ))}
    </div>
  );

  return (
    <div
      style={{
        marginBottom: isMobile ? 14 : 20,
        background: colors.bgPanel,
        border: `1px solid ${colors.borderSubtle}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isMobile ? "6px 10px" : "8px 12px",
        }}
      >
        <div style={{ fontSize: 10, color: colors.textSecondary, letterSpacing: 3 }}>
          EXECUTION LOG
        </div>
        {isMobile && (
          <button
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse execution log" : "Expand execution log"}
            style={{
              background: "transparent",
              border: `1px solid ${colors.borderSubtle}`,
              color: colors.textMuted,
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 10,
              padding: "2px 8px",
            }}
          >
            {expanded ? "\u25BE" : "\u25B8"}
          </button>
        )}
      </div>
      {(!isMobile || expanded) && content}
    </div>
  );
}
