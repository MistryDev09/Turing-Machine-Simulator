import TuringMachine from "./components/TuringMachine";
import AdBanner from "./components/AdBanner";

export default function App() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      fontFamily: "'IBM Plex Mono', 'Fira Code', 'Courier New', monospace",
    }}>
      {/* ===== TOP AD BANNER ===== */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "12px 16px 0" }}>
        <AdBanner
          adSlot="YOUR_TOP_BANNER_SLOT"   /* ← Replace with real slot ID */
          adFormat="horizontal"
          style={{ marginBottom: 0 }}
        />
      </div>

      {/* ===== MAIN GAME ===== */}
      <TuringMachine />

      {/* ===== BOTTOM AD BANNER ===== */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 16px 24px" }}>
        <AdBanner
          adSlot="YOUR_BOTTOM_BANNER_SLOT"  /* ← Replace with real slot ID */
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
        color: "#4fffb033",
        borderTop: "1px solid #4fffb011",
        fontFamily: "'IBM Plex Mono', monospace",
      }}>
        Turing Machine Simulator · Free educational tool
        <br />
        Built with React · Hosted on Vercel
      </footer>
    </div>
  );
}
