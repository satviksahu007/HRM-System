import React, { useState, useEffect } from "react";

function Work_Agenda() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(null);
  const [windowInfo, setWindowInfo] = useState(null);
  const [windowLoading, setWindowLoading] = useState(false);
  const today    = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear]   = useState(today.getFullYear());
  const [selectedDate, setSelectedDate]   = useState(null);
  const [viewData, setViewData]           = useState(null); 
  const [viewLoading, setViewLoading]     = useState(false);
  const [deletingId, setDeletingId]       = useState(null);
  const [teamList, setTeamList]       = useState([]); 
  const [tasksByTec, setTasksByTec]   = useState({});  
  const [teamInputs, setTeamInputs]   = useState({});   
  const [monthCalendar, setMonthCalendar] = useState({});
  const [monthStatus, setMonthStatus] = useState({});
  const [loadedAgendaByTec, setLoadedAgendaByTec] = useState({});
  const [pendingAgendaByTec, setPendingAgendaByTec] = useState({}); 

  useEffect(() => {
    fetchWindowStatus();
    fetchTeamList();
    fetchTodayAgenda();

    if (selectedDate === todayStr) {
      fetchDateTasks(todayStr);
    }

    fetchMonthStatus(today.getMonth(), today.getFullYear());
  }, []);

  useEffect(() => {
    fetchMonthStatus(calMonth, calYear);
  }, [calMonth, calYear]);


  const fetchMonthStatus = async (month, year) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/daily_agenda/monthly_status?month=${month + 1}&year=${year}`,
        { credentials: "include" ,
        }
      );
      const data = await res.json();
      if (res.ok) {
        const map = {};
        data.forEach(d => { map[d.date] = d; });
        setMonthStatus(map);
      }
    } catch (e) {
      console.log("Failed to fetch month status", e);
    }
  };


  const fetchWindowStatus = async () => {
    setWindowLoading(true);
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/window_status`, { 
        method: "GET",
        credentials: "include" });
      const data = await res.json();
      setWindowInfo(data);
    } catch (e) {
      console.log("ERROR", e);
    } finally {
      setWindowLoading(false);
    }
  };

  const fetchTeamList = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/user_tec_combinations`, {
        credentials: "include",
      });
      const data = await res.json();
      const combinations = Array.isArray(data) ? data : data.combinations || [];

      const uniqueMap = new Map();
      combinations.forEach(c => {
        if (!uniqueMap.has(c.team_name)) {
          uniqueMap.set(c.team_name, c.tec_id);
        }
      });
      const teams = Array.from(uniqueMap, ([team_name, tec_id]) => ({ team_name, tec_id }));
      setTeamList(teams);
    } catch (e) {
      console.log("Failed to fetch teams", e);
    }
  };

  const handleTeamInputChange = (tec_id, value) => {
    setTeamInputs(prev => ({ ...prev, [tec_id]: value }));
  };

  const addTaskForTeam = (tec_id) => {
    const input = (teamInputs[tec_id] || "").trim();
    if (!input) return;                         // NO NULL / empty
    setTasksByTec(prev => ({
      ...prev,
      [tec_id]: [...(prev[tec_id] || []), { taskid: Date.now(), content: input }]
    }));
    setTeamInputs(prev => ({ ...prev, [tec_id]: "" }));
  };

  const removeTaskFromTeam = (tec_id, taskid) => {
    setTasksByTec(prev => ({
      ...prev,
      [tec_id]: prev[tec_id].filter(t => t.taskid !== taskid)
    }));
  };

  const handleSubmitAll = async () => {
    const tecIdsWithTasks = Object.entries(tasksByTec)
      .filter(([_, tasks]) => tasks.length > 0)
      .map(([tec_id, tasks]) => ({ tec_id, tasks }));

    if (tecIdsWithTasks.length === 0) return;

    setSubmitting(true);
    setSuccess(null);

    try {
      for (const { tec_id, tasks } of tecIdsWithTasks) {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/daily_agenda/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ tec_id, tasks }),
        });
        if (!res.ok) {
          const data = await res.json();
          fetchDateTasks(todayStr);
          throw new Error(data.error || "Submission failed");
        }
      }
      fetchTodayAgenda();
      fetchMonthStatus(calMonth, calYear);
      const newTasksByTec = { ...tasksByTec };
      tecIdsWithTasks.forEach(({ tec_id }) => { newTasksByTec[tec_id] = []; });
      setTasksByTec(newTasksByTec);
      setSuccess({ status: "on-time" });
      setTimeout(() => setSuccess(null), 4000);
      if (selectedDate === todayStr) fetchDateTasks(todayStr);
    } catch (e) {
      console.log(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchTodayAgenda = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/daily_agenda_date/team_wise?date=${todayStr}`,
        { credentials: "include" }
      );

      const data = await res.json();

      const grouped = {};

      data.forEach(team => {
        grouped[team.tec_id] = team.tasks || [];
      });

      setLoadedAgendaByTec(grouped);
    } catch (e) {
      console.log("error", e);
      setLoadedAgendaByTec({});
    }
  };






  const fetchDateTasks = async (dateStr) => {
    setViewLoading(true);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/daily_agenda_date/team_wise?date=${dateStr}`,
        { credentials: "include" }
      );

      const data = await res.json();

      const grouped = {};

      data.forEach(team => {
        grouped[team.tec_id] = team.tasks || [];
      });

      setViewData(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log("error", e);
      setLoadedAgendaByTec({});
    } finally {
      setViewLoading(false);
    }
  };



  const handleDateClick = (dateStr) => {
    if (dateStr > todayStr) return;
    setSelectedDate(dateStr);
    fetchDateTasks(dateStr);
  };

  const handleDeleteTask = async (taskId, tecId) => {   // add tecId parameter
  setDeletingId(taskId);
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/delete_task`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ date: selectedDate, task_id: taskId, tec_id: tecId }),
    });
    const data = await res.json();
    if (res.ok) {
      fetchDateTasks(selectedDate);   // refresh
      fetchTodayAgenda();


    } else {
      setSuccess(null);

      setSuccess({
        status: "error",
        message: data.error || "Delete failed"
      });
    }
  } catch (e) {
    console.log("error", e);
  } finally {
    setDeletingId(null);
  }
};

  const getDaysInMonth   = (m, y) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (m, y) => new Date(y, m, 1).getDay();
  const monthNames = ["January","February","March","April","May","June",
                      "July","August","September","October","November","December"];
  const dayNames   = ["Su","Mo","Tu","We","Th","Fr","Sa"];

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
    const firstDay    = getFirstDayOfMonth(calMonth, calYear);
    const cells       = [];

    for (let i = 0; i < firstDay; i++)
      cells.push(<div key={`e-${i}`} className="w-8 h-8" />);

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr  = `${calYear}-${String(calMonth + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      const isToday  = dateStr === todayStr;
      const isFuture = dateStr > todayStr;
      const isSel    = dateStr === selectedDate;
      const dayInfo  = monthStatus[dateStr];
      const status   = dayInfo?.status;
      const dayType  = dayInfo?.day_type;

      // status ring color when not selected
      const statusStyles = {
        green:  'text-green-400 hover:bg-green-600/20',
        yellow: 'text-yellow-400 hover:bg-yellow-600/20',
        red:    'text-red-400 hover:bg-red-600/20',
        grey:   'text-gray-600 cursor-not-allowed',
      };

      // dot color below date
      const dotColor = {
        green:  'bg-green-400',
        yellow: 'bg-yellow-400',
        red:    'bg-red-400',
        grey:   '',
      };

      const isGreyed = status === 'grey' || isFuture;

      cells.push(
        <div key={d} className="relative flex flex-col items-center">
          <button
            onClick={() => !isGreyed && handleDateClick(dateStr)}
            disabled={isFuture || status === 'grey'}
            title={
              dayType === 'holiday' ? 'Holiday' :
              dayType === 'weekoff' ? 'Weekoff' :
              status === 'green'   ? 'All submitted on time' :
              status === 'yellow'  ? 'Some delayed' :
              status === 'red'     ? 'Missed submissions' : ''
            }
            className={`w-8 h-8 text-sm rounded-full transition-colors
              ${isSel    ? "bg-indigo-600 text-white font-semibold" : ""}
              ${isToday && !isSel ? "border-2 border-indigo-400 font-semibold" : ""}
              ${!isSel && !isGreyed && status ? statusStyles[status] : ""}
              ${isGreyed && !isSel ? "text-gray-600 cursor-not-allowed" : ""}
            `}
          >{d}</button>

          {/* status dot — skip grey and future */}
          {!isGreyed && !isSel && status && dotColor[status] && (
            <span className={`w-1 h-1 rounded-full mt-0.5 ${dotColor[status]}`} />
          )}
        </div>
      );
    }
    return cells;
  };

  const hasAnyTasks = Object.values(tasksByTec).some(arr => arr && arr.length > 0);

  return (
    <div className="w-full min-h-screen bg-gray-900 p-4 md:p-8">

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Daily Work Agenda</h1>

          {/* Window status */}
          {windowLoading ? (
            <p className="text-gray-500 text-sm">Checking window...</p>
          ) : windowInfo ? (
            <div className="flex items-center gap-3">
              <span className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full
                ${windowInfo.is_open
                  ? "bg-green-600/20 text-green-400 border border-green-600/30"
                  : "bg-red-600/20 text-red-400 border border-red-600/30"}`}>
                <span className={`w-2 h-2 rounded-full ${windowInfo.is_open ? "bg-green-400" : "bg-red-400"}`} />
                {windowInfo.is_open ? "Window Open" : "Window Closed"}
              </span>
              <span className="text-gray-500 text-sm">
                {windowInfo.window_start} – {windowInfo.window_end}
              </span>
              <button
                onClick={fetchWindowStatus}
                className="text-gray-600 hover:text-gray-400 text-xs underline transition-colors"
              >
                Refresh
              </button>
            </div>
          ) : null}
        </div>
        {success && (
  <div
    className={`flex items-center gap-2 px-4 py-3 rounded-lg mb-4 border text-sm font-medium ${
      success.status === "on-time"
        ? "bg-green-600/20 border-green-600/30 text-green-400"
        : success.status === "error"
        ? "bg-red-600/20 border-red-600/30 text-red-400"
        : "bg-yellow-600/20 border-yellow-600/30 text-yellow-400"
    }`}
  >
    <span>
      {success.status === "on-time"
        ? "✅"
        : success.status === "error"
        ? "❌"
        : "⚠️"}
    </span>

    {success.message ||
      (success.status === "on-time"
        ? "All tasks submitted successfully"
        : "Something went wrong")}
  </div>
)}
      </div>
      {(() => {
  const todayCalendar = monthCalendar[todayStr];
  if (!todayCalendar) return null;

  if (todayCalendar.day_type === 'holiday') {
    return (
      <div className="flex items-center gap-2 mt-3 px-4 py-2.5 rounded-xl bg-red-600/10 border border-red-600/20 text-red-400 text-sm w-fit">
        <span className="w-2 h-2 rounded-full bg-red-400" />
        Today is a Holiday
        {todayCalendar.holiday_name && (
          <span className="text-red-300 font-medium">— {todayCalendar.holiday_name}</span>
        )}
      </div>
    );
  }

  if (todayCalendar.day_type === 'weekoff') {
    return (
      <div className="flex items-center gap-2 mt-3 px-4 py-2.5 rounded-xl bg-gray-700/50 border border-gray-600 text-gray-300 text-sm w-fit">
        <span className="w-2 h-2 rounded-full bg-gray-400" />
        Today is a Weekoff
      </div>
    );
  }

  return null;
})()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT – All teams & tasks */}
        <div className="lg:col-span-2 space-y-6">
          {teamList.length === 0 && (
            <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 text-gray-400">
              Loading teams...
            </div>
          )}
            
