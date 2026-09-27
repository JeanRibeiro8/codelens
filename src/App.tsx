import "./App.css"
import { useState } from "react"
import { parseCode } from "./analyzer/parser"
import { analyzeCode } from "./analyzer/analyze"
import type { AnalysisResult } from "./analyzer/types"

interface AIAnalysis {
  result: string
}

function App() {
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("typescript")
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)

  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [aiError, setAiError] = useState("")

  // Run the CodeLens static analysis.
  function handleAnalyze() {
    const sourceFile = parseCode(code, language)
    const result = analyzeCode(sourceFile)

    setAnalysis(result)

    // Clear the previous AI result when the code is analyzed again.
    setAiAnalysis(null)
    setAiError("")
  }

  // Send the code and CodeLens analysis to our backend.
  async function handleAIAnalysis() {
    if (!analysis) {
      return
    }

    setIsAiLoading(true)
    setAiError("")

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language,
          analysis,
        }),
      })

      // Read the response as text first.
      // This allows us to see server errors even when the response is not JSON.
      const responseText = await response.text()

      let data: {
        result?: string
        error?: string
      }

      // Try to convert the server response from JSON text into an object.
      try {
        data = JSON.parse(responseText)
      } catch {
        throw new Error(
          responseText || "The server returned an invalid response."
        )
      }

      // Handle HTTP errors returned by our backend.
      if (!response.ok) {
        throw new Error(data.error || "AI analysis failed.")
      }

      // Save the AI result.
      setAiAnalysis({
        result: data.result || "",
      })
    } catch (error) {
      setAiError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      )
    } finally {
      // Always stop the loading state.
      setIsAiLoading(false)
    }
  }

  return (
    <main className="app">
      <header className="header">
        <div>
          <p className="eyebrow">Developer Tool</p>

          <h1>CodeLens</h1>

          <p className="subtitle">
            Analyze your code. Understand your code.
          </p>
        </div>
      </header>

      <section className="workspace">
        <div className="editor-panel">
          <div className="panel-header">
            <h2>Code Analyzer</h2>

            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              <option value="typescript">TypeScript</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>

          <textarea
            value={code}
            placeholder="Paste your code here..."
            spellCheck={false}
            onChange={(event) => setCode(event.target.value)}
          />

          <button type="button" onClick={handleAnalyze}>
            Analyze Code
          </button>
        </div>

        <div className="results-panel">
          <div className="panel-header">
            <h2>Analysis Results</h2>
          </div>

          {analysis ? (
            <div className="results">
              <div className="quality-card">
                <span>Code Quality</span>

                <strong>{analysis.qualityScore}</strong>

                <small>out of 100</small>
              </div>

              <div className="metric-card">
                <strong>{analysis.lines}</strong>
                <span>Lines</span>
              </div>

              <div className="metric-card">
                <strong>{analysis.functions}</strong>
                <span>Functions</span>
              </div>

              <div className="metric-card">
                <strong>{analysis.variables}</strong>
                <span>Variables</span>
              </div>

              <div className="metric-card">
                <strong>{analysis.conditions}</strong>
                <span>Conditions</span>
              </div>

              <div className="metric-card">
                <strong>{analysis.complexity}</strong>
                <span>Complexity</span>
              </div>

              <div className="metric-card">
                <strong>{analysis.issues.length}</strong>
                <span>Issues</span>
              </div>

              <div className="issues-section">
                <h3>Potential Issues</h3>

                {analysis.issues.length === 0 ? (
                  <p className="no-issues">
                    No potential issues detected.
                  </p>
                ) : (
                  <div className="issues-list">
                    {analysis.issues.map((issue) => (
                      <div
                        className={`issue issue-${issue.severity}`}
                        key={issue.id}
                      >
                        <div>
                          <strong>{issue.message}</strong>

                          <span>Line {issue.line}</span>
                        </div>

                        <span className="severity">
                          {issue.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="suggestions-section">
                <h3>Suggestions</h3>

                <div className="suggestions-list">
                  {analysis.suggestions.map((suggestion) => (
                    <div className="suggestion" key={suggestion}>
                      <span>→</span>

                      <p>{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ai-section">
                <h3>AI Analysis</h3>

                <button
                  type="button"
                  onClick={handleAIAnalysis}
                  disabled={isAiLoading}
                >
                  {isAiLoading
                    ? "Analyzing with AI..."
                    : "Ask AI to Explain"}
                </button>

                {aiError && (
                  <p className="ai-error">
                    {aiError}
                  </p>
                )}

                {aiAnalysis && (
                  <div className="ai-result">
                    <p>{aiAnalysis.result}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <h3>No analysis yet</h3>

              <p>
                Add some code and run the analyzer to see the results.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default App