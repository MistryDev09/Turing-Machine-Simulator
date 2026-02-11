import { useState, useRef, useEffect, useCallback } from "react";

const BLANK = "⬜";

const CHALLENGES = [
  {
    name: "Binary Inverter",
    description: "Flip all 0s to 1s and 1s to 0s, then halt.",
    tape: ["1", "0", "1", "1", "0", "0", "1"],
    headPos: 0,
    expectedTape: ["0", "1", "0", "0", "1", "1", "0"],
    hints: "Use one state to scan right, flipping bits. Halt on blank.",
  },
  {
    name: "Move & Mark",
    description: "Replace all blanks with 'X' for 5 cells, then halt.",
    tape: [BLANK, BLANK, BLANK, BLANK, BLANK],
    headPos: 0,
    expectedTape: ["X", "X", "X", "X", "X"],
    hints: "Write X and move right. Count using states or halt on a boundary.",
  },
  {
    name: "Unary Increment",
    description: "Add one '1' to the end of a unary number (string of 1s).",
    tape: ["1", "1", "1", BLANK, BLANK],
    headPos: 0,
    expectedTape: ["1", "1", "1", "1"],
    hints: "Scan right past all 1s, write a 1 on the first blank, then halt.",
  },
  {
    name: "Palindrome",
    description: "Mark tape with 'Y' if '1001' is a palindrome, 'N' if not. (It is!)",
    tape: ["1", "0", "0", "1", BLANK, BLANK],
    headPos: 0,
    expectedTape: ["Y"],
    hints: "Compare first & last symbols, mark checked cells. Advanced!",
  },
  {
    name: "Sandbox",
    description: "Free mode — set up your own tape and rules!",
    tape: [BLANK, BLANK, BLANK, BLANK, BLANK, BLANK, BLANK, BLANK],
    headPos: 0,
    expectedTape: null,
    hints: "Experiment freely. No win condition.",
  },
];

const INIT_RULES = [
  { state: "q0", read: "0", write: "1", move: "R", nextState: "q0" },
  { state: "q0", read: "1", write: "0", move: "R", nextState: "q0" },
  { state: "q0", read: BLANK, write: BLANK, move: "N", nextState: "HALT" },
];

