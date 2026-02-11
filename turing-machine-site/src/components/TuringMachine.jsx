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
    preloadRules: [],
  },
  {
    name: "Move Right & Mark",
    description: "Replace all blanks with 'X' for 5 cells, then halt.",
    tape: [BLANK, BLANK, BLANK, BLANK, BLANK],
    headPos: 0,
    expectedTape: ["X", "X", "X", "X", "X"],
    hints: "Write X and move right. Count using states or halt on a boundary.",
    preloadRules: [],
  },
  {
    name: "Unary Increment",
    description: "Add one '1' to the end of a unary number (string of 1s).",
    tape: ["1", "1", "1", BLANK, BLANK],
    headPos: 0,
    expectedTape: ["1", "1", "1", "1"],
    hints: "Scan right past all 1s, write a 1 on the first blank, then halt.",
    preloadRules: [],
  },
  {
    name: "Palindrome Detector",
    description: "Mark tape with 'Y' if '1001' is a palindrome, 'N' if not. (It is!)",
    tape: ["1", "0", "0", "1", BLANK, BLANK],
    headPos: 0,
    expectedTape: ["Y"],
    hints: "Compare first & last symbols, mark checked cells. This is advanced!",
    preloadRules: [],
  },
  {
    name: "Sandbox",
    description: "Free mode — set up your own tape and rules!",
    tape: [BLANK, BLANK, BLANK, BLANK, BLANK, BLANK, BLANK, BLANK],
    headPos: 0,
    expectedTape: null,
    hints: "Experiment freely. There's no win condition here.",
    preloadRules: [],
  },
];

const INIT_RULES = [
  { state: "q0", read: "0", write: "1", move: "R", nextState: "q0" },
  { state: "q0", read: "1", write: "0", move: "R", nextState: "q0" },
  { state: "q0", read: BLANK, write: BLANK, move: "N", nextState: "HALT" },
];

