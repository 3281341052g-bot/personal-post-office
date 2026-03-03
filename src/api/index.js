/* API 适配层 - 自动判断演示/服务器模式 */

const IS_SERVER = location.protocol !== 'file:' && import.meta.env.PROD
  ? true
  : location.protocol !== 'file:';

function getToken() { return localStorage.getItem('ppo_token') || ''; }

async function request(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Session-Token': getToken(),
  };
  const res = await fetch('/api' + url, { ...options, headers });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || '请求失败');
  return json.data;
}

/* ── Mock 数据初始化 ── */
function initMock() {
  if (localStorage.getItem('ppo_mock_initialized')) return;
  const inbox = [
    { id:'msg-001', folder:'inbox', unread:true, starred:false, from:'林小雨', fromEmail:'lin@example.com', to:'我', toEmail:'me@postoffice.com', subject:'好久不见，最近还好吗？', body:'亲爱的朋友，\n\n好久没有联系了，不知道你最近过得怎么样？\n\n前几天看到街上的梧桐叶落了，忽然想起我们一起走过那条街道的时光。\n\n林小雨 敬上', date:'2026-03-01T09:12:00', trackingId:'PPO-20260301-1234', trackingStatus:'delivered', package:'心意', from_city:'成都', to_city:'上海' },
    { id:'msg-002', folder:'inbox', unread:true, starred:true, from:'张伟明', fromEmail:'zhang@example.com', to:'我', toEmail:'me@postoffice.com', subject:'生日快乐！来自纽约的祝福', body:'生日快乐！\n\n隔着太平洋，送上我最真诚的祝福。\n\n张伟明\n2026年2月28日，于纽约', date:'2026-02-28T14:30:00', trackingId:'PPO-20260228-5678', trackingStatus:'delivered', package:'珍藏', from_city:'纽约', to_city:'上海' },
    { id:'msg-003', folder:'inbox', unread:true, starred:false, from:'个人邮局系统', fromEmail:'system@postoffice.com', to:'我', toEmail:'me@postoffice.com', subject:'你的信件已签收 · PPO-20260225-9012', body:'亲爱的用户，\n\n你于2026年2月25日发出的信件已成功签收！\n\n追踪编号：PPO-20260225-9012\n收件人：王芳芳\n签收时间：2026年3月2日 10:45', date:'2026-03-02T10:45:00', trackingId:'PPO-20260225-9012', trackingStatus:'delivered' },
    { id:'msg-004', folder:'inbox', unread:false, starred:false, from:'陈思远', fromEmail:'chen@example.com', to:'我', toEmail:'me@postoffice.com', subject:'谢谢你的那封信', body:'你好，\n\n收到你上个月的来信，我激动了好久。\n\n现代社会里，还有人愿意用纸和笔写信，真的让我很感动。\n\n陈思远', date:'2026-02-20T16:22:00' },
  ];
  const sent = [
    { id:'sent-001', folder:'sent', unread:false, starred:false, from:'我', fromEmail:'me@postoffice.com', to:'王芳芳', toEmail:'wang@example.com', subject:'致远方的你', body:'芳芳，\n\n见字如面。\n\n好久没有联系，却总是在某个安静的午后想起你。\n\n你的朋友 敬上', date:'2026-02-25T11:00:00', trackingId:'PPO-20260225-9012', trackingStatus:'delivered', package:'心意', from_city:'上海', to_city:'深圳' },
    { id:'sent-002', folder:'sent', unread:false, starred:true, from:'我', fromEmail:'me@postoffice.com', to:'爸爸妈妈', toEmail:'parents@example.com', subject:'报平安，顺便说说近况', body:'爸爸妈妈，\n\n好久没打电话，想着写封信给你们。\n\n我在上海一切都好，工作虽然忙，但已经慢慢适应了。\n\n爱你们的孩子', date:'2026-02-10T20:30:00', trackingId:'PPO-20260210-3344', trackingStatus:'delivered', package:'信笺', from_city:'上海', to_city:'武汉' },
  ];
  const contacts = [
    { id:'c-001', name:'林小雨', email:'lin@example.com', phone:'138-0000-0001', city:'成都', note:'大学室友' },
    { id:'c-002', name:'张伟明', email:'zhang@example.com', phone:'138-0000-0002', city:'纽约', note:'留学好友' },
    { id:'c-003', name:'王芳芳', email:'wang@example.com', phone:'138-0000-0003', city:'深圳', note:'高中同学' },
    { id:'c-004', name:'陈思远', email:'chen@example.com', phone:'138-0000-0004', city:'北京', note:'网友' },
  ];
  const tracking = [
    { id:'PPO-20260301-1234', status:'delivered', from:'成都', to:'上海', package:'心意', sender:'林小雨', recipient:'我', steps:[{ event:'已封装', location:'成都分拣中心', time:'2026-03-01 09:12', done:true },{ event:'已揽收', location:'成都顺丰快递', time:'2026-03-01 14:30', done:true },{ event:'运输中', location:'成都→上海航空', time:'2026-03-01 20:00', done:true },{ event:'派送中', location:'上海配送站', time:'2026-03-02 08:30', done:true },{ event:'已签收', location:'上海收件点', time:'2026-03-02 11:20', done:true }] },
    { id:'PPO-20260303-8821', status:'transit', from:'上海', to:'巴黎', package:'珍藏', sender:'我', recipient:'好友 Emma', steps:[{ event:'已封装', location:'上海分拣中心', time:'2026-03-03 09:12', done:true },{ event:'已揽收', location:'上海国际快递', time:'2026-03-03 14:30', done:true },{ event:'运输中', location:'浦东国际机场', time:'2026-03-03 22:00', done:true },{ event:'海关清关', location:'法国海关', time:null, done:false },{ event:'已签收', location:'巴黎收件点', time:null, done:false }] },
  ];
  localStorage.setItem('ppo_inbox', JSON.stringify(inbox));
  localStorage.setItem('ppo_sent', JSON.stringify(sent));
  localStorage.setItem('ppo_contacts', JSON.stringify(contacts));
  localStorage.setItem('ppo_tracking', JSON.stringify(tracking));
  localStorage.setItem('ppo_mock_initialized', '1');
}

