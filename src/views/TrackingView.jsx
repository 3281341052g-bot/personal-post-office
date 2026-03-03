import { useState, useEffect } from 'react'
import { Search, Package } from 'lucide-react'
import { api } from '../api/index.js'

const STATUS_LABEL = { delivered:'已签收', transit:'运输中', processing:'处理中' }
const STATUS_COLOR = {
  delivered: 'bg-green-50 text-[#34c759] border-green-100',
  transit: 'bg-orange-50 text-[#ff9500] border-orange-100',
  processing: 'bg-blue-50 text-[#0071e3] border-blue-100',
}

function Timeline({ steps }) {
  return (
    <div className="space-y-0">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 mt-1 ${step.done ? 'border-[#0071e3] bg-[#0071e3]' : 'border-[#d2d2d7] bg-white'}`} />
            {i < steps.length - 1 && <div className={`w-0.5 flex-1 my-1 ${step.done ? 'bg-[#0071e3]' : 'bg-[#e5e5ea]'}`} />}
          </div>
          <div className={`pb-5 flex-1 ${i === steps.length - 1 ? 'pb-0' : ''}`}>
            <div className={`text-sm font-medium ${step.done ? 'text-[#1d1d1f]' : 'text-[#aeaeb2]'}`}>{step.event}</div>
            {step.location && <div className="text-xs text-[#8e8e93] mt-0.5">{step.location}</div>}
            {step.time && <div className="text-xs text-[#aeaeb2] mt-0.5">{step.time}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}

function TrackCard({ item, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 border-b border-[#f2f2f7] hover:bg-[#f5f5f7] transition ${active ? 'bg-[#e8f0fe]' : ''}`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-mono text-[#8e8e93]">{item.id}</span>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${STATUS_COLOR[item.status] || 'bg-gray-50 text-[#8e8e93] border-gray-100'}`}>
          {STATUS_LABEL[item.status] || item.status}
        </span>
      </div>
      <div className="text-sm font-medium text-[#1d1d1f]">{item.from} → {item.to}</div>
      <div className="text-xs text-[#8e8e93] mt-0.5">{item.package} · {item.sender} → {item.recipient}</div>
    </button>
  )
}

export default function TrackingView() {
  const [query, setQuery] = useState('')
  const [all, setAll] = useState([])
  const [selected, setSelected] = useState(null)
  const [searching, setSearching] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    api.getAllTracking().then(list => {
      setAll(list)
      if (list.length > 0) setSelected(list[0])
    })
  }, [])

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true); setNotFound(false)
    const result = await api.trackPackage(query)
    if (result) { setSelected(result); if (!all.find(t => t.id === result.id)) setAll(a => [result, ...a]) }
    else setNotFound(true)
    setSearching(false)
  }

  return (
    <div className="h-full flex">
      {/* 左侧列表 */}
      <div className="w-72 flex-shrink-0 border-r border-[#e5e5ea] flex flex-col bg-white">
        <div className="px-4 py-3 border-b border-[#f2f2f7]">
          <h2 className="text-base font-semibold text-[#1d1d1f] mb-2">实时追踪</h2>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="输入追踪编号…"
              className="flex-1 text-xs px-3 py-2 rounded-xl border border-[#d2d2d7] outline-none focus:border-[#0071e3] placeholder:text-[#aeaeb2]"
            />
            <button type="submit" className="p-2 rounded-xl bg-[#0071e3] text-white hover:bg-[#0077ed] transition">
              <Search size={14} />
            </button>
          </form>
          {notFound && <p className="text-xs text-red-500 mt-1.5">未找到该追踪编号</p>}
        </div>
        <div className="flex-1 overflow-y-auto">
          {all.length === 0 ? (
            <div className="text-center py-16 text-[#aeaeb2] text-sm">暂无追踪记录</div>
          ) : all.map(item => (
            <TrackCard key={item.id} item={item} active={selected?.id === item.id} onClick={() => setSelected(item)} />
          ))}
        </div>
      </div>

      {/* 右侧详情 */}
      {selected ? (
        <div className="flex-1 overflow-y-auto bg-[#f5f5f7] px-8 py-8">
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-[#e5e5ea] p-6 mb-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xs font-mono text-[#8e8e93] mb-1">{selected.id}</div>
                  <h2 className="text-lg font-semibold text-[#1d1d1f]">{selected.from} → {selected.to}</h2>
                  <div className="text-sm text-[#6e6e73] mt-0.5">{selected.package}</div>
                </div>
                <span className={`text-xs font-medium px-3 py-1.5 rounded-full border ${STATUS_COLOR[selected.status] || 'bg-gray-50 text-[#8e8e93] border-gray-100'}`}>
                  {STATUS_LABEL[selected.status] || selected.status}
                </span>
              </div>
              <div className="text-xs text-[#aeaeb2] flex gap-4">
                <span>寄件人：{selected.sender}</span>
                <span>收件人：{selected.recipient}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#e5e5ea] p-6">
              <h3 className="text-sm font-semibold text-[#1d1d1f] mb-5">物流时间线</h3>
              <Timeline steps={selected.steps || []} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-[#aeaeb2]">
          <Package size={40} className="mb-3 opacity-40" />
          <p className="text-sm">选择包裹或输入追踪编号</p>
        </div>
      )}
    </div>
  )
}
