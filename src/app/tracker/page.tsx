'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Status = 'wishlist' | 'applied' | 'interview' | 'offer' | 'rejected'

type Job = {
  id: string
  job_title: string
  company: string
  status: Status
  notes: string
  job_url: string
  match_score: number | null
  created_at: string
}

const COLUMNS: { id: Status; label: string; color: string; bg: string }[] = [
  { id: 'wishlist',  label: 'Wishlist',   color: '#818cf8', bg: 'rgba(129,140,248,0.08)' },
  { id: 'applied',   label: 'Applied',    color: '#c9a96e', bg: 'rgba(201,169,110,0.08)' },
  { id: 'interview', label: 'Interview',  color: '#4ecdc4', bg: 'rgba(78,205,196,0.08)'  },
  { id: 'offer',     label: 'Offer',      color: '#34d399', bg: 'rgba(52,211,153,0.08)'  },
  { id: 'rejected',  label: 'Rejected',   color: '#f87171', bg: 'rgba(248,113,113,0.08)' },
]

// ── Modal lives OUTSIDE Tracker so it never remounts on state change ──
function Modal({ onSave, onClose, title, form, setForm, saving }: {
  onSave: () => void
  onClose: () => void
  title: string
  form: any
  setForm: (fn: (p: any) => any) => void
  saving: boolean
}) {
  const inp: React.CSSProperties = { width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'white', borderRadius:'10px', padding:'11px 14px', fontSize:'13px', outline:'none', fontFamily:'system-ui,sans-serif', boxSizing:'border-box' }
  const lbl: React.CSSProperties = { color:'rgba(255,255,255,0.4)', fontSize:'10px', letterSpacing:'2px', textTransform:'uppercase', display:'block', marginBottom:'6px' }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', backdropFilter:'blur(6px)' }}>
      <div style={{ background:'#111118', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'20px', padding:'32px', width:'100%', maxWidth:'480px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
          <h3 style={{ color:'white', fontWeight:700, fontSize:'18px' }}>{title}</h3>
          <button onClick={onClose} style={{ background:'transparent', border:'none', color:'rgba(255,255,255,0.4)', fontSize:'22px', cursor:'pointer', lineHeight:1 }}>×</button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'14px' }}>
          <div>
            <label style={lbl}>Job Title *</label>
            <input
              value={form.job_title}
              onChange={e => setForm(p => ({ ...p, job_title: e.target.value }))}
              placeholder="e.g. Frontend Dev"
              style={inp}
            />
          </div>
          <div>
            <label style={lbl}>Company *</label>
            <input
              value={form.company}
              onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
              placeholder="e.g. Google"
              style={inp}
            />
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'14px' }}>
          <div>
            <label style={lbl}>Status</label>
            <select
              value={form.status}
              onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
              style={{ ...inp, appearance:'none' as const }}
            >
              {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Match Score %</label>
            <input
              type="number" min="0" max="100"
              value={form.match_score}
              onChange={e => setForm(p => ({ ...p, match_score: e.target.value }))}
              placeholder="e.g. 85"
              style={inp}
            />
          </div>
        </div>

        <div style={{ marginBottom:'14px' }}>
          <label style={lbl}>Job URL</label>
          <input
            value={form.job_url}
            onChange={e => setForm(p => ({ ...p, job_url: e.target.value }))}
            placeholder="https://..."
            style={inp}
          />
        </div>

        <div style={{ marginBottom:'24px' }}>
          <label style={lbl}>Notes</label>
          <textarea
            value={form.notes}
            onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            placeholder="Interview date, contact name, anything useful..."
            rows={3}
            style={{ ...inp, resize:'vertical', lineHeight:'1.6' }}
          />
        </div>

        <div style={{ display:'flex', gap:'10px' }}>
          <button onClick={onClose} style={{ flex:1, background:'transparent', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)', padding:'12px', borderRadius:'10px', fontSize:'14px', cursor:'pointer' }}>
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving || !form.job_title || !form.company}
            style={{ flex:2, background: saving ? 'rgba(201,169,110,0.5)' : '#c9a96e', color:'black', border:'none', padding:'12px', borderRadius:'10px', fontSize:'14px', fontWeight:700, cursor:'pointer', opacity: (!form.job_title || !form.company) ? 0.5 : 1 }}
          >
            {saving ? 'Saving...' : 'Save Application'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────
export default function Tracker() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editJob, setEditJob] = useState<Job | null>(null)
  const [dragJob, setDragJob] = useState<string | null>(null)
  const [form, setForm] = useState({ job_title:'', company:'', status:'wishlist' as Status, notes:'', job_url:'', match_score:'' })
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)
      const { data } = await supabase.from('job_applications').select('*').order('created_at', { ascending: false })
      setJobs(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const refresh = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('job_applications').select('*').order('created_at', { ascending: false })
    setJobs(data || [])
  }

  const handleAdd = async () => {
    if (!form.job_title || !form.company) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('job_applications').insert({
      user_id: user.id,
      job_title: form.job_title,
      company: form.company,
      status: form.status,
      notes: form.notes,
      job_url: form.job_url,
      match_score: form.match_score ? parseInt(form.match_score) : null,
    })
    setForm({ job_title:'', company:'', status:'wishlist', notes:'', job_url:'', match_score:'' })
    setShowAdd(false)
    setSaving(false)
    refresh()
  }

  const handleEdit = async () => {
    if (!editJob) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('job_applications').update({
      job_title: form.job_title,
      company: form.company,
      status: form.status,
      notes: form.notes,
      job_url: form.job_url,
      match_score: form.match_score ? parseInt(form.match_score) : null,
      updated_at: new Date().toISOString(),
    }).eq('id', editJob.id)
    setEditJob(null)
    setSaving(false)
    refresh()
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    await supabase.from('job_applications').delete().eq('id', id)
    refresh()
  }

  const handleStatusChange = async (id: string, status: Status) => {
    const supabase = createClient()
    await supabase.from('job_applications').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j))
  }

  const openEdit = (job: Job) => {
    setEditJob(job)
    setForm({ job_title: job.job_title, company: job.company, status: job.status, notes: job.notes || '', job_url: job.job_url || '', match_score: job.match_score?.toString() || '' })
  }

  const handleDragStart = (id: string) => setDragJob(id)
  const handleDrop = (status: Status) => {
    if (dragJob) { handleStatusChange(dragJob, status); setDragJob(null) }
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#09090e', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui,sans-serif' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:'36px', height:'36px', border:'2px solid rgba(201,169,110,0.2)', borderTop:'2px solid #c9a96e', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 12px' }}></div>
        <div style={{ color:'rgba(255,255,255,0.3)', fontSize:'13px' }}>Loading tracker...</div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#09090e', fontFamily:'system-ui,sans-serif', color:'white' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        .job-card { transition: transform 0.15s, box-shadow 0.15s; cursor: grab; }
        .job-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
        .col-drop { transition: background 0.15s; }
        .col-drop.drag-over { background: rgba(201,169,110,0.05) !important; }
        .icon-btn { transition: background 0.15s; }
        .icon-btn:hover { background: rgba(255,255,255,0.1) !important; }
        @media (max-width: 768px) {
          .sidebar { display: none !important; }
          .mobile-nav { display: flex !important; }
          .main-content { margin-left: 0 !important; padding: 20px 16px !important; }
          .kanban { flex-direction: column !important; min-width: unset !important; }
          .kanban-col { min-width: unset !important; width: 100% !important; }
        }
      `}</style>

      {/* Mobile nav */}
      <div className="mobile-nav" style={{ display:'none', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'#0d0d14', position:'sticky', top:0, zIndex:50 }}>
        <span style={{ fontWeight:800, fontSize:'18px' }}>Prep<span style={{ color:'#c9a96e' }}>Wise</span></span>
        <button onClick={() => { setShowAdd(true); setForm({ job_title:'', company:'', status:'wishlist', notes:'', job_url:'', match_score:'' }) }} style={{ background:'#c9a96e', color:'black', border:'none', padding:'8px 16px', borderRadius:'8px', fontWeight:700, fontSize:'13px', cursor:'pointer' }}>
          + Add Job
        </button>
      </div>

      <div style={{ display:'flex', minHeight:'100vh' }}>

        {/* Sidebar */}
        <aside className="sidebar" style={{ width:'220px', background:'#0d0d14', borderRight:'1px solid rgba(255,255,255,0.05)', padding:'28px 0', display:'flex', flexDirection:'column', position:'fixed', top:0, bottom:0, left:0 }}>
          <div style={{ padding:'0 24px 32px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontWeight:800, fontSize:'18px', letterSpacing:'-0.5px' }}>
              Prep<span style={{ color:'#c9a96e' }}>Wise</span>
            </span>
          </div>
          <nav style={{ padding:'20px 12px', flex:1 }}>
            {[
              { icon:'⊞', label:'Dashboard',    href:'/dashboard', active:false },
              { icon:'✦', label:'New Analysis', href:'/analyze',   active:false },
              { icon:'◈', label:'Job Tracker',  href:'/tracker',   active:true  },
              { icon: '📄', label: 'CV Score', href: '/cv-score', active: false },
            ].map(item => (
              <Link key={item.label} href={item.href} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'8px', marginBottom:'4px', background: item.active ? 'rgba(201,169,110,0.1)' : 'transparent', color: item.active ? '#c9a96e' : 'rgba(255,255,255,0.4)', textDecoration:'none', fontSize:'14px', fontWeight: item.active ? 600 : 400 }}>
                <span>{item.icon}</span>{item.label}
              </Link>
            ))}
          </nav>
          <div style={{ padding:'20px 12px', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ padding:'10px 12px' }}>
              <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'12px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="main-content" style={{ marginLeft:'220px', flex:1, padding:'40px', animation:'fadeIn 0.4s ease', overflowX:'auto' }}>

          {/* Header */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'36px', flexWrap:'wrap', gap:'16px' }}>
            <div>
              <h1 style={{ fontSize:'28px', fontWeight:800, letterSpacing:'-1px', color:'white', marginBottom:'4px' }}>Job Tracker</h1>
              <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'13px' }}>{jobs.length} application{jobs.length !== 1 ? 's' : ''} tracked</p>
            </div>
            <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
              <Link href="/analyze" style={{ background:'rgba(201,169,110,0.1)', border:'1px solid rgba(201,169,110,0.25)', color:'#c9a96e', textDecoration:'none', padding:'10px 18px', borderRadius:'10px', fontSize:'13px', fontWeight:600 }}>
                ✦ Analyze a Job
              </Link>
              <button
                onClick={() => { setShowAdd(true); setForm({ job_title:'', company:'', status:'wishlist', notes:'', job_url:'', match_score:'' }) }}
                style={{ background:'#c9a96e', color:'black', border:'none', padding:'10px 18px', borderRadius:'10px', fontSize:'13px', fontWeight:700, cursor:'pointer' }}
              >
                + Add Application
              </button>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display:'flex', gap:'10px', marginBottom:'28px', flexWrap:'wrap' }}>
            {COLUMNS.map(col => {
              const count = jobs.filter(j => j.status === col.id).length
              return (
                <div key={col.id} style={{ background:'#111119', border:`1px solid ${col.color}22`, borderRadius:'12px', padding:'12px 18px', display:'flex', alignItems:'center', gap:'10px' }}>
                  <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:col.color, flexShrink:0 }}></div>
                  <div>
                    <div style={{ color:col.color, fontWeight:800, fontSize:'20px', lineHeight:1 }}>{count}</div>
                    <div style={{ color:'rgba(255,255,255,0.25)', fontSize:'10px', marginTop:'2px' }}>{col.label}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Kanban */}
          <div className="kanban" style={{ display:'flex', gap:'14px', alignItems:'flex-start', minWidth:'900px' }}>
            {COLUMNS.map(col => {
              const colJobs = jobs.filter(j => j.status === col.id)
              return (
                <div
                  key={col.id}
                  className="kanban-col col-drop"
                  style={{ flex:1, minWidth:'180px', background:'#111119', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'14px', padding:'14px', minHeight:'420px' }}
                  onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('drag-over') }}
                  onDragLeave={e => e.currentTarget.classList.remove('drag-over')}
                  onDrop={e => { e.currentTarget.classList.remove('drag-over'); handleDrop(col.id) }}
                >
                  {/* Col header */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px', paddingBottom:'10px', borderBottom:`1px solid ${col.color}20` }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
                      <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:col.color }}></div>
                      <span style={{ color:col.color, fontSize:'11px', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase' }}>{col.label}</span>
                    </div>
                    <span style={{ background:col.bg, color:col.color, fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'100px' }}>{colJobs.length}</span>
                  </div>

                  {/* Cards */}
                  <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                    {colJobs.map(job => (
                      <div
                        key={job.id}
                        className="job-card"
                        draggable
                        onDragStart={() => handleDragStart(job.id)}
                        style={{ background:'#18181f', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'10px', padding:'12px' }}
                      >
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'6px' }}>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ color:'white', fontWeight:600, fontSize:'13px', marginBottom:'2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{job.job_title}</div>
                            <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'11px' }}>{job.company}</div>
                          </div>
                          {job.match_score !== null && (
                            <span style={{ background: job.match_score >= 70 ? 'rgba(52,211,153,0.15)' : job.match_score >= 50 ? 'rgba(251,191,36,0.15)' : 'rgba(248,113,113,0.15)', color: job.match_score >= 70 ? '#34d399' : job.match_score >= 50 ? '#fbbf24' : '#f87171', fontSize:'11px', fontWeight:700, padding:'2px 8px', borderRadius:'100px', flexShrink:0, marginLeft:'6px' }}>
                              {job.match_score}%
                            </span>
                          )}
                        </div>

                        {job.notes ? (
                          <div style={{ color:'rgba(255,255,255,0.3)', fontSize:'11px', lineHeight:'1.5', marginBottom:'8px', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as const }}>
                            {job.notes}
                          </div>
                        ) : null}

                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'6px' }}>
                          <span style={{ color:'rgba(255,255,255,0.2)', fontSize:'10px' }}>
                            {new Date(job.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric' })}
                          </span>
                          <div style={{ display:'flex', gap:'4px' }}>
                            {job.job_url && (
                              <a href={job.job_url} target="_blank" className="icon-btn" style={{ background:'rgba(255,255,255,0.05)', border:'none', color:'rgba(255,255,255,0.4)', width:'24px', height:'24px', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', textDecoration:'none', cursor:'pointer' }}>↗</a>
                            )}
                            <button onClick={() => openEdit(job)} className="icon-btn" style={{ background:'rgba(255,255,255,0.05)', border:'none', color:'rgba(255,255,255,0.4)', width:'24px', height:'24px', borderRadius:'6px', cursor:'pointer', fontSize:'12px' }}>✎</button>
                            <button onClick={() => handleDelete(job.id)} className="icon-btn" style={{ background:'rgba(248,113,113,0.08)', border:'none', color:'#f87171', width:'24px', height:'24px', borderRadius:'6px', cursor:'pointer', fontSize:'14px', fontWeight:700 }}>×</button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {colJobs.length === 0 && (
                      <div style={{ textAlign:'center', padding:'28px 12px', color:'rgba(255,255,255,0.12)', fontSize:'12px', border:'1px dashed rgba(255,255,255,0.06)', borderRadius:'8px' }}>
                        Drop here
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </main>
      </div>

      {showAdd && (
        <Modal
          title="Add Application"
          onSave={handleAdd}
          onClose={() => setShowAdd(false)}
          form={form}
          setForm={setForm}
          saving={saving}
        />
      )}

      {editJob && (
        <Modal
          title="Edit Application"
          onSave={handleEdit}
          onClose={() => setEditJob(null)}
          form={form}
          setForm={setForm}
          saving={saving}
        />
      )}
    </div>
  )
}