import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Inbox, Send, MapPin, BookUser, Settings,
  PenLine, LogOut
} from 'lucide-react'
import { api } from '../api/index.js'
import Dashboard from './Dashboard.jsx'
import InboxView from './InboxView.jsx'
import SentView from './SentView.jsx'
import ComposeView from './ComposeView.jsx'
import TrackingView from './TrackingView.jsx'
import ContactsView from './ContactsView.jsx'
import SettingsView from './SettingsView.jsx'

const NAV = [
  { to: '/', icon: LayoutDashboard, label: '仪表盘', exact: true },
  { to: '/inbox', icon: Inbox, label: '收件箱' },
  { to: '/sent', icon: Send, label: '已发送' },
  { to: '/tracking', icon: MapPin, label: '实时追踪' },
  { to: '/contacts', icon: BookUser, label: '地址簿' },
  { to: '/settings', icon: Settings, label: '设置' },
]

export default function AppLayout() {
  const navigate = useNavigate()
  const user = api.getCurrentUser()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    api.getUnreadCount().then(setUnread)
    const t = setInterval(() => api.getUnreadCount().then(setUnread), 30000)
    return () => clearInterval(t)
  }, [])

  function handleLogout() {
    localStorage.removeItem('ppo_user')
    localStorage.removeItem('ppo_token')
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden relative"
      style={{background:'linear-gradient(135deg,#080f1e 0%,#0f1e3a 40%,#162545 70%,#1a2d55 100%)'}}>

      {/* 全局背景光晕 */}
      <div className="absolute pointer-events-none"
        style={{top:'-200px', left:'-50px', width:'750px', height:'750px',
          background:'radial-gradient(circle at 40% 35%, rgba(50,130,255,0.5) 0%, rgba(60,100,255,0.2) 35%, transparent 65%)',
          filter:'blur(55px)'}} />
      <div className="absolute pointer-events-none"
        style={{bottom:'-150px', right:'-50px', width:'650px', height:'650px',
          background:'radial-gradient(circle at 55% 55%, rgba(140,70,255,0.45) 0%, rgba(110,50,220,0.2) 38%, transparent 65%)',
          filter:'blur(55px)'}} />
      <div className="absolute pointer-events-none"
        style={{top:'30%', right:'5%', width:'500px', height:'500px',
          background:'radial-gradient(circle at 50% 50%, rgba(0,200,180,0.28) 0%, rgba(0,170,160,0.1) 40%, transparent 70%)',
          filter:'blur(50px)'}} />
      <div className="absolute pointer-events-none"
        style={{bottom:'15%', left:'20%', width:'400px', height:'400px',
          background:'radial-gradient(circle at 50% 50%, rgba(255,80,160,0.2) 0%, transparent 65%)',
          filter:'blur(50px)'}} />

      {/* 侧边栏 */}
      <aside className="w-56 flex-shrink-0 flex flex-col py-4 border-r border-white/15 relative z-10"
        style={{background:'rgba(255,255,255,0.1)', backdropFilter:'blur(40px)', WebkitBackdropFilter:'blur(40px)'}}>

        {/* Logo */}
        <div className="px-5 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
              style={{background:'rgba(77,166,255,0.25)', boxShadow:'0 0 16px rgba(77,166,255,0.4)'}}>
              ✉️
            </div>
            <div>
              <div className="text-sm font-semibold text-white leading-tight">个人邮局</div>
              <div className="text-[10px] text-white/50">Personal Post Office</div>
            </div>
          </div>
        </div>

        {/* 写信按钮 */}
        <div className="px-3 mb-4">
          <button
            onClick={() => navigate('/compose')}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-white text-sm font-medium transition active:scale-[0.98] glow-blue"
            style={{background:'rgba(77,166,255,0.3)', border:'1px solid rgba(77,166,255,0.55)'}}
            onMouseEnter={e => e.currentTarget.style.background='rgba(77,166,255,0.45)'}
            onMouseLeave={e => e.currentTarget.style.background='rgba(77,166,255,0.3)'}
          >
            <PenLine size={15} />
            写信
          </button>
        </div>

        {/* 导航 */}
        <nav className="flex-1 px-2 space-y-0.5">
          {NAV.map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition group ${
                  isActive ? 'text-white font-medium' : 'text-white/65 hover:text-white/90'
                }`
              }
              style={({ isActive }) => isActive
                ? { background: 'rgba(77,166,255,0.25)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 0 12px rgba(77,166,255,0.2)' }
                : {}
              }
              onMouseEnter={e => { if (!e.currentTarget.classList.contains('text-white')) e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
              onMouseLeave={e => { if (!e.currentTarget.classList.contains('text-white')) e.currentTarget.style.background = '' }}
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className={isActive ? 'text-[#4da6ff]' : 'text-white/50 group-hover:text-white/80'} />
                  <span className="flex-1">{label}</span>
                  {label === '收件箱' && unread > 0 && (
                    <span className="text-[10px] font-semibold bg-[#4da6ff] text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                      style={{boxShadow:'0 0 8px rgba(77,166,255,0.6)'}}>
                      {unread > 99 ? '99+' : unread}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* 用户信息 */}
        <div className="px-3 pt-3 border-t border-white/15 mt-2">
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition cursor-default">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
              style={{background:'rgba(77,166,255,0.4)', boxShadow:'0 0 12px rgba(77,166,255,0.35)'}}>
              {user?.avatar || user?.name?.[0] || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white/95 truncate">{user?.name || '用户'}</div>
              <div className="text-[10px] text-white/50 truncate">{user?.email || ''}</div>
            </div>
            <button
              onClick={handleLogout}
              title="退出登录"
              className="text-white/40 p-1 rounded-lg transition"
              onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.2)'; e.currentTarget.style.color='rgba(248,113,113,1)' }}
              onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.color='' }}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-hidden relative z-10">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inbox" element={<InboxView onRead={() => api.getUnreadCount().then(setUnread)} />} />
          <Route path="/sent" element={<SentView />} />
          <Route path="/compose" element={<ComposeView />} />
          <Route path="/tracking" element={<TrackingView />} />
          <Route path="/contacts" element={<ContactsView />} />
          <Route path="/settings" element={<SettingsView />} />
        </Routes>
      </main>
    </div>
  )
}
