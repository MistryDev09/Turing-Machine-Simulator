import TuringMachine from "./components/TuringMachine";
import AdBanner from "./components/AdBanner";
import { useTheme } from "./contexts/ThemeContext";
import { font } from "./styles/theme";

export default function App() {
  const { colors } = useTheme();

  return (
    <div style={{
      minHeight: "100vh",
      background: colors.bg,
      fontFamily: font,
    }}>
      {/* ===== TOP AD BANNER ===== */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "12px 16px 0" }}>
        <AdBanner
          adSlot="YOUR_TOP_BANNER_SLOT"
          adFormat="horizontal"
          style={{ marginBottom: 0 }}
        />
      </div>

      {/* ===== MAIN GAME ===== */}
      <TuringMachine />

      {/* ===== BOTTOM AD BANNER ===== */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 16px 24px" }}>
        <AdBanner
          adSlot="YOUR_BOTTOM_BANNER_SLOT"
          adFormat="horizontal"
          style={{ marginTop: 0 }}
        />
      </div>

      {/* ===== FOOTER ===== */}
      <footer style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: "16px",
        textAlign: "center",
        fontSize: 10,
        color: colors.textDisabled,
        borderTop: `1px solid ${colors.borderFaint}`,
        fontFamily: font,
      }}>
        Turing Machine Simulator · Free educational tool
        <br />
        Built with React · Hosted on Vercel
      </footer>
    </div>
  );
}
