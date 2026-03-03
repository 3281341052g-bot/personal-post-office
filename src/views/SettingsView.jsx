import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { api } from '../api/index.js'

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#e5e5ea] overflow-hidden mb-4">
      <div className="px-6 py-4 border-b border-[#f2f2f7]">
        <h2 className="text-sm font-semibold text-[#1d1d1f]">{title}</h2>
      </div>
      <div className="px-6 py-4">{children}</div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="flex items-center gap-4 py-2.5 border-b border-[#f2f2f7] last:border-0">
      <label className="text-sm text-[#6e6e73] w-28 flex-shrink-0">{label}</label>
      {children}
    </div>
  )
}

export default function SettingsView() {
  const user = api.getCurrentUser()
  const savedCfg = JSON.parse(localStorage.getItem('ppo_server_config') || JSON.stringify({ host:'two.edu.kg', smtpPort:25, imapPort:143, ssl:false, username:'admin@two.edu.kg', password:'' }))
  const [cfg, setCfg] = useState(savedCfg)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [saved, setSaved] = useState(false)

  const set = (k, v) => { setCfg(c => ({ ...c, [k]: v })); setTestResult(null) }

  async function handleTest() {
    setTesting(true); setTestResult(null)
    try {
      const res = await fetch('/api/server-config.php?action=test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Session-Token': localStorage.getItem('ppo_token') || '' },
        body: JSON.stringify(cfg),
      })
      const json = await res.json()
      setTestResult(json.data || { success: false, message: json.error })
    } catch {
      setTestResult({ success: false, message: '网络错误，请检查服务器是否可达' })
    } finally {
      setTesting(false)
    }
  }

  function handleSave() {
    localStorage.setItem('ppo_server_config', JSON.stringify(cfg))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="h-full overflow-y-auto bg-[#f5f5f7] px-8 py-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-6">设置</h1>

        <Section title="账号信息">
          <Field label="邮箱"><span className="text-sm text-[#1d1d1f]">{user?.email}</span></Field>
          <Field label="用户名"><span className="text-sm text-[#1d1d1f]">{user?.name}</span></Field>
          <Field label="模式">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${api.isServerMode() ? 'bg-green-50 text-[#34c759]' : 'bg-blue-50 text-[#0071e3]'}`}>
              {api.isServerMode() ? '服务器模式' : '本地演示模式'}
            </span>
          </Field>
        </Section>

        <Section title="邮件服务器配置">
          <p className="text-xs text-[#8e8e93] mb-4">配置宝塔邮局 IMAP/SMTP 服务器参数，保存后重新登录生效。</p>

          {[
            { key:'host', label:'服务器地址', placeholder:'mail.example.com', type:'text' },
            { key:'username', label:'邮箱账号', placeholder:'admin@example.com', type:'email' },
            { key:'password', label:'邮箱密码', placeholder:'••••••••', type:'password' },
            { key:'imapPort', label:'IMAP 端口', placeholder:'143 或 993', type:'number' },
            { key:'smtpPort', label:'SMTP 端口', placeholder:'25、465 或 587', type:'number' },
          ].map(({ key, label, placeholder, type }) => (
            <Field key={key} label={label}>
              <input
                type={type}
                value={cfg[key] || ''}
                onChange={e => set(key, type === 'number' ? Number(e.target.value) : e.target.value)}
                placeholder={placeholder}
                className="flex-1 text-sm text-[#1d1d1f] px-3 py-2 rounded-xl border border-[#d2d2d7] outline-none focus:border-[#0071e3] placeholder:text-[#aeaeb2]"
              />
            </Field>
          ))}

          <Field label="SSL 加密">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={cfg.ssl} onChange={e => set('ssl', e.target.checked)} className="rounded accent-[#0071e3]" />
              <span className="text-sm text-[#1d1d1f]">启用 SSL/TLS</span>
            </label>
          </Field>

          {testResult && (
            <div className={`mt-3 px-4 py-3 rounded-xl text-sm border ${testResult.success ? 'bg-green-50 border-green-100 text-[#34c759]' : 'bg-red-50 border-red-100 text-red-600'}`}>
              {testResult.success ? '✅ 连接成功！IMAP 和 SMTP 均正常' : `❌ ${testResult.message || '连接失败'}`}
              {testResult.imap && !testResult.success && (
                <div className="mt-1 text-xs space-y-0.5">
                  <div>IMAP: {testResult.imap.success ? '✅' : '❌'} {testResult.imap.message}</div>
                  <div>SMTP: {testResult.smtp?.success ? '✅' : '❌'} {testResult.smtp?.message}</div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleTest}
              disabled={testing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#d2d2d7] text-sm text-[#1d1d1f] hover:bg-[#f5f5f7] transition disabled:opacity-60"
            >
              {testing ? <Loader2 size={14} className="animate-spin" /> : null}
              {testing ? '测试中…' : '测试连接'}
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-sm font-medium transition"
            >
              {saved ? <Check size={14} /> : null}
              {saved ? '已保存' : '保存配置'}
            </button>
          </div>
        </Section>

        <Section title="关于">
          <div className="text-sm text-[#6e6e73] space-y-1">
            <div>个人邮局 · Personal Post Office</div>
            <div className="text-xs text-[#aeaeb2]">版本 1.0.0 · React + Vite + Tailwind CSS</div>
          </div>
        </Section>
      </div>
    </div>
  )
}
