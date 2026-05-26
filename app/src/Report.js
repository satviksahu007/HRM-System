import React, { useState, useEffect } from "react";

function DailyReport() {
  const STATUS = ["Uninitiated", "In Progress", "Completed"];
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const [reportWindow, setReportWindow] = useState(null);
  const [windowLoading, setWindowLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [teamList, setTeamList] = useState([]); // [{ team_name, tec_id }]
  const [loadedTasksByTec, setLoadedTasksByTec] = useState({}); // { [tec_id]: [ { id, content, status, isFromAgenda } ] }
  const [pendingInputsByTec, setPendingInputsByTec] = useState({}); // { [tec_id]: string }
  const [pendingTasksByTec, setPendingTasksByTec] = useState({}); // { [tec_id]: [ { id, content, status } ] }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewData, setViewData] = useState([]); // team‑wise report view
  const [viewLoading, setViewLoading] = useState(false);
  const [showYesterdayModal, setShowYesterdayModal] = useState(false);
  const [yesterdayTasks, setYesterdayTasks] = useState([]);
  const [yesterdayLoading, setYesterdayLoading] = useState(false);
  const [yesterdaySubmitting, setYesterdaySubmitting] = useState(false);
  const [yesterdayTaskInput, setYesterdayTaskInput] = useState("");
  const [submitNextDay, setSubmitNextDay] = useState(false); // normalized boolean
  const [yesterdayLoaded, setYesterdayLoaded] = useState({});
  const [yesterdayPending ,setYesterdayPending] = useState({});
  const [yesterdayInputs ,setYesterdayInputs] = useState(false);
  const [monthStatus, setMonthStatus] = useState({});
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    fetchReportWindow();
    fetchSubmitNextStatus();
    fetchTeamList().then(() => {
    fetchTodayDataForAllTeams();
    });
    fetchMonthStatus(calMonth, calYear);
  }, []);

  useEffect(() => {
      fetchMonthStatus(calMonth, calYear);
    }, [calMonth, calYear]);


  const fetchMonthStatus = async (month, year) => {
    try {
      const res = await fetch(
        `http://localhost:5000/daily_report/monthly_status?month=${month + 1}&year=${year}`,
        {
          credentials: "include",
        }
      );

      const data = await res.json();

      if (res.ok) {
        const map = {};
        data.forEach(d => {
          map[d.date] = d;
        });

        setMonthStatus(map);
      }
    } catch (e) {
      console.log("Failed to fetch month status", e);
    }
  };   

  const fetchTeamList = async () => {
    try {
      const res = await fetch("http://localhost:5000/user_tec_combinations", {
        credentials: "include",
      });
      const data = await res.json();
      const combinations = Array.isArray(data) ? data : data.combinations || [];
      // Deduplicate by team name (first active tec_id)
      const uniqueMap = new Map();
      combinations.forEach(c => {
        if (!uniqueMap.has(c.team_name)) {
          uniqueMap.set(c.team_name, c.tec_id);
        }
      });
      const teams = Array.from(uniqueMap, ([team_name, tec_id]) => ({ team_name, tec_id }));
      setTeamList(teams);
      return teams  
    } catch (e) {
      console.error("Failed to fetch teams", e);
    }
  };

  const fetchTodayDataForAllTeams = async () => {
    setLoading(true);
    setError(null);
    try {
      const [agendaRes, reportRes] = await Promise.all([
        fetch(`http://localhost:5000/daily_agenda_date/team_wise?date=${todayStr}`, { credentials: "include" }),
        fetch(`http://localhost:5000/daily_report/team_wise?date=${todayStr}`, { credentials: "include" })
      ]);
      const agendaData = await agendaRes.json();
      const reportData = await reportRes.json();

      console.log(reportData)
      const merged = {};
      for (const team of agendaData) {
        const tecId = team.tec_id;
        const taskMap = new Map();
        if (team.submitted && team.tasks) {
          team.tasks.forEach(t => {
            taskMap.set(t.id, {
              id: t.id,
              content: t.content,
              status: "Uninitiated",
              isFromAgenda: true,
            });
          });
        }

const reportEntry = reportData.find(r => r.tec_id === tecId);
if (reportEntry && reportEntry.submitted && reportEntry.tasks) {
  reportEntry.tasks.forEach(t => {
    // Try matching by task_id first
    const existing = taskMap.get(t.task_id);
    if (existing) {
      existing.status = t.status;
    } else {
      // Try matching by content to avoid duplicates
      const matchByContent = Array.from(taskMap.values()).find(
        m => m.content === t.content
      );
      if (matchByContent) {
        matchByContent.status = t.status;
      } else {
        // Truly a report-only task
        taskMap.set(t.task_id, {
          id: t.task_id,
          content: t.content,
          status: t.status,
          isFromAgenda: false,
        });
      }
    }
  });
}

        merged[tecId] = Array.from(taskMap.values());
      }

      // Teams that appear only in report (no agenda at all)
      for (const reportEntry of reportData) {
        if (!merged[reportEntry.tec_id] && reportEntry.submitted && reportEntry.tasks) {
          merged[reportEntry.tec_id] = reportEntry.tasks.map(t => ({
            id: t.task_id,
            content: t.content,
            status: t.status,
            isFromAgenda: false,
          }));
        }
      }

      setLoadedTasksByTec(merged);
      setError(null);
    } catch (e) {
      console.error(e);
      setError("Failed to load today's tasks.");
    } finally {
      setLoading(false);
    }
  };

  const fetchReportWindow = async () => {
    setWindowLoading(true);
    try {
      const res = await fetch("http://localhost:5000/report_window_status", {
        credentials: "include",
      });
      const data = await res.json();
      setReportWindow(data);
    } catch (e) {
      console.error("Error fetching report window", e);
    } finally {
      setWindowLoading(false);
    }
  };
  

  const fetchSubmitNextStatus = async () => {
    try {
      const res = await fetch("http://localhost:5000/submit_next_day_status", { credentials: "include" });
      const data = await res.json();
      // Normalize to boolean: 1 or "yes" become true
      setSubmitNextDay(data.submit_next_day == 1 || data.submit_next_day === 'yes');
    } catch (e) {
      console.error(e);
    }
  };

  const removeLoadedTask = (tecId, taskId) => {
  setLoadedTasksByTec(prev => ({
    ...prev,
    [tecId]: prev[tecId].filter(t => t.id !== taskId),
  }));
};

  const updateTaskStatus = (tecId, taskId, newStatus) => {
    setLoadedTasksByTec(prev => ({
      ...prev,
      [tecId]: prev[tecId].map(t => t.id === taskId ? { ...t, status: newStatus } : t),
    }));
  };

  const addPendingTask = (tecId) => {
    const input = (pendingInputsByTec[tecId] || "").trim();
    if (!input) return;
    setPendingTasksByTec(prev => ({
      ...prev,
      [tecId]: [...(prev[tecId] || []), { id: Date.now(), content: input, status: "Uninitiated" }],
    }));
    setPendingInputsByTec(prev => ({ ...prev, [tecId]: "" }));
  };

  const removePendingTask = (tecId, taskId) => {
    setPendingTasksByTec(prev => ({
      ...prev,
      [tecId]: prev[tecId].filter(t => t.id !== taskId),
    }));
  };

  const handleSubmitAll = async () => {
    const allTecIds = new Set([
        ...Object.keys(loadedTasksByTec),
        ...Object.keys(pendingTasksByTec),
    ]);
    const teamsWithTasks = teamList.map(team => {
        const loaded = loadedTasksByTec[team.tec_id] || [];
        const pending = pendingTasksByTec[team.tec_id] || [];
        const allTasks = [...loaded, ...pending].map(t => ({
          task_id: t.id,
          content: t.content,
          status: t.status,
        }));
        return { tec_id: team.tec_id, tasks: allTasks };
      })
      .filter(entry => entry.tasks.length > 0);
    console.log(teamsWithTasks)

    if (teamsWithTasks.length === 0) return;

    setSubmitting(true);
    setSuccess(null);
    try {
      for (const { tec_id, tasks } of teamsWithTasks) {
        const res = await fetch("http://localhost:5000/add_report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            tec_id,
            date: todayStr,
            out_time: new Date().toTimeString().split(" ")[0],
            tasks,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Submission failed");
        }
      }
      setSuccess({
        message: "Report submitted successfully for all teams!"
      });

      setSubmitError("");
      setPendingTasksByTec({});
      fetchTodayDataForAllTeams();
      fetchMonthStatus(calMonth, calYear);
      setTimeout(() => setSuccess(null), 4000);
    }  catch (e) {

      setSuccess(null);
      setSubmitError(e.message || "Failed to submit reports");

    } finally {
      setSubmitting(false);
    }
  };

  const fetchDateReport = async (dateStr) => {
    setViewLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/daily_report/team_wise?date=${dateStr}`, {
        credentials: "include",
      });
      const data = await res.json();
      console.log(data)
      setViewData(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setViewData([]);
    } finally {
      setViewLoading(false);
    }
  };

  const handleDateClick = (dateStr) => {
    if (dateStr > todayStr) return;
    setSelectedDate(dateStr);
    fetchDateReport(dateStr);
  };

  // ---------- yesterday modal ----------
  const getYesterdayStr = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
  };

  const openYesterdayModal = async () => {
  setShowYesterdayModal(true);
  setYesterdayLoading(true);
  setYesterdayLoaded({});
  setYesterdayPending({});
  setYesterdayInputs({});

  const yesterdayStr = getYesterdayStr();
  try {
    // ✅ Fetch BOTH agenda AND report (just like fetchTodayDataForAllTeams does)
    const [agendaRes, reportRes] = await Promise.all([
      fetch(`http://localhost:5000/daily_agenda_date/team_wise?date=${yesterdayStr}`, { credentials: "include" }),
      fetch(`http://localhost:5000/daily_report/team_wise?date=${yesterdayStr}`, { credentials: "include" })
    ]);
    const agendaData = await agendaRes.json();
    const reportData = await reportRes.json();

    const merged = {};

    // Start with agenda tasks
    for (const team of agendaData) {
      const tecId = team.tec_id;
      const taskMap = new Map();
      if (team.submitted && team.tasks) {
        team.tasks.forEach(t => {
          taskMap.set(t.id, {
            id: t.id,
            content: t.content,
            status: "Uninitiated",
            isFromAgenda: true,
          });
        });
      }

      // Overlay report statuses on top
      const reportEntry = reportData.find(r => r.tec_id === tecId);
      if (reportEntry && reportEntry.submitted && reportEntry.tasks) {
        reportEntry.tasks.forEach(t => {
          const existing = taskMap.get(t.task_id);
          if (existing) {
            existing.status = t.status;
          } else {
            const matchByContent = Array.from(taskMap.values()).find(m => m.content === t.content);
            if (matchByContent) {
              matchByContent.status = t.status;
            } else {
              taskMap.set(t.task_id, {
                id: t.task_id,
                content: t.content,
                status: t.status,
                isFromAgenda: false,
              });
            }
          }
        });
      }

      merged[tecId] = Array.from(taskMap.values());
    }

    // Teams that only appear in report (no agenda)
    for (const reportEntry of reportData) {
      if (!merged[reportEntry.tec_id] && reportEntry.submitted && reportEntry.tasks) {
        merged[reportEntry.tec_id] = reportEntry.tasks.map(t => ({
          id: t.task_id,
          content: t.content,
          status: t.status,
          isFromAgenda: false,
        }));
      }
    }

    setYesterdayLoaded(merged);
  } catch (e) {
    console.error(e);
    setSubmitError("Failed to load yesterday's report");
  } finally {
    setYesterdayLoading(false);
  }
};


    

  const updateYesterdayStatus = (uniqueId, newStatus) => {
    setYesterdayTasks(prev => prev.map(t => t.uniqueId === uniqueId ? { ...t, status: newStatus } : t));
  };

  const deleteYesterdayTask = (uniqueId) => {
    setYesterdayTasks(prev => prev.filter(t => t.uniqueId !== uniqueId));
  };
  // Status update for a loaded task
