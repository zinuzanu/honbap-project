import React, { useState } from "react";

// 요일 순서 기준
const WEEK_ORDER = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"];

function OpenHoursDisplay({ rawOpenHours }) {
  const [expanded, setExpanded] = useState(false);

  if (!rawOpenHours) return null;

  const lines = rawOpenHours
    .split("\n")
    .map(line => line.trim())
    .filter(line => line !== "");

  const grouped = [];
  let current = null;

  lines.forEach(line => {
    if (WEEK_ORDER.some(day => line.includes(day)) || line.includes("요일")) {
      if (current) grouped.push(current);
      current = line;
    } else {
      current += "\n" + line;
    }
  });
  if (current) grouped.push(current);

  const todayLabel = (() => {
    const today = new Date().getDay(); // 0 (일요일) ~ 6 (토요일)
    return WEEK_ORDER[today === 0 ? 6 : today - 1];
  })();

  const todayEntry = grouped.find(entry => entry.includes(todayLabel));
  const otherEntries = grouped.filter(entry => !entry.includes(todayLabel));
  const isGroupedByEveryday = grouped.length === 1 && grouped[0].includes("매일요일");

  const buttonStyle = {
    background: "#f2f2f2",
    border: "1px solid #ccc",
    borderRadius: "6px",
    padding: "6px 10px",
    cursor: "pointer",
    fontSize: "13px",
    marginBottom: "8px"
  };

  const entryTextStyle = {
    whiteSpace: "pre-wrap",
    margin: "4px 0",
    fontSize: "13px",
    color: "#555"
  };

  return (
    <>
      <h4 style={{ fontSize: "15px", margin: "12px 0 6px", display: "flex", alignItems: "center", gap: "6px" }}>
        ⏰ 운영시간
      </h4>

      {/* 매일 동일한 경우 */}
      {isGroupedByEveryday ? (
        <div style={{ fontWeight: "bold", color: "#222", marginBottom: "8px" }}>
          <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{grouped[0]}</pre>
        </div>
      ) : (
        <>
          {todayEntry && (
            <div style={{ fontWeight: "bold", color: "#222", marginBottom: "8px" }}>
              <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{todayEntry}</pre>
            </div>
          )}

          {otherEntries.length > 0 && (
            <>
              <button onClick={() => setExpanded(!expanded)} style={buttonStyle}>
                {expanded ? "▲ 다른 요일 닫기" : "▼ 다른 요일 보기"}
              </button>
              {expanded && (
                <div>
                  {otherEntries.map((entry, idx) => (
                    <pre key={idx} style={entryTextStyle}>
                      {entry}
                    </pre>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}

export default OpenHoursDisplay;
