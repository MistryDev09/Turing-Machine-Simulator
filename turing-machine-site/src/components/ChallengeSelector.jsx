import { CHALLENGES } from "../constants/challenges";
import { colors, font } from "../styles/theme";

export default function ChallengeSelector({ selectedIdx, onSelect, isMobile }) {
  return (
    <div style={{ marginBottom: isMobile ? 14 : 20 }}>
      <div style={{ fontSize: 10, color: colors.textSecondary, letterSpacing: 3, marginBottom: 8 }}>
        SELECT CHALLENGE
      </div>
      <div
        role="radiogroup"
        aria-label="Challenge selection"
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(5, auto)",
          gap: isMobile ? 4 : 6,
        }}
      >
        {CHALLENGES.map((ch, i) => (
          <button
            key={i}
            role="radio"
            aria-checked={selectedIdx === i}
            aria-label={`Select challenge: ${ch.name}`}
            onClick={() => onSelect(i)}
            style={{
              padding: isMobile ? "10px 8px" : "6px 14px",
              minHeight: isMobile ? 44 : "auto",
              fontSize: isMobile ? 10 : 11,
              letterSpacing: 1,
              background: selectedIdx === i ? colors.primary : "transparent",
              color: selectedIdx === i ? colors.bg : colors.primary,
              border: `1px solid ${selectedIdx === i ? colors.primary : colors.borderPrimary}`,
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: selectedIdx === i ? 700 : 400,
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            {ch.name}
          </button>
        ))}
      </div>
      <div
        style={{
          marginTop: 8,
          padding: isMobile ? "8px 10px" : "10px 14px",
          background: colors.bgDark,
          border: `1px solid ${colors.borderSubtle}`,
          fontSize: isMobile ? 11 : 12,
          lineHeight: 1.6,
        }}
      >
        <span style={{ color: colors.primary }}>{"\u25B8"} </span>
        {CHALLENGES[selectedIdx].description}
        <br />
        <span style={{ color: colors.accentMuted, fontSize: isMobile ? 10 : 11 }}>
          {"\u25B8"} Hint: {CHALLENGES[selectedIdx].hints}
        </span>
      </div>
    </div>
  );
}
