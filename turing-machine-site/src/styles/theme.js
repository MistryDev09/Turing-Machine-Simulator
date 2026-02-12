export const font = "'IBM Plex Mono', 'Fira Code', 'Courier New', monospace";

export const btnStyle = (colors, disabled, primary = false, mobile = false) => ({
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

export const tinyBtnStyle = (colors) => ({
  padding: "4px 12px",
  fontSize: 9,
  letterSpacing: 1,
  background: "transparent",
  color: colors.textMuted,
  border: `1px solid ${colors.borderSubtle}`,
  cursor: "pointer",
  fontFamily: font,
});

export const ruleInputStyle = (colors) => ({
  background: colors.bgInput,
  border: `1px solid ${colors.borderSubtle}`,
  color: colors.primary,
  padding: "5px 6px",
  fontSize: 12,
  fontFamily: font,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
});

export const delBtnStyle = (colors) => ({
  background: "transparent",
  border: `1px solid ${colors.borderDanger}`,
  color: colors.danger,
  cursor: "pointer",
  fontSize: 14,
  fontFamily: font,
  padding: 0,
  transition: "all 0.2s",
  opacity: 0.5,
});

export const mobileLabelStyle = (colors) => ({
  display: "flex",
  flexDirection: "column",
  gap: 3,
  fontSize: 9,
  color: colors.textMuted,
  letterSpacing: 1,
});

export const mobileInputStyle = (colors) => ({
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
});
