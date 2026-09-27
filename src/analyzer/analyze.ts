import ts from "typescript"
import type { AnalysisResult, AnalysisIssue } from "./types"
import { calculateQualityScore } from "./quality"
import { generateSuggestions } from "./suggestions"

export function analyzeCode(sourceFile: ts.SourceFile): AnalysisResult {
  let functions = 0
  let variables = 0
  let conditions = 0

  const issues: AnalysisIssue[] = []

  function visit(node: ts.Node) {
    // Count functions.
    if (
      ts.isFunctionDeclaration(node) ||
      ts.isArrowFunction(node) ||
      ts.isFunctionExpression(node)
    ) {
      functions++

      const functionLine =
        sourceFile.getLineAndCharacterOfPosition(
          node.getStart(sourceFile)
        ).line + 1

      // Detect empty functions.
     if (
  node.body &&
  ts.isBlock(node.body) &&
  node.body.statements.length === 0
) {
  issues.push({
    id: `empty-function-${functionLine}`,
    severity: "low",
    message: "Empty function detected.",
    line: functionLine,
  })
}
      // Detect functions with too many parameters.
      if (node.parameters.length > 4) {
        issues.push({
          id: `many-parameters-${functionLine}`,
          severity: "medium",
          message: "Function has too many parameters.",
          line: functionLine,
        })
      }

      // Detect long functions.
      if (node.body) {
        const startLine =
          sourceFile.getLineAndCharacterOfPosition(
            node.body.getStart(sourceFile)
          ).line

        const endLine =
          sourceFile.getLineAndCharacterOfPosition(
            node.body.getEnd()
          ).line

        const functionLines = endLine - startLine + 1

        if (functionLines > 30) {
          issues.push({
            id: `long-function-${functionLine}`,
            severity: "medium",
            message: "Function is too long.",
            line: functionLine,
          })
        }
      }
    }

    // Count variable declarations.
    if (ts.isVariableDeclaration(node)) {
      variables++
    }

    // Count decision points.
    if (
      ts.isIfStatement(node) ||
      ts.isConditionalExpression(node) ||
      ts.isSwitchStatement(node) ||
      ts.isForStatement(node) ||
      ts.isForInStatement(node) ||
      ts.isForOfStatement(node) ||
      ts.isWhileStatement(node) ||
      ts.isDoStatement(node) ||
      ts.isCatchClause(node)
    ) {
      conditions++
    }

    if (ts.isCaseClause(node)) {
      conditions++
    }

    // Detect console.log().
    if (ts.isCallExpression(node)) {
      const expression = node.expression

      if (
        ts.isPropertyAccessExpression(expression) &&
        expression.expression.getText(sourceFile) === "console" &&
        expression.name.getText(sourceFile) === "log"
      ) {
        const line =
          sourceFile.getLineAndCharacterOfPosition(
            node.getStart(sourceFile)
          ).line + 1

        issues.push({
          id: `console-log-${line}`,
          severity: "low",
          message: "console.log() detected.",
          line,
        })
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  const lines =
    sourceFile.getLineAndCharacterOfPosition(sourceFile.end).line + 1

  const complexity = conditions + 1

  // Detect high complexity.
  if (complexity > 10) {
    issues.push({
      id: "high-complexity",
      severity: "high",
      message: "Code has high cyclomatic complexity.",
      line: 1,
    })
  }

  const qualityScore = calculateQualityScore(issues)

  const suggestions = generateSuggestions(
    issues,
    functions,
    complexity
  )

  return {
    lines,
    functions,
    variables,
    conditions,
    complexity,
    qualityScore,
    issues,
    suggestions,
  }
}