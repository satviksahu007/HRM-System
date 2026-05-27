import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function fmtDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

const today = new Date();

const HR_Performance_Review = () => {
  const navigate = useNavigate();

  // ---------- state ----------
  const [mainTab, setMainTab] = useState("reviewed");         // reviewed | missed
  const [missedSubTab, setMissedSubTab] = useState("leader"); // leader | employee
  const [selectedMonth, setSelectedMonth] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    
    const fetchList = async () => {
      setLoading(true);
      setError(null);
      try {
        const [yyyy, mm] = selectedMonth.split("-");
        const month = `${mm}/${String(yyyy).slice(-2)}`;

        // Determine the correct status parameter
        let status;
        if (mainTab === "reviewed") {
          status = "reviewed";
        } else if (missedSubTab === "leader") {
          status = "missed_leader";
        } else {
          status = "missed_employee";
        }

        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/performance_review/hr_list?month=${month}&status=${status}`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        console.log(data)
        setEmployees(data.employees || []);
      } catch (e) {
        setError("Could not load reviews.");
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, [mainTab, missedSubTab, selectedMonth]);

  // ---------- filter by search ----------
  const visible = employees.filter(emp => {
    const term = searchTerm.toLowerCase();
    return (
      !term ||
      emp.eha_id?.toLowerCase().includes(term) ||
      emp.employee_name?.toLowerCase().includes(term)
    );
  });

  // ---------- UI (the same as before, but now fully connected) ----------
  return (
    <div className="w-full min-h-screen bg-gray-900 p-4 md:p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          HR Performance Reviews
        </h1>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        {/* Left: Tabs */}
        <div className="flex flex-col items-start gap-3">
          {/* Main Tabs */}
          <div className="flex bg-gray-800 rounded-lg p-1 gap-1">
            {[
              { key: "reviewed", label: "Reviewed" },
              { key: "missed", label: "Missed" },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setMainTab(t.key)}
                className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
                  mainTab === t.key
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Missed Sub‑Tabs */}
          {mainTab === "missed" && (
            <div className="flex bg-gray-800 rounded-lg p-1 gap-1">
              {[
                { key: "leader", label: "Missed by Leader" },
                { key: "employee", label: "Missed by Employee" },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setMissedSubTab(t.key)}
                  className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
                    missedSubTab === t.key
                      ? "bg-indigo-600 text-white"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Month & Search */}
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="month"
            value={selectedMonth}
            max={`${today.getFullYear()}-${String(
              today.getMonth() + 1
            ).padStart(2, "0")}`}
            onChange={e => setSelectedMonth(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />

          <div className="relative w-72">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name or code..."
              className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-gray-500 text-sm py-12 text-center">Loading...</div>
      ) : error ? (
        <div className="bg-gray-900 rounded-xl border border-red-800 p-8 text-center">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-gray-800 text-gray-300 text-sm rounded-lg hover:bg-gray-700"
          >
            Retry
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-gray-900 rounded-xl border border-gray-700 p-12 text-center">
          <p className="text-gray-500 text-lg">
            {mainTab === "reviewed"
              ? "No reviewed submissions"
              : missedSubTab === "leader"
              ? "No reports missed by leader"
              : "No employees missed submission"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map(emp => (
            <div
              key={emp.pr_id || emp.eha_id}
              className="bg-gray-900 rounded-xl border border-gray-700 px-5 py-4 flex flex-wrap justify-between gap-4"
            >
              {/* Employee info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-900/60 text-indigo-300 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {emp.employee_name
                    .split(" ")
                    .map(w => w[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{emp.employee_name}</p>
                  <p className="text-xs text-gray-500">{emp.eha_id}</p>
                </div>
              </div>

              {mainTab === "reviewed" && (
                <>
                  <div>
                    <p className="text-xs text-gray-500">Submitted On</p>
                    <p className="text-sm text-white mt-1">{fmtDate(emp.submitted_at)}</p>
                  </div>
                  <div >
                    <p className="text-xs text-gray-500">Team LeadReviewed On</p>
                    <div className="flex gap-2">
                      <p className="text-sm text-white mt-1">{fmtDate(emp.tl_reviewed_at)}</p>
                    <span
                    className={`text-xs px-1 py-1 rounded-full font-medium border ${
                      emp.submit_status === 0
                        ? "bg-green-900/40 text-green-400 border-green-700/40"
                        : "bg-yellow-900/40 text-yellow-400 border-yellow-700/40"
                    }`}
                  >
                    {emp.submit_status === 0
                      ? "On Time"
                      : "Delayed"}
                  </span>
                    </div>
                    
                    
                  </div>
                  <div>
                    
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Avg Points</p>
                    <p className="text-lg font-semibold text-white mt-1">{emp.avg_points}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/Hr_View_Review/${emp.pr_id}`)}
                    className="px-4 py-2 bg-indigo-600 font-medium border border-gray-700 hover:border-gray-500 text-white rounded-lg text-sm transition"
                  >
                    View Review
                  </button>
                </>
              )}

              {mainTab === "missed" && missedSubTab === "leader" && (
                <>
                  <div>
                    <p className="text-xs text-gray-500">Employee Submitted On</p>
                    <p className="text-sm text-white mt-1">{fmtDate(emp.submitted_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Team Lead Deadline</p>
                    <p className="text-sm text-white mt-1">{fmtDate(emp.review_deadline)}</p>
                  </div>
                  <span
                className={`text-xs px-2.5 py-2.5 rounded-full font-medium border ${
                    emp.review_overdue
                    ? "bg-red-900/40 text-red-400 border-red-700/40"
                    : "bg-yellow-900/40 text-yellow-400 border-yellow-700/40"
                }`}
                >
                {emp.review_overdue
                    ? "Missed Due Review"
                    : "Awaiting TL Review"}
                </span>
                </>
              )}

              {mainTab === "missed" && missedSubTab === "employee" && (
                <span className="text-xs px-2.5 py-2.5 rounded-full font-medium bg-red-900/40 text-red-400 border border-red-700/40">
                  Missed Submission
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HR_Performance_Review;
