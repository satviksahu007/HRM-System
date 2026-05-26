import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

 
const fmtTime = (ts) => {
  if (!ts) return "—";
  const d = new Date(ts);
  if (isNaN(d)) return ts;
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
};
 
const fmtDate = (str) => {
  if (!str) return "—";
  const d = new Date(str);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
 
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
 
 
function StatusBadge({ status }) {
  const map = {
    Submitted:  "bg-green-600/20 text-green-400 border-green-600/30",
    Delayed:    "bg-amber-600/20 text-amber-400 border-amber-600/30",
    Missed:     "bg-red-600/20 text-red-400 border-red-600/30",
    Pending:    "bg-blue-600/20 text-blue-400 border-blue-600/30",
  };
  const dot = {
    Submitted: "bg-green-400",
    Delayed:   "bg-amber-400",
    Missed:    "bg-red-400",
    Pending:   "bg-blue-400",
  };
  const cls = map[status] || "bg-gray-600/20 text-gray-400 border-gray-600/30";
  const d   = dot[status]  || "bg-gray-400";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${d}`} />
      {status}
    </span>
  );
}

function TaskStatusBadge({ status }) {
  const map = {
    completed:   "bg-green-600/20 text-green-400 border-green-600/30",
    inprogress:  "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
  };
  const dot = {
    completed:  "bg-green-400",
    inprogress: "bg-yellow-400",
  };

  const key = status?.toLowerCase().replace(/\s/g, "");
  const cls = map[key] || "bg-gray-600/20 text-gray-400 border-gray-600/30";
  const d   = dot[key] || "bg-gray-400";

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${d}`} />
      {status}
    </span>
  );
}
 
 
function TeamDrawer({ team, date, onClose }) {
  const [employees,setEmployees] = useState([])
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`http://localhost:5000/daily_team_submissions/today?date=${date}&tha_id=${team.tha_id}`,
          {credentials:"include"})
          const data = await res.json()
          setEmployees(data.employees || [])
          console.log(data)
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  },[date,team]);
 
  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-gray-900 border-l border-gray-700 z-50 flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-white">{team.team_name}</h3>
            <p className="text-xs text-indigo-400 mt-1">{team.tha_id} · {fmtDate(date)}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {loading ? (
            <p className="text-gray-500 text-sm text-center py-8">Loading...</p>
          ) : employees.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No submissions found</p>
          ) : (
            employees.map(emp => (
              <div key={emp.eha_id} className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-white">{emp.name}</p>
                    <p className="text-xs text-gray-500">{emp.eha_id}</p>
                  </div>
                </div>
                {emp.teams.map((t) => (
  <div
    key={t.tec_id}
    className="py-4 border-t border-gray-700 first:border-t-0"
  >

    {/* Historical Badge */}
    {t.is_historical && (
      <div className="mb-3">
        <span className="px-2.5 py-1 text-xs rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
          Previous Team
        </span>
      </div>
    )}

    {/* Agenda */}
    <div className="flex items-center gap-3 mb-3">
      <h4 className="text-lg font-semibold text-white">
        Agenda
      </h4>

      <StatusBadge
        status={
          !t.agenda_today
            ? "Missed"
            : t.agenda_today.submit_status === 0
            ? "Submitted"
            : "Delayed"
        }
      />
    </div>

    <div className="space-y-2">
      {t.agenda_today ? (
        <>
          <p className="text-xs text-gray-500">
            Submitted at {fmtTime(t.agenda_today.in_time)}
          </p>

          {t.agenda_today.text?.length > 0 ? (
            t.agenda_today.text.map((task) => (
              <div
                key={task.id}
                className="flex gap-3 bg-gray-900/50 rounded-lg p-3"
              >
                <span className="text-gray-500 mt-0.5">•</span>

                <p className="text-sm text-gray-300">
                  {task.content}
                </p>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-600">
              No tasks
            </p>
          )}
        </>
      ) : (
        <p className="text-xs text-gray-600">
          No submission
        </p>
      )}
    </div>

    {/* Report */}
    <div className="flex items-center gap-3 mt-6 mb-3">
      <h4 className="text-lg font-semibold text-white">
        Report
      </h4>

      <StatusBadge
        status={
          !t.report_today
            ? "Missed"
            : t.report_today.submit_status === 0
            ? "Submitted"
            : "Delayed"
        }
      />
    </div>

    <div className="space-y-2">
      {t.report_today ? (
        <>
          <p className="text-xs text-gray-500">
            Submitted at {fmtTime(t.report_today.out_time)}
          </p>

          {t.report_today.text?.length > 0 ? (
            t.report_today.text.map((task) => (
              <div
                key={task.id}
                className="flex items-start justify-between gap-4 bg-gray-900/50 rounded-lg p-3"
              >
                <div className="flex gap-3">
                  <span className="text-gray-500 mt-0.5">•</span>

                  <p className="text-sm text-gray-300">
                    {task.content}
                  </p>
                </div>

                <TaskStatusBadge status={task.status} />
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-600">
              No tasks
            </p>
          )}
        </>
      ) : (
        <p className="text-xs text-gray-600">
          No submission
        </p>
      )}
    </div>

  </div>
))}
              </div>
            ))
          )}
        </div>

      </div>
    </>
  );

 
  
}





 
function TeamsView() {
  const [teams,        setTeams]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [searchTerm,   setSearchTerm]   = useState("");
  const [teamDrawer ,setTeamDrawer] = useState(null)
 
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res  = await fetch(`http://localhost:5000/my_teams?date=${selectedDate}`, { credentials: "include" });
        const data = await res.json();
        if (res.ok) {
          setTeams(data.teams);
          console.log(data)
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, [selectedDate]);
 
 
  const filteredTeams = teams
  .filter(team =>
    !searchTerm.trim() ||
    team.team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.members.some(m =>
      m.eha_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${m.first_name} ${m.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )
  .map(team => ({
    ...team,
    members: searchTerm.trim()
      ? team.members.filter(m =>
          m.eha_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `${m.first_name} ${m.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : team.members
  }));
 
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400 text-lg">Loading teams...</p>
      </div>
    );
  }
 
  return (
    <div className="w-full min-h-screen bg-gray-900 p-4 md:p-8">
 
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Teams</h1>
            <p className="text-gray-400">View teammates' agenda and daily reports</p>
          </div>
 
          {/* Date picker */}
          <input
            type="date"
            value={selectedDate}
            max={todayStr()}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
        </div>
      </div>
 
      {/* Search */}
      <div className="relative w-full md:w-80 mb-6">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search by name or code..."
          className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
        />
      </div>
 
      {/* Empty state */}
      {teams.length === 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-700 p-12 text-center">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-gray-500 text-lg">You are not part of any team</p>
        </div>
      )}
 
      {/* Teams list */}
      <div className="space-y-4">
        {filteredTeams.map(team => {
          const leaders    = team.members.filter(m => m.role === "Leader");
          const members    = team.members.filter(m => m.role === "Member");
 
          return (
            <div key={team.tha_id} className=" bg-gray-900 rounded-xl border border-gray-700 overflow-hidden transition-all duration-200">
 
              {/* Team Header — clickable to expand */}
                <div className="w-full flex p-4 justify-between gap-4">
                  <div className="text-left">
                    <p className="text-base font-semibold text-white">{team.team_name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <p className="text-xs text-indigo-400">{team.tha_id}</p>
                      <span className="text-gray-600 text-xs">·</span>
                      <p className="text-xs text-gray-500">{team.members.length} member{team.members.length !== 1 ? "s" : ""}</p>
                      <span className="text-gray-600 text-xs">·</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        team.my_link_type === 2
                          ? "bg-purple-600/20 text-purple-400 border border-purple-600/30"
                          : "bg-gray-700 text-gray-400"
                      }`}>
                        {team.my_link_type === 2 ? "Leader" : "Member"}
                      </span>
                    </div>
                    
                  </div>
                  <div>
                    <button
                      className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                      onClick={()=>setTeamDrawer(team)}
                      >
                        View Team Agenda and Reports
                      </button>
                  </div>
                </div>
              
            </div>
          );
        })}
      </div>
 
      {/* Team Drawer */}
      {teamDrawer && (
        <TeamDrawer
          team={teamDrawer}
          date={selectedDate}
          onClose={() => setTeamDrawer(null)}
        />
      )}
    </div>
  );
}

 
function MemberRow({ member, onView }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-200">
      <div className="flex items-center gap-4">
        <div>
          <p className="text-sm font-medium text-white">
            {member.first_name}{member.middle_name ? " " + member.middle_name : ""} {member.last_name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-indigo-400">{member.eha_id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
 
export default TeamsView;