export default function TuringMachine() {
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
  const [showRuleEditor, setShowRuleEditor] = useState(false);
  const [activeRule, setActiveRule] = useState(null);
  const [editTapeMode, setEditTapeMode] = useState(false);
  const [tapeOffset, setTapeOffset] = useState(0);

  const runRef = useRef(false);
  const tapeContainerRef = useRef(null);
  const intervalRef = useRef(null);

  const findRule = useCallback(
    (st, sym) => rules.find((r) => r.state === st && r.read === sym),
    [rules]
  );

  const doStep = useCallback(() => {
    if (halted) return false;
    if (currentState === "HALT") {
      setHalted(true);
      setRunning(false);
      runRef.current = false;
      checkWin();
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
  }, [tape, headPos, currentState, rules, halted, speed, stepCount, findRule]);

  const checkWinWith = (currentTape) => {
    const ch = CHALLENGES[challenge];
    if (!ch.expectedTape) return;
    const trimmed = currentTape.filter((c) => c !== BLANK);
    const expected = ch.expectedTape.filter((c) => c !== BLANK);
    if (trimmed.join("") === expected.join("")) {
      setWon(true);
      setMessage("✨ CORRECT! Machine produced the expected output!");
    } else {
      setMessage(`Machine halted. Output: [${trimmed.join(",")}] — Expected: [${expected.join(",")}]`);
    }
  };

  const checkWin = () => {
    checkWinWith(tape);
  };

  useEffect(() => {
    if (running) {
      runRef.current = true;
      intervalRef.current = setInterval(() => {
        if (!runRef.current) {
          clearInterval(intervalRef.current);
          return;
        }
      }, speed);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, speed]);

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

  const handleRun = () => {
    if (halted) return;
    setRunning(true);
    runRef.current = true;
  };

  const handlePause = () => {
    setRunning(false);
    runRef.current = false;
  };

  const handleStep = () => {
    if (halted) return;
    doStep();
  };

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
    runRef.current = false;
    if (idx === 0) {
      setRules(INIT_RULES.map((r) => ({ ...r })));
    } else {
      setRules([]);
    }
  };

  const addRule = () => {
    setRules((r) => [
      ...r,
      { state: "q0", read: BLANK, write: BLANK, move: "R", nextState: "q0" },
    ]);
  };

  const updateRule = (idx, field, value) => {
    setRules((rs) => rs.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  };

  const deleteRule = (idx) => {
    setRules((rs) => rs.filter((_, i) => i !== idx));
  };

  const updateTapeCell = (idx, value) => {
    setTape((t) => t.map((c, i) => (i === idx ? (value || BLANK) : c)));
  };

  const addTapeCell = () => setTape((t) => [...t, BLANK]);
  const removeTapeCell = () => {
    if (tape.length > 1) setTape((t) => t.slice(0, -1));
  };

  const allStates = [...new Set(rules.flatMap((r) => [r.state, r.nextState]))].sort();
  const allSymbols = [...new Set([...tape, ...rules.flatMap((r) => [r.read, r.write]), BLANK])];

  const visibleStart = Math.max(0, headPos - 8);
  const visibleEnd = Math.min(tape.length, headPos + 9);
  const visibleTape = tape.slice(visibleStart, visibleEnd);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      color: "#c8f7c5",
      fontFamily: "'IBM Plex Mono', 'Fira Code', 'Courier New', monospace",
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Scanlines overlay */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
        pointerEvents: "none", zIndex: 100,
      }} />

      {/* CRT vignette */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)",
        pointerEvents: "none", zIndex: 99,
      }} />

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "20px 16px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h1 style={{
            fontSize: 28, fontWeight: 800, letterSpacing: 6,
            color: "#4fffb0",
            textShadow: "0 0 20px rgba(79,255,176,0.5), 0 0 40px rgba(79,255,176,0.2)",
            margin: 0, fontFamily: "'IBM Plex Mono', monospace",
          }}>
            ⚙ TURING MACHINE
          </h1>
          <div style={{ fontSize: 11, color: "#4fffb088", letterSpacing: 4, marginTop: 4 }}>
            UNIVERSAL COMPUTATION SIMULATOR
          </div>
        </div>

        {/* Challenge Selector */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: "#4fffb088", letterSpacing: 3, marginBottom: 8 }}>SELECT CHALLENGE</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {CHALLENGES.map((ch, i) => (
              <button key={i} onClick={() => loadChallenge(i)} style={{
                padding: "6px 14px", fontSize: 11, letterSpacing: 1,
                background: challenge === i ? "#4fffb0" : "transparent",
                color: challenge === i ? "#0a0a0f" : "#4fffb0",
                border: `1px solid ${challenge === i ? "#4fffb0" : "#4fffb044"}`,
                cursor: "pointer", fontFamily: "inherit", fontWeight: challenge === i ? 700 : 400,
                transition: "all 0.2s",
              }}>
                {ch.name}
              </button>
            ))}
          </div>
          <div style={{
            marginTop: 10, padding: "10px 14px",
            background: "#0f1a14", border: "1px solid #4fffb022",
            fontSize: 12, lineHeight: 1.6,
          }}>
            <span style={{ color: "#4fffb0" }}>▸ OBJECTIVE: </span>
            {CHALLENGES[challenge].description}
            <br />
            <span style={{ color: "#ffc04d88" }}>▸ HINT: </span>
            <span style={{ color: "#ffc04d66" }}>{CHALLENGES[challenge].hints}</span>
          </div>
        </div>

        {/* Machine Status Bar */}
        <div style={{
          display: "flex", gap: 20, alignItems: "center", justifyContent: "center",
          padding: "10px 20px", marginBottom: 16,
          background: "#0d1510", border: "1px solid #4fffb022",
          fontSize: 13, letterSpacing: 2,
        }}>
          <div>
            STATE: <span style={{
              color: currentState === "HALT" ? "#ff6b6b" : "#4fffb0",
              fontWeight: 700, textShadow: `0 0 8px ${currentState === "HALT" ? "#ff6b6b44" : "#4fffb044"}`,
            }}>{currentState}</span>
          </div>
          <div style={{ color: "#4fffb066" }}>│</div>
          <div>
            HEAD: <span style={{ color: "#ffc04d" }}>{headPos}</span>
          </div>
          <div style={{ color: "#4fffb066" }}>│</div>
          <div>
            STEPS: <span style={{ color: "#ffc04d" }}>{stepCount}</span>
          </div>
          <div style={{ color: "#4fffb066" }}>│</div>
          <div>
            {halted ? (
              <span style={{ color: won ? "#4fffb0" : "#ff6b6b", fontWeight: 700 }}>
                {won ? "✓ SUCCESS" : "■ HALTED"}
              </span>
            ) : running ? (
              <span style={{ color: "#ffc04d", fontWeight: 700 }}>▶ RUNNING</span>
            ) : (
              <span style={{ color: "#4fffb066" }}>● READY</span>
            )}
          </div>
        </div>

        {/* Tape */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 8,
          }}>
            <div style={{ fontSize: 10, color: "#4fffb088", letterSpacing: 3 }}>TAPE</div>
            <button onClick={() => setEditTapeMode(!editTapeMode)} style={{
              padding: "3px 10px", fontSize: 10, letterSpacing: 1,
              background: editTapeMode ? "#ffc04d" : "transparent",
              color: editTapeMode ? "#0a0a0f" : "#ffc04d88",
              border: `1px solid ${editTapeMode ? "#ffc04d" : "#ffc04d44"}`,
              cursor: "pointer", fontFamily: "inherit",
            }}>
              {editTapeMode ? "DONE" : "EDIT TAPE"}
            </button>
          </div>

          <div ref={tapeContainerRef} style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 0, padding: "12px 0", overflow: "hidden",
            background: "#050a08",
            border: "1px solid #4fffb022",
            position: "relative",
          }}>
            {/* Left fade */}
            <div style={{
              position: "absolute", left: 0, top: 0, bottom: 0, width: 40,
              background: "linear-gradient(to right, #050a08, transparent)",
              zIndex: 2, pointerEvents: "none",
            }} />
            {/* Right fade */}
            <div style={{
              position: "absolute", right: 0, top: 0, bottom: 0, width: 40,
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
                  {/* Head indicator */}
                  {isHead && (
                    <div style={{
                      position: "absolute", top: -8,
                      fontSize: 14, color: "#4fffb0",
                      textShadow: "0 0 10px #4fffb0",
                      animation: "pulse 1s ease-in-out infinite",
                    }}>▼</div>
                  )}
                  {editTapeMode ? (
                    <input
                      value={cell === BLANK ? "" : cell}
                      onChange={(e) => updateTapeCell(realIdx, e.target.value.slice(-1) || BLANK)}
                      style={{
                        width: 44, height: 44, textAlign: "center", fontSize: 18,
                        background: isHead ? "#1a3a28" : "#0a1210",
                        color: cell === BLANK ? "#4fffb033" : "#4fffb0",
                        border: `2px solid ${isHead ? "#4fffb0" : "#4fffb022"}`,
                        fontFamily: "inherit", fontWeight: 700,
                        outline: "none", margin: "8px 1px 2px",
                        boxShadow: isHead ? "0 0 12px #4fffb033, inset 0 0 12px #4fffb011" : "none",
                      }}
                    />
                  ) : (
                    <div style={{
                      width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18, fontWeight: 700,
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
                  <div style={{ fontSize: 8, color: "#4fffb033", marginTop: 2 }}>{realIdx}</div>
                </div>
              );
            })}
          </div>

          {editTapeMode && (
            <div style={{ display: "flex", gap: 6, marginTop: 6, justifyContent: "center" }}>
              <button onClick={addTapeCell} style={tinyBtnStyle}>+ ADD CELL</button>
              <button onClick={removeTapeCell} style={tinyBtnStyle}>- REMOVE CELL</button>
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={{
          display: "flex", gap: 8, justifyContent: "center", marginBottom: 20, flexWrap: "wrap",
          alignItems: "center",
        }}>
          <button onClick={handleStep} disabled={halted || running} style={btnStyle(halted || running)}>
            ⏭ STEP
          </button>
          {running ? (
            <button onClick={handlePause} style={btnStyle(false, true)}>
              ⏸ PAUSE
            </button>
          ) : (
            <button onClick={handleRun} disabled={halted} style={btnStyle(halted, true)}>
              ▶ RUN
            </button>
          )}
          <button onClick={handleUndo} disabled={history.length === 0 || running} style={btnStyle(history.length === 0 || running)}>
            ↩ UNDO
          </button>
          <button onClick={handleReset} style={{
            ...btnStyle(false),
            borderColor: "#ff6b6b44",
            color: "#ff6b6b",
          }}>
            ⟳ RESET
          </button>
          <div style={{
            display: "flex", alignItems: "center", gap: 8, marginLeft: 12,
            fontSize: 10, color: "#4fffb066",
          }}>
            SPEED
            <input type="range" min={50} max={800} step={50} value={800 - speed + 50}
              onChange={(e) => setSpeed(800 - Number(e.target.value) + 50)}
              style={{ width: 80, accentColor: "#4fffb0" }}
            />
          </div>
        </div>

        {/* Message */}
        {message && (
          <div style={{
            textAlign: "center", padding: "10px 16px", marginBottom: 16,
            background: won ? "#0f2a1a" : "#2a0f0f",
            border: `1px solid ${won ? "#4fffb044" : "#ff6b6b44"}`,
            color: won ? "#4fffb0" : "#ff6b6b",
            fontSize: 13, fontWeight: 600, letterSpacing: 1,
          }}>
            {message}
          </div>
        )}

        {/* Transition Rules */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 10,
          }}>
            <div style={{ fontSize: 10, color: "#4fffb088", letterSpacing: 3 }}>
              TRANSITION RULES ({rules.length})
            </div>
            <button onClick={addRule} style={{
              padding: "4px 14px", fontSize: 11,
              background: "#4fffb0", color: "#0a0a0f",
              border: "none", cursor: "pointer", fontFamily: "inherit",
              fontWeight: 700, letterSpacing: 1,
            }}>
              + ADD RULE
            </button>
          </div>

          <div style={{
            background: "#050a08", border: "1px solid #4fffb022",
            maxHeight: 340, overflowY: "auto",
          }}>
            {/* Header */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr 0.7fr 1fr 40px",
              gap: 1, padding: "8px 10px",
              borderBottom: "1px solid #4fffb022",
              fontSize: 9, color: "#4fffb066", letterSpacing: 2,
              position: "sticky", top: 0, background: "#050a08", zIndex: 1,
            }}>
              <div>STATE</div>
              <div>READ</div>
              <div>WRITE</div>
              <div>MOVE</div>
              <div>NEXT</div>
              <div></div>
            </div>

            {rules.length === 0 && (
              <div style={{
                padding: 24, textAlign: "center", color: "#4fffb044", fontSize: 12,
              }}>
                No rules defined. Add rules to program the machine.
              </div>
            )}

            {rules.map((rule, idx) => {
              const isActive = activeRule && activeRule.state === rule.state && activeRule.read === rule.read;
              return (
                <div key={idx} style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr 1fr 0.7fr 1fr 40px",
                  gap: 1, padding: "4px 10px",
                  background: isActive ? "#1a3a28" : "transparent",
                  borderBottom: "1px solid #4fffb00a",
                  transition: "background 0.2s",
                  boxShadow: isActive ? "inset 0 0 20px #4fffb011" : "none",
                }}>
                  <input value={rule.state} onChange={(e) => updateRule(idx, "state", e.target.value)}
                    style={ruleInputStyle} placeholder="q0" />
                  <select value={rule.read} onChange={(e) => updateRule(idx, "read", e.target.value)}
                    style={ruleInputStyle}>
                    {allSymbols.map((s) => <option key={s} value={s}>{s === BLANK ? "⬜ blank" : s}</option>)}
                    <option value="_custom">type...</option>
                  </select>
                  <select value={rule.write} onChange={(e) => updateRule(idx, "write", e.target.value)}
                    style={ruleInputStyle}>
                    {allSymbols.map((s) => <option key={s} value={s}>{s === BLANK ? "⬜ blank" : s}</option>)}
                    <option value="_custom">type...</option>
                  </select>
                  <select value={rule.move} onChange={(e) => updateRule(idx, "move", e.target.value)}
                    style={ruleInputStyle}>
                    <option value="L">← L</option>
                    <option value="R">→ R</option>
                    <option value="N">· N</option>
                  </select>
                  <input value={rule.nextState} onChange={(e) => updateRule(idx, "nextState", e.target.value)}
                    style={ruleInputStyle} placeholder="q1" />
                  <button onClick={() => deleteRule(idx)} style={{
                    background: "transparent", border: "1px solid #ff6b6b22",
                    color: "#ff6b6b66", cursor: "pointer", fontSize: 14,
                    fontFamily: "inherit", padding: 0,
                    transition: "all 0.2s",
                  }}
                    onMouseEnter={(e) => { e.target.style.color = "#ff6b6b"; e.target.style.borderColor = "#ff6b6b"; }}
                    onMouseLeave={(e) => { e.target.style.color = "#ff6b6b66"; e.target.style.borderColor = "#ff6b6b22"; }}
                  >×</button>
                </div>
              );
            })}
          </div>
        </div>

        {/* State Diagram with SVG connections */}
        {(() => {
          const uniqueStates = [...new Set([
            ...rules.map(r => r.state),
            ...rules.map(r => r.nextState),
          ])].filter((v, i, a) => a.indexOf(v) === i);

          if (uniqueStates.length === 0) {
            return (
              <div style={{
                padding: "12px 16px",
                background: "#050a08", border: "1px solid #4fffb022",
                marginBottom: 20,
              }}>
                <div style={{ fontSize: 10, color: "#4fffb088", letterSpacing: 3, marginBottom: 10 }}>
                  STATE GRAPH
                </div>
                <div style={{ padding: 20, textAlign: "center", color: "#4fffb033", fontSize: 12 }}>
                  Add rules to see state connections.
                </div>
              </div>
            );
          }

          const svgW = 900;
          const svgH = Math.max(220, uniqueStates.length > 5 ? 320 : 240);
          const nodeR = 28;

          // Layout: place states in a horizontal line with spacing
          const positions = {};
          const nonHalt = uniqueStates.filter(s => s !== "HALT");
          const hasHalt = uniqueStates.includes("HALT");
          const totalNodes = nonHalt.length + (hasHalt ? 1 : 0);
          const spacing = Math.min(140, (svgW - 120) / Math.max(totalNodes, 1));
          const startX = (svgW - spacing * (totalNodes - 1)) / 2;

          // Sort states: q0 first, then others alphabetically, HALT last
          const sorted = [...nonHalt].sort((a, b) => {
            if (a === "q0") return -1;
            if (b === "q0") return 1;
            return a.localeCompare(b);
          });
          if (hasHalt) sorted.push("HALT");

          sorted.forEach((state, i) => {
            positions[state] = {
              x: startX + i * spacing,
              y: svgH / 2,
            };
          });

          // Group transitions by (from, to) pair
          const edgeMap = {};
          rules.forEach(r => {
            const key = `${r.state}__${r.nextState}`;
            if (!edgeMap[key]) edgeMap[key] = [];
            edgeMap[key].push(r);
          });

          const edges = Object.entries(edgeMap).map(([key, rs]) => {
            const [from, to] = key.split("__");
            const label = rs.map(r => `${r.read}→${r.write},${r.move}`).join(" | ");
            const isActiveEdge = activeRule && rs.some(r => r.state === activeRule.state && r.read === activeRule.read);
            return { from, to, label, isActiveEdge, rules: rs };
          });

          return (
            <div style={{
              padding: "12px 16px",
              background: "#050a08", border: "1px solid #4fffb022",
              marginBottom: 20,
              overflowX: "auto",
            }}>
              <div style={{ fontSize: 10, color: "#4fffb088", letterSpacing: 3, marginBottom: 6 }}>
                STATE GRAPH
              </div>
              <svg width="100%" height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} style={{ display: "block" }}>
                <defs>
                  <marker id="arrowGreen" viewBox="0 0 10 7" refX="10" refY="3.5"
                    markerWidth="8" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 3.5 L 0 7 z" fill="#4fffb066" />
                  </marker>
                  <marker id="arrowActive" viewBox="0 0 10 7" refX="10" refY="3.5"
                    markerWidth="8" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 3.5 L 0 7 z" fill="#4fffb0" />
                  </marker>
                  <marker id="arrowYellow" viewBox="0 0 10 7" refX="10" refY="3.5"
                    markerWidth="8" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 3.5 L 0 7 z" fill="#ffc04d88" />
                  </marker>
                </defs>

                {/* Draw edges */}
                {edges.map(({ from, to, label, isActiveEdge }, ei) => {
                  const pFrom = positions[from];
                  const pTo = positions[to];
                  if (!pFrom || !pTo) return null;

                  const isSelfLoop = from === to;
                  const hasReverse = edges.some(e => e.from === to && e.to === from && e.from !== e.to);
                  const strokeColor = isActiveEdge ? "#4fffb0" : "#4fffb055";
                  const strokeW = isActiveEdge ? 2 : 1.2;
                  const markerEnd = isActiveEdge ? "url(#arrowActive)" : "url(#arrowGreen)";
                  const textColor = isActiveEdge ? "#4fffb0" : "#4fffb077";
                  const glowFilter = isActiveEdge ? "drop-shadow(0 0 4px #4fffb066)" : "none";

                  if (isSelfLoop) {
                    // Draw a loop above the node
                    const cx = pFrom.x;
                    const cy = pFrom.y - nodeR;
                    const loopR = 22;
                    return (
                      <g key={ei} style={{ filter: glowFilter }}>
                        <path
                          d={`M ${cx - 10} ${cy} A ${loopR} ${loopR} 0 1 1 ${cx + 10} ${cy}`}
                          fill="none" stroke={strokeColor} strokeWidth={strokeW}
                          markerEnd={markerEnd}
                        />
                        <text x={cx} y={cy - loopR - 6} textAnchor="middle"
                          fontSize="9" fontFamily="'IBM Plex Mono', monospace"
                          fill={textColor}>
                          {label}
                        </text>
                      </g>
                    );
                  }

                  // Straight or curved line between nodes
                  const dx = pTo.x - pFrom.x;
                  const dy = pTo.y - pFrom.y;
                  const dist = Math.sqrt(dx * dx + dy * dy);
                  const nx = dx / dist;
                  const ny = dy / dist;

                  // Offset start/end by node radius
                  const x1 = pFrom.x + nx * (nodeR + 2);
                  const y1 = pFrom.y + ny * (nodeR + 2);
                  const x2 = pTo.x - nx * (nodeR + 10);
                  const y2 = pTo.y - ny * (nodeR + 10);

                  if (hasReverse) {
                    // Curve the edge to avoid overlap with reverse edge
                    const curveOffset = from < to ? -30 : 30;
                    const mx = (x1 + x2) / 2 + (-ny) * curveOffset;
                    const my = (y1 + y2) / 2 + nx * curveOffset;
                    return (
                      <g key={ei} style={{ filter: glowFilter }}>
                        <path
                          d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
                          fill="none" stroke={strokeColor} strokeWidth={strokeW}
                          markerEnd={markerEnd}
                        />
                        <text x={mx} y={my - 6} textAnchor="middle"
                          fontSize="9" fontFamily="'IBM Plex Mono', monospace"
                          fill={textColor}>
                          {label}
                        </text>
                      </g>
                    );
                  }

                  // Straight line
                  const mx = (x1 + x2) / 2;
                  const my = (y1 + y2) / 2;
                  return (
                    <g key={ei} style={{ filter: glowFilter }}>
                      <line x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke={strokeColor} strokeWidth={strokeW}
                        markerEnd={markerEnd}
                      />
                      <text x={mx} y={my - 10} textAnchor="middle"
                        fontSize="9" fontFamily="'IBM Plex Mono', monospace"
                        fill={textColor}>
                        {label}
                      </text>
                    </g>
                  );
                })}

                {/* Draw nodes */}
                {sorted.map((state) => {
                  const pos = positions[state];
                  const isActive = state === currentState;
                  const isHalt = state === "HALT";
                  const fillColor = isActive ? "#0f2a1a" : isHalt ? "#1a0a0a" : "#0a1210";
                  const strokeColor = isActive ? "#4fffb0" : isHalt ? "#ff6b6b66" : "#4fffb033";
                  const textColor = isActive ? "#4fffb0" : isHalt ? "#ff6b6b" : "#4fffb088";
                  const glow = isActive ? "drop-shadow(0 0 10px #4fffb044)" : "none";

                  return (
                    <g key={state} style={{ filter: glow }}>
                      {isHalt ? (
                        <rect
                          x={pos.x - nodeR} y={pos.y - nodeR}
                          width={nodeR * 2} height={nodeR * 2} rx={6}
                          fill={fillColor} stroke={strokeColor} strokeWidth={2}
                        />
                      ) : (
                        <>
                          <circle cx={pos.x} cy={pos.y} r={nodeR}
                            fill={fillColor} stroke={strokeColor} strokeWidth={2}
                          />
                          {/* Double circle for accept states if needed */}
                        </>
                      )}
                      <text x={pos.x} y={pos.y + 4} textAnchor="middle"
                        fontSize="12" fontWeight="700" fontFamily="'IBM Plex Mono', monospace"
                        fill={textColor} style={{ letterSpacing: 1 }}>
                        {state}
                      </text>
                      {/* Start arrow for q0 */}
                      {state === "q0" && (
                        <>
                          <line x1={pos.x - nodeR - 30} y1={pos.y} x2={pos.x - nodeR - 4} y2={pos.y}
                            stroke="#4fffb066" strokeWidth={1.5} markerEnd="url(#arrowGreen)" />
                          <text x={pos.x - nodeR - 32} y={pos.y - 8} textAnchor="end"
                            fontSize="8" fontFamily="'IBM Plex Mono', monospace" fill="#4fffb044">
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

        {/* Quick Reference */}
        <div style={{
          padding: "12px 16px",
          background: "#0a0f0d",
          border: "1px solid #4fffb011",
          fontSize: 10, color: "#4fffb044", lineHeight: 1.8,
        }}>
          <span style={{ color: "#4fffb066", letterSpacing: 3 }}>QUICK REFERENCE</span>
          <br />
          A Turing machine reads a symbol, applies a matching rule (state + symbol → write, move, next state), and repeats until HALT.
          <br />
          ⬜ = blank cell · L = move left · R = move right · N = stay · HALT = stop execution
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&display=swap');
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: translateY(0); }
          50% { opacity: 0.5; transform: translateY(-2px); }
        }
        input::placeholder { color: #4fffb033; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #050a08; }
        ::-webkit-scrollbar-thumb { background: #4fffb033; }
        ::-webkit-scrollbar-thumb:hover { background: #4fffb066; }
        select option { background: #0a1210; color: #4fffb0; }
      `}</style>
    </div>
  );
}

const btnStyle = (disabled, primary = false) => ({
  padding: "8px 18px",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: 2,
  fontFamily: "'IBM Plex Mono', monospace",
  background: primary && !disabled ? "#4fffb0" : "transparent",
  color: disabled ? "#4fffb022" : primary ? "#0a0a0f" : "#4fffb0",
  border: `1px solid ${disabled ? "#4fffb011" : primary ? "#4fffb0" : "#4fffb044"}`,
  cursor: disabled ? "not-allowed" : "pointer",
  transition: "all 0.2s",
});

const tinyBtnStyle = {
  padding: "3px 10px", fontSize: 9, letterSpacing: 1,
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
