import React, { useState } from "react";
import axios from "axios";

function getColor(score) {
  if (score >= 85) return "bg-green-500";
  if (score >= 70) return "bg-yellow-500";
  return "bg-red-500";
}

function getGrade(score) {
  if (score >= 90) return { letter: "A", color: "bg-green-500" };
  if (score >= 80) return { letter: "B", color: "bg-lime-500" };
  if (score >= 70) return { letter: "C", color: "bg-yellow-400" };
  if (score >= 60) return { letter: "D", color: "bg-orange-500" };
  return { letter: "F", color: "bg-red-600" };
}

export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError("");
  };

  const handleUpload = async () => {
    if (!file) return setError("Please select a file first.");

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("http://127.0.0.1:8000/analyze_cv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError("Error analyzing CV.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-4xl font-bold text-center text-indigo-700 mb-6">
          CV Analyzer
        </h1>

        {!result && (
          <>
            <p className="text-gray-600 text-center mb-8">
              Upload your CV (PDF or DOCX) to receive a detailed analysis and score.
            </p>

            <div className="flex flex-col items-center justify-center space-y-4">
              <label
                htmlFor="file-upload"
                className="w-full sm:w-auto cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-indigo-300 rounded-xl p-8 hover:bg-indigo-50 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-indigo-600 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 16V4m0 0L3 8m4-4l4 4m10 8v4m0 0h-4m4 0h4"
                  />
                </svg>
                <span className="text-indigo-600 font-semibold">
                  {file ? file.name : "Click to select a file"}
                </span>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleUpload}
                disabled={loading}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition disabled:opacity-50"
              >
                {loading ? "Analyzing..." : "Upload & Analyze"}
              </button>

              {error && <p className="text-red-600">{error}</p>}
            </div>
          </>
        )}

        {result && (
          <div className="mt-8">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Results</h2>
                <p className="text-sm text-gray-500">{file?.name}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-indigo-600">
                  {result.score ?? "N/A"} / 100
                </span>
                {result?.score !== undefined && (() => {
                  const { letter, color } = getGrade(result.score);
                  return (
                    <span
                      className={`text-white text-sm font-semibold px-3 py-1 rounded-full ${color}`}
                    >
                      Grade {letter}
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Criteria */}
            <div>
              <h3 className="font-semibold text-lg mb-2 text-gray-800">
                Criteria Breakdown
              </h3>
              <div className="space-y-3">
                {Object.entries(result?.criteria || {}).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm">
                      <span className="capitalize font-medium">{key}</span>
                      <span>{value}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`${getColor(value)} h-2.5 rounded-full transition-all`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    {result?.criteria_explanations?.[key] && (
                      <p className="text-gray-500 text-sm italic mt-1">
                        {result.criteria_explanations[key]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback */}
            {result?.feedback?.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-lg mb-2 text-gray-800">
                  Feedback
                </h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {result.feedback.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* AI Analysis */}
            {result?.ai_analysis && (
              <div className="mt-6 border-t pt-4">
                <h3 className="font-semibold text-lg mb-2 text-indigo-700">
                  AI Insights
                </h3>
                <p className="text-gray-700 mb-3">
                  <strong>Summary:</strong> {result.ai_analysis.summary}
                </p>

                {["strengths", "weaknesses", "recommendations"].map(
                  (section) =>
                    result.ai_analysis?.[section]?.length > 0 && (
                      <div key={section} className="mb-3">
                        <h4 className="font-medium capitalize">{section}</h4>
                        <ul className="list-disc list-inside text-gray-700">
                          {result.ai_analysis[section].map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )
                )}
              </div>
            )}

            {/* Back button */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setResult(null)}
                className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                Upload Another CV
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
