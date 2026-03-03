import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import { api } from '../api/index.js'

function ContactModal({ contact, onSave, onClose }) {
  const [form, setForm] = useState(contact || { name:'', email:'', phone:'', city:'', note:'' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function handleSave(e) {
    e.preventDefault()
    if (!form.name) return
    onSave(form)
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#f2f2f7]">
          <h2 className="text-base font-semibold text-[#1d1d1f]">{contact?.id ? '编辑联系人' : '新增联系人'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-[#f5f5f7] text-[#8e8e93]"><X size={16} /></button>
        </div>
        <form onSubmit={handleSave} className="px-6 py-4 space-y-3">
          {[
            { key:'name', label:'姓名 *', placeholder:'联系人姓名' },
            { key:'email', label:'邮箱', placeholder:'email@example.com' },
            { key:'phone', label:'电话', placeholder:'138-0000-0000' },
            { key:'city', label:'城市', placeholder:'所在城市' },
            { key:'note', label:'备注', placeholder:'认识方式或其他备注' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="text-xs text-[#8e8e93] mb-1 block">{label}</label>
              <input
                value={form[key]}
                onChange={e => set(key, e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 rounded-xl border border-[#d2d2d7] text-sm text-[#1d1d1f] outline-none focus:border-[#0071e3] placeholder:text-[#aeaeb2]"
              />
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#d2d2d7] text-sm text-[#1d1d1f] hover:bg-[#f5f5f7] transition">取消</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#0071e3] text-white text-sm font-medium hover:bg-[#0077ed] transition">保存</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ContactsView() {
  const [contacts, setContacts] = useState([])
  const [modal, setModal] = useState(null) // null | 'new' | contact

  useEffect(() => { api.getContacts().then(setContacts) }, [])

  function load() { api.getContacts().then(setContacts) }

  function handleSave(form) {
    api.saveContact(form).then(() => { load(); setModal(null) })
  }

  function handleDelete(id) {
    if (!confirm('确定删除这个联系人？')) return
    api.deleteContact(id).then(load)
  }

  return (
    <div className="h-full overflow-y-auto bg-[#f5f5f7] px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#1d1d1f]">地址簿</h1>
          <p className="text-sm text-[#6e6e73] mt-0.5">{contacts.length} 位联系人</p>
        </div>
        <button
          onClick={() => setModal('new')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-sm font-medium transition"
        >
          <Plus size={15} /> 新增联系人
        </button>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-20 text-[#aeaeb2]">
          <div className="text-5xl mb-3">👤</div>
          <p className="text-sm">还没有联系人，点击右上角添加</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {contacts.map(c => (
            <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-[#e5e5ea] p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-full bg-[#0071e3]/10 flex items-center justify-center text-[#0071e3] font-semibold text-lg">
                  {c.name[0]}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setModal(c)} className="p-1.5 rounded-lg hover:bg-[#f5f5f7] text-[#8e8e93] hover:text-[#1d1d1f] transition"><Pencil size={13} /></button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-[#8e8e93] hover:text-red-500 transition"><Trash2 size={13} /></button>
                </div>
              </div>
              <div className="text-sm font-semibold text-[#1d1d1f]">{c.name}</div>
              {c.city && <div className="text-xs text-[#8e8e93] mt-0.5">📍 {c.city}</div>}
              {c.email && <div className="text-xs text-[#aeaeb2] mt-1 truncate">{c.email}</div>}
              {c.note && <div className="text-xs text-[#aeaeb2] mt-1 truncate">{c.note}</div>}
            </div>
          ))}
        </div>
      )}

      {modal && (
        <ContactModal
          contact={modal === 'new' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
