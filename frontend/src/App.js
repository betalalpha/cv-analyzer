import React, { useState } from "react";
import axios from "axios";
import CvViewer from "./CvViewer";

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
    <div className="min-h-screen bg-gray-100">
      {/* Upload screen */}
      {!result && (
        <div className="flex flex-col items-center justify-center h-screen text-center p-4">
          <h1 className="text-4xl font-bold text-indigo-700 mb-4">
            CV Analyzer
          </h1>
          <p className="text-gray-600 mb-8 w-3/4 md:w-1/2">
            Upload your CV (PDF only) to see a detailed analysis and feedback.
          </p>

          <div className="flex flex-col items-center gap-4">
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-indigo-300 rounded-xl p-10 hover:bg-indigo-50 transition"
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
                accept=".pdf"
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
        </div>
      )}

      {/* Analysis screen */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 h-screen">
          {/* Left: CV Viewer */}
          <div className="p-0 bg-gray-200 flex justify-center items-center">
            <CvViewer
              file={URL.createObjectURL(file)}
              highlights={result?.highlights || []}
            />
          </div>

          {/* Right: Results Panel */}
          <div className="p-0 overflow-y-auto bg-white shadow-inner relative">
            {/* 🔝 Sticky Header */}
            <div className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Results</h2>
                <p className="text-sm text-gray-500">{file?.name}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-3xl font-extrabold text-indigo-600">
                  {result.score ?? "N/A"} / 100
                </span>
                {result?.score !== undefined && (() => {
                  const { letter, color } = getGrade(result.score);
                  return (
                    <span
                      className={`text-white text-sm font-semibold px-3 py-1 rounded-full mt-1 ${color}`}
                    >
                      Grade {letter}
                    </span>
                  );
                })()}
              </div>
            </div>

            {}
            <div className="p-8">
              {}
              <div>
                <h3 className="font-semibold text-lg mb-3 text-gray-800 flex items-center gap-2">
                  <span className="text-indigo-500">📊</span> Criteria Breakdown
                </h3>
                <div className="space-y-4">
                  {Object.entries(result?.criteria || {}).map(([key, value]) => (
                    <div
                      key={key}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow transition"
                    >
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize font-medium text-gray-700">{key}</span>
                        <span className="font-semibold text-gray-800">{value}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`${getColor(value)} h-2.5 rounded-full transition-all`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      {result?.criteria_explanations?.[key] && (
                        <p className="text-gray-500 text-sm italic mt-2">
                          {result.criteria_explanations[key]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {}
              {result?.feedback?.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-semibold text-lg mb-3 text-gray-800 flex items-center gap-2">
                    <span className="text-indigo-500">💡</span> Feedback
                  </h3>
                  <ul className="space-y-3">
                    {result.feedback.map((f, i) => (
                      <li
                        key={i}
                        className="bg-gray-50 border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition"
                      >
                        <p className="text-gray-700">{f}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {}
              <div className="mt-10 text-center border-t pt-6">
                <button
                  onClick={() => setResult(null)}
                  className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition font-medium text-gray-800"
                >
                  Upload Another CV
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
