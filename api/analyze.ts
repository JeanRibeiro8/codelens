import OpenAI from "openai"
import type { VercelRequest, VercelResponse } from "@vercel/node"

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed.",
    })
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is not configured.",
      })
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const { code, language, analysis } = req.body

    if (!code || !language || !analysis) {
      return res.status(400).json({
        error: "Code, language, and analysis are required.",
      })
    }

    const response = await client.responses.create({
      model: "gpt-5.6-luna",

      input: `
You are CodeLens AI, a code analysis assistant.

Analyze the following ${language} code using the static analysis results provided by CodeLens.

Your job is to:

1. Explain what the code is doing.
2. Explain the important issues detected by CodeLens.
3. Explain the complexity and code quality.
4. Give practical recommendations for improvement.

Keep the explanation clear and useful for a junior developer.

Code:
${code}

CodeLens analysis:
${JSON.stringify(analysis, null, 2)}
      `,

      store: false,
    })

    return res.status(200).json({
      result: response.output_text,
    })
  } catch (error) {
    console.error("OpenAI API error:", error)

    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to analyze the code with AI.",
    })
  }
}