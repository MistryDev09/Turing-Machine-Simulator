import { useEffect, useRef } from "react";

/**
 * Google AdSense Ad Banner Component
 *
 * HOW TO SET UP:
 * 1. Go to https://adsense.google.com and sign up / get approved
 * 2. In index.html, uncomment and add your AdSense script with your ca-pub-XXXX ID
 * 3. In your AdSense dashboard, create ad units and copy the "data-ad-slot" values
 * 4. Replace the slot IDs below where this component is used
 *
 * PROPS:
 *   adSlot   — your ad unit slot ID from AdSense (e.g., "1234567890")
 *   adFormat — "auto" (responsive), "horizontal", "vertical", "rectangle"
 *   style    — optional extra styles for the container
 */
export default function AdBanner({ adSlot = "YOUR_AD_SLOT_ID", adFormat = "auto", style = {} }) {
  const adRef = useRef(null);
  const pushed = useRef(false);

  useEffect(() => {
    // Only push ad once per mount and only if adsense is loaded
    if (!pushed.current && typeof window !== "undefined") {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      } catch (e) {
        // AdSense not loaded yet — that's fine during development
      }
    }
  }, []);

  return (
    <div
      style={{
        width: "100%",
        textAlign: "center",
        overflow: "hidden",
        minHeight: 90,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0f0d",
        border: "1px solid #4fffb011",
        ...style,
      }}
    >
      <ins
        className="adsbygoogle"
        ref={adRef}
        style={{ display: "block", width: "100%" }}
        data-ad-client="ca-pub-YOUR_PUBLISHER_ID"  /* ← REPLACE with your ca-pub ID */
        data-ad-slot={adSlot}                       /* ← REPLACE with your ad slot ID */
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />

      {/* Placeholder shown when ads aren't loaded (dev mode) */}
      <noscript>
        <div style={{ padding: 20, color: "#4fffb033", fontSize: 11 }}>
          Ad Space
        </div>
      </noscript>
    </div>
  );
}
