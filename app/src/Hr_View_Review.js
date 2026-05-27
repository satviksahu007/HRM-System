import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function fmtDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const Hr_View_Review = () => {
  const navigate = useNavigate();
  const { pr_id } = useParams();

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);

  const competencies = [
    "Technical Skills & Code Quality",
    "Problem Solving & Debugging",
    "Task Management & Productivity",
    "Communication & Collaboration",
    "Testing & Quality Assurance",
    "Initiative & Learning Attitude",
    "Ownership & Accountability",
    "Contribution to Team / Project",
  ];

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/performance_review/${pr_id}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setReport(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Loading review...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="w-full min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-red-400">Failed to load review</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-900 p-4 md:p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Performance Review Details
          </h1>
          <p className="text-gray-400">Employee review summary and evaluation</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 hover:border-gray-500 text-gray-300 rounded-lg text-sm transition"
        >
          Back
        </button>
      </div>

      {/* Employee Info */}
      <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Employee</p>
            <p className="text-white font-medium">{report.employee_name}</p>
            <p className="text-sm text-gray-500 mt-1">{report.eha_id}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              Reporting Manager(s)
            </p>
            <p className="text-white font-medium">
              {report.reporting_manager?.map((m) => m.name).join(", ") || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Review Month</p>
            <p className="text-white font-medium">{report.review_month}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Submitted On</p>
            <p className="text-white font-medium">{fmtDate(report.created_at)}</p>
          </div>

        </div>
      </div>

      {/* Assigned Projects */}
      <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-5">Assigned Projects</h2>
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
                <tr key={idx} className="border-b border-gray-800">
                  <td className="py-4 text-sm text-white">{proj.projectName}</td>
                  <td className="py-4 text-sm text-gray-300">{proj.workedAs}</td>
                  <td className="py-4 text-sm text-gray-300">{proj.workedWith}</td>
                  <td className="py-4 text-sm text-gray-300">{proj.workingFrom}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Self Rating + Skill Development */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-5">Self Rating</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">
              {report.self_rating}
            </div>
            <p className="text-gray-400 text-sm">Employee self evaluation score</p>
          </div>
        </div>

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
          <h2 className="text-lg font-semibold text-white">Major Tasks Completed</h2>
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
              <p className="text-sm text-white leading-relaxed">{task.description}</p>
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
        <h2 className="text-lg font-semibold text-white mb-5">Challenges Faced</h2>
        <div className="space-y-3">
          {report.challenges?.map((challenge, idx) => (
            <div key={idx} className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <p className="text-sm text-gray-300 leading-relaxed">{challenge}</p>
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
              <p className="text-sm text-white">{goal.description}</p>
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {fmtDate(goal.targetDate)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* TL Review */}
      <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 mb-6">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Team Leader Review</h2>
            <p className="text-sm text-gray-500 mt-1">Ratings and reviewer feedback</p>
          </div>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
              report.tl_submit_status === 0
                ? "bg-green-900/40 text-green-400 border-green-700/40"
                : "bg-yellow-900/40 text-yellow-400 border-yellow-700/40"
            }`}
          >
            {report.tl_submit_status === 0 ? "Reviewed On Time" : "Delayed Review"}
          </span>
        </div>

        {/* TL Meta */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Reviewed By</p>
            <p className="text-sm text-white">{report.tl_reviewed_by_name || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Reviewed On</p>
            <p className="text-sm text-white">{fmtDate(report.tl_submit_time)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Final Score</p>
            <p className="text-3xl font-bold text-white">{report.tl_point_9 || 0}/10</p>
          </div>
        </div>

        {/* Points Table */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full border border-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 border border-gray-700 text-gray-300 text-xs font-medium uppercase tracking-wide text-left w-16">
                  Sr. No.
                </th>
                <th className="px-4 py-3 border border-gray-700 text-gray-300 text-xs font-medium uppercase tracking-wide text-left">
                  Competency Area
                </th>
                <th className="px-4 py-3 border border-gray-700 text-gray-300 text-xs font-medium uppercase tracking-wide w-28">
                  Rating (/10)
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                report.tl_point_1,
                report.tl_point_2,
                report.tl_point_3,
                report.tl_point_4,
                report.tl_point_5,
                report.tl_point_6,
                report.tl_point_7,
                report.tl_point_8,
              ].map((point, idx) => (
                <tr key={idx} className="border-b border-gray-800">
                  <td className="px-4 py-4 text-sm text-gray-400 text-center border border-gray-700">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-300 border border-gray-700">
                    {competencies[idx]}
                  </td>
                  <td className="px-4 py-4 border border-gray-700 text-center">
                    <span className="px-3 py-1 rounded-lg bg-indigo-900/40 text-indigo-300 text-sm font-medium">
                      {point || 0}/10
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TL Comments */}
        {report.tl_comments && Object.keys(report.tl_comments).length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Reviewer Comments</h3>
            <div className="space-y-3">
              {Object.entries(report.tl_comments).map(([key, value]) => (
                <div
                  key={key}
                  className="bg-gray-800/60 border border-gray-700 rounded-lg p-4"
                >
                  <p className="text-xs text-gray-500 mb-2">Comment {key}</p>
                  <p className="text-sm text-gray-300">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default Hr_View_Review;
