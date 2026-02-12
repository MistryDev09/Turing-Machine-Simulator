import { createContext, useContext, useState, useEffect, useMemo } from "react";

const darkColors = {
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

  textSecondary: "#5ec89e",
  textMuted: "#4aba8a",
  textDisabled: "#3d8a6a",
  accentMuted: "#b89050",

  borderPrimary: "#4fffb044",
  borderSubtle: "#4fffb022",
  borderFaint: "#4fffb011",
  borderDanger: "#ff6b6b44",
  borderAccent: "#ffc04d44",
  divider: "#4fffb022",

  // Effect colors
  crtScanline: "rgba(0,0,0,0.08)",
  crtVignette: "rgba(0,0,0,0.6)",
  glowPrimary: "rgba(79,255,176,0.5)",
  glowPrimaryFaint: "rgba(79,255,176,0.2)",
  glowDanger: "#ff6b6b44",
  glowPrimaryAlt: "#4fffb044",
  cellFlash: "rgba(79, 255, 176, 0.25)",
  svgEdge: "#4fffb055",
  svgMarker: "#4fffb066",
  haltBg: "#1a0a0a",
  haltBorder: "#ff6b6b66",
};

const lightColors = {
  bg: "#f0f4f2",
  bgPanel: "#e4ebe7",
  bgSubtle: "#dce5e0",
  bgInput: "#ffffff",
  bgHighlight: "#c8e6d4",
  bgDark: "#d4ddd8",
  bgError: "#fde8e8",
  bgSuccess: "#e0f5e9",

  primary: "#0d7a4a",
  accent: "#a06800",
  danger: "#c53030",
  text: "#1a2e24",

  textSecondary: "#2d6e4e",
  textMuted: "#3d7a5e",
  textDisabled: "#7a9e8c",
  accentMuted: "#8a6a20",

  borderPrimary: "#0d7a4a44",
  borderSubtle: "#0d7a4a22",
  borderFaint: "#0d7a4a11",
  borderDanger: "#c5303044",
  borderAccent: "#a0680044",
  divider: "#0d7a4a22",

  // Effect colors
  crtScanline: "rgba(0,0,0,0.03)",
  crtVignette: "rgba(0,0,0,0.12)",
  glowPrimary: "rgba(13,122,74,0.3)",
  glowPrimaryFaint: "rgba(13,122,74,0.1)",
  glowDanger: "#c5303033",
  glowPrimaryAlt: "#0d7a4a33",
  cellFlash: "rgba(13, 122, 74, 0.15)",
  svgEdge: "#0d7a4a55",
  svgMarker: "#0d7a4a66",
  haltBg: "#fde8e8",
  haltBorder: "#c5303066",
};

const STORAGE_KEY = "turing-machine-theme";

const ThemeContext = createContext(null);

function getInitialMode() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {}
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  return "dark";
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(getInitialMode);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {}
    document.body.style.background = mode === "dark" ? darkColors.bg : lightColors.bg;
  }, [mode]);

  const toggleTheme = () => setMode((m) => (m === "dark" ? "light" : "dark"));

  const value = useMemo(
    () => ({
      colors: mode === "dark" ? darkColors : lightColors,
      mode,
      toggleTheme,
    }),
    [mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
