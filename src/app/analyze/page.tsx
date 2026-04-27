'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function Analyze() {
  const [cvText, setCvText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('questions')
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  const handleAnalyze = async () => {
    if (!cvText.trim() || !jobDescription.trim()) { setError('Please fill in both your CV and the job description.'); return }
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/analyze', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({cvText, jobDescription, jobTitle, company}) })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('analyses').insert({ user_id:user.id, job_title:jobTitle||'Unknown Role', company:company||'Unknown Company', match_score:data.matchScore, result:data })
      }
      setResult(data)
    } catch(e: any) {
      setError(e.message || 'Analysis failed. Please try again.')
    } finally { setLoading(false) }
  }

  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const scoreColor = result ? (result.matchScore >= 70 ? '#34d399' : result.matchScore >= 50 ? '#fbbf24' : '#f87171') : '#c9a96e'
  const scoreBg = result ? (result.matchScore >= 70 ? 'rgba(16,185,129,0.1)' : result.matchScore >= 50 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)') : 'rgba(201,169,110,0.1)'

  const taStyle = {width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'white', borderRadius:'12px', padding:'14px 16px', fontSize:'14px', outline:'none', resize:'vertical' as const, lineHeight:'1.6', fontFamily:'system-ui,sans-serif', boxSizing:'border-box' as const}
  const inputStyle = {width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'white', borderRadius:'12px', padding:'12px 16px', fontSize:'14px', outline:'none', fontFamily:'system-ui,sans-serif', boxSizing:'border-box' as const}
  const labelStyle = {color:'rgba(255,255,255,0.45)', fontSize:'11px', letterSpacing:'2px', textTransform:'uppercase' as const, display:'block', marginBottom:'8px'}

  return (
    <div style={{minHeight:'100vh', background:'#0a0a0f', fontFamily:'system-ui,sans-serif'}}>
      <style>{`
        @media (max-width: 768px) {
          .analyze-grid { grid-template-columns: 1fr !important; }
          .analyze-nav { padding: 14px 20px !important; }
          .analyze-wrap { padding: 28px 16px !important; }
          .score-card { grid-template-columns: 1fr !important; text-align: center; }
          .strengths-grid { grid-template-columns: 1fr !important; }
          .score-box { min-width: unset !important; }
          .tab-btn { padding: 14px 16px !important; font-size: 13px !important; }
        }
      `}</style>

      <nav className="analyze-nav" style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 48px', borderBottom:'1px solid rgba(255,255,255,0.06)', position:'sticky', top:0, background:'rgba(10,10,15,0.95)', zIndex:50, backdropFilter:'blur(20px)'}}>
        <Link href="/dashboard" style={{color:'white', fontWeight:800, fontSize:'18px', textDecoration:'none', letterSpacing:'-0.5px'}}>
          Prep<span style={{color:'#c9a96e'}}>Wise</span>
        </Link>
        <Link href="/dashboard" style={{color:'rgba(255,255,255,0.4)', textDecoration:'none', fontSize:'13px', display:'flex', alignItems:'center', gap:'6px'}}>
          ← Dashboard
        </Link>
      </nav>

      <div className="analyze-wrap" style={{maxWidth:'1100px', margin:'0 auto', padding:'48px 24px'}}>
        <div style={{marginBottom:'36px'}}>
          <h1 style={{color:'white', fontSize:'clamp(24px, 4vw, 34px)', fontWeight:800, letterSpacing:'-1px', marginBottom:'8px'}}>New Analysis</h1>
          <p style={{color:'rgba(255,255,255,0.35)', fontSize:'14px'}}>Paste your CV and a job description to get your personalised prep report.</p>
        </div>

        {!result ? (
          <div className="analyze-grid" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
            <div style={{background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'20px'}}>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'18px'}}>
                <div>
                  <label style={labelStyle}>Job Title</label>
                  <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Frontend Developer" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Company</label>
                  <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Google" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Job Description</label>
                <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Paste the full job description here..." rows={12} style={taStyle} />
              </div>
            </div>

            <div style={{background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'20px'}}>
              <label style={labelStyle}>Your CV / Resume</label>
              <textarea value={cvText} onChange={e => setCvText(e.target.value)} placeholder="Paste your full CV text here..." rows={16} style={taStyle} />
            </div>

            <div style={{gridColumn:'1/-1'}}>
              {error && <div style={{background:'rgba(220,38,38,0.1)', border:'1px solid rgba(220,38,38,0.2)', color:'#f87171', fontSize:'13px', padding:'12px 16px', borderRadius:'10px', marginBottom:'14px'}}>{error}</div>}
              <button onClick={handleAnalyze} disabled={loading} style={{width:'100%', background:loading ? 'rgba(201,169,110,0.5)' : '#c9a96e', color:'black', border:'none', borderRadius:'14px', padding:'18px', fontWeight:700, fontSize:'16px', cursor:loading ? 'wait' : 'pointer'}}>
                {loading ? '🤖 Analyzing with AI — this takes ~15 seconds...' : '✨ Analyze My Application →'}
              </button>
            </div>
          </div>

        ) : (
          <div>
            <div className="score-card" style={{display:'grid', gridTemplateColumns:'auto 1fr', gap:'24px', marginBottom:'20px', background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'20px', padding:'28px', alignItems:'center'}}>
              <div className="score-box" style={{background:scoreBg, border:`2px solid ${scoreColor}33`, borderRadius:'16px', padding:'24px 32px', textAlign:'center', minWidth:'150px'}}>
                <div style={{color:scoreColor, fontSize:'52px', fontWeight:800, lineHeight:1}}>{result.matchScore}%</div>
                <div style={{color:'rgba(255,255,255,0.35)', fontSize:'11px', marginTop:'6px', letterSpacing:'2px', textTransform:'uppercase'}}>Match Score</div>
              </div>
              <div>
                <div style={{color:'#c9a96e', fontSize:'11px', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'8px'}}>Analysis Complete ✓</div>
                <div style={{color:'white', fontWeight:700, fontSize:'20px', marginBottom:'10px'}}>{jobTitle}{company ? ` at ${company}` : ''}</div>
                <p style={{color:'rgba(255,255,255,0.5)', fontSize:'14px', lineHeight:'1.7', marginBottom:'16px'}}>{result.summary}</p>
                <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
                  <button onClick={() => {setResult(null); setCvText(''); setJobDescription(''); setJobTitle(''); setCompany('')}} style={{background:'transparent', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.55)', padding:'9px 18px', borderRadius:'8px', fontSize:'13px', cursor:'pointer'}}>← New Analysis</button>
                  <Link href="/dashboard" style={{background:'rgba(201,169,110,0.1)', border:'1px solid rgba(201,169,110,0.25)', color:'#c9a96e', padding:'9px 18px', borderRadius:'8px', fontSize:'13px', textDecoration:'none'}}>View Dashboard →</Link>
                </div>
              </div>
            </div>

            <div className="strengths-grid" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'18px'}}>
              <div style={{background:'#111118', border:'1px solid rgba(16,185,129,0.2)', borderRadius:'16px', padding:'22px'}}>
                <div style={{color:'#34d399', fontSize:'11px', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'14px'}}>✓ Strengths</div>
                {result.strengths?.map((s: string, i: number) => (
                  <div key={i} style={{color:'rgba(255,255,255,0.7)', fontSize:'13px', padding:'9px 0', borderBottom:i < result.strengths.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none', lineHeight:'1.5', display:'flex', gap:'8px'}}>
                    <span style={{color:'#34d399', flexShrink:0}}>•</span>{s}
                  </div>
                ))}
              </div>
              <div style={{background:'#111118', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'16px', padding:'22px'}}>
                <div style={{color:'#f87171', fontSize:'11px', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'14px'}}>⚠ Gaps</div>
                {result.gaps?.map((g: string, i: number) => (
                  <div key={i} style={{color:'rgba(255,255,255,0.7)', fontSize:'13px', padding:'9px 0', borderBottom:i < result.gaps.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none', lineHeight:'1.5', display:'flex', gap:'8px'}}>
                    <span style={{color:'#f87171', flexShrink:0}}>•</span>{g}
                  </div>
                ))}
              </div>
            </div>

            <div style={{background:'#111118', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', overflow:'hidden'}}>
              <div style={{display:'flex', borderBottom:'1px solid rgba(255,255,255,0.07)', overflowX:'auto'}}>
                {[{id:'questions',label:'💬 Questions'},{id:'cover',label:'✉️ Cover Letter'},{id:'tips',label:'💡 Tips'}].map(tab => (
                  <button key={tab.id} className="tab-btn" onClick={() => setActiveTab(tab.id)} style={{padding:'16px 24px', background:'transparent', border:'none', color:activeTab===tab.id ? '#c9a96e' : 'rgba(255,255,255,0.3)', fontSize:'14px', cursor:'pointer', borderBottom:activeTab===tab.id ? '2px solid #c9a96e' : '2px solid transparent', fontWeight:activeTab===tab.id ? 600 : 400, whiteSpace:'nowrap'}}>
                    {tab.label}
                  </button>
                ))}
              </div>

              <div style={{padding:'24px'}}>
                {activeTab === 'questions' && (
                  <div style={{display:'flex', flexDirection:'column', gap:'14px'}}>
                    {result.interviewQuestions?.map((q: any, i: number) => (
                      <div key={i} style={{background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', padding:'20px'}}>
                        <span style={{background:'rgba(201,169,110,0.15)', color:'#c9a96e', fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'100px', display:'inline-block', marginBottom:'10px'}}>Q{i+1}</span>
                        <div style={{color:'white', fontWeight:600, fontSize:'15px', marginBottom:'14px', lineHeight:'1.5'}}>{q.question}</div>
                        <div style={{borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'14px'}}>
                          <div style={{color:'rgba(255,255,255,0.2)', fontSize:'10px', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'8px'}}>Suggested Answer</div>
                          <div style={{color:'rgba(255,255,255,0.55)', fontSize:'13px', lineHeight:'1.75'}}>{q.suggestedAnswer}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === 'cover' && (
                  <div>
                    <div style={{display:'flex', justifyContent:'flex-end', marginBottom:'14px'}}>
                      <button onClick={() => copyToClipboard(result.coverLetter)} style={{background:copied ? 'rgba(16,185,129,0.15)' : 'rgba(201,169,110,0.1)', border:`1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(201,169,110,0.25)'}`, color:copied ? '#34d399' : '#c9a96e', padding:'8px 18px', borderRadius:'8px', fontSize:'13px', cursor:'pointer'}}>
                        {copied ? '✓ Copied!' : '⎘ Copy'}
                      </button>
                    </div>
                    <div style={{color:'rgba(255,255,255,0.7)', fontSize:'14px', lineHeight:'1.9', whiteSpace:'pre-wrap', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', padding:'24px'}}>
                      {result.coverLetter}
                    </div>
                  </div>
                )}
                {activeTab === 'tips' && (
                  <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                    {result.recommendations?.map((r: string, i: number) => (
                      <div key={i} style={{display:'flex', gap:'14px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', padding:'16px 18px', alignItems:'flex-start'}}>
                        <span style={{background:'rgba(201,169,110,0.15)', color:'#c9a96e', fontWeight:700, fontSize:'13px', flexShrink:0, width:'28px', height:'28px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center'}}>{i+1}</span>
                        <span style={{color:'rgba(255,255,255,0.65)', fontSize:'14px', lineHeight:'1.65', paddingTop:'3px'}}>{r}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}