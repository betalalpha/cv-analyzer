import { Document, Page, pdfjs } from "react-pdf";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ✅ Worker setup for pdfjs-dist v5
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function CvViewer({ file, highlights = [] }) {
  const [numPages, setNumPages] = useState(null);
  const [error, setError] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [scaleRatios, setScaleRatios] = useState({}); // store scale per page
  const containerRef = useRef(null);

  // called when a page is rendered
  const handleRenderSuccess = (page, pageIndex) => {
    const viewport = page.getViewport({ scale: 1 });
    const renderedWidth = Math.min(window.innerWidth * 0.9, 850);
    const ratio = renderedWidth / viewport.width;
    setScaleRatios((prev) => ({ ...prev, [pageIndex]: ratio }));
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-auto bg-gray-50 flex justify-center items-start py-10"
    >
      {error && (
        <p className="text-red-600 mt-6">
          ⚠️ Failed to load PDF: {error.message}
        </p>
      )}

      {!error && (
        <Document
          file={file}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          onLoadError={(err) => setError(err)}
        >
          {Array.from({ length: numPages }, (_, i) => (
            <div key={i} className="relative inline-block m-4">
              {/* Render PDF Page */}
              <Page
                pageNumber={i + 1}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                width={Math.min(window.innerWidth * 0.9, 850)}
                className="shadow-2xl rounded-xl bg-white"
                onRenderSuccess={(page) => handleRenderSuccess(page, i)}
              />

              {/* 🟨 Render Highlights */}
              {highlights
                .filter((h) => h.page === i)
                .map((h, j) => {
                  const ratio = scaleRatios[i] || 1;
                  const scaled = {
                    x: h.x * ratio,
                    y: h.y * ratio,
                    w: h.w * ratio,
                    h: h.h * ratio,
                  };
                  return (
                    <div
                      key={j}
                      className={`absolute opacity-30 rounded cursor-pointer transition ${
                        h.color === "red"
                          ? "bg-red-400"
                          : h.color === "green"
                          ? "bg-green-400"
                          : "bg-yellow-300"
                      }`}
                      style={{
                        top: scaled.y,
                        left: scaled.x,
                        width: scaled.w,
                        height: scaled.h,
                      }}
                      onMouseEnter={() => setHovered(h)}
                      onMouseLeave={() => setHovered(null)}
                    ></div>
                  );
                })}

              {/* 💬 Animated Tooltip   ds  dsds  */}
              <AnimatePresence>
                {hovered && hovered.page === i && (() => {
                  const viewerWidth = Math.min(window.innerWidth * 0.9, 850);
                  const tooltipWidth = 300;
                  const margin = 10;

                  const spaceRight = viewerWidth - (hovered.x + hovered.w);
                  const spaceLeft = hovered.x;

                  let leftPos;
                  if (spaceRight >= tooltipWidth + margin) {
                    leftPos = hovered.x + hovered.w + margin;
                  } else if (spaceLeft >= tooltipWidth + margin) {
                    leftPos = hovered.x - tooltipWidth - margin;
                  } else {
                    leftPos = Math.max(
                      10,
                      Math.min(hovered.x, viewerWidth - tooltipWidth - 10)
                    );
                  }

                  const topPos = Math.max(20, Math.min(hovered.y, 750));

                  return (
                    <motion.div
                      key="tooltip"
                      className="absolute bg-white shadow-xl border border-gray-300 rounded-xl p-3 w-72 text-sm text-gray-700"
                      style={{
                        top: topPos,
                        left: leftPos,
                        zIndex: 50,
                      }}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      transition={{
                        duration: 0.2,
                        ease: "easeOut",
                      }}
                    >
                      <p className="font-medium">{hovered.reason}</p>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>
            </div>
          ))}
        </Document>
      )}
    </div>
  );
}
