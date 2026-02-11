export const BLANK = "\u2B1C";

export const CHALLENGES = [
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
    description: "Free mode \u2014 set up your own tape and rules!",
    tape: [BLANK, BLANK, BLANK, BLANK, BLANK, BLANK, BLANK, BLANK],
    headPos: 0,
    expectedTape: null,
    hints: "Experiment freely. No win condition.",
  },
];

export const INIT_RULES = [
  { state: "q0", read: "0", write: "1", move: "R", nextState: "q0" },
  { state: "q0", read: "1", write: "0", move: "R", nextState: "q0" },
  { state: "q0", read: BLANK, write: BLANK, move: "N", nextState: "HALT" },
];
