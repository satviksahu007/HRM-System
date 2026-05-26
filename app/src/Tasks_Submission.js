import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const today = new Date();
const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;


function employeeStatus(emp) {
  const statuses = emp.teams.flatMap((t) => [
    agendaStatus(t),
    reportStatus(t),
  ]);

  if (statuses.some((s) => s === "mis")) return "mis";
  if (statuses.some((s) => s === "del")) return "del";

  return "sub";
}

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

function fmtDisplayMonth(monthStr) {
  return new Date(`${monthStr}-01`).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
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
  return new Date().toLocaleDateString("en-CA")
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
    label: "On Time",
  },
  del: {
    pillCls: "bg-yellow-900/40 text-yellow-400 border border-yellow-700/40",
    badgeCls: "bg-yellow-900/40 text-yellow-400",
    label: "Delayed",
  },
  mis: {
    pillCls: "bg-red-900/40 text-red-400 border border-red-700/40",
    badgeCls: "bg-red-900/40 text-red-400",
    label: "Missed",
  },
  pending: {
    pillCls: "bg-blue-900/40 text-blue-400 border border-blue-700/40",
    badgeCls: "bg-blue-900/40 text-blue-400",
    label: "Pending",
  },
};


function agendaStatus(team) {
  const d = team.day_today;

  if (!d) return "mis";
  if (d.submit_status === 0) return "sub";
  if (d.submit_status === 1) return "del";

  return "mis";
}

function reportStatus(team,selectedDate) {
  const d = team.report_today;

  const today = new Date();

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const todayStr = today.toLocaleDateString("en-CA");
  const yesterdayStr = yesterday.toLocaleDateString("en-CA");

  const allowPending =
    selectedDate === todayStr ||
    selectedDate === yesterdayStr;

  if (!d) {
    // allow pending only for today's date
    if (
      allowPending &&
      team.submit_next_day === "yes"
    ) {
      return "pending";
    }
    // old dates -> missed
    return "mis";
  }
  

  if (d.submit_status === 0) return "sub";
  if (d.submit_status === 1) return "del";

  return "mis";
}

function combinedTeamStatus(team, selectedDate) {
  const a = agendaStatus(team);
  const r = reportStatus(team, selectedDate);

  // 1. If anything is truly missed → missed
  if (a === "mis" || r === "mis") return "mis";

  // 2. If no missed, but something delayed → delayed
  if (a === "del" || r === "del") return "del";

  // 3. If no missed/delayed, but report is pending → pending
  if (r === "pending") return "pending";

  // 4. Everything submitted on time
  return "sub";
}

