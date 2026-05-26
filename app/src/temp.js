import React, { useState, useEffect } from "react";

function teamStatus(team) {
  const d = team.day_today;
  if (!d) return "mis";
  if (d.submit_status === 0) return "sub";
  if (d.submit_status === 1) return "del";
  return "mis";
}

function fmtTime(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function initials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function fmtDisplayDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const STATUS_META = {
  sub: {
    pillCls: "bg-green-900/40 text-green-400 border border-green-700/40",
    badgeCls: "bg-green-900/40 text-green-400",
    icon: "✓",
    label: "Submitted",
  },
  del: {
    pillCls: "bg-yellow-900/40 text-yellow-400 border border-yellow-700/40",
    badgeCls: "bg-yellow-900/40 text-yellow-400",
    icon: "⏱",
    label: "Delayed",
  },
  mis: {
    pillCls: "bg-red-900/40 text-red-400 border border-red-700/40",
    badgeCls: "bg-red-900/40 text-red-400",
    icon: "✗",
    label: "Missed",
  },
};

// ── Employee card ─────────────────────────────────────────────────────────────
function EmpCard({ emp, subTab }) {
  const [open, setOpen] = useState(false);

  const teamsToShow =
    subTab === "Delayed"
      ? emp.teams.filter((t) => teamStatus(t) === "del")
      : subTab === "Missed"
      ? emp.teams.filter((t) => teamStatus(t) === "mis")
      : emp.teams;

  if (teamsToShow.length === 0) return null;

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between gap-3 px-5 py-3 cursor-pointer hover:bg-gray-800/40 transition-all"
        onClick={() => setOpen((o) => !o)}
      >
        {/* Avatar + name */}
        <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-indigo-900/60 text-indigo-300 flex items-center justify-center text-xs font-medium flex-shrink-0">
            {initials(emp.name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{emp.name}</p>
            <p className="text-xs text-gray-500">{emp.eha_id}</p>
          </div>
        </div>

        {/* Team pills */}
        <div className="flex flex-wrap gap-1.5 flex-1 justify-end">
          {teamsToShow.map((t) => {
            const m = STATUS_META[teamStatus(t)];
            return (
              <span
                key={t.tec_id}
                className={`text-[11px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${m.pillCls}`}
              >
                <span>{m.icon}</span>
                {t.tha_id}: {m.label}
              </span>
            );
          })}
        </div>

        {/* Chevron */}
        <span
          className={`text-gray-500 flex-shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </div>

      {/* Expanded body */}
      {open && (
        <div className="border-t border-gray-700 divide-y divide-gray-800">
          {teamsToShow.map((t) => {
            const s = teamStatus(t);
            const m = STATUS_META[s];
            const time = t.day_today?.in_time ? ` · ${fmtTime(t.day_today.in_time)}` : "";
            const taskCount = t.day_today?.text?.length ?? 0;

            return (
              <div
                key={t.tec_id}
                className="flex items-center justify-between px-5 py-3 gap-4"
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    {t.tha_id}{" "}
                    <span className="text-gray-500 font-normal text-xs">
                      ({t.tec_id})
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {s === "mis"
                      ? "No submission"
                      : `${taskCount} task${taskCount !== 1 ? "s" : ""}`}
                  </p>
                </div>
                <span
                  className={`text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 ${m.badgeCls}`}
                >
                  <span>{m.icon}</span>
                  {m.label}
                  {time}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
function Agenda_Submission() {
  const [activeTab, setActiveTab]       = useState("Today");
  const [subTab, setSubTab]             = useState("All");
  const [searchTerm, setSearchTerm]     = useState("");
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [employees, setEmployees]       = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  useEffect(() => {
    if (activeTab === "Today") fetchForDate(selectedDate);
  }, [activeTab, selectedDate]);

  const fetchForDate = async (dateStr) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `http://localhost:5000/daily_agendas/today?date=${dateStr}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();

      const parsed = (data.employees || []).map((emp) => ({
        ...emp,
        teams: emp.teams.map((t) => ({
          ...t,
          day_today:
            typeof t.day_today === "string"
              ? JSON.parse(t.day_today)
              : t.day_today,
        })),
      }));

      setEmployees(parsed);
    } catch (e) {
      console.error("Failed to fetch agendas:", e);
      setError("Could not load submissions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const visible = employees.filter((emp) => {
    const term = searchTerm.toLowerCase();
    if (
      term &&
      !emp.eha_id.toLowerCase().includes(term) &&
      !emp.name.toLowerCase().includes(term)
    )
      return false;
    if (subTab === "Delayed") return emp.teams.some((t) => teamStatus(t) === "del");
    if (subTab === "Missed")  return emp.teams.some((t) => teamStatus(t) === "mis");
    return true;
  });

  const isToday = selectedDate === todayStr();

  return (
    <div className="w-full min-h-screen bg-gray-900 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Daily Agenda Submission
        </h1>
        <p className="text-gray-400">Track team agenda submissions</p>
      </div>

      {/* Main tabs + date picker + search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex bg-gray-800 rounded-lg p-1 gap-2">
          {["Today", "Monthly"].map((t) => (
            <button
              key={t}
              onClick={() => {
                setActiveTab(t);
                if (t === "Today") setSelectedDate(todayStr());
              }}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === t
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {t === "Today" ? "Today's Submissions" : "Monthly Submissions"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {activeTab === "Today" && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400 whitespace-nowrap">
                {isToday ? "Today" : fmtDisplayDate(selectedDate)}
              </label>
              <input
                type="date"
                value={selectedDate}
                max={todayStr()}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200"
              />
              {!isToday && (
                <button
                  onClick={() => setSelectedDate(todayStr())}
                  className="px-3 py-2 bg-gray-800 border border-gray-700 text-gray-400 text-sm rounded-lg hover:text-white hover:bg-gray-700 transition-all duration-200"
                >
                  Back to today
                </button>
              )}
            </div>
          )}

          <div className="relative w-full md:w-80">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or code..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      {activeTab === "Today" && (
        <div className="flex gap-3 mb-5">
          {["All", "Submitted", "Delayed", "Missed"].map((s) => (
            <button
              key={s}
              onClick={() => setSubTab(s)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                subTab === s
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-gray-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {activeTab === "Today" && (
        <>
          {loading ? (
            <div className="text-gray-500 text-sm py-8 text-center">
              Loading submissions for {isToday ? "today" : fmtDisplayDate(selectedDate)}…
            </div>
          ) : error ? (
            <div className="bg-gray-900 rounded-xl border border-red-800 p-8 text-center">
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={() => fetchForDate(selectedDate)}
                className="mt-4 px-4 py-2 bg-gray-800 text-gray-300 text-sm rounded-lg hover:bg-gray-700 transition-all"
              >
                Retry
              </button>
            </div>
          ) : visible.length === 0 ? (
            <div className="bg-gray-900 rounded-xl border border-gray-700 p-12 text-center">
              <p className="text-gray-500 text-lg">No employees found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visible.map((emp) => (
                <EmpCard key={emp.eha_id} emp={emp} subTab={subTab} />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "Monthly" && (
        <div className="text-gray-500 text-sm py-8 text-center">
          Monthly view — coming soon
        </div>
      )}
    </div>
  );
}

export default Agenda_Submission;