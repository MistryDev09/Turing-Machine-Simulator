import { useEffect } from "react";
import { colors, btnStyle, font } from "../styles/theme";

export default function ControlPanel({
  onStep,
  onRun,
  onPause,
  onUndo,
  onReset,
  speed,
  onSpeedChange,
  halted,
  running,
  canUndo,
  isMobile,
}) {
  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;

      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (running) onPause();
        else onRun();
      } else if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        onStep();
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        onReset();
      } else if (e.key === "z" || e.key === "Z" || (e.ctrlKey && e.key === "z")) {
        e.preventDefault();
        onUndo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [running, onStep, onRun, onPause, onUndo, onReset]);

  const speedLabel = speed <= 150 ? "Fast" : speed <= 400 ? "Medium" : "Slow";

  return (
    <div style={{ marginBottom: isMobile ? 14 : 20 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "auto auto auto auto auto",
          gap: isMobile ? 6 : 8,
          justifyContent: isMobile ? "stretch" : "center",
          alignItems: "center",
        }}
      >
        <button
          onClick={onStep}
          disabled={halted || running}
          aria-label="Step forward one instruction"
          style={btnStyle(halted || running, false, isMobile)}
        >
          {"\u23ED"} STEP
        </button>
        {running ? (
          <button
            onClick={onPause}
            aria-label="Pause machine"
            style={btnStyle(false, true, isMobile)}
          >
            {"\u23F8"} PAUSE
          </button>
        ) : (
          <button
            onClick={onRun}
            disabled={halted}
            aria-label="Run machine"
            style={btnStyle(halted, true, isMobile)}
          >
            {"\u25B6"} RUN
          </button>
        )}
        <button
          onClick={onUndo}
          disabled={!canUndo || running}
          aria-label="Undo last step"
          style={btnStyle(!canUndo || running, false, isMobile)}
        >
          {"\u21A9"} UNDO
        </button>
        <button
          onClick={onReset}
          aria-label="Reset machine"
          style={{
            ...btnStyle(false, false, isMobile),
            borderColor: colors.borderDanger,
            color: colors.danger,
          }}
        >
          {"\u27F3"} RESET
        </button>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 9,
            color: colors.textMuted,
            gridColumn: isMobile ? "1 / -1" : "auto",
            justifyContent: "center",
            padding: isMobile ? "4px 0" : 0,
          }}
        >
          <span style={{ fontSize: 8, color: colors.textDisabled }}>SLOW</span>
          <input
            type="range"
            min={50}
            max={800}
            step={50}
            value={800 - speed + 50}
            onChange={(e) => onSpeedChange(800 - Number(e.target.value) + 50)}
            aria-label="Execution speed"
            aria-valuemin={50}
            aria-valuemax={800}
            aria-valuenow={800 - speed + 50}
            aria-valuetext={speedLabel}
            style={{
              width: isMobile ? "100%" : 80,
              accentColor: colors.primary,
              flex: isMobile ? 1 : "none",
            }}
          />
          <span style={{ fontSize: 8, color: colors.textDisabled }}>FAST</span>
        </label>
      </div>
      <div
        style={{
          textAlign: "center",
          marginTop: 6,
          fontSize: 8,
          color: colors.textDisabled,
          letterSpacing: 1,
        }}
      >
        Keys: S=step, Space=run/pause, Z=undo, R=reset
      </div>
    </div>
  );
}
