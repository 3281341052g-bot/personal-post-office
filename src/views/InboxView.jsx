import { useState, useEffect } from 'react'
import { Trash2, Star, Reply, RotateCcw } from 'lucide-react'
import { api } from '../api/index.js'

function MsgList({ messages, selected, onSelect }) {
  return (
    <div className="w-72 flex-shrink-0 border-r border-[#e5e5ea] flex flex-col bg-white">
      <div className="px-4 py-3 border-b border-[#f2f2f7]">
        <h2 className="text-base font-semibold text-[#1d1d1f]">收件箱</h2>
        <p className="text-xs text-[#8e8e93]">{messages.filter(m=>m.unread).length} 封未读</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-16 text-[#aeaeb2] text-sm">收件箱为空</div>
        ) : messages.map(msg => (
          <button
            key={msg.id}
            onClick={() => onSelect(msg)}
            className={`w-full flex items-start gap-3 px-4 py-3.5 border-b border-[#f2f2f7] hover:bg-[#f5f5f7] transition text-left ${selected?.id === msg.id ? 'bg-[#e8f0fe]' : ''}`}
          >
            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${msg.unread ? 'bg-[#0071e3]' : 'bg-transparent'}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-1">
                <span className={`text-sm truncate ${msg.unread ? 'font-semibold text-[#1d1d1f]' : 'text-[#3d3d3f]'}`}>{msg.from}</span>
                <span className="text-[10px] text-[#aeaeb2] flex-shrink-0">
                  {new Date(msg.date).toLocaleDateString('zh-CN', { month:'numeric', day:'numeric' })}
                </span>
              </div>
              <div className={`text-sm truncate mt-0.5 ${msg.unread ? 'font-medium text-[#1d1d1f]' : 'text-[#6e6e73]'}`}>{msg.subject}</div>
              <div className="text-xs text-[#aeaeb2] truncate mt-0.5">{msg.body?.split('\n')[0]}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function MsgDetail({ msg, onDelete, onReply }) {
  if (!msg) return (
    <div className="flex-1 flex flex-col items-center justify-center text-[#aeaeb2]">
      <div className="text-5xl mb-3">📬</div>
      <p className="text-sm">选择一封信来阅读</p>
    </div>
  )
  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="max-w-2xl mx-auto px-8 py-8">
        <h1 className="text-xl font-semibold text-[#1d1d1f] mb-4">{msg.subject}</h1>
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#f2f2f7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0071e3]/10 flex items-center justify-center text-[#0071e3] font-semibold">
              {msg.from?.[0] || '?'}
            </div>
            <div>
              <div className="text-sm font-medium text-[#1d1d1f]">{msg.from}</div>
              <div className="text-xs text-[#8e8e93]">{msg.fromEmail}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#aeaeb2]">
              {new Date(msg.date).toLocaleString('zh-CN', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' })}
            </span>
            <button onClick={onReply} className="p-2 rounded-xl hover:bg-[#f5f5f7] text-[#6e6e73] hover:text-[#0071e3] transition" title="回复">
              <Reply size={16} />
            </button>
            <button onClick={() => onDelete(msg.id)} className="p-2 rounded-xl hover:bg-red-50 text-[#6e6e73] hover:text-red-500 transition" title="删除">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        {msg.trackingId && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-[#f5f5f7] border border-[#e5e5ea] text-xs text-[#6e6e73] flex items-center gap-2">
            <span>📦</span>
            <span>追踪编号：<span className="font-mono font-medium text-[#1d1d1f]">{msg.trackingId}</span></span>
            {msg.from_city && msg.to_city && <span className="text-[#aeaeb2]">· {msg.from_city} → {msg.to_city}</span>}
          </div>
        )}
        <div className="text-sm text-[#3d3d3f] leading-relaxed whitespace-pre-wrap">{msg.body}</div>
      </div>
    </div>
  )
}

export default function InboxView({ onRead }) {
  const [messages, setMessages] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => { load() }, [])

  function load() {
    api.getMessages('inbox').then(msgs => {
      setMessages(msgs)
      if (msgs.length > 0 && !selected) selectMsg(msgs[0], msgs)
    })
  }

  function selectMsg(msg, msgs) {
    setSelected(msg)
    if (msg.unread) {
      api.markRead(msg.id).then(() => {
        const updated = (msgs || messages).map(m => m.id === msg.id ? { ...m, unread: false } : m)
        setMessages(updated)
        onRead?.()
      })
    }
  }

  function handleDelete(id) {
    api.deleteMessage(id).then(() => {
      const updated = messages.filter(m => m.id !== id)
      setMessages(updated)
      setSelected(updated[0] || null)
      onRead?.()
    })
  }

  return (
    <div className="h-full flex">
      <MsgList messages={messages} selected={selected} onSelect={m => selectMsg(m)} />
      <MsgDetail msg={selected} onDelete={handleDelete} onReply={() => {}} />
    </div>
  )
}
