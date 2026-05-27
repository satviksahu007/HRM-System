import React, { useEffect, useState } from "react";

function Qna() {

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const [answer, setAnswer] = useState("");

  // =========================================
  // FETCH QUESTIONS
  // =========================================

  const fetchQuestions = async () => {

    try {

      setLoading(true);

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/qa/my-questions`,
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

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // =========================================
  // MODAL
  // =========================================

  const openModal = (question) => {

    setSelectedQuestion(question);

    setAnswer("");
  };

  const closeModal = () => {

    setSelectedQuestion(null);

    setAnswer("");
  };

  // =========================================
  // SUBMIT ANSWER
  // =========================================

  const [submitting, setSubmitting] = useState(false);

const submitAnswer = async () => {

  if (!answer) {
    alert("Please answer the question");
    return;
  }

  try {

    setSubmitting(true);

    const payload = {

      hqa_id: selectedQuestion.hqa_id,

      question_cycle_no:
        selectedQuestion.question_cycle_no,

      submit_status:
        selectedQuestion.submit_status,

      answer:
        selectedQuestion.question_type === 1
          ? answer
          : null,

      answer_option:
        selectedQuestion.question_type !== 1
          ? answer
          : null
    };

    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/qa/submit-answer`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        credentials: "include",

        body: JSON.stringify(payload)
      }
    );

    const data = await res.json();

    if (res.ok) {

      closeModal();

      fetchQuestions();

    } else {

      alert(data.message || "Failed to submit");

    }

  } catch (err) {

    console.log(err);

    alert("Something went wrong");

  } finally {

    setSubmitting(false);

  }
};

  // =========================================
  // LOADING
  // =========================================

  if (loading) {

    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // =========================================
  // UI
  // =========================================

  return (

    <div className="min-h-screen bg-gray-900 text-white p-6">

      <div>

        <div className="mb-8">

          <h1 className="text-3xl font-bold">
            My Questionnaire
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Pending Questions
          </p>

        </div>

        {/* QUESTIONS */}

        <div className="space-y-4">

          {questions.length === 0 && (

            <div className="text-gray-500 text-sm">
              No pending questions
            </div>

          )}

          {questions.map((q) => (

            <div
              key={q.hqa_id}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-5 flex items-center justify-between"
            >

              <div>

                <p className="text-sm mb-2">
                  {q.question}
                </p>

                <div className="flex gap-3 text-xs text-gray-500">

                  

                  

                </div>

              </div>
              <div className="flex gap-2">
                
              <button
                onClick={() => openModal(q)}
                className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm"
              >
                Answer
              </button>
              
              </div>

            </div>

          ))}

        </div>
      </div>

      {/* ========================================= */}
      {/* MODAL */}
      {/* ========================================= */}

      {selectedQuestion && (

        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">

          <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-lg p-6">

            <div className="flex items-start justify-between mb-5">

              <div>

                <p className="text-xs text-indigo-400 mb-2">
                  {selectedQuestion.hqa_id}
                </p>

                <h2 className="text-lg font-semibold">
                  {selectedQuestion.question}
                </h2>

              </div>

              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-white"
              >
                ✕
              </button>

            </div>

            {/* ================================= */}
            {/* TEXT */}
            {/* ================================= */}

            {selectedQuestion.question_type === 1 && (

              <textarea
                value={answer}
                onChange={(e) =>
                  setAnswer(e.target.value)
                }
                placeholder="Write your answer..."
                className="w-full h-32 bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm outline-none"
              />

            )}

            {/* ================================= */}
            {/* RADIO */}
            {/* ================================= */}

            {selectedQuestion.question_type === 2 && (

              <div className="space-y-3">

                {["No", "Yes", "Maybe"].map((label) => (

                  <button
                    key={label}
                    onClick={() =>
                      setAnswer(label)
                    }
                    className={`w-full text-left border rounded-lg px-4 py-3 text-sm transition-all
                    ${
                      answer === label
                        ? "border-indigo-500 bg-indigo-500/10"
                        : "border-gray-700"
                    }`}
                  >
                    {label}
                  </button>

                ))}

              </div>

            )}

            {/* ================================= */}
            {/* SELECTION */}
            {/* ================================= */}

            {selectedQuestion.question_type === 3 && (

              <div className="space-y-3">

                {selectedQuestion.selection_option.map((opt) => (

                  <button
                    key={opt}
                    onClick={() =>
                      setAnswer(opt)
                    }
                    className={`w-full text-left border rounded-lg px-4 py-3 text-sm transition-all
                    ${
                      answer === opt
                        ? "border-indigo-500 bg-indigo-500/10"
                        : "border-gray-700"
                    }`}
                  >
                    {opt}
                  </button>

                ))}

              </div>

            )}

            {/* ================================= */}
            {/* ACTIONS */}
            {/* ================================= */}

            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-600 rounded-lg text-sm"
              >
                Cancel
              </button>

              <button
                onClick={submitAnswer}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm"
              >
                Submit
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Qna;
