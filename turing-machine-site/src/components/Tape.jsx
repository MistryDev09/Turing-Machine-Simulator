import { useRef, useEffect } from "react";
import { BLANK } from "../constants/challenges";
import { useTheme } from "../contexts/ThemeContext";
import { tinyBtnStyle } from "../styles/theme";

export default function Tape({
  tape,
  headPos,
  editTapeMode,
  cellSize,
  visibleStart,
  visibleEnd,
  changedCellIdx,
  isMobile,
  onToggleEdit,
  onUpdateCell,
  onAddCell,
  onRemoveCell,
}) {
  const visibleTape = tape.slice(visibleStart, visibleEnd);
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (editTapeMode && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [editTapeMode]);

  return (
    <div style={{ marginBottom: isMobile ? 14 : 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ fontSize: 10, color: colors.textSecondary, letterSpacing: 3 }}>TAPE</div>
        <button
          onClick={onToggleEdit}
          aria-label={editTapeMode ? "Stop editing tape" : "Edit tape cells"}
          style={{
            padding: "3px 8px",
            fontSize: 9,
            letterSpacing: 1,
            background: editTapeMode ? colors.accent : "transparent",
            color: editTapeMode ? colors.bg : colors.accentMuted,
            border: `1px solid ${editTapeMode ? colors.accent : colors.borderAccent}`,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {editTapeMode ? "DONE" : "EDIT"}
        </button>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
          padding: isMobile ? "8px 0" : "12px 0",
          overflow: "hidden",
          background: colors.bgPanel,
          border: `1px solid ${colors.borderSubtle}`,
          position: "relative",
        }}
      >
        {/* Fades */}
        <div
          style={{
            position: "absolute", left: 0, top: 0, bottom: 0, width: 30,
            background: `linear-gradient(to right, ${colors.bgPanel}, transparent)`,
            zIndex: 2, pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute", right: 0, top: 0, bottom: 0, width: 30,
            background: `linear-gradient(to left, ${colors.bgPanel}, transparent)`,
            zIndex: 2, pointerEvents: "none",
          }}
        />

        {visibleTape.map((cell, vIdx) => {
          const realIdx = visibleStart + vIdx;
          const isHead = realIdx === headPos;
          const isChanged = realIdx === changedCellIdx;
          const cellLabel = `Tape cell ${realIdx}, value: ${cell === BLANK ? "blank" : cell}${isHead ? ", head position" : ""}`;

          return (
            <div
              key={realIdx}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
              }}
            >
              {isHead && (
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: -6,
                    fontSize: isMobile ? 10 : 14,
                    color: colors.primary,
                    textShadow: `0 0 10px ${colors.primary}`,
                    animation: "tmPulse 1s ease-in-out infinite",
                  }}
                >
                  {"\u25BC"}
                </div>
              )}
              {editTapeMode ? (
                <input
                  ref={vIdx === 0 ? firstInputRef : undefined}
                  value={cell === BLANK ? "" : cell}
                  onChange={(e) => onUpdateCell(realIdx, e.target.value.slice(-1) || BLANK)}
                  aria-label={cellLabel}
                  maxLength={2}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    textAlign: "center",
                    fontSize: isMobile ? 14 : 18,
                    background: isHead ? colors.bgHighlight : colors.bgInput,
                    color: cell === BLANK ? colors.textDisabled : colors.primary,
                    border: `2px solid ${isHead ? colors.primary : colors.borderSubtle}`,
                    fontFamily: "inherit",
                    fontWeight: 700,
                    outline: "none",
                    margin: "8px 1px 2px",
                    boxShadow: isHead ? `0 0 12px ${colors.borderPrimary}, inset 0 0 12px ${colors.borderFaint}` : "none",
                    padding: 0,
                    borderRadius: 0,
                  }}
                />
              ) : (
                <div
                  role="img"
                  aria-label={cellLabel}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: isMobile ? 14 : 18,
                    fontWeight: 700,
                    background: isHead ? colors.bgHighlight : colors.bgInput,
                    color: cell === BLANK ? colors.textDisabled : colors.primary,
                    border: `2px solid ${isHead ? colors.primary : colors.borderSubtle}`,
                    margin: "8px 1px 2px",
                    boxShadow: isHead ? `0 0 12px ${colors.borderPrimary}, inset 0 0 12px ${colors.borderFaint}` : "none",
                    transition: "all 0.15s ease",
                    animation: isChanged ? "cellFlash 0.4s ease-out" : "none",
                  }}
                >
                  {cell === BLANK ? "\u00B7" : cell}
                </div>
              )}
              <div style={{ fontSize: 7, color: colors.textDisabled, marginTop: 1 }}>
                {realIdx}
              </div>
            </div>
          );
        })}
      </div>

      {editTapeMode && (
        <div style={{ display: "flex", gap: 6, marginTop: 6, justifyContent: "center" }}>
          <button onClick={onAddCell} aria-label="Add tape cell" style={tinyBtnStyle}>
            + CELL
          </button>
          <button onClick={onRemoveCell} aria-label="Remove last tape cell" style={tinyBtnStyle}>
            - CELL
          </button>
        </div>
      )}
    </div>
  );
}
