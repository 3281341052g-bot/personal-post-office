import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, X } from 'lucide-react'
import { api } from '../api/index.js'

const PACKAGES = [
  { id: 'letter', label: '普通信封', icon: '✉️', desc: '简约素雅' },
  { id: '心意', label: '心意礼盒', icon: '🎁', desc: '附赠贺卡' },
  { id: '珍藏', label: '珍藏礼盒', icon: '📦', desc: '精致包装' },
  { id: '信笺', label: '信笺套装', icon: '📜', desc: '复古风格' },
]

export default function ComposeView() {
  const navigate = useNavigate()
  const [contacts, setContacts] = useState([])
  const [form, setForm] = useState({ to: '', toEmail: '', subject: '', body: '', package: 'letter', fromCity: '', toCity: '' })
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => { api.getContacts().then(setContacts) }, [])

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function handleContactSelect(e) {
    const contact = contacts.find(c => c.email === e.target.value)
    if (contact) { set('to', contact.name); set('toEmail', contact.email); set('toCity', contact.city || '') }
  }

  async function handleSend(e) {
    e.preventDefault()
    if (!form.to || !form.body) { setError('请填写收件人和信件内容'); return }
    setError(''); setSending(true)
    try {
      const result = await api.sendMessage(form)
      setSuccess(result.trackingId)
    } catch (err) {
      setError(err.message || '发送失败')
    } finally {
      setSending(false)
    }
  }

  if (success) return (
    <div className="h-full flex flex-col items-center justify-center bg-[#f5f5f7]">
      <div className="bg-white rounded-2xl shadow-sm border border-[#e5e5ea] p-10 text-center max-w-sm w-full">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-semibold text-[#1d1d1f] mb-2">信件已寄出！</h2>
        <p className="text-sm text-[#6e6e73] mb-2">你的信正在路上</p>
        <p className="text-xs font-mono text-[#8e8e93] mb-6">{success}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => { setSuccess(null); setForm({ to:'',toEmail:'',subject:'',body:'',package:'letter',fromCity:'',toCity:'' }) }} className="px-5 py-2.5 rounded-xl bg-[#0071e3] text-white text-sm font-medium hover:bg-[#0077ed] transition">再写一封</button>
          <button onClick={() => navigate('/tracking')} className="px-5 py-2.5 rounded-xl border border-[#d2d2d7] text-[#1d1d1f] text-sm font-medium hover:bg-[#f5f5f7] transition">查看追踪</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="h-full overflow-y-auto bg-[#f5f5f7] px-8 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-6">✍️ 写一封信</h1>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center justify-between">
            {error}
            <button onClick={() => setError('')}><X size={14} /></button>
          </div>
        )}

        <form onSubmit={handleSend} className="bg-white rounded-2xl shadow-sm border border-[#e5e5ea] overflow-hidden">
          {/* 收件人 */}
          <div className="px-6 py-4 border-b border-[#f2f2f7] flex items-center gap-3">
            <span className="text-sm text-[#8e8e93] w-14 flex-shrink-0">收件人</span>
            <input value={form.to} onChange={e => set('to', e.target.value)} placeholder="姓名" className="flex-1 text-sm text-[#1d1d1f] outline-none placeholder:text-[#aeaeb2]" />
            <select onChange={handleContactSelect} defaultValue="" className="text-xs text-[#0071e3] outline-none bg-transparent cursor-pointer">
              <option value="">从地址簿选择</option>
              {contacts.map(c => <option key={c.id} value={c.email}>{c.name}</option>)}
            </select>
          </div>
          <div className="px-6 py-4 border-b border-[#f2f2f7] flex items-center gap-3">
            <span className="text-sm text-[#8e8e93] w-14 flex-shrink-0">邮箱</span>
            <input value={form.toEmail} onChange={e => set('toEmail', e.target.value)} placeholder="收件人邮箱地址" className="flex-1 text-sm text-[#1d1d1f] outline-none placeholder:text-[#aeaeb2]" />
          </div>
          <div className="px-6 py-4 border-b border-[#f2f2f7] flex items-center gap-3">
            <span className="text-sm text-[#8e8e93] w-14 flex-shrink-0">主题</span>
            <input value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="信件主题（可选）" className="flex-1 text-sm text-[#1d1d1f] outline-none placeholder:text-[#aeaeb2]" />
          </div>
          <div className="px-6 py-4 border-b border-[#f2f2f7] flex items-center gap-3">
            <span className="text-sm text-[#8e8e93] w-14 flex-shrink-0">城市</span>
            <input value={form.fromCity} onChange={e => set('fromCity', e.target.value)} placeholder="寄件城市" className="w-28 text-sm text-[#1d1d1f] outline-none placeholder:text-[#aeaeb2]" />
            <span className="text-[#aeaeb2]">→</span>
            <input value={form.toCity} onChange={e => set('toCity', e.target.value)} placeholder="收件城市" className="w-28 text-sm text-[#1d1d1f] outline-none placeholder:text-[#aeaeb2]" />
          </div>

          {/* 正文 */}
          <textarea
            value={form.body}
            onChange={e => set('body', e.target.value)}
            placeholder="见字如面…"
            rows={12}
            className="w-full px-6 py-5 text-sm text-[#1d1d1f] outline-none resize-none placeholder:text-[#aeaeb2] leading-relaxed"
          />

          {/* 套餐选择 */}
          <div className="px-6 py-4 border-t border-[#f2f2f7]">
            <p className="text-xs text-[#8e8e93] mb-3">信纸套餐</p>
            <div className="flex gap-2">
              {PACKAGES.map(pkg => (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => set('package', pkg.id)}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border text-center transition ${form.package === pkg.id ? 'border-[#0071e3] bg-[#0071e3]/5' : 'border-[#e5e5ea] hover:border-[#d2d2d7]'}`}
                >
                  <span className="text-xl">{pkg.icon}</span>
                  <span className="text-xs font-medium text-[#1d1d1f]">{pkg.label}</span>
                  <span className="text-[10px] text-[#aeaeb2]">{pkg.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 发送 */}
          <div className="px-6 py-4 border-t border-[#f2f2f7] flex justify-end">
            <button
              type="submit"
              disabled={sending}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-sm font-medium transition disabled:opacity-60"
            >
              <Send size={15} />
              {sending ? '发送中…' : '寄出这封信'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
