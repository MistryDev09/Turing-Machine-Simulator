import { useTheme } from "../contexts/ThemeContext";
import { font } from "../styles/theme";

export default function StateGraph({ rules, currentState, activeRule, isMobile, isTablet }) {
  const uniqueStates = [...new Set([...rules.map((r) => r.state), ...rules.map((r) => r.nextState)])];

  if (uniqueStates.length === 0) {
    return (
      <div
        style={{
          padding: "12px 16px",
          background: colors.bgPanel,
          border: `1px solid ${colors.borderSubtle}`,
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 10, color: colors.textSecondary, letterSpacing: 3, marginBottom: 10 }}>
          STATE GRAPH
        </div>
        <div style={{ padding: 16, textAlign: "center", color: colors.textDisabled, fontSize: 11 }}>
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
  const nonHalt = sorted
    .filter((s) => s !== "HALT")
    .sort((a, b) => {
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
  rules.forEach((r) => {
    const key = `${r.state}__${r.nextState}`;
    if (!edgeMap[key]) edgeMap[key] = [];
    edgeMap[key].push(r);
  });

  const edges = Object.entries(edgeMap).map(([key, rs]) => {
    const [from, to] = key.split("__");
    const label = rs.map((r) => `${r.read}\u2192${r.write},${r.move}`).join(isMobile ? " " : " | ");
    const isActiveEdge = activeRule && rs.some((r) => r.state === activeRule.state && r.read === activeRule.read);
    return { from, to, label, isActiveEdge };
  });

  const stateList = nonHalt.join(", ");
  const ariaLabel = `State transition diagram with ${uniqueStates.length} states: ${stateList}. Current state: ${currentState}.`;

  const transitionDescs = rules
    .map(
      (r) =>
        `${r.state} reads ${r.read}, writes ${r.write}, moves ${r.move}, goes to ${r.nextState}`
    )
    .join("; ");

  return (
    <div
      style={{
        padding: isMobile ? "10px 6px" : "12px 16px",
        background: colors.bgPanel,
        border: `1px solid ${colors.borderSubtle}`,
        marginBottom: 20,
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div style={{ fontSize: 10, color: colors.textSecondary, letterSpacing: 3, marginBottom: 6 }}>
        STATE GRAPH
      </div>
      <svg
        role="img"
        aria-label={ariaLabel}
        width="100%"
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ display: "block", maxWidth: "100%" }}
      >
        <title>{ariaLabel}</title>
        <desc>Transitions: {transitionDescs}</desc>
        <defs>
          <marker id="arrG" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="7" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0L10 3.5L0 7z" fill="#4fffb066" />
          </marker>
          <marker id="arrA" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="7" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0L10 3.5L0 7z" fill={colors.primary} />
          </marker>
        </defs>

        {/* Edges */}
        {edges.map(({ from, to, label, isActiveEdge }, ei) => {
          const pF = positions[from];
          const pT = positions[to];
          if (!pF || !pT) return null;

          const sc = isActiveEdge ? colors.primary : "#4fffb055";
          const sw = isActiveEdge ? 2 : 1.2;
          const me = isActiveEdge ? "url(#arrA)" : "url(#arrG)";
          const tc = isActiveEdge ? colors.primary : colors.textMuted;
          const gf = isActiveEdge ? "drop-shadow(0 0 4px #4fffb066)" : "none";

          if (from === to) {
            const cx = pF.x;
            const cy = pF.y - nodeR;
            const lr = isMobile ? 16 : 22;
            return (
              <g key={ei} style={{ filter: gf }}>
                <path
                  d={`M ${cx - 8} ${cy} A ${lr} ${lr} 0 1 1 ${cx + 8} ${cy}`}
                  fill="none"
                  stroke={sc}
                  strokeWidth={sw}
                  markerEnd={me}
                />
                <text x={cx} y={cy - lr - 4} textAnchor="middle" fontSize={labelFontSize} fontFamily={font} fill={tc}>
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

          const hasReverse = edges.some((e) => e.from === to && e.to === from && e.from !== e.to);

          if (hasReverse) {
            const co = from < to ? -24 : 24;
            const mx = (x1 + x2) / 2 + -ny * co;
            const my = (y1 + y2) / 2 + nx * co;
            return (
              <g key={ei} style={{ filter: gf }}>
                <path d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`} fill="none" stroke={sc} strokeWidth={sw} markerEnd={me} />
                <text x={mx} y={my - 5} textAnchor="middle" fontSize={labelFontSize} fontFamily={font} fill={tc}>
                  {label}
                </text>
              </g>
            );
          }

          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2;
          return (
            <g key={ei} style={{ filter: gf }}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={sc} strokeWidth={sw} markerEnd={me} />
              <text x={mx} y={my - 8} textAnchor="middle" fontSize={labelFontSize} fontFamily={font} fill={tc}>
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
          const fc = isAct ? colors.bgSuccess : isH ? "#1a0a0a" : colors.bgInput;
          const stc = isAct ? colors.primary : isH ? "#ff6b6b66" : colors.borderPrimary;
          const txc = isAct ? colors.primary : isH ? colors.danger : colors.textSecondary;
          const glow = isAct ? "drop-shadow(0 0 10px #4fffb044)" : "none";

          return (
            <g key={state} style={{ filter: glow }}>
              {isH ? (
                <rect x={pos.x - nodeR} y={pos.y - nodeR} width={nodeR * 2} height={nodeR * 2} rx={5} fill={fc} stroke={stc} strokeWidth={2} />
              ) : (
                <circle cx={pos.x} cy={pos.y} r={nodeR} fill={fc} stroke={stc} strokeWidth={2} />
              )}
              <text
                x={pos.x}
                y={pos.y + (isMobile ? 3 : 4)}
                textAnchor="middle"
                fontSize={nodeFontSize}
                fontWeight="700"
                fontFamily={font}
                fill={txc}
                style={{ letterSpacing: 1 }}
              >
                {state}
              </text>
              {state === "q0" && (
                <>
                  <line
                    x1={pos.x - nodeR - 22}
                    y1={pos.y}
                    x2={pos.x - nodeR - 3}
                    y2={pos.y}
                    stroke="#4fffb066"
                    strokeWidth={1.5}
                    markerEnd="url(#arrG)"
                  />
                  <text
                    x={pos.x - nodeR - 24}
                    y={pos.y - 6}
                    textAnchor="end"
                    fontSize="7"
                    fontFamily={font}
                    fill={colors.textDisabled}
                  >
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
}
