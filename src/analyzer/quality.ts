import type { AnalysisIssue } from "./types"

export function calculateQualityScore(
  issues: AnalysisIssue[]
): number {
  let score = 100

  // High-severity issues have the biggest impact.
  score -=
    issues.filter((issue) => issue.severity === "high").length * 20

  // Medium-severity issues have a moderate impact.
  score -=
    issues.filter((issue) => issue.severity === "medium").length * 10

  // Low-severity issues have a smaller impact.
  score -=
    issues.filter((issue) => issue.severity === "low").length * 5

  // Never allow the score to go below zero.
  return Math.max(0, score)
}