function DonutChart({ employees, subTab, setSubTab, selectedDate }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const LABELS = ["On Time", "Delayed", "Missed", "Pending"];
  const COLORS = ["#44ce1b", "#ffce00", "#b91616", "#3b82f6"];
  const HOVER = ["#2f9e12", "#d4aa00", "rgba(157, 29, 29)", "#2563eb"];

  // Count employees whose **combined** status matches each label
  const counts = LABELS.map(
    (label) =>
      employees.filter((e) =>
        e.teams.some((t) => {
          const status = combinedTeamStatus(t, selectedDate);
          return (
            (label === "On Time" && status === "sub") ||
            (label === "Delayed" && status === "del") ||
            (label === "Missed" && status === "mis") ||
            (label === "Pending" && status === "pending")
          );
        })
      ).length
  );

  const total = counts.reduce((a, b) => a + b, 0);

  const createChart = (canvas, chartRef) => {
    if (!canvas) return;
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    chartRef.current = new Chart(canvas, {
      type: "doughnut",
      data: {
        labels: LABELS,
        datasets: [
          {
            data: counts,
            backgroundColor: COLORS,
            hoverBackgroundColor: HOVER,
            borderWidth: 5,
            borderColor: "#111827",
            hoverOffset: 10,
            borderRadius: 8,
            offset: counts.map(() => 0),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: "50%",
        onClick: (e, els, chart) => {
          const len = chart.data.datasets[0].data.length;
          chart.data.datasets[0].offset = Array(len).fill(0);

          if (!els.length) {
            setSubTab("All");
            chart.update();
            return;
          }

          const idx = els[0].index;
          chart.data.datasets[0].offset[idx] = 40;
          setSubTab(LABELS[idx]);
          chart.update();
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#1F2937",
            borderColor: "#374151",
            borderWidth: 1,
            padding: 14,
            titleColor: "#fff",
            bodyColor: "#D1D5DB",
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.parsed}`,
            },
          },
        },
      },
    });
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    createChart(canvasRef.current, chartRef);
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [employees, selectedDate]); // re‑draw when data or date changes

  // Sync offset when subTab changes externally
  useEffect(() => {
    if (!chartRef.current) return;
    const idx = subTab === "All" ? null : LABELS.indexOf(subTab);
    const len = chartRef.current.data.datasets[0].data.length;
    chartRef.current.data.datasets[0].offset = Array.from({ length: len }, (_, i) =>
      idx !== null && i === idx ? 40 : 0
    );
    chartRef.current.update();
  }, [subTab]);

  return (
    <div className="bg-gray-900 rounded-3xl border border-gray-800 p-10 mb-6 shadow-2xl">
      <div className="flex flex-col items-center">
        <h2 className="text-3xl text-white mb-8">Submission Status</h2>
        <div className="relative w-60 h-60">
          <canvas ref={canvasRef} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-4xl text-white">{total}</span>
            <span className="text-xl text-gray-400 mt-2 uppercase tracking-[0.2em]">Total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-gray-800/60 border border-gray-700 rounded-xl px-3 py-2 mt-6 flex flex-wrap items-center gap-4">
          {LABELS.map((label, idx) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: COLORS[idx] }} />
              <span className="text-xs text-gray-300">{label}</span>
              <span className="text-xs font-semibold text-white">{counts[idx]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



function MonthlyBarChart({ memployees, daysInMonth, selectedMonth, calendarMap }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  const AGENDA_LABELS = ["On Time", "Delayed", "Missed"];
  const REPORT_LABELS = ["On Time", "Delayed", "Missed", "Pending"];

  const getDayStatus = (memp, day) => {
    return getMonthlyStatus(memp,day,selectedMonth,calendarMap)
  };

  const todayDate    = new Date();
  const [yyyy, mm]   = selectedMonth.split("-").map(Number);
  const isCurrentMonth = todayDate.getFullYear() === yyyy && todayDate.getMonth() + 1 === mm;
  const countUpTo    = isCurrentMonth ? todayDate.getDate() : daysInMonth;

  // build per-employee counts
  const labels   = memployees.map(e => e.name.split(" ")[0]); // first name only for brevity
  const onTime   = memployees.map(e => {
    let count = 0;
    for (let d = 1; d <= countUpTo; d++) if (getDayStatus(e, d) === "sub") count++;
    return count;
  });
  const delayed  = memployees.map(e => {
    let count = 0;
    for (let d = 1; d <= countUpTo; d++) if (getDayStatus(e, d) === "del") count++;
    return count;
  });
  const pending = memployees.map(e => {
    let count = 0;

  for (let d = 1; d <= countUpTo; d++) {
    if (getDayStatus(e, d) === "pending") count++;
  }


  return count;
});
  const missed   = memployees.map(e => {
    let count = 0;
    for (let d = 1; d <= countUpTo; d++) if (getDayStatus(e, d) === "mis") count++;
    return count;
  });

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    chartRef.current = new Chart(canvasRef.current, {
  type: "bar",
  data: {
    labels,
    datasets: [
      {
        label: "On Time",
        data: onTime,
        backgroundColor: "#44ce1b",
        borderRadius: 7,
        barThickness: 12,
      },
      {
        label: "spacer",
        data:"",
        backgroundColor:""
      },
      {
        label: "Delayed",
        data: delayed,
        backgroundColor: "#ffce00",
        borderRadius: 7,
        barThickness: 12,
      },
      {
        label: "spacer",
        data:"",
        backgroundColor: "",
      },
      {
        label: "Missed",
        data: missed,
        backgroundColor: "rgba(157, 29, 29)",
        borderRadius: 7,
        barThickness: 12,
      },
      {
        label: "spacer",
        data:"",
        backgroundColor: "",
      },
      {
        label: "Pending",
        data: pending,
        backgroundColor: "#3b82f6",
        borderRadius: 7,
        barThickness: 12,
      },
    ],
  },

  options: {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,

    layout: {
      padding: {
        top: 10,
        bottom: 10,
      },
    },

    scales: {
      x: {
        grid: { color: "#1F2937" },
        ticks: {
          color: "#9CA3AF",
          font: { size: 15 },
        },
        max: countUpTo,
      },

      y: {
        grid: {
          display: false,
        },

        ticks: {
          color: "#D1D5DB",
          font: { size: 15 },
          padding:1
        },
      },
    },

    plugins: {
      legend: {
        display: false,
        position: "top",
        labels: {
          color: "#9CA3AF",
          boxWidth: 12,
          padding: 18,
          font: { size: 12 },
              filter: (legendItem) =>
          legendItem.text !== "spacer",

        },
      },

      tooltip: {
        backgroundColor: "#1F2937",
        borderColor: "#374151",
        borderWidth: 1,
        padding: 12,
        titleColor: "#fff",
        bodyColor: "#D1D5DB",
        callbacks: {
          label: (ctx) =>
            ` ${ctx.dataset.label}: ${ctx.parsed.x} days`,
        },
      },
    },
  },
});

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [memployees, selectedMonth]);

  const chartHeight = Math.max(300, memployees.length *110);

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Monthly Tasks Submission Overview</h2>
        </div>
        <div className="flex gap-3">
          {[["Submitted agenda and report on time", "#44ce1b"], ["Delayed either agenda or report or both", "#ffce00"], ["Pending next-day report submission", "#3b82f6"],
               ["Missed either agenda or report or both", "#e51f1f"]].map(([label, color]) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: `${chartHeight}px` }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

function monthlyTeamStatus(team, day, selectedMonth) {
  const agenda = team.days?.[String(day)];
  const report = team.report_days?.[String(day)];

  const getStatus = (d) => {
    if (!d) return "mis";
    if (Number(d.submit_status) === 0) return "sub";
    if (Number(d.submit_status) === 1) return "del";
    return "mis";
  };

  const agendaStatus = getStatus(agenda);

  let reportStatus;

  // report missing
  if (!report) {
    const today = new Date();
    const [yyyy, mm] = selectedMonth.split("-").map(Number);
    const cellDate = new Date(yyyy, mm - 1, day);
    const diffDays = Math.floor((today - cellDate) / (1000 * 60 * 60 * 24));

    // Fix: accept multiple truthy representations for submit_next_day
    if (
      (team.submit_next_day === "yes" ||
       team.submit_next_day === true ||
       team.submit_next_day === 1) &&
      (diffDays === 0 || diffDays === 1)
    ) {
      reportStatus = "pending";
    } else {
      reportStatus = "mis";
    }
  } else {
    reportStatus = getStatus(report);
  }

  // Priority: missed > delayed > pending > sub
  if (agendaStatus === "mis" || reportStatus === "mis") return "mis";
  if (agendaStatus === "del" || reportStatus === "del") return "del";
  if (reportStatus === "pending") return "pending";
  if (agendaStatus === "sub" || reportStatus === "sub") return "sub";
  return "mis";
}






function getMonthlyStatus(emp, day, selectedMonth, calendarMap = {}) {
  const [yyyy, mm] = selectedMonth.split("-").map(Number);
  
  // Note: use padStart not zfill — that's JS
  const dateKey = `${yyyy}-${String(mm).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
  const dayType = calendarMap[dateKey];
  if (dayType === "holiday" || dayType === "weekoff") return "grey";

  const statuses = emp.teams.map((t) => monthlyTeamStatus(t, day, selectedMonth));
  if (statuses.some((s) => s === "del")) return "del";
  if (statuses.some((s) => s === "pending")) return "pending";
  if (statuses.some((s) => s === "sub")) return "sub";
  return "mis";
}

function getDaysInMonth(monthStr){
  const [year, month] = monthStr.split("-").map(Number);
  return new Date(year, month, 0).getDate();
}

function MonthlyEmpCard({ memp, daysInMonth, selectedMonth, selectedDate, calendarMap}) {
  const [showCal, setShowCal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);


  function isTeamActiveOnDay(team, dayDate) {
  // If assigned_on exists, check start date
  if (team.assigned_on) {
    const assignedDate = new Date(team.assigned_on + "T00:00:00");
    if (dayDate < assignedDate) return false;
  }

  // If unlinked_on exists, check end date (team NOT active after that date)
  if (team.unlinked_on) {
    const unlinkedDate = new Date(team.unlinked_on + "T00:00:00");
    if (dayDate > unlinkedDate) return false;
  }

  // No restricting dates, or day is within the range → active
  return true;
}

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-gray-800/40 transition-all">
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-indigo-900/60 text-indigo-300 flex items-center justify-center text-xs font-medium flex-shrink-0">
            {initials(memp.name)}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{memp.name}</p>
            <p className="text-xs text-gray-500">{memp.eha_id}</p>
          </div>
        </div>

        <div className="flex gap-3">
          {/* summary counts */}
          {(() => {
            const todayDate = new Date();
            const [yyyy, mm] = selectedMonth.split("-").map(Number);
            const isCurrentMonth = todayDate.getFullYear() === yyyy && todayDate.getMonth() + 1 === mm;
            const countUpTo = isCurrentMonth ? todayDate.getDate() : daysInMonth;
            let sub = 0, del = 0, pen = 0, mis = 0;
            for (let d = 1; d <= countUpTo; d++) {
              const s = getMonthlyStatus(memp, d, selectedMonth, calendarMap);
              if (s === "grey") continue;   // ← add this
              if (s === "sub") sub++;
              else if (s === "del") del++;
              else if (s === "pending") pen++;
              else mis++;
            }
            return (
              <div className="flex gap-1.5">
                <span className="text-xs px-3 py-1 rounded-full bg-green-900/40 text-green-400 border border-green-700/40">On Time: {sub}</span>
                <span className="text-xs px-3 py-1 rounded-full bg-yellow-900/40 text-yellow-400 border border-yellow-700/40">Delayed: {del}</span>
                <span className="text-xs px-3 py-1 rounded-full bg-red-900/40 text-red-400 border border-red-700/40">Missed: {mis}</span>
                <span className="text-xs px-3 py-1 rounded-full bg-blue-900/40 text-blue-400 border border-blue-700/40">Pending: {pen}</span>
              </div>
            );
          })()}

          <button
            onClick={(e) => { e.stopPropagation(); setShowCal(o => !o); }}
            className="px-4 py-1.5 rounded-md text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-all flex-shrink-0"
          >
            {showCal ? "Hide Calendar" : "Calendar View"}
          </button>
        </div>
      </div>

      {/* Calendar */}
      {showCal && (
        <div className="border-t border-gray-700 p-4">
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: daysInMonth }, (_, i) => {
              const dayNum = i + 1;
              const [yyyy, mm] = selectedMonth.split("-").map(Number);
              const isFuture = new Date(yyyy, mm - 1, dayNum) > new Date();

              const s = isFuture ? null : getMonthlyStatus(memp, dayNum, selectedMonth, calendarMap);
              const colorClass = isFuture
                ? "bg-gray-700 text-gray-500"
                : s === "grey"
                ? "bg-gray-700/40 text-gray-600"
                : s === "sub"
                ? "bg-green-900/60 text-green-400"
                : s === "del"
                ? "bg-yellow-900/60 text-yellow-400"
                : s === "pending"
                ? "bg-blue-900/60 text-blue-400"
                : "bg-red-900/60 text-red-400";


              return (
                <div
                  key={dayNum}
                  onClick={() => {
                    if (isFuture) return;
                    const s = getMonthlyStatus(memp, dayNum, selectedMonth, calendarMap);
                    if (s === "grey") return;   // ← don't open breakdown for holidays/weekoffs
                    setSelectedDay(dayNum === selectedDay ? null : dayNum);
                  }}
                  title={s === "grey"
                    ? (calendarMap[`${yyyy}-${String(mm).padStart(2,"0")}-${String(dayNum).padStart(2,"0")}`] === "holiday" ? "Holiday" : "Week off")
                    : undefined
                  }
                  className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium cursor-pointer hover:opacity-80 ${colorClass}`}
                >
                  {dayNum}
                </div>
              );
            })}
          </div>

          {/* Day breakdown — agenda + report side by side */}
          {selectedDay && (
            <div className="mt-3 border-t border-gray-700 pt-3 space-y-4">
              <p className="text-xs text-gray-500">Day {selectedDay} — Team breakdown</p>

              {(() => {
                // Build a Date object for the selected day in the current month
                const [yyyy, mm] = selectedMonth.split("-").map(Number);
                const dayDate = new Date(yyyy, mm - 1, selectedDay);

                // Only teams that were active on this exact day
                const activeTeams = memp.teams.filter((t) => isTeamActiveOnDay(t, dayDate));

                if (activeTeams.length === 0) {
                  return <p className="text-xs text-red-400">No active teams on this day</p>;
                }

                return activeTeams.map((t) => {
                  // --- existing rendering of a single team (unchanged) ---
                  const agenda      = t.days?.[String(selectedDay)];
                  const report      = t.report_days?.[String(selectedDay)];
                  const agendaSt    = !agenda ? "mis" : agenda.submit_status === 0 ? "sub" : "del";
                  const am          = STATUS_META[agendaSt];
                  const agendaTime  = agenda?.in_time ? fmtTime(agenda.in_time) : null;
                  const reportTime  = report?.out_time ? fmtTime(report.out_time) : null;
                  const agendaTasks = agenda?.text ?? [];
                  const reportTasks = report?.text ?? [];

                  let reportSt;
                  if (!report) {
                    const today = new Date();
                    const currentDay = today.getDate();

                    if (
                      (t.submit_next_day === "yes" || t.submit_next_day === true || t.submit_next_day === 1) &&
                      (selectedDay === currentDay || selectedDay === currentDay - 1)
                    ) {
                      reportSt = "pending";
                    } else {
                      reportSt = "mis";
                    }
                  } else {
                    reportSt = report.submit_status === 0 ? "sub" : "del";
                  }
                  const rm = STATUS_META[reportSt];

                  return (
                    <div key={t.tec_id} className="space-y-2">
                      <div className="flex gap-2">
                        <p className="text-xs font-medium text-white">{t.team_name || t.tha_id}</p>
                        {t.is_historical && (
                          <span className="text-xs px-3 py-1 rounded-full bg-red-900/40 text-red-400 border border-red-700/40">
                            {t.unlinked_on ? `Team Change ${t.unlinked_on}` : ""}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Agenda */}
                        <div className="bg-gray-800/60 rounded-lg px-4 py-3 border border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Agenda</p>
                            <div className="flex items-center gap-2">
                              {agendaTime && <span className="text-xs text-gray-500">{agendaTime}</span>}
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${am.badgeCls}`}>{am.label}</span>
                            </div>
                          </div>
                          {agendaTasks.length > 0 ? (
                            <ul className="space-y-1">
                              {agendaTasks.map((task, i) => (
                                <li key={task.id || i} className="text-xs text-gray-300 flex gap-2">
                                  <span className="text-gray-600">•</span>
                                  {task.content}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-gray-600">No tasks</p>
                          )}
                        </div>

                        {/* Report */}
                        <div className="bg-gray-800/60 rounded-lg px-4 py-3 border border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Report</p>
                            <div className="flex items-center gap-2">
                              {reportTime && <span className="text-xs text-gray-500">{reportTime}</span>}
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rm.badgeCls}`}>{rm.label}</span>
                            </div>
                          </div>
                          {reportTasks.length > 0 ? (
                            <ul className="space-y-1">
                              {reportTasks.map((task, i) => {
                                const statusMeta =
                                  task.status === "Completed" ? { cls: "bg-green-900/40 text-green-400 border border-green-700/40" } :
                                  task.status === "In Progress" ? { cls: "bg-yellow-900/40 text-yellow-400 border border-yellow-700/40" } :
                                  { cls: "bg-gray-700/50 text-gray-300 border border-gray-600/40" };
                                return (
                                  <li key={task.id || i} className="flex items-center gap-2 text-xs">
                                    <span className="text-gray-600">•</span>
                                    <span className="text-gray-300 flex-1">{task.content}</span>
                                    {task.status && (
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${statusMeta.cls}`}>
                                        {task.status}
                                      </span>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          ) : (
                            <p className="text-xs text-gray-600">No tasks</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      )}

    </div>
  );
}




function EmpCard({ emp, subTab, selectedDate}) {
  const [open, setOpen] = useState(false);

  const teamsToShow =
  subTab === "On Time"  ? emp.teams.filter(t => combinedTeamStatus(t, selectedDate) === "sub")
  : subTab === "Delayed" ? emp.teams.filter(t => combinedTeamStatus(t, selectedDate) === "del")
  : subTab === "Missed"  ? emp.teams.filter(t => combinedTeamStatus(t, selectedDate) === "mis")
  : subTab === "Pending" ? emp.teams.filter(t => combinedTeamStatus(t, selectedDate) === "pending")
  : emp.teams;

  if (teamsToShow.length === 0) return null;

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">

      {/* Header */}
      <div
        className="flex items-center justify-between gap-3 px-5 py-3 cursor-pointer hover:bg-gray-800/40 transition-all"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-indigo-900/60 text-indigo-300 flex items-center justify-center text-xs font-medium flex-shrink-0">
            {initials(emp.name)}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{emp.name}</p>
            <p className="text-xs text-gray-500">{emp.eha_id}</p>
          </div>
        </div>

        

        <span className={`text-gray-500 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </div>

      {/* Expanded — per team agenda + report detail */}
      {open && (
        <div className="border-t border-gray-700 divide-y divide-gray-800">
          {teamsToShow.map((t) => {
            const as_ = agendaStatus(t);
            const am  = STATUS_META[as_];
            const rs  = reportStatus(t,selectedDate);
            const rm  = rs === "pending"
              ? { badgeCls: "bg-blue-900/40 text-blue-400", label: "Pending" }
              : STATUS_META[rs];

            const agendaTime   = t.day_today?.in_time ? fmtTime(t.day_today.in_time) : null;
            const reportTime   = t.report_today?.out_time ? fmtTime(t.report_today.out_time) : null;
            console.log(reportTime)
            const agendaTasks  = t.day_today?.text?.length ?? 0;
            const reportTasks  = t.report_today?.text?.length ?? 0;

            return (
              <div key={t.tec_id} className="px-5 py-4 gap-4">

                {/* Team name */}
                <p className="text-sm font-medium text-white mb-3">
                  {t.team_name || t.tha_id}
                </p>

                <div className="grid grid-cols-2 gap-3">

                  {/* Agenda */}
                  <div className="bg-gray-800/60 rounded-lg px-4 py-3 border border-gray-700">
                    
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-white mb-2 uppercase tracking-wide">Agenda</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-white">
                          {as_ === "mis"
                            ? "No submission"
                            : `Time : ${agendaTime}`}
                        </p>

                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${am.badgeCls}`}
                        >
                          {am.label}
                        </span>
                      </div>
                    </div>

                    {/* Task list */}
                    {t.day_today?.text?.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {t.day_today.text.map((task, i) => (
                          <li key={task.id || i} className="text-xs text-white flex gap-2">
                            <span className="text-white">•</span>
                            {task.content}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Report */}
                  <div className="bg-gray-800/60 rounded-lg px-4 py-3 border border-gray-700">
                  <div className="flex items-center justify-between">
                      <p className="text-xs text-white mb-2 uppercase tracking-wide">Report</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-white">
                          {rs === "mis" ? (
                          <p className="text-xs text-gray-500">No submission</p>
                        ) : rs === "pending" ? (
                          <p className="text-xs text-blue-400">Submitted next day</p>
                        ) : (
                          
                          <p className="text-xs text-white">
                          {as_ === "mis"
                            ? "No submission"
                            : `Time : ${reportTime}`}
                        </p>
                        )}
                        </p>

                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${rm.badgeCls}`}
                        >
                          {rm.label}
                        </span>
                      </div>
                    </div>
                    
                    

                    
                    {/* Report task list */}
                    {t.report_today?.text?.length > 0 && (
                      <ul className="mt-2 space-y-2">
                        {t.report_today.text.map((task, i) => {
                          const statusMeta =
                            task.status === "Completed"
                              ? {
                                  cls: "bg-green-900/40 text-green-400 border border-green-700/40",
                                }
                              : task.status === "In Progress"
                              ? {
                                  cls: "bg-yellow-900/40 text-yellow-400 border border-yellow-700/40",
                                }
                              : {
                                  cls: "bg-gray-700/50 text-gray-300 border border-gray-600/40",
                                };

                          return (
                            <li
                              key={task.id || i}
                              className="flex items-center justify gap-3 text-xs"
                            >
                              <div className="flex items-start gap-2 text-gray-300">
                                <span className="text-gray-500 mt-[1px]">•</span>

                                <span>{task.content}</span>
                              </div>

                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${statusMeta.cls}`}
                              >
                                {task.status}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}



function Tasks_Submission() {
  const [activeTab, setActiveTab]       = useState("Datewise");
  const [subTab, setSubTab]             = useState("All");
  const [searchTerm, setSearchTerm]     = useState("");
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [selectedMonth, setSelectedMonth] = useState(currentYearMonth);
  const [employees, setEmployees]       = useState([]);
  const [memployees,setMemployees]      = useState([])
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [calendarMap, setCalendarMap] = useState({});


  useEffect(() => {
    if (activeTab === "Datewise") fetchForDate(selectedDate);
    if (activeTab === "Monthly") fetchForMonth(selectedMonth)
  }, [activeTab, selectedDate, selectedMonth]);

  const fetchForDate = async (dateStr) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `http://localhost:5000/daily_agendas_all/today?date=${dateStr}`,
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
      console.log("Fetched employees new:", parsed);  

      setEmployees(parsed);
    } catch (e) {
      console.error("Failed to fetch agendas:", e);
      setError("Could not load submissions. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const downloadMonthlyXlsx = async () => {
  try {
    const [yyyy, mm] = selectedMonth.split("-");
    const mm_yy = `${mm}-${yyyy}`;

    const res = await fetch(
      `http://localhost:5000/daily_tasks/monthly/download?month=${mm_yy}`,
      {
        credentials: "include"
      }
    );

    if (!res.ok) {
      throw new Error("Failed to download XLSX");
    }

    const blob = await res.blob();

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `monthly_tasks_${mm_yy}.xlsx`;

    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(url);

  } catch (err) {
    console.error(err);
    console.log("Failed to download XLSX");
  }
};


  const fetchForMonth = async (monthStr)=>{
    setLoading(true)
    setError(null)
    const [yyyy, mm] = monthStr.split("-"); 
    const mm_yy = `${mm}-${yyyy}`;
    console.log("Sending mm_yy:", mm_yy);
    try {
      const res = await fetch(
        `http://localhost:5000/daily_tasks/monthly?month=${mm_yy}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      console.log("Raw monthly data:", data);

      const parsed = (data.employees || []).map((emp) => ({
        ...emp,
        teams: emp.teams.map((t) => ({
          ...t,
        })),
      }));
      console.log("Fetched employees:", parsed);  

      setMemployees(parsed);
      setCalendarMap(data.calendar || {});
      console.log("Monthly employees set:", parsed);
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
  ) {
    return false;
  }

  if (subTab === "On Time")  return emp.teams.some(t => combinedTeamStatus(t, selectedDate) === "sub");
  if (subTab === "Delayed")  return emp.teams.some(t => combinedTeamStatus(t, selectedDate) === "del");
  if (subTab === "Missed")   return emp.teams.some(t => combinedTeamStatus(t, selectedDate) === "mis");
  if (subTab === "Pending")  return emp.teams.some(t => combinedTeamStatus(t, selectedDate) === "pending");

  return true;
});

  const visiblem = memployees.filter((emp) => {
    const term = searchTerm.toLowerCase();
    if (
      term &&
      !emp.eha_id.toLowerCase().includes(term) &&
      !emp.name.toLowerCase().includes(term)
    )
      return false;
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
          {["Datewise", "Monthly"].map((t) => (
            <button
              key={t}
              onClick={() => {
                setActiveTab(t);
                if (t === "Datewise") setSelectedDate(todayStr());
              }}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === t
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {t === "Datewise" ? "Datewise Submissions" : "Monthly Submissions"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {activeTab === "Datewise" && (
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
      {activeTab === "Datewise" && !loading && employees.length > 0 && (
      <DonutChart
        employees={employees}
        subTab={subTab}
        setSubTab={setSubTab}
        selectedDate={selectedDate}
      />
    )}

      {/* Sub-tabs */}
      {activeTab === "Datewise" && (
        <div className="flex gap-3 mb-5">
          {["All", "On Time", "Delayed", "Missed","Pending"].map((s) => (
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
      {activeTab === "Datewise" && (
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
                <EmpCard key={emp.eha_id} emp={emp} subTab={subTab}   selectedDate={selectedDate}/>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "Monthly" && (
        <>
        <div className="flex items-center gap-2 py-3">
          
          <label className="text-sm text-gray-400">
            {fmtDisplayMonth(selectedMonth)}
          </label>
          <input
          type ="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200"
          max={currentYearMonth}
          >
          </input>
           <button
                onClick={() => downloadMonthlyXlsx()}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-purple-600/30 border border-transparent transition-all duration-200 flex items-center gap-2"
              >Download Attendance</button>
        </div>
        {loading ?(
          <div className="text-gray-500 text-sm py-8 text-center">
            Loading submissions for {fmtDisplayMonth(selectedMonth)}
          </div>
        ):error?(
          <div className="bg-gray-900 rounded-xl border border-red-800 p-8 text-center">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={() => fetchForMonth(selectedMonth)}
              className="mt-4 px-4 py-2 bg-gray-800 text-gray-300 text-sm rounded-lg hover:bg-gray-700 transition-all"
            >
              Retry
            </button>
          </div>
        ):(visiblem.length === 0 ?(
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-12 text-center">
            <p className="text-gray-500 text-lg">No employees found</p>
          </div>
        ):(
          
          <div className="space-y-3">
            {activeTab === "Monthly" && !loading && visiblem.length > 0 && (
              <MonthlyBarChart
                memployees={visiblem}
                daysInMonth={getDaysInMonth(selectedMonth)}
                selectedMonth={selectedMonth}
                calendarMap={calendarMap} 
              />
              

            )}
            {visiblem.map((memp) =>(
              <MonthlyEmpCard key={memp.eha_id} memp={memp} daysInMonth={getDaysInMonth(selectedMonth)}
              selectedMonth={selectedMonth}
                selectedDate={selectedDate}
                calendarMap={calendarMap} 
               />
            ))}
          </div>
        ))}
        </>
      )}
    </div>
  );
}

export default Tasks_Submission;