{teamList.map(team => {
  const loadedTasks = loadedAgendaByTec?.[team.tec_id] || [];
  const pendingTasks = tasksByTec?.[team.tec_id] || [];

  return (
    <div
      key={team.tec_id}
      className="bg-gray-900 rounded-xl border border-gray-700 p-6"
    >
      
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        {team.team_name}

        {(loadedTasks.length + pendingTasks.length) > 0 && (
          <span className="bg-indigo-600/20 text-indigo-400 text-xs px-2.5 py-0.5 rounded-full ml-2">
            {loadedTasks.length + pendingTasks.length}
          </span>
        )}
      </h2>

      {/* Already submitted tasks */}
      {loadedTasks.length > 0 && (
        <ul className="space-y-2 mb-4">
          {loadedTasks.map((t, idx) => (
            <li
              key={t.id}
              className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-6">
                  {idx + 1}
                </span>

                <span className="text-gray-200">
                  {t.content}
                </span>
              </div>

              {windowInfo?.is_open && (
                <button
                  onClick={() =>
                    handleDeleteTask(t.id, team.tec_id)
                  }
                  disabled={deletingId === t.id}
                  className="text-red-500 hover:text-red-400 text-xs font-bold disabled:opacity-40"
                >
                  {deletingId === t.id ? "..." : "✕"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Add task input */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Enter task..."
          value={teamInputs[team.tec_id] || ""}
          onChange={(e) =>
            handleTeamInputChange(team.tec_id, e.target.value)
          }
          onKeyPress={(e) =>
            e.key === "Enter" && addTaskForTeam(team.tec_id)
          }
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />

        <button
          onClick={() => addTaskForTeam(team.tec_id)}
          disabled={!(teamInputs[team.tec_id] || "").trim()}
          className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          Add
        </button>
      </div>

      {/* Pending tasks */}
      {pendingTasks.length > 0 && (
        <ul className="space-y-2">
          {pendingTasks.map((t, idx) => (
            <li
              key={t.taskid}
              className="flex items-center justify-between bg-yellow-600/10 border border-yellow-600/30 rounded-lg px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-6">
                  {idx + loadedTasks.length + 1}
                </span>

                <span className="text-gray-200">
                  {t.content}
                </span>
              </div>

              <button
                onClick={() =>
                  removeTaskFromTeam(team.tec_id, t.taskid)
                }
                className="text-red-400 hover:text-red-300 font-bold"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {loadedTasks.length === 0 &&
        pendingTasks.length === 0 && (
          <p className="text-gray-500 text-sm">
            No agenda tasks yet.
          </p>
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
              ) : "Submit All"}
            </button>
          </div>
        </div>

        {/* RIGHT – Calendar */}
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
              { color: 'bg-yellow-400', label: 'One or more submitted late' },
              { color: 'bg-red-400',    label: 'One or more missed submission' },
              { color: 'bg-gray-600',   label: 'Holiday / Weekoff / Future' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className={`w-2 h-2 rounded-full ${color}`} />
                {label}
              </div>
            ))}
          </div>
          </div>
          {selectedDate && (
            <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
              <h3 className="text-white font-semibold mb-4">
                {new Date(selectedDate + "T00:00:00").toDateString()}
              </h3>

              {viewLoading && <p className="text-gray-500 text-sm">Loading...</p>}

              {!viewLoading && viewData.length === 0 && (
                <p className="text-gray-500 text-sm">No teams found or no data.</p>
              )}

              {!viewLoading && viewData.length > 0 && viewData.map((teamAgenda, idx) => (
                <div key={idx} className="mb-4 last:mb-0 bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-indigo-400 font-medium text-sm">
                      {teamAgenda.team_name}
                    </span>
                    {teamAgenda.submitted ? (
                      <>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          teamAgenda.submit_status === 0
                            ? "bg-green-600/20 text-green-400 border border-green-600/30"
                            : "bg-yellow-600/20 text-yellow-400 border border-yellow-600/30"
                        }`}>
                          {teamAgenda.submit_status === 0 ? "On-time" : "Delayed"}
                        </span>
                        <span className="text-xs text-gray-400">
                          {teamAgenda.in_time?.split(" ")[1] || teamAgenda.in_time}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-red-400/70">No agenda submitted</span>
                    )}
                  </div>

                  {teamAgenda.submitted && teamAgenda.tasks.length > 0 && (
                    <ul className="space-y-1 mt-2">
                      {teamAgenda.tasks.map((t) => (
                        <li key={t.id} className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600">{t.id}</span>
                            <span className="text-xs text-gray-300">{t.content}</span>
                          </div>
                          
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
    </div>
  );
}

export default Work_Agenda;
