import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";


function Home() {
    const [windowInfo, setWindowInfo] = useState(null);
    const [windowLoading, setWindowLoading] = useState(false);
    const [windowLoading2, setWindowLoading2] = useState(false);
    const [windowLoading3, setWindowLoading3] = useState(false);
    const [viewLoading4, setViewLoading4] = useState(false);
    const [loadingq, setLoadingq] = useState(false);
    const [reportWindow, setReportWindow] = useState(null);
    const [qloading, qsetLoading] = useState(true);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [pInfo, setPInfo] = useState([]);
    const navigate = useNavigate();
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
    const [loadedAgendaByTec, setLoadedAgendaByTec] = useState({});
    const [viewData, setViewData] = useState([]); // team‑wise report view
    const [error, setError] = useState(null);
    const [prStatus, setprStatus] = useState([])
    




    const fetchWindowStatus = async () => {
        setWindowLoading(true);
    try {
      const res  = await fetch(`http://localhost:5000/window_status`, { 
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


  const fetchReportWindow = async () => {
    setWindowLoading2(true);
    try {
      const res = await fetch("http://localhost:5000/report_window_status", {
        credentials: "include",
      });
      const data = await res.json();
      setReportWindow(data);
    } catch (e) {
      console.error("Error fetching report window", e);
    } finally {
      setWindowLoading2(false);
    }
  };


  const fetchQuestions = async () => {

    try {

      setLoadingq(true);

      const res = await fetch(
        "http://localhost:5000/qa/my-questions",
        {
          method: "GET",
          credentials: "include"
        }
      );

      const data = await res.json();
      console.log(data)

      if (res.ok) {

        setQuestions(data.questions || []);

      } else {

        console.log(data.message);

      }

    } catch (err) {

      console.log(err);

    } finally {

      setLoadingq(false);

    }
  };

  const fetchPWindowStatus = async () => {
    setWindowLoading3(true);
    try {
      const res  = await fetch(`http://localhost:5000/window_status_performance`, { 
        method: "GET",
        credentials: "include" });
      const data = await res.json();
      setPInfo(data);
    } catch (e) {
      console.log("ERROR", e);
    } finally {
      setWindowLoading3(false);
    }
  };

  const fetchTodayAgenda = async () => {
    try {
        const res = await fetch(
        `http://localhost:5000/daily_agenda_date/team_wise?date=${todayStr}`,
        { credentials: "include" }
        );

        const data = await res.json();

        const grouped = {};

        data.forEach((team) => {
        grouped[team.tec_id] = {
            submitted: team.submitted,
            tasks: team.tasks || [],
        };
        });

        setLoadedAgendaByTec(grouped);

    } catch (e) {
        console.log("error", e);
        setLoadedAgendaByTec({});
    }
    };

   const fetchDateReport = async (dateStr) => {
  setViewLoading4(true);
  setError(null);

  try {
    const res = await fetch(
      `http://localhost:5000/daily_report/team_wise?date=${dateStr}`,
      {
        credentials: "include",
      }
    );

    const data = await res.json();

    const grouped = {};

    data.forEach((team) => {
      grouped[team.tec_id] = {
        submitted: team.submitted,
        tasks: team.tasks || [],
      };
    });

    setViewData(grouped);

  } catch (e) {
    console.error(e);
    setError("Failed to load today's reports.");
    setViewData({});
  } finally {
    setViewLoading4(false);
  }
};

const fetchPRStatus = async () => {
  try {
    const res = await fetch(
      "http://localhost:5000/performance_report/submission_status",
      {
        credentials: "include",
      }
    );

    const data = await res.json();
    setprStatus(data)
    console.log(data);

  } catch (e) {
    console.log(e);
  }
};






  useEffect(() => {
  fetchWindowStatus();
  fetchReportWindow();
  fetchPWindowStatus();
  fetchQuestions();
  fetchTodayAgenda();
  fetchDateReport(todayStr);
  fetchPRStatus();
}, []);

  return (
  <div className="w-full min-h-screen bg-gray-900 p-4 md:p-8">

    {/* Header */}
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-white">
        Welcome Back
      </h1>

      <p className="text-gray-400 mt-1 text-sm">
        Quick overview of company activity
      </p>
    </div>

    {/* Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

      {/* Daily Work Agenda */}
      <div className="bg-gray-800/80 backdrop-blur border border-gray-700 rounded-2xl p-5 hover:border-indigo-500/30 transition-all duration-200">

        {/* Top */}
        <div className="flex items-center justify-between mb-5">

          <div className="flex items-center gap-3">
            

            <div>
              <h2 className="text-white font-semibold">
                Daily Work Agenda
              </h2>

              <p className="text-xs text-gray-500">
                Submission Window
              </p>
            </div>
          </div>

          <button
            onClick={fetchWindowStatus}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Refresh
          </button>
        </div>


        {/* Status */}
        {windowLoading ? (
          <div className="animate-pulse h-10 rounded-xl bg-gray-700" />
        ) : (
          <div
            className={`rounded-xl border px-4 py-3 flex items-center justify-between
            ${
              windowInfo?.is_open
                ? "bg-green-500/10 border-green-500/20"
                : "bg-red-500/10 border-red-500/20"
            }`}
          >

            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full
                ${
                  windowInfo?.is_open
                    ? "bg-green-400"
                    : "bg-red-400"
                }`}
              />

              <span
                className={`text-sm font-medium
                ${
                  windowInfo?.is_open
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {windowInfo?.is_open
                  ? "Window Open"
                  : "Window Closed"}
              </span>
              
            </div>

            <span className="text-xs text-gray-400">
              {windowInfo?.window_start} — {windowInfo?.window_end}
            </span>
            
          </div>

          
        )}
        {Object.values(loadedAgendaByTec).some(team => team.submitted) ? (
            <div className="mt-4 rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3">
                <p className="text-sm text-green-400 font-medium">
                Agenda Submitted
                </p>
            </div>
            ) : (
            new Date().toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            }) > windowInfo?.window_start && (
                <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
                <p className="text-sm text-red-400 font-medium">
                    Please Submit Your Agenda !
                </p>
                </div>
            )
            )}
        <button
            onClick={()=>navigate("/Work_Agenda")}
            className="px-4 py-2 mt-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 text-l font-medium flex items-center gap-2"
          >
            Submit
          </button>
      </div>
        {/*report*/}
      <div className="bg-gray-800/80 backdrop-blur border border-gray-700 rounded-2xl p-5 hover:border-indigo-500/30 transition-all duration-200">

        {/* Top */}
        <div className="flex items-center justify-between mb-5">

          <div className="flex items-center gap-3">
            

            <div>
              <h2 className="text-white font-semibold">
                Daily Work Report
              </h2>

              <p className="text-xs text-gray-500">
                Submission Window
              </p>
            </div>
          </div>

          <button
            onClick={fetchReportWindow}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Status */}
        {windowLoading2 ? (
          <div className="animate-pulse h-10 rounded-xl bg-gray-700" />
        ) : (
          <div
            className={`rounded-xl border px-4 py-3 flex items-center justify-between
            ${
              reportWindow?.is_open
                ? "bg-green-500/10 border-green-500/20"
                : "bg-red-500/10 border-red-500/20"
            }`}
          >

            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full
                ${
                  reportWindow?.is_open
                    ? "bg-green-400"
                    : "bg-red-400"
                }`}
              />

              <span
                className={`text-sm font-medium
                ${
                  reportWindow?.is_open
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {reportWindow?.is_open
                  ? "Window Open"
                  : "Window Closed"}
              </span>
            </div>

            <span className="text-xs text-gray-400">
              {reportWindow?.window_start} — {reportWindow?.window_end}
            </span>
          </div>
        )}
        {Object.values(viewData).some(team => team.submitted) ? (
            <div className="mt-4 rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3">
                <p className="text-sm text-green-400 font-medium">
                Report Submitted
                </p>
            </div>
            ) : (
            new Date().toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            }) > reportWindow?.window_start && (
                <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
                <p className="text-sm text-red-400 font-medium">
                    Please Submit Your Report !
                </p>
                </div>
            )
            )}
         <button
            onClick={()=>navigate("/Report")}
            className="px-4 py-2 mt-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 text-l font-medium flex items-center gap-2"
          >
            Submit
          </button>
      </div>

      {/*Performance*/}
      <div className="bg-gray-800/80 backdrop-blur border border-gray-700 rounded-2xl p-5 hover:border-indigo-500/30 transition-all duration-200">

        {/* Top */}
        <div className="flex items-center justify-between mb-5">

          <div className="flex items-center gap-3">
            

            <div>
              <h2 className="text-white font-semibold">
                Performance Report
              </h2>

              <p className="text-xs text-gray-500">
                Submission Window
              </p>
            </div>
          </div>

          <button
            onClick={fetchPWindowStatus}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Status */}
        {windowLoading3 ? (
          <div className="animate-pulse h-10 rounded-xl bg-gray-700" />
        ) : (
          <div
            className={`rounded-xl border px-4 py-3 flex items-center justify-between
            ${
              pInfo?.is_open
                ? "bg-green-500/10 border-green-500/20"
                : "bg-red-500/10 border-red-500/20"
            }`}
          >

            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full
                ${
                  pInfo?.is_open
                    ? "bg-green-400"
                    : "bg-red-400"
                }`}
              />

              <span
                className={`text-sm font-medium
                ${
                  pInfo?.is_open
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {pInfo?.is_open
                  ? "Window Open"
                  : "Window Closed"}
              </span>
            </div>

            <span className="text-xs text-gray-400">
              {pInfo?.window_start} — {pInfo?.window_end} of every month
            </span>
          </div>
        )}

        {prStatus?.submitted ? (
            <div className="mt-4 rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3">
                <div className="flex items-center justify-between">
                
                <p className="text-sm text-green-400 font-medium">
                    Performance Report Submitted
                </p>

               

                </div>

            </div>
            ) : (
            <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
                <p className="text-sm text-red-400 font-medium">
                Please Submit Your Performance Report !
                </p>
            </div>
            )}
        <button
            onClick={()=>navigate("/Performance_Report")}
            className="px-4 py-2 mt-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 text-l font-medium flex items-center gap-2"
          >
            Submit
          </button>
      </div>

       {/*QNA*/}
      <div className="bg-gray-800/80 backdrop-blur border border-gray-700 rounded-2xl p-5 hover:border-indigo-500/30 transition-all duration-200">

        {/* Top */}
        <div className="flex items-center justify-between mb-5">

          <div className="flex items-center gap-3">
            

            <div>
              <h2 className="text-white font-semibold">
                Questionnaire
              </h2>

              <p className="text-xs text-gray-500">
                Submission Window
              </p>
            </div>
          </div>

          <button
            onClick={fetchQuestions}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Status */}
        {questions.length > 0 ? (
        <div className="mt-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 px-4 py-3">
            <p className="text-sm text-yellow-400 font-medium">
            You have {questions.length} pending questions
            </p>
        </div>
        ) : (
        <div className="mt-4 rounded-xl bg-gray-700/40 border border-gray-600 px-4 py-3">
            <p className="text-sm text-gray-400">
            No pending questions
            </p>
        </div>
        )}
        <button
            onClick={()=>navigate("/Qna")}
            className="px-4 py-2 mt-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 text-l font-medium flex items-center gap-2"
          >
            Submit
          </button>
      </div>

      

      

    </div>
  </div>
);
}

export default Home;