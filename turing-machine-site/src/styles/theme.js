export const font = "'IBM Plex Mono', 'Fira Code', 'Courier New', monospace";

export const colors = {
  bg: "#0a0a0f",
  bgPanel: "#050a08",
  bgSubtle: "#0d1510",
  bgInput: "#0a1210",
  bgHighlight: "#1a3a28",
  bgDark: "#0f1a14",
  bgError: "#2a0f0f",
  bgSuccess: "#0f2a1a",

  primary: "#4fffb0",
  accent: "#ffc04d",
  danger: "#ff6b6b",
  text: "#c8f7c5",

  // Solid accessible text colors (WCAG AA on #0a0a0f)
  textSecondary: "#5ec89e",   // ~5.5:1 — labels, section headers
  textMuted: "#4aba8a",       // ~5.2:1 — hints, less important text
  textDisabled: "#3d8a6a",    // ~3.5:1 — large text only (indices, decorative)
  accentMuted: "#b89050",     // ~4.5:1 — hint text in accent color

  // Decorative only (borders, shadows, dividers — NOT for readable text)
  borderPrimary: "#4fffb044",
  borderSubtle: "#4fffb022",
  borderFaint: "#4fffb011",
  borderDanger: "#ff6b6b44",
  borderAccent: "#ffc04d44",
  divider: "#4fffb022",
};

export const btnStyle = (disabled, primary = false, mobile = false) => ({
  padding: mobile ? "10px 8px" : "8px 18px",
  fontSize: mobile ? 11 : 12,
  fontWeight: 700,
  letterSpacing: mobile ? 1 : 2,
  fontFamily: font,
  background: primary && !disabled ? colors.primary : "transparent",
  color: disabled ? colors.textDisabled : primary ? colors.bg : colors.primary,
  border: `1px solid ${disabled ? colors.borderFaint : primary ? colors.primary : colors.borderPrimary}`,
  cursor: disabled ? "not-allowed" : "pointer",
  transition: "all 0.2s",
  touchAction: "manipulation",
});

export const tinyBtnStyle = {
  padding: "4px 12px",
  fontSize: 9,
  letterSpacing: 1,
  background: "transparent",
  color: colors.textMuted,
  border: `1px solid ${colors.borderSubtle}`,
  cursor: "pointer",
  fontFamily: font,
};

export const ruleInputStyle = {
  background: colors.bgInput,
  border: `1px solid ${colors.borderSubtle}`,
  color: colors.primary,
  padding: "5px 6px",
  fontSize: 12,
  fontFamily: font,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

export const delBtnStyle = {
  background: "transparent",
  border: `1px solid ${colors.borderDanger}`,
  color: colors.danger,
  cursor: "pointer",
  fontSize: 14,
  fontFamily: font,
  padding: 0,
  transition: "all 0.2s",
  opacity: 0.5,
};

export const mobileLabelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 3,
  fontSize: 9,
  color: colors.textMuted,
  letterSpacing: 1,
};

export const mobileInputStyle = {
  background: colors.bgInput,
  border: `1px solid ${colors.borderPrimary}`,
  color: colors.primary,
  padding: "8px 8px",
  fontSize: 13,
  fontFamily: font,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  borderRadius: 0,
  WebkitAppearance: "none",
};