function isServerMode() {
  const token = getToken();
  return IS_SERVER && !!token && !token.startsWith('demo-');
}

/* ── 导出 API ── */
export const api = {
  isServerMode,

  getCurrentUser() { return JSON.parse(localStorage.getItem('ppo_user') || 'null'); },
  logout() {
    localStorage.removeItem('ppo_user');
    localStorage.removeItem('ppo_token');
    window.location.href = '/';
  },

  async login(email, password) {
    if (IS_SERVER) {
      const res = await fetch('/api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || '邮箱或密码错误');
      return json.data;
    }
    const name = email.split('@')[0];
    return {
      user: { email, name: name.charAt(0).toUpperCase() + name.slice(1), avatar: name.charAt(0).toUpperCase() },
      token: 'demo-' + btoa(email),
    };
  },

  getMessages(folder = 'inbox') {
    if (isServerMode()) {
      return request(`/messages.php?folder=${folder}`)
        .then(d => d.demo ? this._mockMessages(folder) : d.messages)
        .catch(() => this._mockMessages(folder));
    }
    return Promise.resolve(this._mockMessages(folder));
  },
  _mockMessages(folder) {
    const key = folder === 'inbox' ? 'ppo_inbox' : 'ppo_sent';
    return JSON.parse(localStorage.getItem(key) || '[]');
  },

  getMessage(id) {
    if (isServerMode() && id.startsWith('imap-')) {
      return request(`/messages.php?id=${id}`)
        .then(d => d.demo ? this._mockMessage(id) : d.message)
        .catch(() => this._mockMessage(id));
    }
    return Promise.resolve(this._mockMessage(id));
  },
  _mockMessage(id) {
    const all = [
      ...JSON.parse(localStorage.getItem('ppo_inbox') || '[]'),
      ...JSON.parse(localStorage.getItem('ppo_sent') || '[]'),
    ];
    return all.find(m => m.id === id) || null;
  },

  markRead(id) {
    if (isServerMode() && id.startsWith('imap-')) {
      return request(`/messages.php?action=read&id=${id}`, { method: 'POST' }).catch(() => {});
    }
    ['ppo_inbox', 'ppo_sent'].forEach(key => {
      const msgs = JSON.parse(localStorage.getItem(key) || '[]');
      const idx = msgs.findIndex(m => m.id === id);
      if (idx >= 0) { msgs[idx].unread = false; localStorage.setItem(key, JSON.stringify(msgs)); }
    });
    return Promise.resolve();
  },

  deleteMessage(id) {
    if (isServerMode() && id.startsWith('imap-')) {
      return request(`/messages.php?id=${id}`, { method: 'DELETE' }).catch(() => {});
    }
    ['ppo_inbox', 'ppo_sent'].forEach(key => {
      const msgs = JSON.parse(localStorage.getItem(key) || '[]').filter(m => m.id !== id);
      localStorage.setItem(key, JSON.stringify(msgs));
    });
    return Promise.resolve();
  },

  sendMessage(data) {
    if (isServerMode()) {
      return request('/send.php', { method: 'POST', body: JSON.stringify(data) })
        .then(d => ({ success: true, trackingId: d.trackingId }));
    }
    const sent = JSON.parse(localStorage.getItem('ppo_sent') || '[]');
    const user = this.getCurrentUser();
    const trackingId = 'PPO-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(Math.random() * 9000 + 1000);
    sent.unshift({ id:'sent-'+Date.now(), folder:'sent', unread:false, starred:false, from:user?.name||'我', fromEmail:user?.email||'me@postoffice.com', to:data.to, toEmail:data.toEmail||data.to, subject:data.subject, body:data.body, date:new Date().toISOString(), trackingId, trackingStatus:'processing', package:data.package, from_city:data.fromCity||'上海', to_city:data.toCity||'目的地' });
    localStorage.setItem('ppo_sent', JSON.stringify(sent));
    const tracking = JSON.parse(localStorage.getItem('ppo_tracking') || '[]');
    tracking.unshift({ id:trackingId, status:'processing', from:data.fromCity||'上海', to:data.toCity||'目的地', package:data.package, sender:user?.name||'我', recipient:data.to, steps:[{ event:'已封装', location:'分拣中心', time:new Date().toLocaleString('zh-CN'), done:true },{ event:'等待揽收', location:'待安排', time:null, done:false },{ event:'运输中', location:null, time:null, done:false },{ event:'派送中', location:null, time:null, done:false },{ event:'已签收', location:null, time:null, done:false }] });
    localStorage.setItem('ppo_tracking', JSON.stringify(tracking));
    return Promise.resolve({ success: true, trackingId });
  },

  getUnreadCount() {
    const msgs = JSON.parse(localStorage.getItem('ppo_inbox') || '[]');
    return Promise.resolve(msgs.filter(m => m.unread).length);
  },

  trackPackage(id) {
    const tracking = JSON.parse(localStorage.getItem('ppo_tracking') || '[]');
    return Promise.resolve(tracking.find(t => t.id === id.trim().toUpperCase()) || null);
  },
  getAllTracking() {
    return Promise.resolve(JSON.parse(localStorage.getItem('ppo_tracking') || '[]'));
  },

  getContacts() {
    if (isServerMode()) {
      return request('/contacts.php').catch(() => JSON.parse(localStorage.getItem('ppo_contacts') || '[]'));
    }
    return Promise.resolve(JSON.parse(localStorage.getItem('ppo_contacts') || '[]'));
  },
  saveContact(contact) {
    if (isServerMode()) {
      return request('/contacts.php', { method: 'POST', body: JSON.stringify(contact) });
    }
    const contacts = JSON.parse(localStorage.getItem('ppo_contacts') || '[]');
    if (contact.id) {
      const idx = contacts.findIndex(c => c.id === contact.id);
      idx >= 0 ? contacts[idx] = contact : contacts.push(contact);
    } else { contact.id = 'c-' + Date.now(); contacts.push(contact); }
    localStorage.setItem('ppo_contacts', JSON.stringify(contacts));
    return Promise.resolve(contact);
  },
  deleteContact(id) {
    if (isServerMode()) {
      return request(`/contacts.php?id=${id}`, { method: 'DELETE' });
    }
    const contacts = JSON.parse(localStorage.getItem('ppo_contacts') || '[]').filter(c => c.id !== id);
    localStorage.setItem('ppo_contacts', JSON.stringify(contacts));
    return Promise.resolve();
  },

  init() { initMock(); },
};
