import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const rolesAndDepartments1 = [
  { id: "hr", name: "HR", value: 1 },
  { id: "emp", name: "Employee", value: 2 },
  { id: "tl", name: "Team Leader", value: 3 },
  { id: "dir",name: "Director",value: 4}
];
const rolesAndDepartments2 = [
  { id: "hr", name: "HR", value: 1 },
  { id: "tl", name: "Team Leader", value: 3 },
  { id: "dir", name: "Director", value: 4 },
];

function Manage_Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("General");
  
  // State for General Settings (current only)
  const [generalSettings, setGeneralSettings] = useState(null);
  const [loadingGeneral, setLoadingGeneral] = useState(true);
  
  // State for Special Approvals (all)
  const [specialApprovals, setSpecialApprovals] = useState([]);
  const [loadingSpecial, setLoadingSpecial] = useState(true);
  const [specialFilter, setSpecialFilter] = useState("active")
  
  // State for Q&A Questions
  const [questions, setQuestions] = useState([]);
  const [loadingQA, setLoadingQA] = useState(true);
  
  // Error states
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [actionError, setActionError] = useState("");
  
  // Helper: Format time (HH:MM)
  const formatTime = (time) => {
    if (!time) return "—";
    const parts = time.split(":");
    if (parts.length < 2) return time;
    const hours = parts[0].padStart(2, "0");
    const mins = parts[1].padStart(2, "0");
    return `${hours}:${mins}`;
  };
  
  // Helper: Format date
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString('en-IN');
    } catch {
      return dateString;
    }
  };
  
  // Helper: Determine status of a special approval based on valid_from and valid_till
  const getStatus = (validFrom, validTill) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fromDate = validFrom ? new Date(validFrom) : null;
    const tillDate = validTill ? new Date(validTill) : null;
    
    if (!fromDate) return "Unknown";
    if (tillDate && tillDate < today) return "Expired";
    if (fromDate > today) return "Upcoming";
    return "Active";
  };
  const handleDeleteQuestion = async (question) => {
  try {
    const res = await fetch(`http://localhost:5000/qa/questions/${question.id || question.hqa_id}`, {
      method: "DELETE",
      credentials: "include"
    });
    const data = await res.json();
    if (res.ok) {

      setSuccess({
        message: "Question deleted successfully"
      });

      setActionError("");

      fetchQAQuestions();

    } else {

      setSuccess(null);
      setActionError(data.message || "Delete failed");

    }
    } catch (err) {
    console.error(err);
    alert("Error deleting question");
  }
};
  

  const fetchGeneralSettings = async () => {
    setLoadingGeneral(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:5000/hr-settings?type=present&for=general`, {
        credentials: "include"
      });
      const data = await res.json();
      console.log(data)
      if (res.ok) {
        // Expecting an array, take the first (current) item
        if (data.settings && data.settings.length > 0) {
          setGeneralSettings(data.settings[0]);
        } else {
          setGeneralSettings(null);
        }
      } else {
        throw new Error(data.message || "Failed to fetch general settings");
      }
    } catch (e) {
      console.error("Fetch general error:", e);
      setError("Failed to load general settings");
    }
    setLoadingGeneral(false);
  };
  
  // Fetch all Special Approvals (present, upcoming, old combined)
  const fetchAllSpecialApprovals = async () => {
    setLoadingSpecial(true);
    setError(null);
    try {
      const types = ["present", "upcoming", "old"];
      const allResults = await Promise.all(
        types.map(async (type) => {
          const res = await fetch(`http://localhost:5000/hr-settings?type=${type}&for=special`, {
            credentials: "include"
          });
          const data = await res.json();
          if (res.ok) {
            return data.settings || [];
          }
          return [];
        })
      );
      

      // Combine and deduplicate by hsa_id (if any duplicates across types)
      const combined = allResults.flat();
      const uniqueMap = new Map();
      combined.forEach(item => {
        if (item.hsa_id && !uniqueMap.has(item.hsa_id)) {
          uniqueMap.set(item.hsa_id, item);
        }
      });
      const uniqueApprovals = Array.from(uniqueMap.values());
      // Sort by valid_from (newest first) or hsa_id
      uniqueApprovals.sort((a, b) => (b.hsa_id || 0) - (a.hsa_id || 0));
      setSpecialApprovals(uniqueApprovals);
    } catch (e) {
      console.error("Fetch special approvals error:", e);
      setError("Failed to load special approvals");
    }
    setLoadingSpecial(false);
  };

  const handleDeleteSpecial = async (item) => {
  
  setLoadingSpecial(true);
  try {
    const res = await fetch(`http://localhost:5000/hr-settings/special/${item.hsa_id}`, {
      method: "DELETE",
      credentials: "include"
    });
    const data = await res.json();
    if (res.ok) {

      setSuccess({
        message: "Special approval deleted successfully"
      });

      setActionError("");

      fetchAllSpecialApprovals();

    } else {

      setSuccess(null);
      setActionError(data.message || "Failed to delete");

    }
    } catch (err) {

  console.error("Delete error:", err);

  setSuccess(null);
  setActionError("Error deleting special approval");

}
  setLoadingSpecial(false);
};
  
  // Fetch Q&A Questions
  const fetchQAQuestions = async () => {
    setLoadingQA(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:5000/qa/questions", {
        credentials: "include"
      });
      const data = await res.json();
      console.log(data)
      if (res.ok) {
        setQuestions(data.questions || []);
      } else {
        throw new Error(data.message || "Failed to fetch questions");
      }
    } catch (e) {
      console.error("Fetch QA error:", e);
      setError("Failed to load Q&A questions");
    }
    setLoadingQA(false);
  };
  
  // Initial data load
  useEffect(() => {
    fetchGeneralSettings();
    fetchAllSpecialApprovals();
    fetchQAQuestions();
  }, []);
  
  
  
  // Loading and error display
  if (error && !generalSettings && specialApprovals.length === 0 && questions.length === 0) {
    return (
      <div className="w-full min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 text-center">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <button
            onClick={() => {
              fetchGeneralSettings();
              fetchAllSpecialApprovals();
              fetchQAQuestions();
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  // Style constants
  const sectionClass = "bg-gray-900 rounded-xl p-6";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";
  
  return (
    <div className="w-full min-h-screen bg-gray-900 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">HR Settings</h1>
        <p className="text-gray-400">Manage General, Special Approval & Q&A Settings</p>
      </div>

      {/* Success */}
{success && (
  <div className="flex items-center gap-2 px-4 py-3 rounded-lg mb-4 border text-sm font-medium bg-green-600/20 border-green-600/30 text-green-400">
    <span>✅</span>
    {success.message}
  </div>
)}

{/* Error */}
{actionError && (
  <div className="flex items-center gap-2 px-4 py-3 rounded-lg mb-4 border text-sm font-medium bg-red-600/20 border-red-600/30 text-red-400">
    <span>❌</span>
    {actionError}
  </div>
)}
      
      {/* Tabs */}
      <div className="flex bg-gray-800 rounded-lg p-1 mb-6 w-fit">
        {["General", "Special Approval", "Q&A"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-md text-sm font-medium capitalize transition-all duration-200 ${
              activeTab === tab
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      
      {/* ==================== GENERAL TAB ==================== */}
      {activeTab === "General" && (
        <div className={sectionClass}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              Current General Settings
            </h2>
            <button
              onClick={()=>navigate("/Create_General_Settings")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 text-l font-medium flex items-center gap-2"
            >
            Create New
            </button>
          </div>
          
          {loadingGeneral ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : !generalSettings ? (
            <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-700">
              <p className="text-gray-500">No active general settings found</p>
              <p className="text-gray-600 text-sm mt-2">Click "Create General Settings" to add one</p>
            </div>
          ) : (
            <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
              <div className="p-5 space-y-4">
                {/* Time ranges row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-3 ">
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide">Daily Agenda Time</p>
                    <p className="text-gray-200 font-medium mt-1">
                      {formatTime(generalSettings.daily_agenda_start)} - {formatTime(generalSettings.daily_agenda_end)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide">Daily Report Time</p>
                    <p className="text-gray-200 font-medium mt-1">
                      {formatTime(generalSettings.daily_report_start)} - {formatTime(generalSettings.daily_report_end)}
                    </p>
                  </div>
                </div>
                
                {/* Other settings row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-3">
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide">Submit Report Next Day</p>
                    <p className="text-gray-200 font-medium mt-1 capitalize">
                      {generalSettings.submit_next_day === 1 ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide">Performance Report Window</p>
                    <p className="text-gray-200 font-medium mt-1">
                      {generalSettings.perform_verify_start && generalSettings.perform_verify_end
                        ? `${generalSettings.perform_verify_start} - ${generalSettings.perform_verify_end}`
                        : "—"}
                    </p>
                  </div>
                </div>
                
                {/* Review days and validity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide">Review Period</p>
                    <p className="text-gray-200 font-medium mt-1">
                      Within {generalSettings.perform_verification || "—"} days
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide">Valid From</p>
                    <p className="text-gray-200 font-medium mt-1">{generalSettings.valid_from}</p>
                    
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* ==================== SPECIAL APPROVAL TAB ==================== */}
      {activeTab === "Special Approval" && (
  <div className={sectionClass}>
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-lg font-semibold text-white">Special Approvals</h2>
      <button onClick={()=>navigate("/Create_Special_Approvals_Settings")} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
        Create New
      </button>
    </div>

    {/* Toggle between Active and Upcoming */}
    <div className="flex bg-gray-800 rounded-lg p-1 mb-6 w-fit">
      <button
        onClick={() => setSpecialFilter("active")}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
          specialFilter === "active" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-gray-200"
        }`}
      >
        Active
      </button>
      <button
        onClick={() => setSpecialFilter("upcoming")}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
          specialFilter === "upcoming" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-gray-200"
        }`}
      >
        Upcoming
      </button>
    </div>

    {loadingSpecial ? (
      <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-b-2 border-indigo-500 rounded-full" /></div>
    ) : (
      (() => {
        // Filter specialApprovals by the selected status (active/upcoming)
        const filtered = specialApprovals.filter(item => {
          const status = getStatus(item.valid_from, item.valid_till);
          if (specialFilter === "active") return status === "Active";
          return status === "Upcoming";
        });

        if (filtered.length === 0) {
          return (
            <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-700">
              <p className="text-gray-500">No {specialFilter} special approvals found.</p>
              <p className="text-gray-600 text-sm mt-2">Click "Create Special Approval" to add one.</p>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            {filtered.map((item) => {
              const status = getStatus(item.valid_from, item.valid_till);
              const employeeName = item.first_name && item.last_name 
                ? `${item.first_name} ${item.last_name}` 
                : "";
              return (
                <div key={item.hsa_id} className="bg-gray-900 rounded-lg border border-gray-700 p-4">
                  <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-indigo-400 text-xl  ">{item.first_name}</span>
                      <span className="text-gray-500">|</span>
                      <span className="text-white font-medium">{item.eha_id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10 "
                      onClick={()=>handleDeleteSpecial(item)}
                      >
                      Delete</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div><p className="text-gray-500 text-xs">Early Agenda</p><p className="text-gray-200">{formatTime(item.early_agenda_submit)}</p></div>
                    <div><p className="text-gray-500 text-xs">Late Agenda</p><p className="text-gray-200">{formatTime(item.late_agenda_submit)}</p></div>
                    <div><p className="text-gray-500 text-xs">Early Report</p><p className="text-gray-200">{formatTime(item.early_report_submit)}</p></div>
                    <div><p className="text-gray-500 text-xs">Late Report</p><p className="text-gray-200">{formatTime(item.late_report_submit)}</p></div>
                    <div><p className="text-gray-500 text-xs">Submit Report Next Day</p><p className="text-gray-200 capitalize">{item.submit_next_day}</p></div>
                    <div><p className="text-gray-500 text-xs">Valid From</p><p className="text-gray-200">{formatDate(item.valid_from)}</p></div>
                    <div><p className="text-gray-500 text-xs">Valid Till</p><p className="text-gray-200">{formatDate(item.valid_till) || "Ongoing"}</p></div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()
    )}
  </div>
)}
      
      {/* ==================== Q&A TAB ==================== */}
      {activeTab === "Q&A" && (
        <div className={sectionClass}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              Q&A Questions
            </h2>
            <button
              onClick={()=>navigate("/Create_Qna_Settings")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 text-l font-medium flex items-center gap-2"
            >
              Create New
            </button>
          </div>
          
          {loadingQA ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-700">
              <p className="text-gray-500">No questions found</p>
              <p className="text-gray-600 text-sm mt-2">Click "Create Question" to add one</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, idx) => {
                // Determine question type label
                let typeLabel = "Unknown";
                let typeColor = "bg-gray-700 text-gray-300";
                if (q.question_type === 1) {
                  typeLabel = "Descriptive";
                  typeColor = "bg-blue-900/50 text-blue-400";
                } else if (q.question_type === 3) {
                  typeLabel = "Selection";
                  typeColor = "bg-green-900/50 text-green-400";
                } else if (q.question_type === 2) {
                  typeLabel = "Radio (Deprecated)";
                  typeColor = "bg-yellow-900/50 text-yellow-400";
                }
                
                // Parse asking_to
                let askToNames = [];
                if (q.asking_to) {
                  const askValues = typeof q.asking_to === 'string' ? q.asking_to.split(',') : q.asking_to;
                  askToNames = askValues.filter(Boolean).map(v => 
                    rolesAndDepartments1.find(r => r.value.toString() === v.toString().trim())?.name
                  ).filter(Boolean);
                }
                
                // Parse viewable_by
                let visibleToNames = [];
                if (q.viewable_by) {
                  const viewValues = typeof q.viewable_by === 'string' 
                    ? q.viewable_by.split(',') 
                    : q.viewable_by;
                  visibleToNames = viewValues
                    .filter(Boolean)
                    .map(v => {
                      const num = typeof v === 'string' ? parseInt(v.trim()) : v;
                      return rolesAndDepartments2.find(r => r.value === num)?.name;
                    })
                    .filter(Boolean);
                }

                // Then when displaying, you can use:
                // visibleToNames.length ? visibleToNames.join(', ') : 'None'
                
                // Parse selection options
                
                return (
  <div key={q.id || q.hqa_id || idx} className="bg-gray-900 rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-all">
    {/* Header row: # + question title (indigo semibold) + delete button */}
    <div className="flex flex-wrap items-baseline justify-between gap-3 mb-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-indigo-400 text-sm font-mono">#{idx + 1}</span>
        <span className="text-indigo-300 font-semibold">{q.question}</span>
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColor}`}>
        {typeLabel}
      </span>
      </div>
      <button
        onClick={() => handleDeleteQuestion(q)}
        className="px-3 py-1.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors"
      >
        Delete
      </button>
    </div>


            {/* Metadata row: ask to, visible to, options/max length */}
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-300">
          <div className="flex flex-col gap-1">
            <span>
              <span className="inline-block bg-gray-600 text-white text-xs font-medium px-2 py-0.5 rounded mr-1">
                Ask To
              </span>
              {askToNames.length > 0 ? askToNames.join(", ") : "None"}
            </span>
            <span>
              <span className="inline-block bg-gray-600 text-white text-xs font-medium px-2 py-0.5 rounded mr-1">
                Visible To
              </span>
              {visibleToNames.length > 0 ? visibleToNames.join(", ") : "None"}
            </span>
          </div>

          {typeLabel === "Selection" && q.selection_option && (
            <span>
              <span className="inline-block bg-gray-600 text-white text-xs font-medium px-2 py-0.5 rounded mr-1">
                Options
              </span>
              {
                (Array.isArray(q.selection_option)
                  ? q.selection_option
                  : String(q.selection_option).split(',').filter(Boolean).map(s => s.trim())
                ).join(', ')
              }
            </span>
          )}

                {typeLabel === "Descriptive" && q.length_of_desc && (
                  <span><span className="inline-block bg-gray-600 text-white text-xs font-medium px-2 py-0.5 rounded mr-1">
                    Max Length
              </span>{q.length_of_desc} chars</span>
                )}
                <span><span className="inline-block bg-gray-600 text-white text-xs font-medium px-2 py-0.5 rounded mr-1">
                Cycle Every
              </span>{q.ask_every_x_days} days</span>
              </div>
            </div>
          );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Manage_Settings;