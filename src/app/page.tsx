import Link from 'next/link'

export default function Home() {
  return (
    <main style={{minHeight:'100vh', background:'#0a0a0f', display:'flex', flexDirection:'column', fontFamily:'system-ui,sans-serif'}}>
      <style>{`
        @media (max-width: 640px) {
          .hero-title { font-size: 48px !important; letter-spacing: -2px !important; }
          .hero-italic { font-size: 54px !important; }
          .feature-grid { grid-template-columns: 1fr !important; }
          .hero-actions { flex-direction: column !important; }
          .hero-actions a { text-align: center !important; justify-content: center !important; }
          .nav-pad { padding: 16px 20px !important; }
          .hero-pad { padding: 60px 20px 40px !important; }
        }
      `}</style>

      <nav className="nav-pad" style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 48px', borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <span style={{color:'white', fontWeight:800, fontSize:'20px', letterSpacing:'-0.5px'}}>
          Prep<span style={{color:'#c9a96e'}}>Wise</span>
        </span>
        <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
          <Link href="/auth/login" style={{color:'rgba(255,255,255,0.5)', textDecoration:'none', fontSize:'13px', padding:'8px 12px'}}>
            Sign In
          </Link>
          <Link href="/auth/signup" style={{background:'#c9a96e', color:'black', textDecoration:'none', fontSize:'13px', fontWeight:600, padding:'10px 20px', borderRadius:'100px'}}>
            Get Started
          </Link>
        </div>
      </nav>

      <section className="hero-pad" style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'80px 24px 60px'}}>
        <div style={{display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(201,169,110,0.1)', border:'1px solid rgba(201,169,110,0.25)', color:'#c9a96e', fontSize:'11px', letterSpacing:'3px', textTransform:'uppercase', padding:'8px 18px', borderRadius:'100px', marginBottom:'36px'}}>
          <span style={{width:'6px', height:'6px', background:'#c9a96e', borderRadius:'50%'}}></span>
          AI-Powered Interview Prep
        </div>

        <h1 className="hero-title" style={{fontSize:'68px', fontWeight:800, color:'white', letterSpacing:'-3px', lineHeight:'0.92', marginBottom:'24px', maxWidth:'700px'}}>
          Land your<br/>
          <span className="hero-italic" style={{fontStyle:'italic', fontWeight:300, color:'#c9a96e', fontFamily:'Georgia,serif', fontSize:'76px'}}>dream job</span><br/>
          with AI
        </h1>

        <p style={{color:'rgba(255,255,255,0.4)', fontSize:'16px', maxWidth:'480px', lineHeight:'1.7', marginBottom:'40px'}}>
          Upload your CV, paste a job description, and get instant match scores, tailored interview questions, and a personalised cover letter.
        </p>

        <div className="hero-actions" style={{display:'flex', gap:'14px', marginBottom:'72px', width:'100%', maxWidth:'400px', justifyContent:'center'}}>
          <Link href="/auth/signup" style={{background:'#c9a96e', color:'black', textDecoration:'none', fontWeight:700, padding:'15px 32px', borderRadius:'100px', fontSize:'14px', boxShadow:'0 8px 32px rgba(201,169,110,0.25)', flex:1, textAlign:'center', display:'flex', alignItems:'center', justifyContent:'center'}}>
            Start For Free →
          </Link>
          <Link href="/auth/login" style={{background:'transparent', color:'rgba(255,255,255,0.6)', textDecoration:'none', border:'1px solid rgba(255,255,255,0.12)', padding:'15px 32px', borderRadius:'100px', fontSize:'14px', flex:1, textAlign:'center', display:'flex', alignItems:'center', justifyContent:'center'}}>
            Sign In
          </Link>
        </div>

        <div className="feature-grid" style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px', maxWidth:'900px', width:'100%'}}>
          {[
            {icon:'🎯', title:'Match Score', desc:'See exactly how well your CV fits the role with a detailed percentage breakdown.'},
            {icon:'💬', title:'Interview Questions', desc:'5 tailored questions with personalised suggested answers based on your background.'},
            {icon:'✉️', title:'Cover Letter', desc:'One-click personalised cover letter tailored to the role, ready to copy and send.'},
          ].map(f => (
            <div key={f.title} style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'24px', textAlign:'left'}}>
              <div style={{fontSize:'32px', marginBottom:'14px'}}>{f.icon}</div>
              <div style={{color:'white', fontWeight:600, fontSize:'15px', marginBottom:'8px'}}>{f.title}</div>
              <div style={{color:'rgba(255,255,255,0.35)', fontSize:'13px', lineHeight:'1.7'}}>{f.desc}</div>
            </div>
          ))}
        </div>

        <div style={{display:'flex', gap:'10px', marginTop:'28px', flexWrap:'wrap', justifyContent:'center'}}>
          {['Skills Gap Analysis','ATS Tips','Save Analyses','Instant Results'].map(t => (
            <span key={t} style={{fontSize:'11px', color:'rgba(255,255,255,0.25)', border:'1px solid rgba(255,255,255,0.07)', padding:'5px 14px', borderRadius:'100px'}}>✓ {t}</span>
          ))}
        </div>
      </section>

      <footer style={{textAlign:'center', padding:'20px', borderTop:'1px solid rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.15)', fontSize:'12px'}}>
        © 2026 PrepWise · Built by Lubna Janaan Jiffry
      </footer>
    </main>
  )
}