function useWindowSize() {
  const [size, setSize] = useState({ w: typeof window !== "undefined" ? window.innerWidth : 1024 });
  useEffect(() => {
    const h = () => setSize({ w: window.innerWidth });
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return size;
}

export default function TuringMachine() {
  const { w } = useWindowSize();
  const isMobile = w < 640;
  const isTablet = w >= 640 && w < 900;

  const [challenge, setChallenge] = useState(0);
  const [tape, setTape] = useState([...CHALLENGES[0].tape]);
  const [headPos, setHeadPos] = useState(0);
  const [currentState, setCurrentState] = useState("q0");
  const [rules, setRules] = useState(INIT_RULES.map((r) => ({ ...r })));
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(300);
  const [stepCount, setStepCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [halted, setHalted] = useState(false);
  const [won, setWon] = useState(false);
  const [activeRule, setActiveRule] = useState(null);
  const [editTapeMode, setEditTapeMode] = useState(false);
  const [tapeOffset, setTapeOffset] = useState(0);
  const [editingRuleIdx, setEditingRuleIdx] = useState(null);

  const runRef = useRef(false);

  const findRule = useCallback(
    (st, sym) => rules.find((r) => r.state === st && r.read === sym),
    [rules]
  );

  const checkWinWith = useCallback((currentTape) => {
    const ch = CHALLENGES[challenge];
    if (!ch.expectedTape) return;
    const trimmed = currentTape.filter((c) => c !== BLANK);
    const expected = ch.expectedTape.filter((c) => c !== BLANK);
    if (trimmed.join("") === expected.join("")) {
      setWon(true);
      setMessage("✨ CORRECT! Machine produced the expected output!");
    } else {
      setMessage(`Halted. Got: [${trimmed.join(",")}] — Expected: [${expected.join(",")}]`);
    }
  }, [challenge]);

  const doStep = useCallback(() => {
    if (halted) return false;
    if (currentState === "HALT") {
      setHalted(true);
      setRunning(false);
      runRef.current = false;
      return false;
    }

    const sym = tape[headPos] || BLANK;
    const rule = findRule(currentState, sym);

    if (!rule) {
      setMessage(`⚠ No rule for state="${currentState}", read="${sym}"`);
      setHalted(true);
      setRunning(false);
      runRef.current = false;
      return false;
    }

    setActiveRule(rule);
    setTimeout(() => setActiveRule(null), speed * 0.8);

    setHistory((h) => [...h, { tape: [...tape], headPos, currentState, stepCount }]);

    const newTape = [...tape];
    newTape[headPos] = rule.write;

    let newPos = headPos;
    if (rule.move === "R") newPos++;
    if (rule.move === "L") newPos--;

    if (newPos < 0) {
      newTape.unshift(BLANK);
      newPos = 0;
      setTapeOffset((o) => o - 1);
    }
    if (newPos >= newTape.length) {
      newTape.push(BLANK);
    }

    setTape(newTape);
    setHeadPos(newPos);
    setCurrentState(rule.nextState);
    setStepCount((s) => s + 1);
    setMessage("");

    if (rule.nextState === "HALT") {
      setHalted(true);
      setRunning(false);
      runRef.current = false;
      setTimeout(() => checkWinWith(newTape), 100);
      return false;
    }
    return true;
  }, [tape, headPos, currentState, rules, halted, speed, stepCount, findRule, checkWinWith]);

  useEffect(() => {
    if (running && !halted) {
      const timer = setTimeout(() => {
        const cont = doStep();
        if (!cont) {
          setRunning(false);
          runRef.current = false;
        }
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [running, halted, doStep, speed, stepCount]);

  const handleRun = () => { if (!halted) { setRunning(true); runRef.current = true; } };
  const handlePause = () => { setRunning(false); runRef.current = false; };
  const handleStep = () => { if (!halted && !running) doStep(); };

  const handleReset = () => {
    const ch = CHALLENGES[challenge];
    setTape([...ch.tape]);
    setHeadPos(ch.headPos);
    setCurrentState("q0");
    setStepCount(0);
    setHistory([]);
    setMessage("");
    setHalted(false);
    setWon(false);
    setRunning(false);
    setTapeOffset(0);
    runRef.current = false;
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setTape(prev.tape);
    setHeadPos(prev.headPos);
    setCurrentState(prev.currentState);
    setStepCount(prev.stepCount);
    setHistory((h) => h.slice(0, -1));
    setHalted(false);
    setWon(false);
    setMessage("");
  };

  const loadChallenge = (idx) => {
    setChallenge(idx);
    const ch = CHALLENGES[idx];
    setTape([...ch.tape]);
    setHeadPos(ch.headPos);
    setCurrentState("q0");
    setStepCount(0);
    setHistory([]);
    setMessage("");
    setHalted(false);
    setWon(false);
    setRunning(false);
    setTapeOffset(0);
    setEditingRuleIdx(null);
    runRef.current = false;
    if (idx === 0) {
      setRules(INIT_RULES.map((r) => ({ ...r })));
    } else {
      setRules([]);
    }
  };

  const addRule = () => {
    const newIdx = rules.length;
    setRules((r) => [...r, { state: "q0", read: BLANK, write: BLANK, move: "R", nextState: "q0" }]);
    if (isMobile) setEditingRuleIdx(newIdx);
  };

  const updateRule = (idx, field, value) => {
    setRules((rs) => rs.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  };

  const deleteRule = (idx) => {
    setRules((rs) => rs.filter((_, i) => i !== idx));
    setEditingRuleIdx(null);
  };

  const updateTapeCell = (idx, value) => {
    setTape((t) => t.map((c, i) => (i === idx ? (value || BLANK) : c)));
  };

  const addTapeCell = () => setTape((t) => [...t, BLANK]);
  const removeTapeCell = () => { if (tape.length > 1) setTape((t) => t.slice(0, -1)); };

  const allSymbols = [...new Set([...tape, ...rules.flatMap((r) => [r.read, r.write]), BLANK])];

  // Responsive tape
  const cellSize = isMobile ? 36 : isTablet ? 40 : 44;
  const visibleCount = isMobile ? 7 : isTablet ? 11 : 15;
  const halfVisible = Math.floor(visibleCount / 2);
  const visibleStart = Math.max(0, headPos - halfVisible);
  const visibleEnd = Math.min(tape.length, headPos + halfVisible + 1);
  const visibleTape = tape.slice(visibleStart, visibleEnd);

  const font = "'IBM Plex Mono', 'Fira Code', 'Courier New', monospace";
  const pad = isMobile ? "12px 10px" : "20px 16px";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      color: "#c8f7c5",
      fontFamily: font,
      overflowX: "hidden",
      position: "relative",
    }}>
      {/* Scanlines */}
      <div style={{
        position: "fixed", inset: 0,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
        pointerEvents: "none", zIndex: 100,
      }} />
      {/* CRT vignette */}
      <div style={{
        position: "fixed", inset: 0,
        background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)",
        pointerEvents: "none", zIndex: 99,
      }} />

      <div style={{ maxWidth: 960, margin: "0 auto", padding: pad, position: "relative", zIndex: 1 }}>

        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: isMobile ? 16 : 24 }}>
          <h1 style={{
            fontSize: isMobile ? 18 : 28, fontWeight: 800, letterSpacing: isMobile ? 3 : 6,
            color: "#4fffb0",
            textShadow: "0 0 20px rgba(79,255,176,0.5), 0 0 40px rgba(79,255,176,0.2)",
            margin: 0, fontFamily: font,
          }}>
            ⚙ TURING MACHINE
          </h1>
          <div style={{ fontSize: isMobile ? 9 : 11, color: "#4fffb088", letterSpacing: isMobile ? 2 : 4, marginTop: 4 }}>
            UNIVERSAL COMPUTATION SIMULATOR
          </div>
        </div>

        {/* CHALLENGE SELECTOR */}
        <div style={{ marginBottom: isMobile ? 14 : 20 }}>
          <div style={{ fontSize: 10, color: "#4fffb088", letterSpacing: 3, marginBottom: 8 }}>SELECT CHALLENGE</div>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(5, auto)",
            gap: isMobile ? 4 : 6,
          }}>
            {CHALLENGES.map((ch, i) => (
              <button key={i} onClick={() => loadChallenge(i)} style={{
                padding: isMobile ? "6px 4px" : "6px 14px",
                fontSize: isMobile ? 10 : 11, letterSpacing: 1,
                background: challenge === i ? "#4fffb0" : "transparent",
                color: challenge === i ? "#0a0a0f" : "#4fffb0",
                border: `1px solid ${challenge === i ? "#4fffb0" : "#4fffb044"}`,
                cursor: "pointer", fontFamily: "inherit", fontWeight: challenge === i ? 700 : 400,
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}>
                {ch.name}
              </button>
            ))}
          </div>
          <div style={{
            marginTop: 8, padding: isMobile ? "8px 10px" : "10px 14px",
            background: "#0f1a14", border: "1px solid #4fffb022",
            fontSize: isMobile ? 11 : 12, lineHeight: 1.6,
          }}>
            <span style={{ color: "#4fffb0" }}>▸ </span>
            {CHALLENGES[challenge].description}
            <br />
            <span style={{ color: "#ffc04d66", fontSize: isMobile ? 10 : 11 }}>
              ▸ Hint: {CHALLENGES[challenge].hints}
            </span>
          </div>
        </div>

        {/* STATUS BAR */}
        <div style={{
          display: "flex", gap: isMobile ? 8 : 20,
          alignItems: "center", justifyContent: "center",
          flexWrap: "wrap",
          padding: isMobile ? "8px 10px" : "10px 20px",
          marginBottom: isMobile ? 12 : 16,
          background: "#0d1510", border: "1px solid #4fffb022",
          fontSize: isMobile ? 11 : 13, letterSpacing: isMobile ? 1 : 2,
        }}>
          <div>
            <span style={{ color: "#4fffb066" }}>ST </span>
            <span style={{
              color: currentState === "HALT" ? "#ff6b6b" : "#4fffb0",
              fontWeight: 700,
              textShadow: `0 0 8px ${currentState === "HALT" ? "#ff6b6b44" : "#4fffb044"}`,
            }}>{currentState}</span>
          </div>
          {!isMobile && <div style={{ color: "#4fffb022" }}>│</div>}
          <div>
            <span style={{ color: "#4fffb066" }}>HD </span>
            <span style={{ color: "#ffc04d" }}>{headPos}</span>
          </div>
          {!isMobile && <div style={{ color: "#4fffb022" }}>│</div>}
          <div>
            <span style={{ color: "#4fffb066" }}># </span>
            <span style={{ color: "#ffc04d" }}>{stepCount}</span>
          </div>
          {!isMobile && <div style={{ color: "#4fffb022" }}>│</div>}
          <div>
            {halted ? (
              <span style={{ color: won ? "#4fffb0" : "#ff6b6b", fontWeight: 700 }}>
                {won ? "✓ OK" : "■ HALT"}
              </span>
            ) : running ? (
              <span style={{ color: "#ffc04d", fontWeight: 700 }}>▶ RUN</span>
            ) : (
              <span style={{ color: "#4fffb066" }}>● READY</span>
            )}
          </div>
        </div>

        {/* TAPE */}
        <div style={{ marginBottom: isMobile ? 14 : 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ fontSize: 10, color: "#4fffb088", letterSpacing: 3 }}>TAPE</div>
            <button onClick={() => setEditTapeMode(!editTapeMode)} style={{
              padding: "3px 8px", fontSize: 9, letterSpacing: 1,
              background: editTapeMode ? "#ffc04d" : "transparent",
              color: editTapeMode ? "#0a0a0f" : "#ffc04d88",
              border: `1px solid ${editTapeMode ? "#ffc04d" : "#ffc04d44"}`,
              cursor: "pointer", fontFamily: "inherit",
            }}>
              {editTapeMode ? "DONE" : "EDIT"}
            </button>
          </div>

          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 0, padding: isMobile ? "8px 0" : "12px 0",
            overflow: "hidden",
            background: "#050a08",
            border: "1px solid #4fffb022",
            position: "relative",
          }}>
            {/* Fades */}
            <div style={{
              position: "absolute", left: 0, top: 0, bottom: 0, width: 30,
              background: "linear-gradient(to right, #050a08, transparent)",
              zIndex: 2, pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute", right: 0, top: 0, bottom: 0, width: 30,
              background: "linear-gradient(to left, #050a08, transparent)",
              zIndex: 2, pointerEvents: "none",
            }} />

            {visibleTape.map((cell, vIdx) => {
              const realIdx = visibleStart + vIdx;
              const isHead = realIdx === headPos;
              return (
                <div key={realIdx} style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  position: "relative",
                }}>
                  {isHead && (
                    <div style={{
                      position: "absolute", top: -6,
                      fontSize: isMobile ? 10 : 14, color: "#4fffb0",
                      textShadow: "0 0 10px #4fffb0",
                      animation: "tmPulse 1s ease-in-out infinite",
                    }}>▼</div>
                  )}
                  {editTapeMode ? (
                    <input
                      value={cell === BLANK ? "" : cell}
                      onChange={(e) => updateTapeCell(realIdx, e.target.value.slice(-1) || BLANK)}
                      style={{
                        width: cellSize, height: cellSize, textAlign: "center",
                        fontSize: isMobile ? 14 : 18,
                        background: isHead ? "#1a3a28" : "#0a1210",
                        color: cell === BLANK ? "#4fffb033" : "#4fffb0",
                        border: `2px solid ${isHead ? "#4fffb0" : "#4fffb022"}`,
                        fontFamily: "inherit", fontWeight: 700,
                        outline: "none", margin: "8px 1px 2px",
                        boxShadow: isHead ? "0 0 12px #4fffb033, inset 0 0 12px #4fffb011" : "none",
                        padding: 0, borderRadius: 0,
                      }}
                    />
                  ) : (
                    <div style={{
                      width: cellSize, height: cellSize,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: isMobile ? 14 : 18, fontWeight: 700,
                      background: isHead ? "#1a3a28" : "#0a1210",
                      color: cell === BLANK ? "#4fffb033" : "#4fffb0",
                      border: `2px solid ${isHead ? "#4fffb0" : "#4fffb022"}`,
                      margin: "8px 1px 2px",
                      boxShadow: isHead ? "0 0 12px #4fffb033, inset 0 0 12px #4fffb011" : "none",
                      transition: "all 0.15s ease",
                    }}>
                      {cell === BLANK ? "·" : cell}
                    </div>
                  )}
                  <div style={{ fontSize: 7, color: "#4fffb033", marginTop: 1 }}>{realIdx}</div>
                </div>
              );
            })}
          </div>

          {editTapeMode && (
            <div style={{ display: "flex", gap: 6, marginTop: 6, justifyContent: "center" }}>
              <button onClick={addTapeCell} style={tinyBtnStyle}>+ CELL</button>
              <button onClick={removeTapeCell} style={tinyBtnStyle}>- CELL</button>
            </div>
          )}
        </div>

        {/* CONTROLS */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "auto auto auto auto auto",
          gap: isMobile ? 6 : 8,
          justifyContent: isMobile ? "stretch" : "center",
          marginBottom: isMobile ? 14 : 20,
          alignItems: "center",
        }}>
          <button onClick={handleStep} disabled={halted || running}
            style={btnStyle(halted || running, false, isMobile)}>
            ⏭ STEP
          </button>
          {running ? (
            <button onClick={handlePause} style={btnStyle(false, true, isMobile)}>
              ⏸ PAUSE
            </button>
          ) : (
            <button onClick={handleRun} disabled={halted} style={btnStyle(halted, true, isMobile)}>
              ▶ RUN
            </button>
          )}
          <button onClick={handleUndo} disabled={history.length === 0 || running}
            style={btnStyle(history.length === 0 || running, false, isMobile)}>
            ↩ UNDO
          </button>
          <button onClick={handleReset} style={{
            ...btnStyle(false, false, isMobile),
            borderColor: "#ff6b6b44", color: "#ff6b6b",
          }}>
            ⟳ RESET
          </button>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 9, color: "#4fffb066",
            gridColumn: isMobile ? "1 / -1" : "auto",
            justifyContent: "center",
            padding: isMobile ? "4px 0" : 0,
          }}>
            SPEED
            <input type="range" min={50} max={800} step={50} value={800 - speed + 50}
              onChange={(e) => setSpeed(800 - Number(e.target.value) + 50)}
              style={{ width: isMobile ? "100%" : 80, accentColor: "#4fffb0", flex: isMobile ? 1 : "none" }}
            />
          </div>
        </div>

        {/* MESSAGE */}
        {message && (
          <div style={{
            textAlign: "center", padding: isMobile ? "8px 10px" : "10px 16px",
            marginBottom: 14,
            background: won ? "#0f2a1a" : "#2a0f0f",
            border: `1px solid ${won ? "#4fffb044" : "#ff6b6b44"}`,
            color: won ? "#4fffb0" : "#ff6b6b",
            fontSize: isMobile ? 11 : 13, fontWeight: 600, letterSpacing: 1,
            wordBreak: "break-word",
          }}>
            {message}
          </div>
        )}

        {/* TRANSITION RULES */}
        <div style={{ marginBottom: isMobile ? 14 : 20 }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 8,
          }}>
            <div style={{ fontSize: 10, color: "#4fffb088", letterSpacing: 3 }}>
              RULES ({rules.length})
            </div>
            <button onClick={addRule} style={{
              padding: "4px 12px", fontSize: 10,
              background: "#4fffb0", color: "#0a0a0f",
              border: "none", cursor: "pointer", fontFamily: "inherit",
              fontWeight: 700, letterSpacing: 1,
            }}>
              + ADD
            </button>
          </div>

          {/* Desktop/Tablet: table layout */}
          {!isMobile ? (
            <div style={{
              background: "#050a08", border: "1px solid #4fffb022",
              maxHeight: 300, overflowY: "auto",
            }}>
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr 0.7fr 1fr 36px",
                gap: 1, padding: "8px 10px",
                borderBottom: "1px solid #4fffb022",
                fontSize: 9, color: "#4fffb066", letterSpacing: 2,
                position: "sticky", top: 0, background: "#050a08", zIndex: 1,
              }}>
                <div>STATE</div><div>READ</div><div>WRITE</div><div>MOVE</div><div>NEXT</div><div></div>
              </div>

              {rules.length === 0 && (
                <div style={{ padding: 20, textAlign: "center", color: "#4fffb033", fontSize: 11 }}>
                  No rules. Add rules to program the machine.
                </div>
              )}

              {rules.map((rule, idx) => {
                const isActive = activeRule && activeRule.state === rule.state && activeRule.read === rule.read;
                return (
                  <div key={idx} style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr 1fr 0.7fr 1fr 36px",
                    gap: 1, padding: "4px 10px",
                    background: isActive ? "#1a3a28" : "transparent",
                    borderBottom: "1px solid #4fffb00a",
                    transition: "background 0.2s",
                  }}>
                    <input value={rule.state} onChange={(e) => updateRule(idx, "state", e.target.value)}
                      style={ruleInputStyle} placeholder="q0" />
                    <select value={rule.read} onChange={(e) => updateRule(idx, "read", e.target.value)}
                      style={ruleInputStyle}>
                      {allSymbols.map((s) => <option key={s} value={s}>{s === BLANK ? "⬜ blank" : s}</option>)}
                    </select>
                    <select value={rule.write} onChange={(e) => updateRule(idx, "write", e.target.value)}
                      style={ruleInputStyle}>
                      {allSymbols.map((s) => <option key={s} value={s}>{s === BLANK ? "⬜ blank" : s}</option>)}
                    </select>
                    <select value={rule.move} onChange={(e) => updateRule(idx, "move", e.target.value)}
                      style={ruleInputStyle}>
                      <option value="L">← L</option>
                      <option value="R">→ R</option>
                      <option value="N">· N</option>
                    </select>
                    <input value={rule.nextState} onChange={(e) => updateRule(idx, "nextState", e.target.value)}
                      style={ruleInputStyle} placeholder="q1" />
                    <button onClick={() => deleteRule(idx)} style={delBtnStyle}
                      onMouseEnter={(e) => { e.target.style.color = "#ff6b6b"; }}
                      onMouseLeave={(e) => { e.target.style.color = "#ff6b6b66"; }}
                    >×</button>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Mobile: expandable card-based rules */
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {rules.length === 0 && (
                <div style={{
                  padding: 16, textAlign: "center", color: "#4fffb033", fontSize: 11,
                  background: "#050a08", border: "1px solid #4fffb022",
                }}>
                  No rules. Tap + ADD to start.
                </div>
              )}

              {rules.map((rule, idx) => {
                const isActive = activeRule && activeRule.state === rule.state && activeRule.read === rule.read;
                const isEditing = editingRuleIdx === idx;
                return (
                  <div key={idx} style={{
                    background: isActive ? "#1a3a28" : "#050a08",
                    border: `1px solid ${isActive ? "#4fffb044" : "#4fffb022"}`,
                    padding: "8px 10px",
                    transition: "background 0.2s",
                  }}>
                    {/* Summary row — tap to expand */}
                    <div
                      onClick={() => setEditingRuleIdx(isEditing ? null : idx)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        cursor: "pointer", fontSize: 13, gap: 6,
                      }}
                    >
                      <div style={{ color: "#4fffb0", fontWeight: 600, letterSpacing: 1 }}>
                        <span style={{ color: "#4fffb088" }}>{rule.state}</span>
                        {" "}
                        <span style={{ color: "#ffc04d" }}>{rule.read === BLANK ? "·" : rule.read}</span>
                        <span style={{ color: "#4fffb044" }}> → </span>
                        <span style={{ color: "#ffc04d" }}>{rule.write === BLANK ? "·" : rule.write}</span>
                        {" "}
                        <span style={{ color: "#4fffb066" }}>{rule.move === "L" ? "←" : rule.move === "R" ? "→" : "·"}</span>
                        {" "}
                        <span style={{ color: "#4fffb088" }}>{rule.nextState}</span>
                      </div>
                      <span style={{ color: "#4fffb044", fontSize: 14 }}>{isEditing ? "▾" : "▸"}</span>
                    </div>

                    {/* Expanded editor */}
                    {isEditing && (
                      <div style={{ marginTop: 10 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          <label style={mobileLabelStyle}>
                            <span>State</span>
                            <input value={rule.state} onChange={(e) => updateRule(idx, "state", e.target.value)}
                              style={mobileInputStyle} placeholder="q0" />
                          </label>
                          <label style={mobileLabelStyle}>
                            <span>Read</span>
                            <select value={rule.read} onChange={(e) => updateRule(idx, "read", e.target.value)}
                              style={mobileInputStyle}>
                              {allSymbols.map((s) => <option key={s} value={s}>{s === BLANK ? "⬜ blank" : s}</option>)}
                            </select>
                          </label>
                          <label style={mobileLabelStyle}>
                            <span>Write</span>
                            <select value={rule.write} onChange={(e) => updateRule(idx, "write", e.target.value)}
                              style={mobileInputStyle}>
                              {allSymbols.map((s) => <option key={s} value={s}>{s === BLANK ? "⬜ blank" : s}</option>)}
                            </select>
                          </label>
                          <label style={mobileLabelStyle}>
                            <span>Move</span>
                            <select value={rule.move} onChange={(e) => updateRule(idx, "move", e.target.value)}
                              style={mobileInputStyle}>
                              <option value="L">← Left</option>
                              <option value="R">→ Right</option>
                              <option value="N">· Stay</option>
                            </select>
                          </label>
                          <label style={{ ...mobileLabelStyle, gridColumn: "1 / -1" }}>
                            <span>Next State</span>
                            <input value={rule.nextState} onChange={(e) => updateRule(idx, "nextState", e.target.value)}
                              style={mobileInputStyle} placeholder="q1 or HALT" />
                          </label>
                        </div>
                        <button onClick={() => deleteRule(idx)} style={{
                          marginTop: 10, width: "100%", padding: "8px 0",
                          background: "transparent", border: "1px solid #ff6b6b33",
                          color: "#ff6b6b88", cursor: "pointer", fontFamily: "inherit",
                          fontSize: 10, letterSpacing: 1,
                        }}>
                          DELETE RULE
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* STATE GRAPH (SVG) */}
        {(() => {
          const uniqueStates = [...new Set([
            ...rules.map(r => r.state),
            ...rules.map(r => r.nextState),
          ])];

          if (uniqueStates.length === 0) {
            return (
              <div style={{
                padding: "12px 16px", background: "#050a08", border: "1px solid #4fffb022",
                marginBottom: 20,
              }}>
                <div style={{ fontSize: 10, color: "#4fffb088", letterSpacing: 3, marginBottom: 10 }}>
                  STATE GRAPH
                </div>
                <div style={{ padding: 16, textAlign: "center", color: "#4fffb033", fontSize: 11 }}>
                  Add rules to see state connections.
                </div>
              </div>
            );
          }

          const svgW = isMobile ? 360 : isTablet ? 600 : 900;
          const svgH = isMobile ? 180 : 240;
          const nodeR = isMobile ? 20 : 28;
          const nodeFontSize = isMobile ? 9 : 12;
          const labelFontSize = isMobile ? 7 : 9;

          const sorted = [...new Set(uniqueStates)];
          const nonHalt = sorted.filter(s => s !== "HALT").sort((a, b) => {
            if (a === "q0") return -1;
            if (b === "q0") return 1;
            return a.localeCompare(b);
          });
          const hasHalt = sorted.includes("HALT");
          if (hasHalt) nonHalt.push("HALT");

          const totalNodes = nonHalt.length;
          const spacing = Math.min(isMobile ? 80 : 140, (svgW - (isMobile ? 80 : 120)) / Math.max(totalNodes, 1));
          const startX = (svgW - spacing * (totalNodes - 1)) / 2;

          const positions = {};
          nonHalt.forEach((state, i) => {
            positions[state] = { x: startX + i * spacing, y: svgH / 2 };
          });

          const edgeMap = {};
          rules.forEach(r => {
            const key = `${r.state}__${r.nextState}`;
            if (!edgeMap[key]) edgeMap[key] = [];
            edgeMap[key].push(r);
          });

          const edges = Object.entries(edgeMap).map(([key, rs]) => {
            const [from, to] = key.split("__");
            const label = rs.map(r => `${r.read}→${r.write},${r.move}`).join(isMobile ? " " : " | ");
            const isActiveEdge = activeRule && rs.some(r => r.state === activeRule.state && r.read === activeRule.read);
            return { from, to, label, isActiveEdge };
          });

          return (
            <div style={{
              padding: isMobile ? "10px 6px" : "12px 16px",
              background: "#050a08", border: "1px solid #4fffb022",
              marginBottom: 20, overflowX: "auto",
              WebkitOverflowScrolling: "touch",
            }}>
              <div style={{ fontSize: 10, color: "#4fffb088", letterSpacing: 3, marginBottom: 6 }}>
                STATE GRAPH
              </div>
              <svg
                width="100%"
                height={svgH}
                viewBox={`0 0 ${svgW} ${svgH}`}
                preserveAspectRatio="xMidYMid meet"
                style={{ display: "block", maxWidth: "100%" }}
              >
                <defs>
                  <marker id="arrG" viewBox="0 0 10 7" refX="10" refY="3.5"
                    markerWidth="7" markerHeight="5" orient="auto-start-reverse">
                    <path d="M0 0L10 3.5L0 7z" fill="#4fffb066" />
                  </marker>
                  <marker id="arrA" viewBox="0 0 10 7" refX="10" refY="3.5"
                    markerWidth="7" markerHeight="5" orient="auto-start-reverse">
                    <path d="M0 0L10 3.5L0 7z" fill="#4fffb0" />
                  </marker>
                </defs>

                {/* Edges */}
                {edges.map(({ from, to, label, isActiveEdge }, ei) => {
                  const pF = positions[from];
                  const pT = positions[to];
                  if (!pF || !pT) return null;

                  const sc = isActiveEdge ? "#4fffb0" : "#4fffb055";
                  const sw = isActiveEdge ? 2 : 1.2;
                  const me = isActiveEdge ? "url(#arrA)" : "url(#arrG)";
                  const tc = isActiveEdge ? "#4fffb0" : "#4fffb077";
                  const gf = isActiveEdge ? "drop-shadow(0 0 4px #4fffb066)" : "none";

                  if (from === to) {
                    const cx = pF.x;
                    const cy = pF.y - nodeR;
                    const lr = isMobile ? 16 : 22;
                    return (
                      <g key={ei} style={{ filter: gf }}>
                        <path d={`M ${cx - 8} ${cy} A ${lr} ${lr} 0 1 1 ${cx + 8} ${cy}`}
                          fill="none" stroke={sc} strokeWidth={sw} markerEnd={me} />
                        <text x={cx} y={cy - lr - 4} textAnchor="middle"
                          fontSize={labelFontSize} fontFamily={font} fill={tc}>
                          {label}
                        </text>
                      </g>
                    );
                  }

                  const dx = pT.x - pF.x;
                  const dy = pT.y - pF.y;
                  const dist = Math.sqrt(dx * dx + dy * dy);
                  const nx = dx / dist;
                  const ny = dy / dist;
                  const x1 = pF.x + nx * (nodeR + 2);
                  const y1 = pF.y + ny * (nodeR + 2);
                  const x2 = pT.x - nx * (nodeR + 8);
                  const y2 = pT.y - ny * (nodeR + 8);

                  const hasReverse = edges.some(e => e.from === to && e.to === from && e.from !== e.to);

                  if (hasReverse) {
                    const co = from < to ? -24 : 24;
                    const mx = (x1 + x2) / 2 + (-ny) * co;
                    const my = (y1 + y2) / 2 + nx * co;
                    return (
                      <g key={ei} style={{ filter: gf }}>
                        <path d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
                          fill="none" stroke={sc} strokeWidth={sw} markerEnd={me} />
                        <text x={mx} y={my - 5} textAnchor="middle"
                          fontSize={labelFontSize} fontFamily={font} fill={tc}>
                          {label}
                        </text>
                      </g>
                    );
                  }

                  const mx = (x1 + x2) / 2;
                  const my = (y1 + y2) / 2;
                  return (
                    <g key={ei} style={{ filter: gf }}>
                      <line x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke={sc} strokeWidth={sw} markerEnd={me} />
                      <text x={mx} y={my - 8} textAnchor="middle"
                        fontSize={labelFontSize} fontFamily={font} fill={tc}>
                        {label}
                      </text>
                    </g>
                  );
                })}

                {/* Nodes */}
                {nonHalt.map((state) => {
                  const pos = positions[state];
                  const isAct = state === currentState;
                  const isH = state === "HALT";
                  const fc = isAct ? "#0f2a1a" : isH ? "#1a0a0a" : "#0a1210";
                  const stc = isAct ? "#4fffb0" : isH ? "#ff6b6b66" : "#4fffb033";
                  const txc = isAct ? "#4fffb0" : isH ? "#ff6b6b" : "#4fffb088";
                  const glow = isAct ? "drop-shadow(0 0 10px #4fffb044)" : "none";

                  return (
                    <g key={state} style={{ filter: glow }}>
                      {isH ? (
                        <rect x={pos.x - nodeR} y={pos.y - nodeR}
                          width={nodeR * 2} height={nodeR * 2} rx={5}
                          fill={fc} stroke={stc} strokeWidth={2} />
                      ) : (
                        <circle cx={pos.x} cy={pos.y} r={nodeR}
                          fill={fc} stroke={stc} strokeWidth={2} />
                      )}
                      <text x={pos.x} y={pos.y + (isMobile ? 3 : 4)} textAnchor="middle"
                        fontSize={nodeFontSize} fontWeight="700" fontFamily={font}
                        fill={txc} style={{ letterSpacing: 1 }}>
                        {state}
                      </text>
                      {state === "q0" && (
                        <>
                          <line x1={pos.x - nodeR - 22} y1={pos.y} x2={pos.x - nodeR - 3} y2={pos.y}
                            stroke="#4fffb066" strokeWidth={1.5} markerEnd="url(#arrG)" />
                          <text x={pos.x - nodeR - 24} y={pos.y - 6} textAnchor="end"
                            fontSize="7" fontFamily={font} fill="#4fffb044">
                            start
                          </text>
                        </>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          );
        })()}

        {/* QUICK REFERENCE */}
        <div style={{
          padding: isMobile ? "10px 10px" : "12px 16px",
          background: "#0a0f0d",
          border: "1px solid #4fffb011",
          fontSize: isMobile ? 9 : 10, color: "#4fffb044", lineHeight: 1.8,
        }}>
          <span style={{ color: "#4fffb066", letterSpacing: 3 }}>QUICK REFERENCE</span>
          <br />
          Read a symbol → apply matching rule (state + symbol → write, move, next state) → repeat until HALT.
          <br />
          ⬜ = blank · L = left · R = right · N = stay · HALT = stop
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
        input::placeholder { color: #4fffb033; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #050a08; }
        ::-webkit-scrollbar-thumb { background: #4fffb033; border-radius: 3px; }
        select option { background: #0a1210; color: #4fffb0; }
      `}</style>
    </div>
  );
}

const btnStyle = (disabled, primary = false, mobile = false) => ({
  padding: mobile ? "10px 8px" : "8px 18px",
  fontSize: mobile ? 11 : 12,
  fontWeight: 700,
  letterSpacing: mobile ? 1 : 2,
  fontFamily: "'IBM Plex Mono', monospace",
  background: primary && !disabled ? "#4fffb0" : "transparent",
  color: disabled ? "#4fffb022" : primary ? "#0a0a0f" : "#4fffb0",
  border: `1px solid ${disabled ? "#4fffb011" : primary ? "#4fffb0" : "#4fffb044"}`,
  cursor: disabled ? "not-allowed" : "pointer",
  transition: "all 0.2s",
  touchAction: "manipulation",
});

const tinyBtnStyle = {
  padding: "4px 12px", fontSize: 9, letterSpacing: 1,
  background: "transparent", color: "#4fffb066",
  border: "1px solid #4fffb022", cursor: "pointer",
  fontFamily: "'IBM Plex Mono', monospace",
};

const ruleInputStyle = {
  background: "#0a1210",
  border: "1px solid #4fffb022",
  color: "#4fffb0",
  padding: "5px 6px",
  fontSize: 12,
  fontFamily: "'IBM Plex Mono', monospace",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const delBtnStyle = {
  background: "transparent", border: "1px solid #ff6b6b22",
  color: "#ff6b6b66", cursor: "pointer", fontSize: 14,
  fontFamily: "'IBM Plex Mono', monospace", padding: 0,
  transition: "all 0.2s",
};

const mobileLabelStyle = {
  display: "flex", flexDirection: "column", gap: 3,
  fontSize: 9, color: "#4fffb066", letterSpacing: 1,
};

const mobileInputStyle = {
  background: "#0a1210",
  border: "1px solid #4fffb033",
  color: "#4fffb0",
  padding: "8px 8px",
  fontSize: 13,
  fontFamily: "'IBM Plex Mono', monospace",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  borderRadius: 0,
  WebkitAppearance: "none",
};
