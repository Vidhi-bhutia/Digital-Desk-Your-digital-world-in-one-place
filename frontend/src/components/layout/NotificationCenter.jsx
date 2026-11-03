import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, CheckCheck, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';

const labels = { tasks: 'Tasks', integrations: 'Integrations', security: 'Security', system: 'System' };
const groupFor = value => { const date = new Date(value); const today = new Date(); today.setHours(0, 0, 0, 0); const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1); return date >= today ? 'Today' : date >= yesterday ? 'Yesterday' : 'Older'; };

export default function NotificationCenter() {
  const [open, setOpen] = useState(false); const [items, setItems] = useState([]); const [unread, setUnread] = useState(0); const [error, setError] = useState(''); const navigate = useNavigate(); const { user } = useAuth(); const previousUnread = useRef(null);
  const load = async () => {
    try {
      const result = await apiClient('/notifications'); const count = result.unreadCount || 0;
      if (previousUnread.current !== null && count > previousUnread.current && user?.notificationPreferences?.enabled !== false) {
        const newest = (result.items || []).find(item => !item.readAt);
        if (user?.notificationPreferences?.desktop && 'Notification' in window && Notification.permission === 'granted' && newest) new Notification(newest.title, { body: newest.message || 'Open Digital Desk to view this notification.' });
        if (user?.notificationPreferences?.sound) { try { const AudioCtor = window.AudioContext || window.webkitAudioContext; const audio = new AudioCtor(); const oscillator = audio.createOscillator(); const gain = audio.createGain(); oscillator.frequency.value = 660; gain.gain.value = 0.035; oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime + 0.12); oscillator.onended = () => audio.close(); } catch {} }
      }
      previousUnread.current = count; setItems(result.items || []); setUnread(count); setError('');
    } catch (e) { setError(e.message); }
  };
  useEffect(() => { load(); const timer = setInterval(load, 60000); return () => clearInterval(timer); }, []);
  useEffect(() => { if (open) load(); }, [open]);
  const groups = useMemo(() => items.reduce((result, item) => { const key = groupFor(item.createdAt); (result[key] ||= []).push(item); return result; }, {}), [items]);
  const mark = async item => {
    const nextRead = !item.readAt; const oldItems = items; const now = new Date().toISOString();
    setItems(current => current.map(entry => entry._id === item._id ? { ...entry, readAt: nextRead ? now : null } : entry));
    setUnread(current => Math.max(0, current + (nextRead ? -1 : 1)));
    try { await apiClient(`/notifications/${item._id}`, { method: 'PATCH', body: { read: nextRead } }); await load(); }
    catch (e) { setItems(oldItems); setUnread(current => Math.max(0, current + (nextRead ? 1 : -1))); setError(`Could not update this notification: ${e.message}`); }
  };
  const clearAll = async () => { if (!window.confirm('Clear all notifications? This cannot be undone.')) return; try { await apiClient('/notifications', { method: 'DELETE' }); setItems([]); setUnread(0); } catch (e) { setError(e.message); } };
  const openItem = async item => { if (!item.readAt) await mark(item); setOpen(false); navigate(item.link || '/'); };
  const actionStyle = { border: 0, borderRadius: 8, background: 'var(--color-brand-subtle)', color: 'var(--color-brand)', cursor: 'pointer', padding: '6px 10px', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 };
  return <div style={{ position: 'relative' }}>
    <button type="button" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} onClick={() => setOpen(value => !value)} style={{ width: 38, height: 38, borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)', background: 'var(--color-surface-hover)', color: 'var(--color-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}><Bell size={18}/>{unread > 0 && <span style={{ position: 'absolute', top: -5, right: -5, minWidth: 17, height: 17, borderRadius: 10, padding: '0 4px', background: 'var(--color-danger)', color: '#fff', fontSize: 10, lineHeight: '17px', fontWeight: 700 }}>{unread > 99 ? '99+' : unread}</span>}</button>
    {open && <div role="dialog" aria-label="Notification center" style={{ position: 'absolute', right: 0, top: 48, width: 'min(420px, calc(100vw - 24px))', maxHeight: 'min(72vh, 620px)', overflowY: 'auto', padding: 16, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', zIndex: 60 }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}><strong>Notifications</strong><button type="button" aria-label="Close" onClick={() => setOpen(false)} style={{ border: 0, background: 'transparent', color: 'var(--color-text-muted)', cursor: 'pointer' }}><X size={17}/></button></header>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, fontSize: 12, margin: '12px 0' }}><button type="button" onClick={async () => { try { await apiClient('/notifications/read-all', { method: 'PATCH' }); await load(); } catch (e) { setError(e.message); } }} style={{ ...actionStyle, background: 'transparent' }}><CheckCheck size={14}/> Mark all read</button><button type="button" onClick={clearAll} style={{ ...actionStyle, background: 'transparent', color: 'var(--color-danger)' }}><Trash2 size={14}/> Clear all</button></div>
      {error && <p role="alert" style={{ color: 'var(--color-danger)', fontSize: 12, marginBottom: 8 }}>{error}</p>}
      {Object.entries(groups).map(([group, entries]) => <section key={group}><h3 style={{ fontSize: 13, margin: '12px 0 5px' }}>{group}</h3>{entries.map(item => <article key={item._id} style={{ padding: '11px 0', borderBottom: '1px solid var(--color-border)', opacity: item.readAt ? 0.76 : 1 }}><div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}><button type="button" onClick={() => openItem(item)} style={{ flex: 1, textAlign: 'left', border: 0, padding: 0, background: 'transparent', color: 'var(--color-text)', cursor: 'pointer' }}><small style={{ color: 'var(--color-brand)' }}>{labels[item.category] || 'Update'} · {new Date(item.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</small><b style={{ display: 'block', fontSize: 13, marginTop: 2 }}>{item.title}</b><span style={{ display: 'block', fontSize: 12, color: 'var(--color-text-muted)' }}>{item.message}</span></button></div><div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}><button type="button" onClick={() => mark(item)} style={actionStyle}>{item.readAt ? 'Mark unread' : 'Mark as read'}</button></div></article>)}</section>)}
      {!items.length && !error && <p style={{ color: 'var(--color-text-muted)', fontSize: 13, padding: '14px 0' }}>You’re all caught up.</p>}
    </div>}
  </div>;
}
