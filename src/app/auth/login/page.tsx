'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/dashboard')
  }

  return (
    <div style={{minHeight:'100vh', background:'#0a0a0f', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', fontFamily:'system-ui,sans-serif'}}>
      <Link href="/" style={{color:'white', fontWeight:800, fontSize:'24px', textDecoration:'none', marginBottom:'8px', letterSpacing:'-0.5px'}}>
        Prep<span style={{color:'#c9a96e'}}>Wise</span>
      </Link>
      <p style={{color:'rgba(255,255,255,0.3)', fontSize:'14px', marginBottom:'40px'}}>Welcome back</p>

      <div style={{width:'100%', maxWidth:'420px', background:'#111118', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'20px', padding:'36px'}}>
        <h2 style={{color:'white', fontWeight:700, fontSize:'22px', marginBottom:'28px'}}>Sign In</h2>

        {error && (
          <div style={{background:'rgba(220,38,38,0.1)', border:'1px solid rgba(220,38,38,0.2)', color:'#f87171', fontSize:'13px', padding:'12px 16px', borderRadius:'10px', marginBottom:'20px'}}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{marginBottom:'18px'}}>
            <label style={{color:'rgba(255,255,255,0.4)', fontSize:'11px', letterSpacing:'2px', textTransform:'uppercase', display:'block', marginBottom:'8px'}}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
              style={{width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'white', borderRadius:'12px', padding:'14px 16px', fontSize:'14px', outline:'none'}}
            />
          </div>
          <div style={{marginBottom:'24px'}}>
            <label style={{color:'rgba(255,255,255,0.4)', fontSize:'11px', letterSpacing:'2px', textTransform:'uppercase', display:'block', marginBottom:'8px'}}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
              style={{width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'white', borderRadius:'12px', padding:'14px 16px', fontSize:'14px', outline:'none'}}
            />
          </div>
          <button type="submit" disabled={loading}
            style={{width:'100%', background:'#c9a96e', color:'black', border:'none', borderRadius:'12px', padding:'15px', fontWeight:700, fontSize:'15px', cursor:'pointer', opacity:loading?0.6:1}}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <p style={{color:'rgba(255,255,255,0.25)', fontSize:'13px', textAlign:'center', marginTop:'24px', paddingTop:'24px', borderTop:'1px solid rgba(255,255,255,0.06)'}}>
          No account?{' '}
          <Link href="/auth/signup" style={{color:'#c9a96e', textDecoration:'none'}}>Create one free</Link>
        </p>
      </div>
    </div>
  )
}