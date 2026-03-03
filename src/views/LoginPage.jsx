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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f7] px-4">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">✉️</div>
        <h1 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">个人邮局</h1>
        <p className="text-sm text-[#6e6e73] mt-1">Personal Post Office</p>
      </div>

      {/* 卡片 */}
      <div className="w-full max-w-sm bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/8 border border-white/60 p-8">
        <h2 className="text-xl font-semibold text-[#1d1d1f] mb-1">欢迎回来</h2>
        <p className="text-sm text-[#6e6e73] mb-6">登录你的个人邮局账户</p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">邮箱地址</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8e8e93]" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@example.com"
                autoComplete="email"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#d2d2d7] bg-white text-[#1d1d1f] text-sm placeholder:text-[#aeaeb2] focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">密码</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8e8e93]" />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="请输入密码"
                autoComplete="current-password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#d2d2d7] bg-white text-[#1d1d1f] text-sm placeholder:text-[#aeaeb2] focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8e8e93] hover:text-[#1d1d1f] transition"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-[#1d1d1f] cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="rounded border-[#d2d2d7] accent-[#0071e3]"
              />
              记住我
            </label>
            <button type="button" className="text-sm text-[#0071e3] hover:underline">忘记密码？</button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] active:bg-[#006edb] text-white text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? '登录中…' : '登录'}
          </button>
        </form>

        <p className="mt-5 text-xs text-center text-[#aeaeb2] leading-relaxed">
          服务器模式：使用宝塔邮局账号和密码登录<br />
          本地演示：任意邮箱 + 任意密码均可
        </p>
      </div>

      <p className="mt-6 text-xs text-[#aeaeb2]">
        © 2026 个人邮局 · <a href="#" className="hover:text-[#6e6e73]">隐私政策</a> · <a href="#" className="hover:text-[#6e6e73]">服务条款</a>
      </p>
    </div>
  )
}
