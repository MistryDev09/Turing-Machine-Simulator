import { useState, useRef, useEffect, useCallback } from "react";
import { BLANK, CHALLENGES, INIT_RULES } from "../constants/challenges";

const HISTORY_CAP = 500;
const HISTORY_DROP = 100;

export default function useTuringMachine() {
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
  const [lastStepResult, setLastStepResult] = useState("");
  const [changedCellIdx, setChangedCellIdx] = useState(null);

  const runRef = useRef(false);

  const findRule = useCallback(
    (st, sym) => rules.find((r) => r.state === st && r.read === sym),
    [rules]
  );

  const checkWinWith = useCallback(
    (currentTape) => {
      const ch = CHALLENGES[challenge];
      if (!ch.expectedTape) return;
      const trimmed = currentTape.filter((c) => c !== BLANK);
      const expected = ch.expectedTape.filter((c) => c !== BLANK);
      if (trimmed.join("") === expected.join("")) {
        setWon(true);
        setMessage("\u2728 CORRECT! Machine produced the expected output!");
      } else {
        setMessage(
          `Halted. Got: [${trimmed.join(",")}] \u2014 Expected: [${expected.join(",")}]`
        );
      }
    },
    [challenge]
  );

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
      setMessage(`\u26A0 No rule for state="${currentState}", read="${sym}"`);
      setLastStepResult(
        `No rule for (${currentState}, ${sym === BLANK ? "blank" : sym}) \u2014 halted`
      );
      setHalted(true);
      setRunning(false);
      runRef.current = false;
      return false;
    }

    setActiveRule(rule);
    setTimeout(() => setActiveRule(null), Math.max(speed * 0.8, 300));

    setHistory((h) => {
      const snapshot = { tape: [...tape], headPos, currentState, stepCount };
      if (h.length >= HISTORY_CAP) {
        return [...h.slice(HISTORY_DROP), snapshot];
      }
      return [...h, snapshot];
    });

    const newTape = [...tape];
    newTape[headPos] = rule.write;
    setChangedCellIdx(headPos);
    setTimeout(() => setChangedCellIdx(null), 400);

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

    const moveLabel = rule.move === "R" ? "right" : rule.move === "L" ? "left" : "stay";
    setLastStepResult(
      `Rule: (${rule.state}, ${rule.read === BLANK ? "blank" : rule.read}) \u2192 write ${rule.write === BLANK ? "blank" : rule.write}, move ${moveLabel}, goto ${rule.nextState}`
    );

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

  const handleRun = () => {
    if (!halted) {
      setRunning(true);
      runRef.current = true;
    }
  };
  const handlePause = () => {
    setRunning(false);
    runRef.current = false;
  };
  const handleStep = () => {
    if (!halted && !running) doStep();
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
    setLastStepResult("");
    setChangedCellIdx(null);
    runRef.current = false;
    try {
      localStorage.removeItem("turing-machine-state");
    } catch {}
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
    setLastStepResult("");
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
    setLastStepResult("");
    setChangedCellIdx(null);
    runRef.current = false;
    if (idx === 0) {
      setRules(INIT_RULES.map((r) => ({ ...r })));
    } else {
      setRules([]);
    }
  };

  const addRule = (isMobile) => {
    const newIdx = rules.length;
    setRules((r) => [
      ...r,
      { state: "q0", read: BLANK, write: BLANK, move: "R", nextState: "q0" },
    ]);
    if (isMobile) setEditingRuleIdx(newIdx);
  };

  const updateRule = (idx, field, value) => {
    let sanitized = value;
    if (field === "state" || field === "nextState") {
      sanitized = value.trim().slice(0, 10);
      if (!sanitized) return;
    }
    setRules((rs) =>
      rs.map((r, i) => (i === idx ? { ...r, [field]: sanitized } : r))
    );
  };

  const deleteRule = (idx) => {
    setRules((rs) => rs.filter((_, i) => i !== idx));
    setEditingRuleIdx(null);
  };

  const updateTapeCell = (idx, value) => {
    setTape((t) =>
      t.map((c, i) => (i === idx ? value || BLANK : c))
    );
  };

  const addTapeCell = () => setTape((t) => [...t, BLANK]);
  const removeTapeCell = () => {
    if (tape.length > 1) setTape((t) => t.slice(0, -1));
  };

  const allSymbols = [
    ...new Set([...tape, ...rules.flatMap((r) => [r.read, r.write]), BLANK]),
  ];

  // localStorage persistence
  const saveTimeoutRef = useRef(null);
  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(
          "turing-machine-state",
          JSON.stringify({
            version: 1,
            data: { challenge, rules, tape, headPos },
          })
        );
      } catch {}
    }, 500);
  }, [challenge, rules, tape, headPos]);

  // Restore on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("turing-machine-state");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.version === 1 && parsed.data) {
          const d = parsed.data;
          if (typeof d.challenge === "number" && d.challenge >= 0 && d.challenge < CHALLENGES.length) {
            setChallenge(d.challenge);
          }
          if (Array.isArray(d.rules)) setRules(d.rules);
          if (Array.isArray(d.tape) && d.tape.length > 0) setTape(d.tape);
          if (typeof d.headPos === "number") setHeadPos(d.headPos);
          setMessage("Previous session restored.");
          setTimeout(() => setMessage(""), 3000);
        }
      }
    } catch {}
  }, []);

  return {
    challenge,
    tape,
    headPos,
    currentState,
    rules,
    running,
    speed,
    stepCount,
    history,
    message,
    halted,
    won,
    activeRule,
    editTapeMode,
    tapeOffset,
    editingRuleIdx,
    lastStepResult,
    changedCellIdx,
    allSymbols,
    setSpeed,
    setEditTapeMode,
    setEditingRuleIdx,
    handleRun,
    handlePause,
    handleStep,
    handleReset,
    handleUndo,
    loadChallenge,
    addRule,
    updateRule,
    deleteRule,
    updateTapeCell,
    addTapeCell,
    removeTapeCell,
  };
}