const updateYesterdayLoadedStatus = (tecId, taskId, newStatus) => {
  setYesterdayLoaded(prev => ({
    ...prev,
    [tecId]: prev[tecId].map(t => t.id === taskId ? { ...t, status: newStatus } : t),
  }));
};

// Remove a loaded task (only if it’s not from agenda)
const removeYesterdayLoadedTask = (tecId, taskId) => {
  setYesterdayLoaded(prev => ({
    ...prev,
    [tecId]: prev[tecId].filter(t => t.id !== taskId),
  }));
};

// Add a pending task for a specific team
const addYesterdayPendingTask = (tecId) => {
  const input = (yesterdayInputs[tecId] || "").trim();
  if (!input) return;
  setYesterdayPending(prev => ({
    ...prev,
    [tecId]: [...(prev[tecId] || []), { id: Date.now(), content: input, status: "Uninitiated" }],
  }));
  setYesterdayInputs(prev => ({ ...prev, [tecId]: "" }));
};

// Update status of a pending task
const updateYesterdayPendingStatus = (tecId, taskId, newStatus) => {
  setYesterdayPending(prev => ({
    ...prev,
    [tecId]: prev[tecId].map(t => t.id === taskId ? { ...t, status: newStatus } : t),
  }));
};

// Remove a pending task
const removeYesterdayPendingTask = (tecId, taskId) => {
  setYesterdayPending(prev => ({
    ...prev,
    [tecId]: prev[tecId].filter(t => t.id !== taskId),
  }));
};

  const submitYesterdayReport = async () => {
  setYesterdaySubmitting(true);
  const yesterdayStr = getYesterdayStr();

  // Build payload per team from loaded + pending tasks
  const allTecIds = new Set([
    ...Object.keys(yesterdayLoaded),
    ...Object.keys(yesterdayPending),
  ]);

  const teamsWithTasks = Array.from(allTecIds)
    .map(tec_id => {
      const loaded = yesterdayLoaded[tec_id] || [];
      const pending = yesterdayPending[tec_id] || [];
      const allTasks = [...loaded, ...pending].map(t => ({
        task_id: t.id,
        content: t.content,
        status: t.status,
      }));
      return { tec_id, tasks: allTasks };
    })
    .filter(entry => entry.tasks.length > 0);

  try {
    for (const { tec_id, tasks } of teamsWithTasks) {
      const res = await fetch("http://localhost:5000/add_report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          tec_id,
          date: yesterdayStr,
          out_time: new Date().toTimeString().split(" ")[0],
          tasks,
          is_yesterday: 1
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }
    }
        setSuccess({
      message: "Yesterday's report submitted successfully"
    });

    setSubmitError("");
    setShowYesterdayModal(false);
    // Optionally refresh the main view if the selected date is yesterday
    if (selectedDate === yesterdayStr) fetchDateReport(yesterdayStr);
  } catch (e) {

  setSuccess(null);

  setSubmitError(
    e.message || "Failed to submit yesterday's report"
  );

}
  finally{
        setYesterdaySubmitting(false); // ✅ add this

  }
};

  // ---------- calendar helpers ----------
  const getDaysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (m, y) => new Date(y, m, 1).getDay();
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
  };
  const nextMonth = () => {
    if (calYear === today.getFullYear() && calMonth === today.getMonth()) return;
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
  };

  const renderCalendar = () => {
  const daysInMonth = getDaysInMonth(calMonth, calYear);
  const firstDay = getFirstDayOfMonth(calMonth, calYear);
  const cells = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`e-${i}`} className="w-8 h-8" />);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    const isToday = dateStr === todayStr;
    const isFuture = dateStr > todayStr;
    const isSel = dateStr === selectedDate;

    const dayInfo = monthStatus[dateStr];
    const status = dayInfo?.status;
    const dayType = dayInfo?.day_type;

    const statusStyles = {
      green: "text-green-400 hover:bg-green-600/20",
      yellow: "text-yellow-400 hover:bg-yellow-600/20",
      red: "text-red-400 hover:bg-red-600/20",
      grey: "text-gray-600 cursor-not-allowed",
    };

    const dotColor = {
      green: "bg-green-400",
      yellow: "bg-yellow-400",
      red: "bg-red-400",
      grey: "",
    };

    const isGreyed = status === "grey" || isFuture;

    cells.push(
      <div key={d} className="relative flex flex-col items-center">
        <button
          onClick={() => !isGreyed && handleDateClick(dateStr)}
          disabled={isGreyed}
          title={
            dayType === "holiday"
              ? "Holiday"
              : dayType === "weekoff"
              ? "Weekoff"
              : status === "green"
              ? "All submitted on time"
              : status === "yellow"
              ? "One or more delayed"
              : status === "red"
              ? "Missed submission"
              : ""
          }
          className={`w-8 h-8 text-sm rounded-full transition-colors
            ${isSel ? "bg-indigo-600 text-white font-semibold" : ""}
            ${isToday && !isSel ? "border-2 border-indigo-400 font-semibold" : ""}
            ${!isSel && !isGreyed && status ? statusStyles[status] : ""}
            ${isGreyed && !isSel ? "text-gray-600 cursor-not-allowed" : ""}
          `}
        >
          {d}
        </button>

        {!isGreyed && !isSel && status && dotColor[status] && (
          <span
            className={`w-1 h-1 rounded-full mt-0.5 ${dotColor[status]}`}
          />
        )}
      </div>
      
    );
  }

  return cells;
};



  const hasAnyTasks = Object.values(loadedTasksByTec).some(arr => arr?.length > 0) ||
                      Object.values(pendingTasksByTec).some(arr => arr?.length > 0);

  return (
    <div className="w-full min-h-screen bg-gray-900 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Daily Work Report</h1>
          {windowLoading ? (
            <p className="text-gray-500 text-sm">Checking report window...</p>
          ) : reportWindow ? (
            <div className="flex items-center gap-3">
              <span className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full
                ${reportWindow.is_open
                  ? "bg-green-600/20 text-green-400 border border-green-600/30"
                  : "bg-red-600/20 text-red-400 border border-red-600/30"}`}>
                <span className={`w-2 h-2 rounded-full ${reportWindow.is_open ? "bg-green-400" : "bg-red-400"}`} />
                {reportWindow.is_open ? "Window Open" : "Window Closed"}
              </span>
              <span className="text-gray-500 text-sm">
                {reportWindow.window_start} – {reportWindow.window_end}
              </span>
              <button
                onClick={fetchReportWindow}
                className="text-gray-600 hover:text-gray-400 text-xs underline transition-colors"
              >
                Refresh
              </button>
            </div>
          ) : null}
        </div>
        {success && (
  <div className="flex items-center gap-2 bg-green-600/20 border border-green-600/30 text-green-400 px-4 py-3 rounded-lg mb-4 text-sm font-medium">
    <span>✅</span>
    {success.message}
  </div>
)}

{/* Error */}
{submitError && (
  <div className="flex items-center gap-2 bg-red-600/20 border border-red-600/30 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm font-medium">
    <span>❌</span>
    {submitError}
  </div>
)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT – Per‑team report cards */}
        <div className="lg:col-span-2 space-y-6">
          {loading && <p className="text-gray-500 text-sm">Loading tasks...</p>}
          {error && !loading && (
            <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

    


          {teamList.map(team => {
            const tecId = team.tec_id;
            const loaded = loadedTasksByTec[tecId] || [];
            const pending = pendingTasksByTec[tecId] || [];
            const totalCount = loaded.length + pending.length;

            return (
              <div key={tecId} className="bg-gray-900 rounded-xl border border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  {team.team_name}
                  {totalCount > 0 && (
                    <span className="bg-indigo-600/20 text-indigo-400 text-xs px-2.5 py-0.5 rounded-full ml-2">
                      {totalCount}
                    </span>
                  )}
                </h2>

                {/* Loaded tasks (from agenda / existing report) */}
                {loaded.length > 0 && (
                  <ul className="space-y-2 mb-4">
                    {loaded.map((t, idx) => (
                  <li key={t.id} className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500 w-6">{idx + 1}</span>
                      <span className="text-gray-200">{t.content}</span>
                    </div>
                    <div className="flex gap-3 items-center">
                      <select
                        value={t.status}
                        onChange={(e) => updateTaskStatus(tecId, t.id, e.target.value)}
                        className="text-xs px-2 py-1 bg-gray-900 border border-gray-600 rounded-full text-gray-300"
                      >
                        {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {/* DELETE BUTTON – only local state */}
                      {!t.isFromAgenda && (
                        <button
                          onClick={() => removeLoadedTask(tecId, t.id)}
                          className="text-red-400 hover:text-red-300 text-xs font-bold"
                        >
                          ✕
                      </button>
                      )}
                    </div>
                  </li>
                ))}
                  </ul>
                )}

                {/* Manual task input */}
                <div className="flex gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="Add manual task..."
                    value={pendingInputsByTec[tecId] || ""}
                    onChange={(e) => setPendingInputsByTec(prev => ({ ...prev, [tecId]: e.target.value }))}
                    onKeyPress={(e) => e.key === "Enter" && addPendingTask(tecId)}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => addPendingTask(tecId)}
                    disabled={!(pendingInputsByTec[tecId] || "").trim()}
                    className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>

                {/* Pending manual tasks */}
                {pending.length > 0 && (
                  <ul className="space-y-2">
                    {pending.map((t, idx) => (
                      <li key={t.id} className="flex items-center justify-between bg-yellow-600/10 border border-yellow-600/30 rounded-lg px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500 w-6">{idx + loaded.length + 1}</span>
                          <span className="text-gray-200">{t.content}</span>
                        </div>
                        <div className="flex gap-3">
                          <select
                            value={t.status}
                            onChange={(e) => {
                              setPendingTasksByTec(prev => ({
                                ...prev,
                                [tecId]: prev[tecId].map(pt => pt.id === t.id ? { ...pt, status: e.target.value } : pt),
                              }));
                            }}
                            className="text-xs px-2 py-1 bg-gray-900 border border-gray-600 rounded-full text-gray-300"
                          >
                            {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <button
                            onClick={() => removePendingTask(tecId, t.id)}
                            className="text-red-400 hover:text-red-300 font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {totalCount === 0 && (
                  <p className="text-gray-500 text-sm">No agenda for today. Add manual tasks above.</p>
                )}
              </div>
            );
          })}

          {/* Submit All Button */}
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
            
            <button
              onClick={handleSubmitAll}
              disabled={submitting || !hasAnyTasks}
              className="w-full px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Submitting All Teams...
                </>
              ) : "Submit All Reports"}
            </button>
          </div>

          
        </div>

        {/* RIGHT – Calendar & yesterday button */}
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-1.5 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors">◀</button>
              <span className="text-white font-semibold">{monthNames[calMonth]} {calYear}</span>
              <button
                onClick={nextMonth}
                disabled={calYear === today.getFullYear() && calMonth === today.getMonth()}
                className="p-1.5 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors disabled:opacity-30"
              >▶</button>
            </div>
            <div className="grid grid-cols-7 mb-2">
              {dayNames.map((d) => (
                <div key={d} className="text-center text-xs text-gray-500 font-medium">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-1 place-items-center">
              {renderCalendar()}
            </div>
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-700">
              {[
                { color: 'bg-green-400',  label: 'All submitted on time' },
                { color: 'bg-yellow-400', label: 'One or more delayed' },
                { color: 'bg-red-400',    label: 'Missed submission' },
                { color: 'bg-gray-600',   label: 'Holiday / Weekoff / Future' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span className={`w-2 h-2 rounded-full ${color}`} />
                  {label}
                </div>
              ))}
            </div>
          </div>
          {/* FIXED: use boolean condition */}
          {submitNextDay && (
            <button
              onClick={openYesterdayModal}
              className="w-full px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add Yesterday's Work Report
            </button>
          )}
          {/* Past date view (team‑wise) */}
          {selectedDate && (
            <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="text-indigo-400">📅</span>
                {new Date(selectedDate + "T00:00:00").toDateString()}
              </h3>

              {viewLoading && <p className="text-gray-500 text-sm">Loading...</p>}
              {!viewLoading && viewData.length === 0 && (
                <p className="text-gray-500 text-sm">No reports found for this date.</p>
              )}

              {!viewLoading && viewData.map((teamReport, idx) => (
                <div key={idx} className="mb-4 last:mb-0 bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-indigo-400 font-medium text-sm">
                      {teamReport.team_name}
                    </span>
                    {teamReport.submitted ? (
                      <>
                        <span className="text-xs text-gray-400">
                          Out: {teamReport.out_time?.split(" ")[1] || teamReport.out_time}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ml-2 ${
                          teamReport.submit_status === 1
                            ? "bg-red-600/20 text-red-400 border-red-600/30"
                            : "bg-green-600/20 text-green-400 border-green-600/30"
                        }`}>
                          {teamReport.submit_status === 1 ? "Delayed" : "On time"}
                      </span>
                      </>
                    ) : (
                      <span className="text-xs text-red-400/70">No report submitted</span>
                    )}
                  </div>
                  {teamReport.submitted && teamReport.tasks.length > 0 && (
                    <ul className="space-y-1">
                      {teamReport.tasks.map(t => (
                        <li key={t.task_id} className="flex justify-between bg-gray-900 border border-gray-700 rounded-lg px-3 py-2">
                          <span className="text-sm text-gray-300">{t.content}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                            ${
                              t.status === "Completed"
                                ? "bg-green-600/20 text-green-400 border border-green-600/30"
                                : t.status === "In Progress"
                                ? "bg-yellow-600/20 text-yellow-400 border border-yellow-600/30"
                                : "bg-gray-600/20 text-gray-400 border border-gray-600/30"
                            }`}
                          >
                            {t.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Yesterday modal (team-aware, unique keys) */}
      {showYesterdayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Yesterday's Work Report</h2>
              <button onClick={() => setShowYesterdayModal(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
  {yesterdayLoading ? (
    <p className="text-gray-400">Loading yesterday's tasks...</p>
  ) : (
    teamList.map(team => {
      const tecId = team.tec_id;
      const loaded = yesterdayLoaded[tecId] || [];
      const pending = yesterdayPending[tecId] || [];
      const totalCount = loaded.length + pending.length;

      return (
        <div key={tecId} className="bg-gray-900 rounded-xl border border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            {team.team_name}
            {totalCount > 0 && (
              <span className="bg-indigo-600/20 text-indigo-400 text-xs px-2.5 py-0.5 rounded-full">
                {totalCount}
              </span>
            )}
          </h3>

          {/* Loaded tasks */}
          {loaded.length > 0 && (
            <ul className="space-y-2 mb-4">
              {loaded.map((t, idx) => (
                <li key={t.id} className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 w-6">{idx + 1}</span>
                    <span className="text-gray-200">{t.content}</span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <select
                      value={t.status}
                      onChange={(e) => updateYesterdayLoadedStatus(tecId, t.id, e.target.value)}
                      className="text-xs px-2 py-1 bg-gray-900 border border-gray-600 rounded-full text-gray-300"
                    >
                      {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {!t.isFromAgenda && (
                      <button
                        onClick={() => removeYesterdayLoadedTask(tecId, t.id)}
                        className="text-red-400 hover:text-red-300 text-xs font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Add manual task */}
          <div className="flex gap-3 mb-3">
            <input
              type="text"
              placeholder="Add a task for yesterday..."
              value={yesterdayInputs[tecId] || ""}
              onChange={(e) => setYesterdayInputs(prev => ({ ...prev, [tecId]: e.target.value }))}
              onKeyPress={(e) => e.key === "Enter" && addYesterdayPendingTask(tecId)}
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500"
            />
            <button
              onClick={() => addYesterdayPendingTask(tecId)}
              disabled={!(yesterdayInputs[tecId] || "").trim()}
              className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              Add
            </button>
          </div>

          {/* Pending tasks */}
          {pending.length > 0 && (
            <ul className="space-y-2">
              {pending.map((t, idx) => (
                <li key={t.id} className="flex items-center justify-between bg-yellow-600/10 border border-yellow-600/30 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 w-6">{idx + loaded.length + 1}</span>
                    <span className="text-gray-200">{t.content}</span>
                  </div>
                  <div className="flex gap-3">
                    <select
                      value={t.status}
                      onChange={(e) => updateYesterdayPendingStatus(tecId, t.id, e.target.value)}
                      className="text-xs px-2 py-1 bg-gray-900 border border-gray-600 rounded-full text-gray-300"
                    >
                      {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button
                      onClick={() => removeYesterdayPendingTask(tecId, t.id)}
                      className="text-red-400 hover:text-red-300 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {totalCount === 0 && (
            <p className="text-gray-500 text-sm">No agenda for yesterday. Add tasks above.</p>
          )}
        </div>
      );
    })
  )}
</div>

            <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
              <button onClick={() => setShowYesterdayModal(false)} className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg">Cancel</button>
              <button
                onClick={submitYesterdayReport}
                disabled={
                    yesterdaySubmitting ||
                    (
                    Object.values(yesterdayLoaded).every(arr => !arr || arr.length === 0) &&
                    Object.values(yesterdayPending).every(arr => !arr || arr.length === 0)
                    )
                }
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
                >
                {yesterdaySubmitting ? "Submitting..." : "Submit Yesterday's Report"}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DailyReport;