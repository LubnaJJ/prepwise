import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

export async function POST(req: NextRequest) {
  try {
    const { cvText } = await req.json()

    if (!cvText) return NextResponse.json({ error: 'CV text required' }, { status: 400 })

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: 'You are an expert CV reviewer and career coach. You always respond with valid raw JSON only — no markdown, no backticks, no explanation.',
        },
        {
          role: 'user',
          content: `Review this CV and return ONLY this JSON:

{
  "overallScore": <number 0-100>,
  "grade": "<A/B/C/D/F>",
  "summary": "<2-3 sentence overall assessment>",
  "sections": {
    "formatting": { "score": <0-100>, "feedback": "<specific feedback>" },
    "experience": { "score": <0-100>, "feedback": "<specific feedback>" },
    "skills": { "score": <0-100>, "feedback": "<specific feedback>" },
    "education": { "score": <0-100>, "feedback": "<specific feedback>" },
    "atsCompatibility": { "score": <0-100>, "feedback": "<specific feedback>" }
  },
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": [
    { "priority": "high", "issue": "<issue>", "fix": "<specific actionable fix>" },
    { "priority": "high", "issue": "<issue>", "fix": "<specific actionable fix>" },
    { "priority": "medium", "issue": "<issue>", "fix": "<specific actionable fix>" },
    { "priority": "medium", "issue": "<issue>", "fix": "<specific actionable fix>" },
    { "priority": "low", "issue": "<issue>", "fix": "<specific actionable fix>" }
  ],
  "missingKeywords": ["<keyword 1>", "<keyword 2>", "<keyword 3>", "<keyword 4>", "<keyword 5>"],
  "topRoles": ["<role this CV is best suited for>", "<role 2>", "<role 3>"]
}

CV:
${cvText}`,
        },
      ],
    })

    const text = completion.choices[0].message.content || ''
    const clean = text.replace(/```json/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(clean)
    return NextResponse.json(parsed)

  } catch (err: any) {
    console.error('CV Score error:', err)
    return NextResponse.json({ error: err.message || 'Scoring failed' }, { status: 500 })
  }
}