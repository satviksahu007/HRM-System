import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

function fmtDate(dateStr) {
  if (!dateStr) return "";

  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const Review_Now = () => {

  const { pr_id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const debounceTimers = useRef({});
  const [report, setReport] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(null);
const [submitError, setSubmitError] = useState("");
  useEffect(() => {
    fetchReport();
  }, []);

  // 9 competency areas
  const COMPETENCIES = [
    "Technical Skills & Code Quality",
    "Problem Solving & Debugging",
    "Task Management & Productivity",
    "Communication & Collaboration",
    "Testing & Quality Assurance",
    "Initiative & Learning Attitude",
    "Ownership & Accountability",
    "Contribution to Team / Project",
  ];

  const validateField = (key, value) => {
  let error = "";

  if (!value) {
    error = "Rating is required";
  } else if (isNaN(value) || value < 1 || value > 10) {
    error = "Must be 1-10";
  }

  setErrors((prev) => ({
    ...prev,
    [key]: error,
  }));

  return error;
};

  // State: one object per competency, with rating and comment
  const [evaluations, setEvaluations] = useState(
    COMPETENCIES.map(() => ({ rating: "", comment: "" }))
  );

  const handleEvalRatingChange = (index, value) => {
  if (
    value === "" ||
    (/^\d+$/.test(value) &&
      Number(value) >= 1 &&
      Number(value) <= 10)
  ) {
    setEvaluations((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        rating: value,
      };
      return updated;
    });

    // unique debounce key for each row
    debounce(`rating-${index}`, value);
  }
};



  const handleEvalCommentChange = (index, value) => {
    setEvaluations(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], comment: value };
      return updated;
    });
  };


  const submitReview = async () => {
  // Optional validation: ensure all 9 ratings are filled
  const allRated = evaluations.every(e => e.rating !== "");
  if (!allRated) {

    setSuccess(null);
    setSubmitError("Please provide a rating for all competency areas.");

    return;
  }

  // Build the comments object as { "1": "comment1", "2": "comment2", ... }
  const commentsObj = {};
    evaluations.forEach((evalItem, idx) => {
      if (evalItem.comment.trim() !== "") {
        commentsObj[idx + 1] = evalItem.comment.trim();
      }
    });

    const payload = {
      pr_id,                                          // from useParams
      eha_id: report.eha_id,                          // the employee being reviewed
      mm_yy: report.review_month,                     // MM/YY format
      tl_points: evaluations.map(e => Number(e.rating)),
      tl_average: Number(averageScore),
      tl_comments: commentsObj,
    };

    try {
      const res = await fetch("http://localhost:5000/performance_review/submit_evaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      setSuccess({
        message: "Review submitted successfully"
      });

      setSubmitError("");

      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (err) {
      console.error(err);
      setSuccess(null);

        setSubmitError(
          err.message || "Failed to submit review"
        );
    }
  };

  const fetchReport = async () => {

    try {

      const res = await fetch(
        `http://localhost:5000/performance_review/${pr_id}`,
        {
          credentials: "include",
        }
      );

      const data = await res.json();
      console.log(data)
      if (!res.ok) {
        throw new Error(data.error || "Failed to load");
      }

      setReport(data);

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

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


  const totalScore = evaluations.reduce((sum, e) => {
  const r = Number(e.rating);
  return sum + (isNaN(r) ? 0 : r);
}, 0);

const averageScore = evaluations.length > 0
  ? (totalScore / evaluations.length).toFixed(1)
  : 0;

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-900 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!report) {
    return (
      <div className="w-full min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">

          <p className="text-red-400 mb-4">
            Could not load report
          </p>

          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Go Back
          </button>

        </div>
      </div>
    );
  }

  return (

    <div className="w-full min-h-screen bg-gray-900 p-4 md:p-8">

      {/* Header */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        <div>

          <h1 className="text-3xl font-bold text-white mb-2">
            Performance Review
          </h1>

          <p className="text-gray-400">
            Review employee performance submission
          </p>

        </div>
        {/* Success */}
{success && (
  <div className="flex items-center gap-2 px-4 py-3 rounded-lg mb-6 border text-sm font-medium bg-green-600/20 border-green-600/30 text-green-400">
    <span>✅</span>
    {success.message}
  </div>
)}

{/* Error */}
{submitError && (
  <div className="flex items-center gap-2 px-4 py-3 rounded-lg mb-6 border text-sm font-medium bg-red-600/20 border-red-600/30 text-red-400">
    <span>❌</span>
    {submitError}
  </div>
)}
        <div className="flex items-center gap-3">

          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${
              report.submit_status === 0
                ? "bg-green-900/40 text-green-400 border-green-700/40"
                : "bg-yellow-900/40 text-yellow-400 border-yellow-700/40"
            }`}
          >
            {report.submit_status === 0
              ? "Submitted On Time"
              : "Delayed Submission"}
          </span>

        </div>

      </div>

      {/* Employee Info */}
      <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 mb-6">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          <div>

            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              Employee
            </p>

            <p className="text-white font-medium">
              {report.employee_name}
            </p>

            <p className="text-sm text-gray-500 mt-1">
              {report.eha_id}
            </p>

          </div>
                
                <div className="text-white font-medium">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              Reporting Manager(s)
              </p>
                    {report.reporting_manager.map(m => `${m.name}`).join(", ")}
                </div>
          

          <div>

            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              Review Month
            </p>

            <p className="text-white font-medium">
              {report.review_month}
            </p>

          </div>

          <div>

            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              Submitted On
            </p>

            <p className="text-white font-medium">
              {fmtDate(report.created_at)}
            </p>

          </div>

        </div>

      </div>

      {/* Assigned Projects */}
      <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 mb-6">

        <h2 className="text-lg font-semibold text-white mb-5">
          Assigned Projects
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b border-gray-700">

                <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Project Name
                </th>

                <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Worked As
                </th>

                <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Worked With
                </th>

                <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Working From
                </th>

              </tr>

            </thead>

            <tbody>

              {report.assigned_projects?.map((proj, idx) => (

                <tr
                  key={idx}
                  className="border-b border-gray-800"
                >

                  <td className="py-4 text-sm text-white">
                    {proj.projectName}
                  </td>

                  <td className="py-4 text-sm text-gray-300">
                    {proj.workedAs}
                  </td>

                  <td className="py-4 text-sm text-gray-300">
                    {proj.workedWith}
                  </td>

                  <td className="py-4 text-sm text-gray-300">
                    {proj.workingFrom}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* Self Evaluation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Self Rating */}
        <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">

          <h2 className="text-lg font-semibold text-white mb-5">
            Self Rating
          </h2>

          <div className="flex items-center gap-4">

            <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">
              {report.self_rating}
            </div>

            <p className="text-gray-400 text-sm">
              Employee self evaluation score
            </p>

          </div>

        </div>

        {/* Skill Development */}
        <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">

          <h2 className="text-lg font-semibold text-white mb-5">
            Skill Development & Learning
          </h2>

          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
            {report.skill_development}
          </p>

        </div>

      </div>

      {/* Major Tasks */}
      <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 mb-6">

        <div className="flex items-center justify-between mb-5">

          <h2 className="text-lg font-semibold text-white">
            Major Tasks Completed
          </h2>

          <span className="text-xs text-gray-500">
            {report.major_tasks?.length || 0} Tasks
          </span>

        </div>

        <div className="space-y-4">

          {report.major_tasks?.map((task, idx) => (

            <div
              key={idx}
              className="bg-gray-800 rounded-lg border border-gray-700 p-4 flex items-start justify-between gap-4"
            >

              <div>

                <p className="text-sm text-white leading-relaxed">
                  {task.description}
                </p>

              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                  task.completed === "Yes"
                    ? "bg-green-900/40 text-green-400 border border-green-700/40"
                    : "bg-yellow-900/40 text-yellow-400 border border-yellow-700/40"
                }`}
              >
                {task.completed}
              </span>

            </div>

          ))}

        </div>

      </div>

      {/* Challenges */}
      <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 mb-6">

        <h2 className="text-lg font-semibold text-white mb-5">
          Challenges Faced
        </h2>

        <div className="space-y-3">

          {report.challenges?.map((challenge, idx) => (

            <div
              key={idx}
              className="bg-gray-800 rounded-lg border border-gray-700 p-4"
            >

              <p className="text-sm text-gray-300 leading-relaxed">
                {challenge}
              </p>

            </div>

          ))}

        </div>

      </div>

      {/* Goals */}
      <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 mb-6">

        <h2 className="text-lg font-semibold text-white mb-5">
          Goals For Next Review Period
        </h2>

        <div className="space-y-4">

          {report.goals?.map((goal, idx) => (

            <div
              key={idx}
              className="bg-gray-800 rounded-lg border border-gray-700 p-4 flex items-start justify-between gap-4"
            >

              <div>

                <p className="text-sm text-white">
                  {goal.description}
                </p>

              </div>

              <span className="text-xs text-gray-400 whitespace-nowrap">
                {fmtDate(goal.targetDate)}
              </span>

            </div>

          ))}

        </div>

      </div>
      {/* Performance Evaluation */}
