import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { api } from '../api/index.js'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('ppo_user') || 'null')
    if (user?.loggedIn) { navigate('/'); return }
    const saved = localStorage.getItem('ppo_email')
    if (saved) { setEmail(saved); setRemember(true) }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) { setError('请填写邮箱和密码'); return }
    setError(''); setLoading(true)
    try {
      const { user, token } = await api.login(email, password)
      if (remember) localStorage.setItem('ppo_email', email)
      else localStorage.removeItem('ppo_email')
      localStorage.setItem('ppo_token', token)
      localStorage.setItem('ppo_user', JSON.stringify({ ...user, loggedIn: true }))
      navigate('/')
    } catch (err) {
      setError(err.message || '登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{background:'linear-gradient(135deg,#080f1e 0%,#0f1e3a 40%,#162545 70%,#1a2d55 100%)'}}>

      {/* 大型背景光晕球 - 蓝色，左上 */}
      <div className="absolute pointer-events-none"
        style={{top:'-250px', left:'-200px', width:'800px', height:'800px',
          background:'radial-gradient(circle at 40% 40%, rgba(56,139,255,0.55) 0%, rgba(56,139,255,0.25) 30%, rgba(77,120,255,0.1) 55%, transparent 70%)',
          filter:'blur(50px)'}} />

      {/* 大型背景光晕球 - 紫色，右下 */}
      <div className="absolute pointer-events-none"
        style={{bottom:'-200px', right:'-150px', width:'700px', height:'700px',
          background:'radial-gradient(circle at 55% 55%, rgba(150,80,255,0.5) 0%, rgba(120,50,220,0.25) 35%, rgba(100,40,200,0.1) 60%, transparent 75%)',
          filter:'blur(55px)'}} />

      {/* 青绿色光晕 - 右上 */}
      <div className="absolute pointer-events-none"
        style={{top:'-50px', right:'-100px', width:'500px', height:'500px',
          background:'radial-gradient(circle at 50% 50%, rgba(0,210,190,0.3) 0%, rgba(0,180,160,0.12) 40%, transparent 70%)',
          filter:'blur(60px)'}} />

      {/* 粉红色光晕 - 左下 */}
      <div className="absolute pointer-events-none"
        style={{bottom:'0px', left:'10%', width:'400px', height:'400px',
          background:'radial-gradient(circle at 50% 50%, rgba(255,80,160,0.22) 0%, rgba(220,60,130,0.08) 45%, transparent 70%)',
          filter:'blur(50px)'}} />

      {/* 中央光晕 - 衬托卡片 */}
      <div className="absolute pointer-events-none"
        style={{top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'600px', height:'600px',
          background:'radial-gradient(circle at 50% 50%, rgba(77,140,255,0.2) 0%, rgba(100,80,255,0.1) 40%, transparent 70%)',
          filter:'blur(40px)'}} />

      {/* Logo */}
      <div className="text-center mb-8 relative z-10">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-3xl"
          style={{
            background:'rgba(77,140,255,0.3)',
            border:'1px solid rgba(255,255,255,0.3)',
            boxShadow:'0 0 40px rgba(77,140,255,0.7), 0 0 80px rgba(77,140,255,0.3), inset 0 1px 0 rgba(255,255,255,0.5)'
          }}>
          ✉️
        </div>
        <h1 className="text-2xl font-semibold text-white tracking-tight"
          style={{textShadow:'0 0 30px rgba(77,166,255,0.6)'}}>个人邮局</h1>
        <p className="text-sm mt-1" style={{color:'rgba(180,210,255,0.6)'}}>Personal Post Office</p>
      </div>

      {/* 卡片 */}
      <div className="w-full max-w-sm glass-strong glass-shine rounded-2xl p-8 relative overflow-hidden z-10 prism">

        <div className="relative z-10">
          <h2 className="text-xl font-semibold text-white mb-1">欢迎回来</h2>
          <p className="text-sm mb-6" style={{color:'rgba(180,210,255,0.55)'}}>登录你的个人邮局账户</p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-300"
              style={{background:'rgba(239,68,68,0.12)', border:'1px solid rgba(248,113,113,0.3)'}}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{color:'rgba(200,220,255,0.75)'}}>邮箱地址</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{color:'rgba(150,190,255,0.5)'}} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@example.com"
                  autoComplete="email"
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{color:'rgba(200,220,255,0.75)'}}>密码</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{color:'rgba(150,190,255,0.5)'}} />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  autoComplete="current-password"
                  className="glass-input w-full pl-10 pr-10 py-2.5 rounded-xl text-sm transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition"
                  style={{color:'rgba(150,190,255,0.45)'}}
                  onMouseEnter={e => e.currentTarget.style.color='rgba(150,190,255,0.85)'}
                  onMouseLeave={e => e.currentTarget.style.color='rgba(150,190,255,0.45)'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm cursor-pointer" style={{color:'rgba(180,210,255,0.6)'}}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="rounded"
                  style={{accentColor:'#4da6ff'}}
                />
                记住我
              </label>
              <button type="button" className="text-sm transition"
                style={{color:'rgba(100,170,255,0.85)'}}
                onMouseEnter={e => e.currentTarget.style.color='rgba(100,170,255,1)'}
                onMouseLeave={e => e.currentTarget.style.color='rgba(100,170,255,0.85)'}>忘记密码？</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-white text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{
                background:'linear-gradient(135deg, rgba(56,130,255,0.5) 0%, rgba(77,100,255,0.4) 100%)',
                border:'1px solid rgba(100,170,255,0.55)',
                boxShadow:'0 0 28px rgba(77,140,255,0.5), 0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
              }}
              onMouseEnter={e => !loading && (e.currentTarget.style.background='linear-gradient(135deg, rgba(56,130,255,0.7) 0%, rgba(77,100,255,0.6) 100%)')}
              onMouseLeave={e => e.currentTarget.style.background='linear-gradient(135deg, rgba(56,130,255,0.5) 0%, rgba(77,100,255,0.4) 100%)'}
            >
              {loading ? '登录中…' : '登录'}
            </button>
          </form>

          <p className="mt-5 text-xs text-center leading-relaxed" style={{color:'rgba(150,180,255,0.3)'}}>
            服务器模式：使用宝塔邮局账号和密码登录<br />
            本地演示：任意邮箱 + 任意密码均可
          </p>
        </div>
      </div>

      <p className="mt-6 text-xs relative z-10" style={{color:'rgba(150,180,255,0.25)'}}>
        © 2026 个人邮局 · <a href="#" className="transition hover:opacity-60">隐私政策</a> · <a href="#" className="transition hover:opacity-60">服务条款</a>
      </p>
    </div>
  )
}
