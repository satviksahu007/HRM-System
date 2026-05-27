import React, { useEffect, useState } from "react";

function Qna_Submissions() {

  const [loading, setLoading] = useState(true);

  const [questions, setQuestions] = useState([]);

  const [selectedQuestion, setSelectedQuestion] =
    useState(null);

  const [responses, setResponses] = useState({
    submitted: {},
    missed: {}
  });
  const [activeTab, setActiveTab] = useState("Submitted");

  // =========================================
  // FETCH QUESTIONS
  // =========================================

  const fetchQuestions = async () => {

    try {

      setLoading(true);

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/qa/viewable-questions`,
        {
          credentials: "include"
        }
      );

      const data = await res.json();
      console.log(data)

      if (res.ok) {

        setQuestions(data.questions || []);

      }

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }
  };

  // =========================================
  // FETCH RESPONSES
  // =========================================

  const fetchResponses = async (hqa_id) => {

    try {

      setLoading(true);

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/qa/responses/${hqa_id}`,
        {
          credentials: "include"
        }
      );

      const data = await res.json();
      console.log(data)

      if (res.ok) {

      const groupedSubmitted =
        (data.submitted || []).reduce(
          (acc, item) => {

            const cycle =
              item.question_cycle_no || 1;

            if (!acc[cycle]) {
              acc[cycle] = [];
            }

            acc[cycle].push(item);

            return acc;

          },
          {}
        );

      const groupedMissed =
        (data.missed || []).reduce(
          (acc, item) => {

            const cycle =
              item.question_cycle_no || 1;

            if (!acc[cycle]) {
              acc[cycle] = [];
            }

            acc[cycle].push(item);

            return acc;

          },
          {}
        );

      setResponses({
        submitted: groupedSubmitted,
        missed: groupedMissed
      });

      }

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }
  };

  // =========================================
  // INITIAL
  // =========================================

  useEffect(() => {
    fetchQuestions();
  }, []);

  // =========================================
  // OPEN QUESTION
  // =========================================

  const openQuestion = (q) => {

    setSelectedQuestion(q);

    fetchResponses(q.hqa_id);
  };

  // =========================================
  // LABELS
  // =========================================

  const typeLabel = (type) => {

    if (type === 1) return "Descriptive";

    if (type === 2) return "Yes / No";

    return "Selection";
  };

  const renderAnswer = (r) => {

    // descriptive
    if (r.answer) {

      return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-sm text-gray-300 leading-relaxed">
          {r.answer}
        </div>
      );
    }

    // selection/radio
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
        {r.answer_option}
      </span>
    );
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading && questions.length === 0) {

    return (

      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
        Loading...
      </div>

    );
  }

  return (

    <div className="w-full min-h-screen bg-gray-950 text-white flex">

      {/* ========================================= */}
      {/* SIDEBAR */}
      {/* ========================================= */}

      <div className="w-[340px] border-r border-gray-800 bg-gray-900/70">

        <div className="p-6 border-b border-gray-800">

          <h1 className="text-2xl font-semibold">
            Responses
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Questions & Answers
          </p>

        </div>

        <div className="p-4 space-y-3 overflow-y-auto h-[calc(100vh-90px)]">

          {questions.map((q) => (

            <button
              key={q.hqa_id}
              onClick={() => openQuestion(q)}
              className={`w-full text-left border rounded-2xl p-4 transition-all
              ${
                selectedQuestion?.hqa_id === q.hqa_id
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "border-gray-800 bg-gray-900 hover:bg-gray-800/60"
              }`}
            >

              <div className="flex items-center justify-between gap-3 mb-3">

                

                <span className="text-[10px] px-2 py-1 rounded-full bg-gray-800 text-gray-400">
                  {typeLabel(q.question_type)}
                </span>

              </div>

              <p className="text-sm leading-relaxed text-gray-200">
                {q.question}
              </p>

            </button>

          ))}

        </div>

      </div>

      {/* ========================================= */}
      {/* MAIN */}
      {/* ========================================= */}

      <div className="flex-1 overflow-y-auto">

        {!selectedQuestion ? (

          <div className="h-screen flex items-center justify-center text-gray-500">

            Select a question to view responses

          </div>

        ) : (

          <div className="p-8">

            {/* HEADER */}

            <div className="mb-8">
             

              <div className="flex items-center gap-3 mb-4">

                

                <span className="px-3 py-1 rounded-full bg-gray-800 text-gray-400 text-xs">
                  {typeLabel(selectedQuestion.question_type)}
                </span>

              </div>

              <h2 className="text-3xl font-semibold leading-snug">
                Question : {selectedQuestion.question}
              </h2>

            </div>

            {/* STATS */}

            <div className="grid grid-cols-3 gap-4 mb-8">

              

            </div>

            {/* RESPONSES */}

            <div className="space-y-5">
              {["Submitted", "Missed"].map((t) => (
            <button
              key={t}
              onClick={() => {
                setActiveTab(t);
              }}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === t
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {t === "Submitted" ? "Submitted" : "Missed"}
            </button>
          ))}

              {Object.keys(
                activeTab === "Submitted"
                  ? responses.submitted || {}
                  : responses.missed || {}
              ).length === 0 && (

                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">

                  <p className="text-lg font-medium text-gray-300 mb-2">
                    {activeTab === "Submitted"
                      ? "None submitted yet"
                      : "No missed submissions"}
                  </p>

                  <p className="text-sm text-gray-500">
                    {activeTab === "Submitted"
                      ? "Responses will appear here once employees submit."
                      : "Everyone has submitted successfully."}
                  </p>

                </div>

              )}

              {Object.entries(activeTab === "Submitted" ? responses.submitted : responses.missed).map(
          ([cycle, cycleResponses]) => (

            <div
              key={cycle}
              className="mb-10"
            >

              {/* CYCLE HEADER */}

              <div className="flex items-center gap-3 mb-5">

                <div className="h-px flex-1 bg-gray-800"></div>

                <span className="px-4 py-1 rounded-full text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  Cycle {cycle}
                </span>

                <div className="h-px flex-1 bg-gray-800"></div>

              </div>

              {/* RESPONSES */}

              <div className="space-y-5">
                <div className="flex bg-grey-800 gap-2">
                </div>

                    {cycleResponses.map((r, index) => (

                      <div
                        key={index}
                        className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
                      >

                        {/* USER */}

                        <div className="flex items-center justify-between mb-4">

                          <div className="flex items-center gap-3">

                            <div className="w-11 h-11 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-sm font-medium text-indigo-400">
                              {r.employee_name
                                ?.split(" ")
                                ?.map((w) => w[0])
                                ?.join("")
                                ?.slice(0, 2)}
                            </div>

                            <div>

                              <p className="text-sm font-medium">
                                {r.employee_name}
                              </p>

                              <p className="text-xs text-gray-500">
                                {r.eha_id}
                              </p>

                            </div>

                          </div>

                          <div className="flex items-center gap-3">

                            <span
                                className={`px-3 py-1 rounded-full text-xs border font-medium
                                ${
                                  activeTab === "Missed"
                                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                                    : r.submit_status === 0
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                }`}
                              >
                                {
                                  activeTab === "Missed"
                                    ? "Missed"
                                    : r.submit_status === 0
                                    ? "Submitted"
                                    : ""
                                }
                              </span>

                            <div className="text-xs text-gray-500">
                              {r.answered_on}
                            </div>

                          </div>

                        </div>

                        {/* ANSWER */}

                        {activeTab === "Submitted" && (
                          renderAnswer(r)
                        )}

                      </div>

                    ))}

                  </div>

                </div>

              )
            )}

            </div>

          </div>

        )}

      </div>

    </div>
  );
}

export default Qna_Submissions;
