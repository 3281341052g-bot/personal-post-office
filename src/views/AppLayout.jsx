import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Inbox, Send, MapPin, BookUser, Settings,
  PenLine, LogOut, ChevronRight
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
    <div className="flex h-screen bg-[#f5f5f7] overflow-hidden">
      {/* 侧边栏 */}
      <aside className="w-56 flex-shrink-0 flex flex-col bg-[#f0f0f0]/90 backdrop-blur-xl border-r border-[#d2d2d7]/60 py-4">
        {/* Logo */}
        <div className="px-5 mb-6">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">✉️</span>
            <div>
              <div className="text-sm font-semibold text-[#1d1d1f] leading-tight">个人邮局</div>
              <div className="text-[10px] text-[#8e8e93]">Personal Post Office</div>
            </div>
          </div>
        </div>

        {/* 写信按钮 */}
        <div className="px-3 mb-4">
          <button
            onClick={() => navigate('/compose')}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.98] text-white text-sm font-medium transition"
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
                  isActive
                    ? 'bg-white shadow-sm text-[#0071e3] font-medium'
                    : 'text-[#3d3d3f] hover:bg-white/60 hover:text-[#1d1d1f]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className={isActive ? 'text-[#0071e3]' : 'text-[#8e8e93] group-hover:text-[#1d1d1f]'} />
                  <span className="flex-1">{label}</span>
                  {label === '收件箱' && unread > 0 && (
                    <span className="text-[10px] font-semibold bg-[#0071e3] text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {unread > 99 ? '99+' : unread}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* 用户信息 */}
        <div className="px-3 pt-3 border-t border-[#d2d2d7]/60 mt-2">
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-white/60 transition cursor-default">
            <div className="w-8 h-8 rounded-full bg-[#0071e3] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {user?.avatar || user?.name?.[0] || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[#1d1d1f] truncate">{user?.name || '用户'}</div>
              <div className="text-[10px] text-[#8e8e93] truncate">{user?.email || ''}</div>
            </div>
            <button onClick={handleLogout} title="退出登录" className="text-[#8e8e93] hover:text-red-500 transition p-1 rounded-lg hover:bg-red-50">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-hidden">
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
