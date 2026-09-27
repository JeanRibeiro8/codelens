import ts from "typescript"

export function parseCode(code: string, language: string) {
  const scriptKind =
    language === "javascript"
      ? ts.ScriptKind.JS
      : ts.ScriptKind.TS

  const sourceFile = ts.createSourceFile(
    "code.ts",
    code,
    ts.ScriptTarget.Latest,
    true,
    scriptKind
  )

  return sourceFile
}