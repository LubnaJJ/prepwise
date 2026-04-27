import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

async function extractTextFromBuffer(buffer: Buffer): Promise<string> {
  // Simple PDF text extraction — reads raw text streams from PDF
  const content = buffer.toString('latin1')
  const texts: string[] = []
  
  // Extract text between BT and ET markers (PDF text blocks)
  const btEtRegex = /BT([\s\S]*?)ET/g
  let match
  while ((match = btEtRegex.exec(content)) !== null) {
    const block = match[1]
    // Extract strings in parentheses
    const parenRegex = /\(([^)]*)\)/g
    let strMatch
    while ((strMatch = parenRegex.exec(block)) !== null) {
      const str = strMatch[1]
        .replace(/\\n/g, ' ')
        .replace(/\\r/g, ' ')
        .replace(/\\\\/g, '\\')
        .replace(/\\'/g, "'")
        .trim()
      if (str.length > 0) texts.push(str)
    }
  }
  
  // Also try hex strings <...>
  const hexRegex = /<([0-9A-Fa-f]+)>/g
  while ((match = hexRegex.exec(content)) !== null) {
    const hex = match[1]
    if (hex.length % 2 === 0 && hex.length > 2) {
      try {
        let str = ''
        for (let i = 0; i < hex.length; i += 2) {
          const charCode = parseInt(hex.substr(i, 2), 16)
          if (charCode > 31 && charCode < 127) str += String.fromCharCode(charCode)
        }
        if (str.length > 2) texts.push(str)
      } catch {}
    }
  }

  const result = texts.join(' ').replace(/\s+/g, ' ').trim()
  return result
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''
    let cvText = ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const file = formData.get('file') as File
      if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
      const buffer = Buffer.from(await file.arrayBuffer())
      cvText = await extractTextFromBuffer(buffer)
    } else {
      const body = await req.json()
      cvText = body.cvText
    }

    if (!cvText?.trim() || cvText.trim().length < 50) {
      return NextResponse.json({ 
        error: 'Could not extract enough text from the PDF. Please try the "Paste Text" option instead and copy-paste your CV content.' 
      }, { status: 400 })
    }

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
  "topRoles": ["<role 1>", "<role 2>", "<role 3>"]
}

CV:
${cvText}`,
        },
      ],
    })

    const text = completion.choices[0].message.content || ''
    const clean = text.replace(/```json/g, '').replace(/```/g, '').trim()
    const result = JSON.parse(clean)
    return NextResponse.json({ ...result, extractedText: cvText })

  } catch (err: any) {
    console.error('CV Score error:', err)
    return NextResponse.json({ error: err.message || 'Scoring failed' }, { status: 500 })
  }
}