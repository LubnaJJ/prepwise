import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

export async function POST(req: NextRequest) {
  try {
    const { cvText, jobDescription, jobTitle, company } = await req.json()

    if (!cvText || !jobDescription) {
      return NextResponse.json({ error: 'CV and job description required' }, { status: 400 })
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: 'You are an expert career coach and HR specialist. You always respond with valid raw JSON only — no markdown, no backticks, no explanation.',
        },
        {
          role: 'user',
          content: `Analyze this CV against the job description and return ONLY this JSON structure:

{
  "matchScore": <number 0-100>,
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "gaps": ["<gap 1>", "<gap 2>", "<gap 3>"],
  "interviewQuestions": [
    { "question": "<question>", "suggestedAnswer": "<personalised answer based on their CV>" },
    { "question": "<question>", "suggestedAnswer": "<personalised answer based on their CV>" },
    { "question": "<question>", "suggestedAnswer": "<personalised answer based on their CV>" },
    { "question": "<question>", "suggestedAnswer": "<personalised answer based on their CV>" },
    { "question": "<question>", "suggestedAnswer": "<personalised answer based on their CV>" }
  ],
  "coverLetter": "<full professional cover letter tailored to this specific job>",
  "recommendations": ["<recommendation 1>", "<recommendation 2>", "<recommendation 3>"]
}

CV:
${cvText}

Job Description:
${jobDescription}`,
        },
      ],
    })

    const text = completion.choices[0].message.content || ''
    const clean = text.replace(/```json/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(clean)

    // Save to Supabase
    try {
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('analyses').insert({
          user_id: user.id,
          job_title: jobTitle || 'Unknown',
          company: company || 'Unknown',
          match_score: parsed.matchScore,
          result: parsed,
        })
      }
    } catch (dbErr) {
      console.error('DB save failed (non-fatal):', dbErr)
    }

    return NextResponse.json(parsed)

  } catch (err: any) {
    console.error('Analysis error:', err)
    return NextResponse.json({ error: err.message || 'Analysis failed' }, { status: 500 })
  }
}