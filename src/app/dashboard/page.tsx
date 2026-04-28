'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [analyses, setAnalyses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
  // Demo mode — show empty dashboard without redirecting
  setLoading(false)
  return
}
      setUser(user)
      const { data } = await supabase.from('analyses').select('*').order('created_at', { ascending: false }).limit(20)
      setAnalyses(data || [])
      setLoading(false)
    }
    load()
    const interval = setInterval(load, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const avgScore = analyses.length
    ? Math.round(analyses.reduce((a, b) => a + (b.match_score || 0), 0) / analyses.length)
    : null

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'

  if (loading) return (
    <div style={{minHeight:'100vh', background:'#09090e', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui,sans-serif'}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:'40px', height:'40px', border:'2px solid rgba(201,169,110,0.2)', borderTop:'2px solid #c9a96e', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 16px'}}></div>
        <div style={{color:'rgba(255,255,255,0.3)', fontSize:'13px'}}>Loading...</div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  return (
    <div style={{minHeight:'100vh', background:'#09090e', fontFamily:'system-ui,sans-serif', color:'white'}}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        .card-hover { transition: border-color 0.2s, transform 0.2s; }
        .card-hover:hover { border-color: rgba(201,169,110,0.2) !important; transform: translateY(-2px); }
        .btn-hover { transition: opacity 0.2s, transform 0.2s; }
        .btn-hover:hover { opacity: 0.85; transform: translateY(-1px); }
        .row-hover:hover { background: rgba(255,255,255,0.04) !important; }

        /* Mobile: hide sidebar, show top nav */
        @media (max-width: 768px) {
          .sidebar { display: none !important; }
          .mobile-nav { display: flex !important; }
          .main-content { margin-left: 0 !important; padding: 24px 16px !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .table-header { display: none !important; }
          .table-row { grid-template-columns: 1fr auto !important; }
          .table-company { display: none !important; }
          .table-date { display: none !important; }
          .top-bar { flex-direction: column !important; gap: 16px !important; margin-bottom: 32px !important; }
          .top-bar h1 { font-size: 24px !important; }
        }
      `}</style>

      {/* Mobile top nav */}
      <div className="mobile-nav" style={{display:'none', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'#0d0d14', position:'sticky', top:0, zIndex:50}}>
        <span style={{fontWeight:800, fontSize:'18px'}}>Prep<span style={{color:'#c9a96e'}}>Wise</span></span>
        <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
          <Link href="/analyze" style={{background:'#c9a96e', color:'black', textDecoration:'none', padding:'8px 16px', borderRadius:'8px', fontWeight:700, fontSize:'13px'}}>
            + Analyze
          </Link>
          <button onClick={handleSignOut} style={{background:'transparent', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)', padding:'8px 14px', borderRadius:'8px', fontSize:'13px', cursor:'pointer'}}>
            Out
          </button>
        </div>
      </div>

      <div style={{display:'flex', minHeight:'100vh'}}>
        {/* Desktop Sidebar */}
        <aside className="sidebar" style={{width:'220px', background:'#0d0d14', borderRight:'1px solid rgba(255,255,255,0.05)', padding:'28px 0', display:'flex', flexDirection:'column', position:'fixed', top:0, bottom:0, left:0}}>
          <div style={{padding:'0 24px 32px', borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
            <span style={{fontWeight:800, fontSize:'18px', letterSpacing:'-0.5px'}}>
              Prep<span style={{color:'#c9a96e'}}>Wise</span>
            </span>
          </div>
          <nav style={{padding:'20px 12px', flex:1}}>
            {[
              {icon:'⊞', label:'Dashboard', active:true, href:'/dashboard'},
              {icon:'✦', label:'New Analysis', active:false, href:'/analyze'},
              { icon: '◈', label: 'Job Tracker', active: false, href: '/tracker' },
              { icon: '📄', label: 'CV Score', href: '/cv-score', active: false },
            ].map(item => (
              <Link key={item.label} href={item.href} style={{display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'8px', marginBottom:'4px', background:item.active ? 'rgba(201,169,110,0.1)' : 'transparent', color:item.active ? '#c9a96e' : 'rgba(255,255,255,0.4)', textDecoration:'none', fontSize:'14px', fontWeight:item.active ? 600 : 400}}>
                <span style={{fontSize:'16px'}}>{item.icon}</span>{item.label}
              </Link>
            ))}
          </nav>
          <div style={{padding:'20px 12px', borderTop:'1px solid rgba(255,255,255,0.05)'}}>
            <div style={{padding:'10px 12px', marginBottom:'4px'}}>
              <div style={{color:'rgba(255,255,255,0.6)', fontSize:'13px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{user?.email}</div>
              <div style={{color:'rgba(255,255,255,0.25)', fontSize:'11px', marginTop:'2px'}}>Free Plan</div>
            </div>
            <button onClick={handleSignOut} className="btn-hover" style={{width:'100%', background:'transparent', border:'1px solid rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.35)', padding:'9px 12px', borderRadius:'8px', fontSize:'13px', cursor:'pointer', textAlign:'left'}}>
              ↗ Sign Out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="main-content" style={{marginLeft:'220px', flex:1, padding:'48px 52px', animation:'fadeIn 0.4s ease'}}>

          <div className="top-bar" style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'52px'}}>
            <div>
              <div style={{color:'rgba(255,255,255,0.3)', fontSize:'13px', marginBottom:'6px'}}>
                {new Date().toLocaleDateString('en-US', {weekday:'long', month:'long', day:'numeric'})}
              </div>
              <h1 style={{fontSize:'32px', fontWeight:800, letterSpacing:'-1px', color:'white'}}>
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
                <span style={{color:'#c9a96e'}}>{firstName}</span>
              </h1>
            </div>
            <Link href="/analyze" className="btn-hover" style={{display:'flex', alignItems:'center', gap:'8px', background:'#c9a96e', color:'black', textDecoration:'none', padding:'12px 24px', borderRadius:'12px', fontWeight:700, fontSize:'14px', boxShadow:'0 4px 20px rgba(201,169,110,0.25)', whiteSpace:'nowrap'}}>
              <span>✦</span> New Analysis
            </Link>
          </div>

          <div className="stats-grid" style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', marginBottom:'48px'}}>
            {[
              {label:'Total Analyses', value:analyses.length, sub:analyses.length === 0 ? 'Start your first one' : `${analyses.length} jobs analyzed`, color:'#c9a96e', icon:'◈'},
              {label:'Avg Match Score', value:avgScore !== null ? `${avgScore}%` : '—', sub:avgScore !== null ? (avgScore >= 70 ? 'Strong matches' : avgScore >= 50 ? 'Room to improve' : 'Needs work') : 'No data yet', color:avgScore !== null ? (avgScore >= 70 ? '#34d399' : avgScore >= 50 ? '#fbbf24' : '#f87171') : '#c9a96e', icon:'◎'},
              {label:'This Month', value:analyses.filter(a => new Date(a.created_at) > new Date(Date.now() - 30*24*60*60*1000)).length, sub:'Last 30 days', color:'#818cf8', icon:'◷'},
            ].map(stat => (
              <div key={stat.label} className="card-hover" style={{background:'#111119', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'20px'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px'}}>
                  <span style={{color:'rgba(255,255,255,0.25)', fontSize:'11px', letterSpacing:'2px', textTransform:'uppercase'}}>{stat.label}</span>
                  <span style={{color:stat.color, fontSize:'16px', opacity:0.7}}>{stat.icon}</span>
                </div>
                <div style={{color:stat.color, fontSize:'36px', fontWeight:800, letterSpacing:'-2px', lineHeight:1, marginBottom:'6px'}}>{stat.value}</div>
                <div style={{color:'rgba(255,255,255,0.25)', fontSize:'12px'}}>{stat.sub}</div>
              </div>
            ))}
          </div>

          <div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
              <h2 style={{fontSize:'16px', fontWeight:700, color:'white'}}>Recent Analyses</h2>
              {analyses.length > 0 && <span style={{color:'rgba(255,255,255,0.25)', fontSize:'12px'}}>{analyses.length} total</span>}
            </div>

            {analyses.length === 0 ? (
              <div style={{background:'#111119', border:'1px dashed rgba(255,255,255,0.08)', borderRadius:'16px', padding:'48px 24px', textAlign:'center'}}>
                <div style={{fontSize:'40px', marginBottom:'14px', opacity:0.4}}>✦</div>
                <div style={{color:'white', fontWeight:600, fontSize:'16px', marginBottom:'8px'}}>No analyses yet</div>
                <div style={{color:'rgba(255,255,255,0.3)', fontSize:'13px', marginBottom:'20px'}}>Analyze your first job application to get started</div>
                <Link href="/analyze" style={{background:'#c9a96e', color:'black', textDecoration:'none', padding:'11px 24px', borderRadius:'10px', fontWeight:700, fontSize:'14px'}}>
                  Start First Analysis →
                </Link>
              </div>
            ) : (
              <div style={{background:'#111119', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', overflow:'hidden'}}>
                <div className="table-header" style={{display:'grid', gridTemplateColumns:'2fr 1.5fr 100px 120px', gap:'16px', padding:'14px 24px', borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                  {['Role','Company','Score','Date'].map(h => (
                    <div key={h} style={{color:'rgba(255,255,255,0.2)', fontSize:'11px', letterSpacing:'2px', textTransform:'uppercase'}}>{h}</div>
                  ))}
                </div>
                {analyses.map((a, i) => {
                  const sc = a.match_score || 0
                  const col = sc >= 70 ? '#34d399' : sc >= 50 ? '#fbbf24' : '#f87171'
                  const bg = sc >= 70 ? 'rgba(16,185,129,0.1)' : sc >= 50 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)'
                  return (
                    <div key={a.id} className="table-row row-hover" style={{display:'grid', gridTemplateColumns:'2fr 1.5fr 100px 120px', gap:'16px', padding:'14px 24px', borderBottom: i < analyses.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none', background:'transparent'}}>
                      <div style={{color:'white', fontWeight:500, fontSize:'14px', display:'flex', alignItems:'center', gap:'10px', overflow:'hidden'}}>
                        <div style={{width:'6px', height:'6px', borderRadius:'50%', background:col, flexShrink:0}}></div>
                        <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{a.job_title || 'Untitled'}</span>
                      </div>
                      <div className="table-company" style={{color:'rgba(255,255,255,0.45)', fontSize:'14px', display:'flex', alignItems:'center', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{a.company || '—'}</div>
                      <div style={{display:'flex', alignItems:'center'}}>
                        <span style={{background:bg, color:col, padding:'4px 12px', borderRadius:'100px', fontSize:'13px', fontWeight:700}}>{sc}%</span>
                      </div>
                      <div className="table-date" style={{color:'rgba(255,255,255,0.3)', fontSize:'13px', display:'flex', alignItems:'center'}}>
                        {new Date(a.created_at).toLocaleDateString('en-US', {month:'short', day:'numeric'})}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}