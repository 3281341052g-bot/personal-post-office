import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Inbox, Send, Package, PenLine, MapPin } from 'lucide-react'
import { api } from '../api/index.js'

function StatCard({ icon: Icon, label, value, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 bg-white rounded-2xl p-5 shadow-sm shadow-black/5 border border-[#e5e5ea] hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="text-2xl font-semibold text-[#1d1d1f]">{value}</div>
      <div className="text-sm text-[#6e6e73] mt-0.5">{label}</div>
    </button>
  )
}

function MessageRow({ msg, onClick }) {
  const date = new Date(msg.date)
  const timeStr = date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[#f5f5f7] rounded-xl transition text-left"
    >
      <div className="w-9 h-9 rounded-full bg-[#0071e3]/10 flex items-center justify-center flex-shrink-0 text-[#0071e3] font-semibold text-sm">
        {msg.from?.[0] || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className={`text-sm truncate ${msg.unread ? 'font-semibold text-[#1d1d1f]' : 'text-[#3d3d3f]'}`}>
            {msg.from}
          </span>
          <span className="text-[11px] text-[#aeaeb2] flex-shrink-0">{timeStr}</span>
        </div>
        <div className={`text-sm truncate ${msg.unread ? 'font-medium text-[#1d1d1f]' : 'text-[#6e6e73]'}`}>
          {msg.subject}
        </div>
      </div>
      {msg.unread && <div className="w-2 h-2 rounded-full bg-[#0071e3] mt-1.5 flex-shrink-0" />}
    </button>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const user = api.getCurrentUser()
  const [stats, setStats] = useState({ inbox: 0, sent: 0, unread: 0, tracking: 0 })
  const [recent, setRecent] = useState([])

  useEffect(() => {
    Promise.all([
      api.getMessages('inbox'),
      api.getMessages('sent'),
      api.getAllTracking(),
    ]).then(([inbox, sent, tracking]) => {
      setStats({
        inbox: inbox.length,
        sent: sent.length,
        unread: inbox.filter(m => m.unread).length,
        tracking: tracking.filter(t => t.status !== 'delivered').length,
      })
      setRecent(inbox.slice(0, 5))
    })
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 6 ? '夜深了' : hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好'

  return (
    <div className="h-full overflow-y-auto px-8 py-8">
      {/* 问候 */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1d1d1f]">
          {greeting}，{user?.name || '朋友'} 👋
        </h1>
        <p className="text-sm text-[#6e6e73] mt-1">
          {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="flex gap-4 mb-8">
        <StatCard icon={Inbox} label="收件箱" value={stats.inbox} color="bg-[#0071e3]" onClick={() => navigate('/inbox')} />
        <StatCard icon={Send} label="已发送" value={stats.sent} color="bg-[#34c759]" onClick={() => navigate('/sent')} />
        <StatCard icon={Package} label="在途包裹" value={stats.tracking} color="bg-[#ff9500]" onClick={() => navigate('/tracking')} />
        <StatCard icon={Inbox} label="未读消息" value={stats.unread} color="bg-[#ff3b30]" onClick={() => navigate('/inbox')} />
      </div>

      {/* 快速操作 */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={() => navigate('/compose')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-sm font-medium transition"
        >
          <PenLine size={15} /> 写封信
        </button>
        <button
          onClick={() => navigate('/tracking')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-[#d2d2d7] hover:bg-[#f5f5f7] text-[#1d1d1f] text-sm font-medium transition"
        >
          <MapPin size={15} /> 查追踪
        </button>
      </div>

      {/* 最近收信 */}
      <div className="bg-white rounded-2xl shadow-sm shadow-black/5 border border-[#e5e5ea] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#f2f2f7] flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#1d1d1f]">最近收信</h2>
          <button onClick={() => navigate('/inbox')} className="text-sm text-[#0071e3] hover:underline">查看全部</button>
        </div>
        <div className="p-2">
          {recent.length === 0 ? (
            <div className="text-center py-10 text-[#aeaeb2] text-sm">暂无信件</div>
          ) : (
            recent.map(msg => (
              <MessageRow key={msg.id} msg={msg} onClick={() => navigate('/inbox')} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
