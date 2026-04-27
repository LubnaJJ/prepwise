import Link from 'next/link'

export default function Home() {
  return (
    <main style={{minHeight:'100vh', background:'#0a0a0f', display:'flex', flexDirection:'column', fontFamily:'system-ui,sans-serif'}}>

      {/* Nav */}
      <nav style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 48px', borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <span style={{color:'white', fontWeight:800, fontSize:'20px', letterSpacing:'-0.5px'}}>
          Prep<span style={{color:'#c9a96e'}}>Wise</span>
        </span>
        <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
          <Link href="/auth/login" style={{color:'rgba(255,255,255,0.5)', textDecoration:'none', fontSize:'14px', padding:'8px 16px'}}>
            Sign In
          </Link>
          <Link href="/auth/signup" style={{background:'#c9a96e', color:'black', textDecoration:'none', fontSize:'14px', fontWeight:600, padding:'10px 24px', borderRadius:'100px'}}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'80px 24px 60px'}}>

        <div style={{display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(201,169,110,0.1)', border:'1px solid rgba(201,169,110,0.25)', color:'#c9a96e', fontSize:'11px', letterSpacing:'3px', textTransform:'uppercase', padding:'8px 18px', borderRadius:'100px', marginBottom:'40px'}}>
          <span style={{width:'6px', height:'6px', background:'#c9a96e', borderRadius:'50%'}}></span>
          AI-Powered Interview Prep
        </div>

        <h1 style={{fontSize:'72px', fontWeight:800, color:'white', letterSpacing:'-3px', lineHeight:'0.92', marginBottom:'28px', maxWidth:'700px'}}>
          Land your<br/>
          <span style={{fontStyle:'italic', fontWeight:300, color:'#c9a96e', fontFamily:'Georgia,serif', fontSize:'80px'}}>dream job</span><br/>
          with AI
        </h1>

        <p style={{color:'rgba(255,255,255,0.4)', fontSize:'17px', maxWidth:'500px', lineHeight:'1.7', marginBottom:'44px'}}>
          Upload your CV, paste a job description, and get instant match scores, tailored interview questions, and a personalised cover letter.
        </p>

        <div style={{display:'flex', gap:'14px', marginBottom:'80px'}}>
          <Link href="/auth/signup" style={{background:'#c9a96e', color:'black', textDecoration:'none', fontWeight:700, padding:'16px 36px', borderRadius:'100px', fontSize:'15px', boxShadow:'0 8px 32px rgba(201,169,110,0.25)'}}>
            Start For Free →
          </Link>
          <Link href="/auth/login" style={{background:'transparent', color:'rgba(255,255,255,0.6)', textDecoration:'none', border:'1px solid rgba(255,255,255,0.12)', padding:'16px 36px', borderRadius:'100px', fontSize:'15px'}}>
            Sign In
          </Link>
        </div>

        {/* Feature cards */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', maxWidth:'900px', width:'100%'}}>
          {[
            {icon:'🎯', title:'Match Score', desc:'See exactly how well your CV fits the role with a detailed percentage breakdown and strengths/gaps analysis.'},
            {icon:'💬', title:'Interview Questions', desc:'5 tailored questions based on the job and your background — complete with personalised suggested answers.'},
            {icon:'✉️', title:'Cover Letter', desc:'One-click personalised cover letter tailored to the specific role and company, ready to copy and send.'},
          ].map(f => (
            <div key={f.title} style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'28px', textAlign:'left'}}>
              <div style={{fontSize:'36px', marginBottom:'16px'}}>{f.icon}</div>
              <div style={{color:'white', fontWeight:600, fontSize:'16px', marginBottom:'10px'}}>{f.title}</div>
              <div style={{color:'rgba(255,255,255,0.35)', fontSize:'13px', lineHeight:'1.7'}}>{f.desc}</div>
            </div>
          ))}
        </div>

        <div style={{display:'flex', gap:'12px', marginTop:'32px', flexWrap:'wrap', justifyContent:'center'}}>
          {['Skills Gap Analysis','ATS Optimization Tips','Save Past Analyses','Instant Results'].map(t => (
            <span key={t} style={{fontSize:'12px', color:'rgba(255,255,255,0.25)', border:'1px solid rgba(255,255,255,0.07)', padding:'6px 16px', borderRadius:'100px'}}>✓ {t}</span>
          ))}
        </div>
      </section>

      <footer style={{textAlign:'center', padding:'24px', borderTop:'1px solid rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.15)', fontSize:'12px'}}>
        © 2026 PrepWise · Built by Lubna Janaan Jiffry
      </footer>
    </main>
  )
}