<div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
  <h2 className="text-lg font-semibold text-white mb-4">
    Performance Evaluation (Scale: 1-10)
  </h2>

  <div className="overflow-x-auto">
    <table className="w-full border border-gray-700">
      <thead className="bg-gray-800">
        <tr>
          <th className="px-4 py-3 border border-gray-700 text-gray-300 text-sm w-16">
            Sr. No.
          </th>
          <th className="px-4 py-3 border border-gray-700 text-gray-300 text-sm text-left">
            Competency Area
          </th>
          <th className="px-4 py-3 border border-gray-700 text-gray-300 text-sm w-28">
            Rating (/10)
          </th>
          <th className="px-4 py-3 border border-gray-700 text-gray-300 text-sm text-left">
            Comments
          </th>
        </tr>
      </thead>

      <tbody className="text-gray-300">
        {COMPETENCIES.map((item, index) => (
          <tr key={index}>
            <td className="px-4 py-3 border border-gray-700 text-center">
              {index + 1}
            </td>

            <td className="px-4 py-3 border border-gray-700">
              {item}
            </td>

            <td className="px-4 py-3 border border-gray-700">
              <input
                type="number"
                min="1"
                max="10"
                value={evaluations[index].rating}
                name = "rating"
                onChange={(e) => handleEvalRatingChange(index, e.target.value)}
                className={`w-24 px-3 py-2 bg-gray-900 border rounded-lg text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none ${
                  errors[`rating-${index}`]
                    ? "border-red-500"
                    : "border-gray-600"
                }`}
                placeholder="/10"
              />
              {errors[`rating-${index}`] && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors[`rating-${index}`]}
                  </p>
                )}
            </td>

            <td className="px-4 py-3 border border-gray-700">
              <textarea
                rows={2}
                value={evaluations[index].comment}
                onChange={(e) => handleEvalCommentChange(index, e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                placeholder="Enter comment (optional)"
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

<div className="mt-4 flex items-center gap-3 text-white">
  <span className="text-gray-400 text-sm">Total Score (Average):</span>
  <span className="text-xl font-bold text-indigo-400">
    {averageScore}
  </span>
  <span className="text-xs text-gray-500">/ 10</span>
</div>

      {/* Footer */}
      <div className="flex justify-end gap-3">

        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-gray-800 text-gray-300 rounded-lg border border-gray-700 hover:border-gray-500 transition"
        >
          Back
        </button>

        <button
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
          onClick={submitReview}
        >
          Submit Review
        </button>

      </div>

    </div>

  );

};

export default Review_Now;