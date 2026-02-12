import useTuringMachine from "../hooks/useTuringMachine";
import useWindowSize from "../hooks/useWindowSize";
import { useTheme } from "../contexts/ThemeContext";
import { font } from "../styles/theme";
import ChallengeSelector from "./ChallengeSelector";
import StatusBar from "./StatusBar";
import Tape from "./Tape";
import ControlPanel from "./ControlPanel";
import MessageBanner from "./MessageBanner";
import ExecutionLog from "./ExecutionLog";
import RulesEditor from "./RulesEditor";
import StateGraph from "./StateGraph";

export default function TuringMachine() {
  const { isMobile, isTablet } = useWindowSize();
  const tm = useTuringMachine();

  const cellSize = isMobile ? 36 : isTablet ? 40 : 44;
  const visibleCount = isMobile ? 7 : isTablet ? 11 : 15;
  const halfVisible = Math.floor(visibleCount / 2);
  const visibleStart = Math.max(0, tm.headPos - halfVisible);
  const visibleEnd = Math.min(tm.tape.length, tm.headPos + halfVisible + 1);

  const pad = isMobile ? "12px 10px" : "20px 16px";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.bg,
        color: colors.text,
        fontFamily: font,
        overflowX: "hidden",
        position: "relative",
      }}
    >
      {/* Scanlines */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
          pointerEvents: "none",
          zIndex: 100,
        }}
      />
      {/* CRT vignette */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)",
          pointerEvents: "none",
          zIndex: 99,
        }}
      />

      <div style={{ maxWidth: 960, margin: "0 auto", padding: pad, position: "relative", zIndex: 1 }}>
        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: isMobile ? 16 : 24 }}>
          <h1
            style={{
              fontSize: isMobile ? 18 : 28,
              fontWeight: 800,
              letterSpacing: isMobile ? 3 : 6,
              color: colors.primary,
              textShadow: "0 0 20px rgba(79,255,176,0.5), 0 0 40px rgba(79,255,176,0.2)",
              margin: 0,
              fontFamily: font,
            }}
          >
            <span aria-hidden="true">{"\u2699"} </span>TURING MACHINE
          </h1>
          <div
            style={{
              fontSize: isMobile ? 9 : 11,
              color: colors.textSecondary,
              letterSpacing: isMobile ? 2 : 4,
              marginTop: 4,
            }}
          >
            UNIVERSAL COMPUTATION SIMULATOR
          </div>
        </div>

        <ChallengeSelector
          selectedIdx={tm.challenge}
          onSelect={tm.loadChallenge}
          isMobile={isMobile}
        />

        <StatusBar
          currentState={tm.currentState}
          headPos={tm.headPos}
          stepCount={tm.stepCount}
          halted={tm.halted}
          won={tm.won}
          running={tm.running}
          isMobile={isMobile}
        />

        <Tape
          tape={tm.tape}
          headPos={tm.headPos}
          editTapeMode={tm.editTapeMode}
          cellSize={cellSize}
          visibleStart={visibleStart}
          visibleEnd={visibleEnd}
          changedCellIdx={tm.changedCellIdx}
          isMobile={isMobile}
          onToggleEdit={() => tm.setEditTapeMode(!tm.editTapeMode)}
          onUpdateCell={tm.updateTapeCell}
          onAddCell={tm.addTapeCell}
          onRemoveCell={tm.removeTapeCell}
        />

        <ControlPanel
          onStep={tm.handleStep}
          onRun={tm.handleRun}
          onPause={tm.handlePause}
          onUndo={tm.handleUndo}
          onReset={tm.handleReset}
          speed={tm.speed}
          onSpeedChange={tm.setSpeed}
          halted={tm.halted}
          running={tm.running}
          canUndo={tm.history.length > 0}
          isMobile={isMobile}
        />

        <MessageBanner message={tm.message} won={tm.won} isMobile={isMobile} />

        <ExecutionLog
          history={tm.history}
          lastStepResult={tm.lastStepResult}
          stepCount={tm.stepCount}
          isMobile={isMobile}
        />

        <RulesEditor
          rules={tm.rules}
          activeRule={tm.activeRule}
          allSymbols={tm.allSymbols}
          editingRuleIdx={tm.editingRuleIdx}
          isMobile={isMobile}
          onAddRule={() => tm.addRule(isMobile)}
          onUpdateRule={tm.updateRule}
          onDeleteRule={tm.deleteRule}
          onSetEditingIdx={tm.setEditingRuleIdx}
        />

        <StateGraph
          rules={tm.rules}
          currentState={tm.currentState}
          activeRule={tm.activeRule}
          isMobile={isMobile}
          isTablet={isTablet}
        />

        {/* QUICK REFERENCE */}
        <div
          style={{
            padding: isMobile ? "10px 10px" : "12px 16px",
            background: colors.bgDark,
            border: `1px solid ${colors.borderFaint}`,
            fontSize: isMobile ? 9 : 10,
            color: colors.textDisabled,
            lineHeight: 1.8,
          }}
        >
          <span style={{ color: colors.textMuted, letterSpacing: 3 }}>QUICK REFERENCE</span>
          <br />
          Read a symbol {"\u2192"} apply matching rule (state + symbol {"\u2192"} write, move, next state) {"\u2192"} repeat until HALT.
          <br />
          {"\u2B1C"} = blank {"\u00B7"} L = left {"\u00B7"} R = right {"\u00B7"} N = stay {"\u00B7"} HALT = stop
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body { margin: 0; }
        @keyframes tmPulse {
          0%, 100% { opacity: 1; transform: translateY(0); }
          50% { opacity: 0.5; transform: translateY(-2px); }
        }
        @keyframes cellFlash {
          0% { background: rgba(79, 255, 176, 0.25); }
          100% { background: transparent; }
        }
        input::placeholder { color: ${colors.textDisabled}; }
        button:focus-visible, input:focus-visible, select:focus-visible {
          outline: 2px solid ${colors.primary};
          outline-offset: 2px;
        }
        .visually-hidden {
          position: absolute; width: 1px; height: 1px;
          padding: 0; margin: -1px; overflow: hidden;
          clip: rect(0, 0, 0, 0); border: 0;
        }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: ${colors.bgPanel}; }
        ::-webkit-scrollbar-thumb { background: ${colors.borderPrimary}; border-radius: 3px; }
        select option { background: ${colors.bgInput}; color: ${colors.primary}; }
      `}</style>
    </div>
  );
}
