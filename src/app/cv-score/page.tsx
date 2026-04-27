'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'

export default function CVScore() {
  const [cvText, setCvText] = useState('')
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setExtracting(true)
    setError('')

    try {
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer()
        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        let text = ''
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          text += content.items.map((item: any) => item.str).join(' ') + '\n'
        }
        setCvText(text)
        setInputMode('paste')
      } else if (file.type === 'text/plain') {
        const text = await file.text()
        setCvText(text)
        setInputMode('paste')
      } else {
        setError('Please upload a PDF or TXT file')
      }
    } catch (err) {
      setError('Failed to read file. Try pasting your CV as text instead.')
    } finally {
      setExtracting(false)
    }
  }

  const handleScore = async () => {
    if (!cvText.trim()) { setError('Please upload or paste your CV first.'); return }
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/score-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch (e: any) {
      setError(e.message || 'Scoring failed. Please try again.')
    } finally { setLoading(false) }
  }

  const gradeColor = (grade: string) => {
    if (grade === 'A') return '#34d399'
    if (grade === 'B') return '#4ecdc4'
    if (grade === 'C') return '#fbbf24'
    if (grade === 'D') return '#f97316'
    return '#f87171'
  }

  const scoreColor = (score: number) =>
    score >= 70 ? '#34d399' : score >= 50 ? '#fbbf24' : '#f87171'

  const priorityColor = (p: string) =>
    p === 'high' ? '#f87171' : p === 'medium' ? '#fbbf24' : '#818cf8'

  const inp: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', borderRadius: '12px', padding: '14px 16px', fontSize: '14px', outline: 'none', resize: 'vertical', lineHeight: '1.6', fontFamily: 'system-ui,sans-serif', boxSizing: 'border-box' }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: 'system-ui,sans-serif', color: 'white' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        .score-bar-fill { transition: width 1s ease; }
        @media (max-width: 768px) {
          .cv-nav { padding: 14px 20px !important; }
          .cv-wrap { padding: 24px 16px !important; }
          .sections-grid { grid-template-columns: 1fr !important; }
          .improvements-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Nav */}
      <nav className="cv-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 48px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, background: 'rgba(10,10,15,0.95)', zIndex: 50, backdropFilter: 'blur(20px)' }}>
        <Link href="/dashboard" style={{ color: 'white', fontWeight: 800, fontSize: '18px', textDecoration: 'none', letterSpacing: '-0.5px' }}>
          Prep<span style={{ color: '#c9a96e' }}>Wise</span>
        </Link>
        <Link href="/dashboard" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '13px' }}>
          ← Dashboard
        </Link>
      </nav>

      <div className="cv-wrap" style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px', animation: 'fadeIn 0.4s ease' }}>

        {!result ? (
          <>
            <div style={{ marginBottom: '40px', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.2)', color: '#c9a96e', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', padding: '7px 16px', borderRadius: '100px', marginBottom: '20px' }}>
                ✦ CV Score
              </div>
              <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: '12px' }}>
                How strong is<br />your CV?
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', maxWidth: '480px', margin: '0 auto', lineHeight: '1.7' }}>
                Upload your CV as a PDF or paste the text — get an instant score, ATS analysis, and specific improvements.
              </p>
            </div>

            {/* Toggle */}
            <div style={{ display: 'flex', background: '#111118', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '4px', marginBottom: '24px', width: 'fit-content', margin: '0 auto 24px' }}>
              {(['upload', 'paste'] as const).map(mode => (
                <button key={mode} onClick={() => setInputMode(mode)}
                  style={{ padding: '9px 24px', borderRadius: '9px', border: 'none', background: inputMode === mode ? '#c9a96e' : 'transparent', color: inputMode === mode ? 'black' : 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: inputMode === mode ? 700 : 400, cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize' }}>
                  {mode === 'upload' ? '📄 Upload PDF' : '✏️ Paste Text'}
                </button>
              ))}
            </div>

            {/* Upload zone */}
            {inputMode === 'upload' && (
              <div
                onClick={() => fileRef.current?.click()}
                style={{ border: '2px dashed rgba(201,169,110,0.3)', borderRadius: '16px', padding: '60px 24px', textAlign: 'center', cursor: 'pointer', marginBottom: '20px', transition: 'all 0.2s', background: 'rgba(201,169,110,0.03)' }}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#c9a96e' }}
                onDragLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,169,110,0.3)' }}
                onDrop={e => {
                  e.preventDefault()
                  e.currentTarget.style.borderColor = 'rgba(201,169,110,0.3)'
                  const file = e.dataTransfer.files[0]
                  if (file) {
                    const fakeEvent = { target: { files: [file] } } as any
                    handleFileUpload(fakeEvent)
                  }
                }}
              >
                <input ref={fileRef} type="file" accept=".pdf,.txt" onChange={handleFileUpload} style={{ display: 'none' }} />
                {extracting ? (
                  <>
                    <div style={{ width: '40px', height: '40px', border: '2px solid rgba(201,169,110,0.2)', borderTop: '2px solid #c9a96e', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }}></div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Extracting text from PDF...</div>
                  </>
                ) : fileName ? (
                  <>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
                    <div style={{ color: 'white', fontWeight: 600, marginBottom: '6px' }}>{fileName}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Text extracted successfully — click Score My CV below</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                    <div style={{ color: 'white', fontWeight: 600, fontSize: '16px', marginBottom: '8px' }}>Drop your CV here</div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginBottom: '16px' }}>or click to browse</div>
                    <div style={{ display: 'inline-block', background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.25)', color: '#c9a96e', padding: '8px 20px', borderRadius: '8px', fontSize: '13px' }}>
                      PDF or TXT · Max 10MB
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Paste zone */}
            {inputMode === 'paste' && (
              <div style={{ marginBottom: '20px' }}>
                <textarea
                  value={cvText}
                  onChange={e => setCvText(e.target.value)}
                  placeholder="Paste your full CV text here..."
                  rows={16}
                  style={inp}
                />
              </div>
            )}

            {/* If file uploaded, show extracted text preview */}
            {inputMode === 'upload' && cvText && !extracting && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>Extracted Text Preview</div>
                <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '16px', maxHeight: '160px', overflow: 'auto', color: 'rgba(255,255,255,0.5)', fontSize: '12px', lineHeight: '1.7' }}>
                  {cvText.slice(0, 600)}...
                </div>
              </div>
            )}

            {error && (
              <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', color: '#f87171', fontSize: '13px', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <button
              onClick={handleScore}
              disabled={loading || !cvText.trim()}
              style={{ width: '100%', background: loading || !cvText.trim() ? 'rgba(201,169,110,0.4)' : '#c9a96e', color: 'black', border: 'none', borderRadius: '14px', padding: '18px', fontWeight: 700, fontSize: '16px', cursor: loading ? 'wait' : !cvText.trim() ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
              {loading ? '🤖 Scoring your CV — this takes ~10 seconds...' : '✨ Score My CV →'}
            </button>
          </>

        ) : (
          /* ── RESULTS ── */
          <div style={{ animation: 'fadeIn 0.5s ease' }}>

            {/* Overall score */}
            <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '32px', marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px' }}>Overall CV Score</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '80px', fontWeight: 800, color: scoreColor(result.overallScore), letterSpacing: '-3px', lineHeight: 1 }}>
                  {result.overallScore}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '48px', fontWeight: 800, color: gradeColor(result.grade), lineHeight: 1 }}>{result.grade}</div>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: '4px' }}>out of 100</div>
                </div>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: '1.7', maxWidth: '560px', margin: '0 auto 20px' }}>{result.summary}</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => { setResult(null); setCvText(''); setFileName(''); setInputMode('upload') }}
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.55)', padding: '9px 18px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  ← Score Another CV
                </button>
                <Link href="/analyze" style={{ background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.25)', color: '#c9a96e', padding: '9px 18px', borderRadius: '8px', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>
                  Analyze for a Job →
                </Link>
              </div>
            </div>

            {/* Section scores */}
            <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>Section Breakdown</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {result.sections && Object.entries(result.sections).map(([key, val]: any) => (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ color: 'white', fontSize: '13px', fontWeight: 500, textTransform: 'capitalize' }}>
                        {key === 'atsCompatibility' ? 'ATS Compatibility' : key}
                      </span>
                      <span style={{ color: scoreColor(val.score), fontWeight: 700, fontSize: '13px' }}>{val.score}/100</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '100px', height: '6px', marginBottom: '6px' }}>
                      <div className="score-bar-fill" style={{ width: `${val.score}%`, height: '100%', borderRadius: '100px', background: scoreColor(val.score) }}></div>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', lineHeight: '1.5' }}>{val.feedback}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths + improvements */}
            <div className="sections-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div style={{ background: '#111118', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '16px', padding: '22px' }}>
                <div style={{ color: '#34d399', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '14px' }}>✓ What's Working</div>
                {result.strengths?.map((s: string, i: number) => (
                  <div key={i} style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', padding: '8px 0', borderBottom: i < result.strengths.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', display: 'flex', gap: '8px', lineHeight: '1.5' }}>
                    <span style={{ color: '#34d399', flexShrink: 0 }}>•</span>{s}
                  </div>
                ))}
              </div>

              <div style={{ background: '#111118', border: '1px solid rgba(201,169,110,0.2)', borderRadius: '16px', padding: '22px' }}>
                <div style={{ color: '#c9a96e', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '14px' }}>⚡ Top Roles for You</div>
                {result.topRoles?.map((r: string, i: number) => (
                  <div key={i} style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', padding: '8px 0', borderBottom: i < result.topRoles.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', display: 'flex', gap: '8px', lineHeight: '1.5' }}>
                    <span style={{ color: '#c9a96e', flexShrink: 0 }}>→</span>{r}
                  </div>
                ))}
              </div>
            </div>

            {/* Improvements */}
            <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>Improvements</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {result.improvements?.map((item: any, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '14px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${priorityColor(item.priority)}22`, borderRadius: '12px', padding: '16px' }}>
                    <span style={{ background: `${priorityColor(item.priority)}15`, color: priorityColor(item.priority), fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '100px', flexShrink: 0, height: 'fit-content', letterSpacing: '1px', textTransform: 'uppercase' }}>
                      {item.priority}
                    </span>
                    <div>
                      <div style={{ color: 'white', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>{item.issue}</div>
                      <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', lineHeight: '1.6' }}>{item.fix}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing keywords */}
            <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '14px' }}>Missing Keywords to Add</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {result.missingKeywords?.map((kw: string, i: number) => (
                  <span key={i} style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.25)', color: '#818cf8', padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: 500 }}>
                    + {kw}
                  </span>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}