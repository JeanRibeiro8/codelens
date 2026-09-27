export type IssueSeverity = "low" | "medium" | "high"

export interface AnalysisIssue {
  id: string
  severity: IssueSeverity
  message: string
  line: number
}

export interface AnalysisResult {
  lines: number
  functions: number
  variables: number
  conditions: number
  complexity: number
  qualityScore: number
  issues: AnalysisIssue[]
  suggestions: string[]
}