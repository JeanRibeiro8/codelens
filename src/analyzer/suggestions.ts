import type { AnalysisIssue } from "./types"

export function generateSuggestions(
  issues: AnalysisIssue[],
  functions: number,
  complexity: number
): string[] {
  const suggestions: string[] = []

  if (complexity > 10) {
    suggestions.push(
      "Consider splitting complex logic into smaller functions."
    )
  }

  if (
    issues.some(
      (issue) => issue.message === "console.log() detected."
    )
  ) {
    suggestions.push(
      "Remove console.log() statements before production."
    )
  }

  if (
    issues.some(
      (issue) => issue.message === "Empty function detected."
    )
  ) {
    suggestions.push(
      "Implement or remove empty functions."
    )
  }

  if (
    issues.some(
      (issue) =>
        issue.message === "Function has too many parameters."
    )
  ) {
    suggestions.push(
      "Consider grouping related parameters into an object."
    )
  }

  if (
    issues.some(
      (issue) => issue.message === "Function is too long."
    )
  ) {
    suggestions.push(
      "Consider splitting long functions into smaller responsibilities."
    )
  }

  if (functions === 0) {
    suggestions.push(
      "Consider organizing reusable logic into functions."
    )
  }

  if (suggestions.length === 0) {
    suggestions.push(
      "The code looks good based on the current analysis."
    )
  }

  return suggestions
}