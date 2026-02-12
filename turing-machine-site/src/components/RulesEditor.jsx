import { BLANK } from "../constants/challenges";
import { useTheme } from "../contexts/ThemeContext";
import { font, ruleInputStyle, delBtnStyle, mobileLabelStyle, mobileInputStyle } from "../styles/theme";

export default function RulesEditor({
  rules,
  activeRule,
  allSymbols,
  editingRuleIdx,
  isMobile,
  onAddRule,
  onUpdateRule,
  onDeleteRule,
  onSetEditingIdx,
}) {
  return (
    <div style={{ marginBottom: isMobile ? 14 : 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 10, color: colors.textSecondary, letterSpacing: 3 }}>
          RULES ({rules.length})
        </div>
        <button
          onClick={onAddRule}
          aria-label="Add transition rule"
          style={{
            padding: "4px 12px",
            fontSize: 10,
            background: colors.primary,
            color: colors.bg,
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          + ADD
        </button>
      </div>

      {/* Desktop/Tablet: table layout */}
      {!isMobile ? (
        <div
          role="table"
          aria-label="Transition rules"
          style={{ background: colors.bgPanel, border: `1px solid ${colors.borderSubtle}`, maxHeight: 300, overflowY: "auto" }}
        >
          <div
            role="row"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 0.7fr 1fr 36px",
              gap: 1,
              padding: "8px 10px",
              borderBottom: `1px solid ${colors.borderSubtle}`,
              fontSize: 9,
              color: colors.textSecondary,
              letterSpacing: 2,
              position: "sticky",
              top: 0,
              background: colors.bgPanel,
              zIndex: 1,
            }}
          >
            <div role="columnheader">STATE</div>
            <div role="columnheader">READ</div>
            <div role="columnheader">WRITE</div>
            <div role="columnheader">MOVE</div>
            <div role="columnheader">NEXT</div>
            <div role="columnheader"></div>
          </div>

          {rules.length === 0 && (
            <div style={{ padding: 20, textAlign: "center", color: colors.textDisabled, fontSize: 11 }}>
              No rules. Add rules to program the machine.
            </div>
          )}

          {rules.map((rule, idx) => {
            const isActive = activeRule && activeRule.state === rule.state && activeRule.read === rule.read;
            return (
              <div
                key={idx}
                role="row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 0.7fr 1fr 36px",
                  gap: 1,
                  padding: "4px 10px",
                  background: isActive ? colors.bgHighlight : "transparent",
                  borderLeft: isActive ? `3px solid ${colors.primary}` : "3px solid transparent",
                  borderBottom: `1px solid ${colors.borderFaint}`,
                  transition: "background 0.2s",
                }}
              >
                <div role="cell">
                  <input
                    value={rule.state}
                    onChange={(e) => onUpdateRule(idx, "state", e.target.value)}
                    style={ruleInputStyle}
                    placeholder="q0"
                    maxLength={10}
                    aria-label={`State for rule ${idx + 1}`}
                  />
                </div>
                <div role="cell">
                  <select
                    value={rule.read}
                    onChange={(e) => onUpdateRule(idx, "read", e.target.value)}
                    style={ruleInputStyle}
                    aria-label={`Read symbol for rule ${idx + 1}`}
                  >
                    {allSymbols.map((s) => (
                      <option key={s} value={s}>
                        {s === BLANK ? "\u2B1C blank" : s}
                      </option>
                    ))}
                  </select>
                </div>
                <div role="cell">
                  <select
                    value={rule.write}
                    onChange={(e) => onUpdateRule(idx, "write", e.target.value)}
                    style={ruleInputStyle}
                    aria-label={`Write symbol for rule ${idx + 1}`}
                  >
                    {allSymbols.map((s) => (
                      <option key={s} value={s}>
                        {s === BLANK ? "\u2B1C blank" : s}
                      </option>
                    ))}
                  </select>
                </div>
                <div role="cell">
                  <select
                    value={rule.move}
                    onChange={(e) => onUpdateRule(idx, "move", e.target.value)}
                    style={ruleInputStyle}
                    aria-label={`Move direction for rule ${idx + 1}`}
                  >
                    <option value="L">{"\u2190"} L</option>
                    <option value="R">{"\u2192"} R</option>
                    <option value="N">{"\u00B7"} N</option>
                  </select>
                </div>
                <div role="cell">
                  <input
                    value={rule.nextState}
                    onChange={(e) => onUpdateRule(idx, "nextState", e.target.value)}
                    style={ruleInputStyle}
                    placeholder="q1"
                    maxLength={10}
                    aria-label={`Next state for rule ${idx + 1}`}
                  />
                </div>
                <div role="cell">
                  <button
                    onClick={() => onDeleteRule(idx)}
                    aria-label={`Delete rule ${idx + 1}`}
                    style={delBtnStyle}
                    onMouseEnter={(e) => { e.target.style.opacity = "1"; }}
                    onMouseLeave={(e) => { e.target.style.opacity = "0.5"; }}
                  >
                    {"\u00D7"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Mobile: expandable card-based rules */
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {rules.length === 0 && (
            <div
              style={{
                padding: 16,
                textAlign: "center",
                color: colors.textDisabled,
                fontSize: 11,
                background: colors.bgPanel,
                border: `1px solid ${colors.borderSubtle}`,
              }}
            >
              No rules. Tap + ADD to start.
            </div>
          )}

          {rules.map((rule, idx) => {
            const isActive = activeRule && activeRule.state === rule.state && activeRule.read === rule.read;
            const isEditing = editingRuleIdx === idx;
            return (
              <div
                key={idx}
                style={{
                  background: isActive ? colors.bgHighlight : colors.bgPanel,
                  border: `1px solid ${isActive ? colors.borderPrimary : colors.borderSubtle}`,
                  borderLeft: isActive ? `3px solid ${colors.primary}` : `3px solid transparent`,
                  padding: "8px 10px",
                  transition: "background 0.2s",
                }}
              >
                {/* Summary row */}
                <button
                  onClick={() => onSetEditingIdx(isEditing ? null : idx)}
                  aria-expanded={isEditing}
                  aria-label={`Rule ${idx + 1}: ${rule.state} reads ${rule.read === BLANK ? "blank" : rule.read}, writes ${rule.write === BLANK ? "blank" : rule.write}, moves ${rule.move}, goes to ${rule.nextState}. ${isEditing ? "Collapse" : "Expand"} to edit.`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    cursor: "pointer",
                    fontSize: 13,
                    gap: 6,
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    fontFamily: "inherit",
                    textAlign: "left",
                  }}
                >
                  <div style={{ color: colors.primary, fontWeight: 600, letterSpacing: 1 }}>
                    <span style={{ color: colors.textSecondary }}>{rule.state}</span>{" "}
                    <span style={{ color: colors.accent }}>{rule.read === BLANK ? "\u00B7" : rule.read}</span>
                    <span style={{ color: colors.borderPrimary }}> {"\u2192"} </span>
                    <span style={{ color: colors.accent }}>{rule.write === BLANK ? "\u00B7" : rule.write}</span>{" "}
                    <span style={{ color: colors.textMuted }}>
                      {rule.move === "L" ? "\u2190" : rule.move === "R" ? "\u2192" : "\u00B7"}
                    </span>{" "}
                    <span style={{ color: colors.textSecondary }}>{rule.nextState}</span>
                  </div>
                  <span style={{ color: colors.borderPrimary, fontSize: 14 }}>
                    {isEditing ? "\u25BE" : "\u25B8"}
                  </span>
                </button>

                {/* Expanded editor */}
                {isEditing && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <label style={mobileLabelStyle}>
                        <span>State</span>
                        <input
                          value={rule.state}
                          onChange={(e) => onUpdateRule(idx, "state", e.target.value)}
                          style={mobileInputStyle}
                          placeholder="q0"
                          maxLength={10}
                        />
                      </label>
                      <label style={mobileLabelStyle}>
                        <span>Read</span>
                        <select
                          value={rule.read}
                          onChange={(e) => onUpdateRule(idx, "read", e.target.value)}
                          style={mobileInputStyle}
                        >
                          {allSymbols.map((s) => (
                            <option key={s} value={s}>
                              {s === BLANK ? "\u2B1C blank" : s}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label style={mobileLabelStyle}>
                        <span>Write</span>
                        <select
                          value={rule.write}
                          onChange={(e) => onUpdateRule(idx, "write", e.target.value)}
                          style={mobileInputStyle}
                        >
                          {allSymbols.map((s) => (
                            <option key={s} value={s}>
                              {s === BLANK ? "\u2B1C blank" : s}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label style={mobileLabelStyle}>
                        <span>Move</span>
                        <select
                          value={rule.move}
                          onChange={(e) => onUpdateRule(idx, "move", e.target.value)}
                          style={mobileInputStyle}
                        >
                          <option value="L">{"\u2190"} Left</option>
                          <option value="R">{"\u2192"} Right</option>
                          <option value="N">{"\u00B7"} Stay</option>
                        </select>
                      </label>
                      <label style={{ ...mobileLabelStyle, gridColumn: "1 / -1" }}>
                        <span>Next State</span>
                        <input
                          value={rule.nextState}
                          onChange={(e) => onUpdateRule(idx, "nextState", e.target.value)}
                          style={mobileInputStyle}
                          placeholder="q1 or HALT"
                          maxLength={10}
                        />
                      </label>
                    </div>
                    <button
                      onClick={() => onDeleteRule(idx)}
                      aria-label={`Delete rule ${idx + 1}`}
                      style={{
                        marginTop: 10,
                        width: "100%",
                        padding: "8px 0",
                        background: "transparent",
                        border: `1px solid ${colors.borderDanger}`,
                        color: colors.danger,
                        opacity: 0.6,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        fontSize: 10,
                        letterSpacing: 1,
                      }}
                    >
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
  );
}
