import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";


const Performance_Report = () => {
  // Initial empty row arrays
  const emptyTask = { description: "", completed: "Yes", comments: "" };
  const emptyProject = { projectName: "", workedAs: "", workedWith: "", workingFrom: "" };
  const navigate = useNavigate();
  const emptyGoal = { description: "", targetDate: "" };
  const [success, setSuccess]       = useState(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    employeeName: "",
    project: "",
    reportingManager: "",
    designation: "",
    reviewMonth: "",
    reviewDate: "",
    selfRating: "",
    skillDevelopment: "",
  });

  const [majorTasks, setMajorTasks] = useState([{ ...emptyTask }]);
  const [assignedProjects, setAssignedProjects] = useState([{ ...emptyProject }]);
  const [challenges, setChallenges] = useState([""]);
  const [goals, setGoals] = useState([{ ...emptyGoal }]);
  const location = useLocation();
  const [prefill, setPrefill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [windowLoading, setWindowLoading] = useState(false);
  const [windowInfo, setWindowInfo] = useState(null);
  const scrollContainerRef = useRef(null);

  const [errors, setErrors] = useState({});
  const debounceTimers = useRef({});


  const fetchWindowStatus = async () => {
    setWindowLoading(true);
    try {
      const res  = await fetch(`http://localhost:5000/window_status_performance`, { 
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

  const debounce = (key, value, delay = 500) => {
    if (debounceTimers.current[key]) {
      clearTimeout(debounceTimers.current[key]);
    }
    debounceTimers.current[key] = setTimeout(() => {
      validateField(key, value);
    }, delay);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" }); // fallback
    }
    let hasErrors = false;

    const requiredFields = [
      "selfRating",
      "skillDevelopment"
    ];

    for (const field of requiredFields) {
      const error = validateField(field, formData[field]);
      if (error) hasErrors = true;
    }

    const tasksValid = validateMajorTasks();
    const challengesValid = validateChallenges();
    const goalsValid = validateGoals();

    if (!tasksValid || !challengesValid || !goalsValid) {
      hasErrors = true;
    }
    if (hasErrors) return;
      const payload = {
      self_rating: Number(formData.selfRating),   // ensure it's a number
      skill_development: formData.skillDevelopment,
      major_tasks: majorTasks,
      challenges: challenges,
      goals: goals,
    };


    try {
      console.log(JSON.stringify(payload))
      const res = await fetch("http://localhost:5000/performance_report/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.error?.includes("already submitted")) {
        setAlreadySubmitted(true);
        setError("");
        setSuccess(null);
      }
      else if (res.ok) {
        cleanData()
        setSuccess({
          status: data.submit_status === 0 ? "on-time" : "delayed"
        });

        setAlreadySubmitted(false);
        setError("");
      }
      else {
        setError(data.error || "Something went wrong");
        setSuccess(null);
        setAlreadySubmitted(false);
      }
    } catch (error) {
      console.log("Error:", error);
    }
  };

   




  useEffect(() => {
    fetchWindowStatus();
    const fetchPrefill = async () => {
        try {
          const res = await fetch("http://localhost:5000/performance_report/prefill", {
            credentials: "include",
          }); 
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed to load data");
          }
          const data = await res.json();
          setPrefill(data);
          console.log(data)
        } catch (error) {

          console.log("Error:", error);

          setSuccess(null);
          setAlreadySubmitted(false);
          setError("Failed to submit performance report");

        } finally {
          setLoading(false);
        }
      };
      fetchPrefill();
    }, [navigate]);
    


  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "employeeName":
      case "project":
      case "reportingManager":
      case "skillDevelopment":
        if (!value.trim()) error = "Please enter N/A if not applicable";
        break;

      case "selfRating":
        if (!value) error = "Self-rating is required";
        else if (isNaN(value) || value < 1 || value > 10) error = "Must be 1-10";
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const validateMajorTasks = () => {
    const taskErrors = majorTasks.map((task, index) => {
      if (!task.description.trim()) {
        return "Task description is required";
      }
      return "";
    });

    const hasErrors = taskErrors.some(error => error !== "");
    setErrors((prev) => ({ ...prev, majorTasks: taskErrors }));
    return !hasErrors;
  };

  const validateChallenges = () => {
    const challengeErrors = challenges.map((challenge, index) => {
      if (!challenge.trim()) {
        return "Challenge description is required";
      }
      return "";
    });

    const hasErrors = challengeErrors.some(error => error !== "");
    setErrors((prev) => ({ ...prev, challenges: challengeErrors }));
    return !hasErrors;
  };

  const validateGoals = () => {
    const goalErrors = goals.map((goal) => {
      const errors = {};

      if (!goal.description.trim()) {
        errors.description = "Goal description is required";
      }

      if (!goal.targetDate.trim()) {
        errors.targetDate = "Target date is required";
      }

      return errors;
    });

    const hasErrors = goalErrors.some(
      (error) => Object.keys(error).length > 0
    );
    setErrors((prev) => ({ ...prev, goals: goalErrors }));
    return !hasErrors;
  };

  // Generic handler for simple fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    debounce(name, value);
  };

  // Major Tasks handlers
  const handleTaskChange = (index, field, value) => {
    const updated = [...majorTasks];
    updated[index][field] = value;
    setMajorTasks(updated);
    
    // Trigger validation after a short delay
    setTimeout(() => {
      validateMajorTasks();
    }, 500);
  };
  const addTaskRow = () => {
    setMajorTasks([...majorTasks, { ...emptyTask }]);
    // Trigger validation after adding a new row
    setTimeout(() => {
      validateMajorTasks();
    }, 100);
  };
  const removeTaskRow = (index) => {
    if (majorTasks.length > 1) {
      setMajorTasks(majorTasks.filter((_, i) => i !== index));
      // Trigger validation after removing a row
      setTimeout(() => {
        validateMajorTasks();
      }, 100);
    }
  };



  // Assigned Projects handlers
  const handleProjectChange = (index, field, value) => {
    const updated = [...assignedProjects];
    updated[index][field] = value;
    setAssignedProjects(updated);

  };
  const addProjectRow = () => setAssignedProjects([...assignedProjects, { ...emptyProject }]);
  const removeProjectRow = (index) => {
    if (assignedProjects.length > 1) {
      setAssignedProjects(assignedProjects.filter((_, i) => i !== index));
    }
  };

  // Challenges handlers
  const handleChallengeChange = (index, value) => {
    const updated = [...challenges];
    updated[index] = value;
    setChallenges(updated);
    
    // Trigger validation after a short delay
    setTimeout(() => {
      validateChallenges();
    }, 500);
  };
  const addChallenge = () => {
    setChallenges([...challenges, ""]);
    // Trigger validation after adding a new challenge
    setTimeout(() => {
      validateChallenges();
    }, 100);
  };
  const removeChallenge = (index) => {
    if (challenges.length > 1) {
      setChallenges(challenges.filter((_, i) => i !== index));
      // Trigger validation after removing a challenge
      setTimeout(() => {
        validateChallenges();
      }, 100);
    }
  };

  // Goals handlers
  const handleGoalChange = (index, field, value) => {
    const updated = [...goals];
    updated[index][field] = value;
    setGoals(updated);
    
    // Trigger validation after a short delay
    setTimeout(() => {
      validateGoals();
    }, 500);
  };
  const addGoalRow = () => {
    setGoals([...goals, { ...emptyGoal }]);
    // Trigger validation after adding a new goal
    setTimeout(() => {
      validateGoals();
    }, 100);
  };
  const removeGoalRow = (index) => {
    if (goals.length > 1) {
      setGoals(goals.filter((_, i) => i !== index));
      // Trigger validation after removing a goal
      setTimeout(() => {
        validateGoals();
      }, 100);
    }
  };

  const cleanData = () => {
    setFormData({
      employeeName: "",
      project: "",
      reportingManager: "",
      designation: "",
      reviewMonth: "",
      reviewDate: "",
      selfRating: "",
      skillDevelopment: "",
    });
    setMajorTasks([{ ...emptyTask }]);
    setAssignedProjects([{ ...emptyProject }]);
    setChallenges([""]);
    setGoals([{ ...emptyGoal }]);
    setErrors({});
  };

  const blockNumbers = (e) => {
    if (/\d/.test(e.key)) {
      e.preventDefault();
    }
  };
  const blockSpecialExceptComma = (e) => {
  if (["Backspace", "Delete", "Tab", "Escape", "Enter"].includes(e.key) || e.key.startsWith("Arrow")) {
    return;
  }
  if (!/[a-zA-Z0-9,]/.test(e.key)) {
    e.preventDefault();
  }
};

  const blockLetters = (e) => {
    // Allow control keys
    if (["Backspace", "Delete", "Tab", "Escape", "Enter"].includes(e.key) || e.key.startsWith("Arrow")) {
      return;
    }
    // Block anything that's not a digit
    if (!/\d/.test(e.key)) {
      e.preventDefault();
    }
  };

  const blockSpecialChars = (e) => {
    if (!/[a-zA-Z0-9\s]/.test(e.key) && !["Backspace", "Delete", "Tab", "Escape", "Enter"].includes(e.key) && !e.key.startsWith("Arrow")) {
      e.preventDefault();
    }
  };

  // Styling (consistent with reference)
  const inputClass = (name) =>
    `w-full px-4 py-2.5 bg-gray-900 border rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all duration-200 ${
      errors[name] ? "border-red-500" : "border-gray-700"
    }`;
  const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";
  const requiredStar = <span className="text-red-400">*</span>;

  const tableHeaderClass = "px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider";
  const tableCellClass = "px-4 py-2";

  


  if (loading) {
  return (
    <div className="w-full min-h-screen bg-gray-900 flex items-center justify-center text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p className="text-xl">Loading your details…</p>
      </div>
    </div>
  );
}

  if (!prefill) {
  return (
    <div className="w-full min-h-screen bg-gray-900 flex items-center justify-center text-white">
      <div className="text-center">
        <p className="text-xl mb-4">Could not load your performance data.</p>
        <button onClick={() => navigate("/")} className="px-4 py-2 bg-indigo-600 rounded-lg">
          Go back
        </button>
      </div>
    </div>
  );
}

  return (
    <div className="w-full min-h-screen bg-gray-900 p-4 md:p-8">
      {/* Header */}
      <div ref={scrollContainerRef} className="gap-5 mb-8" >
        <h1 className="text-2xl font-bold text-white">Performance Report</h1>
        <div className="mt-3">
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
                {windowInfo.window_start} – {windowInfo.window_end} of each month
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
              {(success || alreadySubmitted || error) && (
      <div className="bg-gray-900 rounded-xl  mt-4">

        {/* Success */}
        {success && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg mb-4 border text-sm font-medium ${
            success.status === "on-time"
              ? "bg-green-600/20 border-green-600/30 text-green-400"
              : "bg-yellow-600/20 border-yellow-600/30 text-yellow-400"
          }`}>
            <span>{success.status === "on-time" ? "✅" : "⚠️"}</span>
            {success.status === "on-time"
              ? "Performance report submitted successfully"
              : "Performance report submitted successfully (Delayed Submission)"}
          </div>
        )}

        {/* Already Submitted */}
        {alreadySubmitted && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg mb-4 border text-sm font-medium bg-blue-600/20 border-blue-600/30 text-blue-400">
            <span>ℹ️</span>
            Performance report already submitted for this month
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg mb-4 border text-sm font-medium bg-red-600/20 border-red-600/30 text-red-400">
            <span>❌</span>
            {error}
          </div>
        )}

      </div>
    )}
        

        
      </div>
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Your Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-400">Employee Name</span>
            <p className="text-white font-medium">{prefill.employee_name}</p>
          </div>
          <div>
            <span className="text-sm text-gray-400">Project</span>
            {prefill.assigned_projects.map((proj,idx)=>(
              <p key={idx} className="text-white font-medium">{proj.projectName}</p>
            ))}
          </div>
          <div>
            <span className="text-sm text-gray-400">Reporting Manager</span>
            <p className="text-white font-medium">{prefill.reporting_manager}</p>
          </div>
          <div>
            <span className="text-sm text-gray-400">Review Month</span>
            <p className="text-white font-medium">{prefill.review_month}</p>
          </div>
          <div>
            <span className="text-sm text-gray-400">Review Date</span>
            <p className="text-white font-medium">{prefill.review_date}</p>
          </div>
        </div>

        {prefill.assigned_projects?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-md font-semibold text-white mb-2">Assigned Projects</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-800 text-gray-400">
                  <tr>
                    <th className="px-4 py-2 text-left">Project Name</th>
                    <th className="px-4 py-2 text-left">Designation</th>
                    <th className="px-4 py-2 text-left">Worked With</th>
                    <th className="px-4 py-2 text-left">Working From</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {prefill.assigned_projects.map((proj, idx) => (
                    <tr key={idx} className="text-gray-300">
                      <td className="px-4 py-2">{proj.projectName}</td>
                      <td className="px-4 py-2">{proj.workedAs}</td>
                      <td className="px-4 py-2">{proj.workedWith}</td>
                      <td className="px-4 py-2">{proj.workingFrom}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <form className="space-y-6" noValidate>
      

        {/* Major Tasks Completed */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Major Task Completed / Worked {requiredStar}</h2>
            <button
              type="button"
              onClick={addTaskRow}
              className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
            >
              + Add Task
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className={tableHeaderClass}>Sr. No.</th>
                  <th className={tableHeaderClass}>Major Task's description </th>
                  <th className={tableHeaderClass}>Completed (Yes / No)</th>
                  <th className={tableHeaderClass}></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {majorTasks.map((task, index) => (
                  <tr key={index}>
                    <td className={tableCellClass + " text-gray-300"}>{index + 1}</td>
                    <td className={tableCellClass}>
                      <input
                        type="text"
                        name="majorTasks"
                        value={task.description}
                        onChange={(e) => handleTaskChange(index, "description", e.target.value)}
                        className={`w-full px-4 py-2.5 bg-gray-900 border rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all duration-200 ${
                          errors.majorTasks && errors.majorTasks[index]
                            ? "border-red-500"
                            : "border-gray-700"
                        }`}
                        placeholder="Describe task"
                      />
                      {errors.majorTasks && errors.majorTasks[index] && <p className="text-red-400 text-xs mt-1">{errors.majorTasks[index]}</p>}
                    </td>
                    <td className={tableCellClass}>
                      <select
                        value={task.completed}
                        onChange={(e) => handleTaskChange(index, "completed", e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all duration-200"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </td>
                    <td className={tableCellClass}>
                      {majorTasks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTaskRow(index)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        

        {/* Self-Evaluation */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-6">Self-Evaluation</h2>

          {/* Self-Rating */}
          <div className="mb-6">
            <label className={labelClass}>
              Overall Self-Rating (1 = Poor, 10 = Outstanding) {requiredStar}
            </label>
            <input
              type="number"
              min="1"
              max="10"
              name="selfRating"
              value={formData.selfRating}
              onChange={handleChange}
              className={`${inputClass("selfRating")} w-32`}
              placeholder="1-10"
              max='10'
              onKeyDown={(e)=>{blockLetters(e)}}
            />
            {errors.selfRating && <p className="text-red-400 text-xs mt-1">{errors.selfRating}</p>}
          </div>

          {/* Challenges Faced */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className={labelClass}>Challenges Faced {requiredStar}</label>
              <button
                type="button"
                onClick={addChallenge}
                className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition"
              >
                + Add Challenge
              </button>
            </div>
            {challenges.map((challenge, index) => (
              <div key={index} className="flex items-start gap-2 mb-2">
                <span className="text-gray-400 mt-2">{index + 1})</span>
                <div className="flex-1">
                  <input
                    type="text"
                    value={challenge}
                    onChange={(e) => handleChallengeChange(index, e.target.value)}
                    className={`w-full px-4 py-2.5 bg-gray-900 border rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all duration-200 ${
                      errors.challenges && errors.challenges[index]
                        ? "border-red-500"
                        : "border-gray-700"
                    }`}
                    placeholder="Describe challenge"
                  />
                  {errors.challenges && errors.challenges[index] && <p className="text-red-400 text-xs mt-1">{errors.challenges[index]}</p>}
                </div>
                {challenges.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeChallenge(index)}
                    className="text-red-400 hover:text-red-300 text-sm mt-2"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Skill Development */}
          <div>
            <label className={labelClass}>Skill Development & Learning (New Skills / Tools / Technologies Learned) {requiredStar} </label>
            <textarea
              name="skillDevelopment"
              value={formData.skillDevelopment}
              onChange={handleChange}
              className={`w-full h-24 px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all duration-200 ${
                          errors.skillDevelopment && errors.skillDevelopment
                            ? "border-red-500"
                            : "border-gray-700"
                        }`}
              placeholder="Describe new skills, tools, or technologies..."
              onKeyDown={(e) => {
                        {blockNumbers(e)};
                        {blockSpecialChars(e)}}}
            />
            {errors.skillDevelopment && <p className="text-red-400 text-xs mt-1">{errors.skillDevelopment}</p>}
          </div>
        </div>

        {/* Goals for Next Review Period */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Goals for Next Review Period</h2>
            <button
              type="button"
              onClick={addGoalRow}
              className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
            >
              + Add Goal
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className={tableHeaderClass}>Sr. No.</th>
                  <th className={tableHeaderClass}>Goal Description</th>
                  <th className={tableHeaderClass}>Target Date</th>
                  <th className={tableHeaderClass}></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {goals.map((goal, index) => (
                  <tr key={index}>
                    <td className={tableCellClass + " text-gray-300"}>{index + 1}</td>
                    <td className={tableCellClass}>
                      <input
                        type="text"
                        value={goal.description}
                        onChange={(e) => handleGoalChange(index, "description", e.target.value)}
                        className={`w-full px-4 py-2.5 bg-gray-900 border rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all duration-200 ${
                          errors.goals && errors.goals[index]?.description
                            ? "border-red-500"
                            : "border-gray-700"
                        }`}
                        placeholder="Goal description"
                      />
                      {errors.goals && errors.goals[index]?.description && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors.goals[index].description}
                        </p>
                      )}
                    </td>
                    <td className={tableCellClass}>
                      <input
                        type="date"
                        value={goal.targetDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => handleGoalChange(index, "targetDate", e.target.value)}
                        className={`w-full px-4 py-2.5 bg-gray-900 border rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all duration-200 ${
                          errors.goals && errors.goals[index]?.targetDate
                            ? "border-red-500"
                            : "border-gray-700"
                        }`}
                        placeholder="DD/MM/YYYY"
                      />
                      {errors.goals && errors.goals[index]?.targetDate && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors.goals[index].targetDate}
                        </p>
                      )}
                    </td>
                    <td className={tableCellClass}>
                      {goals.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeGoalRow(index)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        

        {/* Buttons */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={cleanData}
            className="px-8 py-3 bg-gray-700 text-gray-300 rounded-lg font-medium hover:bg-gray-600 transition-all duration-200"
          >
            Clear
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all duration-200"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default Performance_Report;