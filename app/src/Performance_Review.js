import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function fmtDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric"
  });
}

function fmtTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", hour12: true
  });
}

const today = new Date();
const currentMonthYY = `${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getFullYear()).slice(-2)}`;

function Performance_Review() {
  const navigate     = useNavigate();
  const [mainTab, setMainTab] = useState("submitted");
  const [submittedTab, setSubmittedTab] = useState("pending");
  const [subTab, setSubTab]         = useState("pending");
  const [selectedMonth, setSelectedMonth] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`
  );
  const [employees, setEmployees]   = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [deadlineDays, setDeadlineDays] = useState(7);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchList();
  }, [mainTab,submittedTab, selectedMonth]);

  const fetchList = async () => {
    setLoading(true);
    setError(null);
    try {
      const [yyyy, mm] = selectedMonth.split("-");
      const month = `${mm}/${String(yyyy).slice(-2)}`;

      const res = await fetch(
        `http://localhost:5000/performance_review/list?month=${month}&status=${
        mainTab === "submitted"
            ? submittedTab
            : "missed"
        }`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      console.log(data)
      setEmployees(data.employees || []);
      setDeadlineDays(data.review_deadline_days || 7);
    } catch (e) {
      setError("Could not load reviews.");
    } finally {
      setLoading(false);
    }
  };

  const visible = employees.filter(e => {
    const term = searchTerm.toLowerCase();
    return !term ||
      e.eha_id.toLowerCase().includes(term) ||
      e.employee_name.toLowerCase().includes(term);
  });

return (
  <div className="w-full min-h-screen bg-gray-900 p-4 md:p-8">

    {/* Header */}
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-white mb-2">
        Performance Reviews
      </h1>

      <p className="text-gray-400">
        Review submitted performance reports from your team
      </p>
    </div>

    {/* Controls */}
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">

      {/* Left */}
      <div className="flex flex-col items-start gap-3">

        {/* Main Tabs */}
        <div className="flex bg-gray-800 rounded-lg p-1 gap-1">

          {[
            { key: "submitted", label: "Submitted" },
            { key: "missed", label: "Missed" },
          ].map((t) => (
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

        {/* Submitted Tabs */}
        {mainTab === "submitted" && (

          <div className="flex bg-gray-800 rounded-lg p-1 gap-1">

            {[
              { key: "pending", label: "Pending Review" },
              { key: "reviewed", label: "Reviewed" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setSubmittedTab(t.key)}
                className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
                  submittedTab === t.key
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

      {/* Right */}
      <div className="flex items-center gap-3 flex-wrap">

        {/* Month */}
        <input
          type="month"
          value={selectedMonth}
          max={`${today.getFullYear()}-${String(
            today.getMonth() + 1
          ).padStart(2, "0")}`}
          onChange={(e) =>
            setSelectedMonth(e.target.value)
          }
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />

        {/* Search */}
        <div className="relative w-72">

          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
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
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            placeholder="Search by name or code..."
            className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />

        </div>

      </div>

    </div>

    {/* Content */}
    {loading ? (

      <div className="text-gray-500 text-sm py-12 text-center">
        Loading...
      </div>

    ) : error ? (

      <div className="bg-gray-900 rounded-xl border border-red-800 p-8 text-center">

        <p className="text-red-400 text-sm">
          {error}
        </p>

        <button
          onClick={fetchList}
          className="mt-4 px-4 py-2 bg-gray-800 text-gray-300 text-sm rounded-lg hover:bg-gray-700"
        >
          Retry
        </button>

      </div>

    ) : visible.length === 0 ? (

      <div className="bg-gray-900 rounded-xl border border-gray-700 p-12 text-center">

        <p className="text-gray-500 text-lg">
          {mainTab === "missed"
            ? "No missed submissions"
            : submittedTab === "pending"
            ? "No pending reviews"
            : "No reviewed submissions"}
        </p>

      </div>

    ) : (

      <div className="space-y-3">

        {visible.map((emp) => (
            
          mainTab === "missed" ? (

            <div
              key={emp.eha_id}
              className="bg-gray-900 rounded-xl border border-red-900/40 px-5 py-4 flex justify-between gap-4"
            >

              {/* Left */}
              <div className="flex gap-3">

                <div className="w-9 h-9 rounded-full bg-red-900/40 text-red-300 flex items-center justify-center text-xs font-medium flex-shrink-0">
                  {emp.employee_name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>

                <div>
                  <p className="text-sm font-medium text-white">
                    {emp.employee_name}
                  </p>

                  <p className="text-xs text-gray-500">
                    {emp.eha_id}
                  </p>
                </div>

              </div>

              {/* Right */}
              <span className="text-xs px-2.5 py-2.5 rounded-full font-medium bg-red-900/40 text-red-400 border border-red-700/40">
                Missed Submission
              </span>

            </div>

          ) : (

            <div
            key={emp.pr_id}
            className="bg-gray-900 flex flex-col lg:flex-row lg:items-center gap-8"
          >

            <div
              key={emp.pr_id}
              className="w-full bg-gray-900 rounded-xl border border-gray-700 px-5 py-4 flex flex-row items-center justify-between"
            >

              {/* Employee */}
              <div className="flex items-center gap-4">

                <div className="w-10 h-10 rounded-full bg-indigo-900/60 text-indigo-300 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {emp.employee_name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>

                <div>
                  <p className="text-sm font-medium text-white">
                    {emp.employee_name}
                  </p>

                  <p className="text-xs text-gray-500">
                    {emp.eha_id}
                  </p>
                </div>

              </div>

              {/* Submitted */}
              <div>
                <p className="text-xs text-gray-500">
                  Submitted By Employee
                </p>

                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-white">
                    {fmtDate(emp.submitted_at)}
                  </p>

                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
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

              {/* Reviewed */}
              {submittedTab === "reviewed" && (
                <>
                  {emp.tl_reviewed_at && (
                    <div>
                      <p className="text-xs text-gray-500">
                        Reviewed On
                      </p>

                      <p className="text-sm text-white mt-1">
                        {fmtDate(emp.tl_reviewed_at)}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      Review Status
                    </p>

                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                        emp.tl_review_status === 0
                          ? "bg-green-900/40 text-green-400 border-green-700/40"
                          : "bg-yellow-900/40 text-yellow-400 border-yellow-700/40"
                      }`}
                    >
                      {emp.tl_review_status === 0
                        ? "On Time"
                        : "Delayed"}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Avg Points
                    </p>

                    <p className="text-lg font-semibold text-white mt-1">
                      {emp.report_points}
                    </p>
                    
                  </div>
                   <button
                    onClick={() => navigate(`/Hr_View_Review/${emp.pr_id}`)}
                    className="px-4 py-2 bg-indigo-600 font-medium border border-gray-700 hover:border-gray-500 text-white rounded-lg text-sm transition"
                  >
                    View Review
                  </button>
                </>
              )}
              <div>
              {submittedTab === "pending" && (
                  <div className="flex gap-2">
                    <p className="text-xs text-gray-500">
                      Review deadline
                      {emp.overdue ? (

                      <p className="text-sm text-red-400 font-medium">
                        Overdue
                      </p>

                    ) : (

                      <p
                        className={`text-sm font-medium ${
                          emp.days_left <= 2
                            ? "text-red-400"
                            : emp.days_left <= 4
                            ? "text-yellow-400"
                            : "text-green-400"
                        }`}
                      >
                        {emp.days_left} day
                        {emp.days_left !== 1 ? "s" : ""} left
                      </p>
                      

                    )}
                    
                    </p>
                      <button
                onClick={() =>
                  navigate(`/Review_Now/${emp.pr_id}`)
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  submittedTab === "pending"
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                    : "bg-gray-800 border border-gray-700 hover:border-gray-500 text-gray-300"
                }`}
              >
                {submittedTab === "pending"
                  ? "Review Now"
                  : "View Review"}
              </button>
                    
                    

                  </div>
                )}
              </div>

            </div>
            </div>

          )

        ))}
        
      </div>

    )}

  </div>
);

  
}

export default Performance_Review;