import { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import { api } from '../api/index.js'

const STATUS_LABEL = { delivered:'已签收', transit:'运输中', processing:'处理中' }
const STATUS_COLOR = { delivered:'text-[#34c759] bg-green-50', transit:'text-[#ff9500] bg-orange-50', processing:'text-[#0071e3] bg-blue-50' }

export default function SentView() {
  const [messages, setMessages] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    api.getMessages('sent').then(msgs => {
      setMessages(msgs)
      if (msgs.length > 0) setSelected(msgs[0])
    })
  }, [])

  function handleDelete(id) {
    api.deleteMessage(id).then(() => {
      const updated = messages.filter(m => m.id !== id)
      setMessages(updated)
      setSelected(updated[0] || null)
    })
  }

  return (
    <div className="h-full flex">
      {/* 列表 */}
      <div className="w-72 flex-shrink-0 border-r border-[#e5e5ea] flex flex-col bg-white">
        <div className="px-4 py-3 border-b border-[#f2f2f7]">
          <h2 className="text-base font-semibold text-[#1d1d1f]">已发送</h2>
          <p className="text-xs text-[#8e8e93]">{messages.length} 封</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center py-16 text-[#aeaeb2] text-sm">暂无发送记录</div>
          ) : messages.map(msg => (
            <button
              key={msg.id}
              onClick={() => setSelected(msg)}
              className={`w-full flex items-start gap-3 px-4 py-3.5 border-b border-[#f2f2f7] hover:bg-[#f5f5f7] transition text-left ${selected?.id === msg.id ? 'bg-[#e8f0fe]' : ''}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-1">
                  <span className="text-sm font-medium text-[#1d1d1f] truncate">致 {msg.to}</span>
                  <span className="text-[10px] text-[#aeaeb2] flex-shrink-0">
                    {new Date(msg.date).toLocaleDateString('zh-CN', { month:'numeric', day:'numeric' })}
                  </span>
                </div>
                <div className="text-sm text-[#6e6e73] truncate mt-0.5">{msg.subject}</div>
                {msg.trackingStatus && (
                  <span className={`inline-block text-[10px] font-medium mt-1 px-1.5 py-0.5 rounded-md ${STATUS_COLOR[msg.trackingStatus] || 'text-[#8e8e93] bg-gray-50'}`}>
                    {STATUS_LABEL[msg.trackingStatus] || msg.trackingStatus}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 详情 */}
      {selected ? (
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-2xl mx-auto px-8 py-8">
            <h1 className="text-xl font-semibold text-[#1d1d1f] mb-4">{selected.subject}</h1>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#f2f2f7]">
              <div>
                <div className="text-sm text-[#6e6e73]">收件人：<span className="text-[#1d1d1f] font-medium">{selected.to}</span></div>
                <div className="text-xs text-[#aeaeb2]">{selected.toEmail}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#aeaeb2]">
                  {new Date(selected.date).toLocaleString('zh-CN', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                </span>
                <button onClick={() => handleDelete(selected.id)} className="p-2 rounded-xl hover:bg-red-50 text-[#6e6e73] hover:text-red-500 transition">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            {selected.trackingId && (
              <div className="mb-6 px-4 py-3 rounded-xl bg-[#f5f5f7] border border-[#e5e5ea] text-xs text-[#6e6e73] flex items-center gap-3">
                <span>📦</span>
                <div>
                  <div>追踪编号：<span className="font-mono font-medium text-[#1d1d1f]">{selected.trackingId}</span></div>
                  {selected.from_city && selected.to_city && (
                    <div className="text-[#aeaeb2] mt-0.5">{selected.from_city} → {selected.to_city}</div>
                  )}
                </div>
                <span className={`ml-auto text-xs font-medium px-2 py-1 rounded-lg ${STATUS_COLOR[selected.trackingStatus] || 'text-[#8e8e93] bg-gray-50'}`}>
                  {STATUS_LABEL[selected.trackingStatus] || selected.trackingStatus || ''}
                </span>
              </div>
            )}
            <div className="text-sm text-[#3d3d3f] leading-relaxed whitespace-pre-wrap">{selected.body}</div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-[#aeaeb2]">
          <div className="text-5xl mb-3">📤</div>
          <p className="text-sm">选择一封信来查看</p>
        </div>
      )}
    </div>
  )
}
