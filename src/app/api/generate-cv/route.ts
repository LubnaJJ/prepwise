import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

export async function POST(req: NextRequest) {
  try {
    const { cvText, improvements, missingKeywords, topRoles } = await req.json()

    if (!cvText?.trim()) {
      return NextResponse.json({ error: 'CV text required' }, { status: 400 })
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content: `You are an expert CV writer. Your job is to improve and reformat the CV you are given.

CRITICAL RULES — NEVER BREAK THESE:
1. NEVER invent, fabricate or add any experience, jobs, companies, projects, or achievements that are not in the original CV
2. NEVER use placeholder text like [Company Name], [Date], X%, Y%, Z%, [Project Name] etc
3. If the person has no work experience, do NOT add a fake experience section — instead strengthen their projects and education sections
4. Only use real information from the original CV
5. You may reword, restructure and improve the language of existing content
6. You may add a professional summary based ONLY on what is actually in the CV
7. Return only the improved CV as plain text — no explanation, no commentary`,
        },
        {
          role: 'user',
          content: `Improve this CV. Keep ALL real information intact. Do not invent anything.

ORIGINAL CV:
${cvText}

ISSUES TO FIX:
${improvements?.map((i: any) => `- ${i.issue}: ${i.fix}`).join('\n')}

KEYWORDS TO NATURALLY INCORPORATE (only where genuinely relevant):
${missingKeywords?.join(', ')}

TARGET ROLES:
${topRoles?.join(', ')}

FORMATTING RULES:
- Use clear section headers: PROFESSIONAL SUMMARY, EDUCATION, SKILLS, PROJECTS, ACHIEVEMENTS
- Only include EXPERIENCE section if the original CV has real work experience
- Use strong action verbs to describe real existing content
- Make bullet points impactful but truthful
- Keep it clean and ATS-friendly
- Do not add any fake metrics or placeholder values

Return ONLY the improved CV text.`,
        },
      ],
    })

    const improvedCV = completion.choices[0].message.content || ''
    return NextResponse.json({ improvedCV })

  } catch (err: any) {
    console.error('Generate CV error:', err)
    return NextResponse.json({ error: err.message || 'Generation failed' }, { status: 500 })
  }
}