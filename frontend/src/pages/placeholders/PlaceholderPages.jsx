import React, { useEffect, useState } from 'react';
import { Search as SearchIcon, Plus, Trash2, Check, RefreshCw } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import SearchModal from '../../components/dashboard/SearchModal';
import MusicPlayerBar from '../../components/layout/MusicPlayerBar';
import { apiClient } from '../../services/apiClient';

const box = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 14 };

export const SearchPage = () => <AppShell pageTitle="Search"><SearchModal isOpen onClose={() => {}} inline /></AppShell>;

export const TasksPage = () => {
  const [tasks, setTasks] = useState([]); const [title, setTitle] = useState(''); const [filter, setFilter] = useState('all'); const [error, setError] = useState('');
  const load = async () => { try { const r = await apiClient(`/tasks?filter=${filter}`); setTasks(r.tasks || []); setError(''); } catch (e) { setError(e.message); } };
  useEffect(() => { load(); }, [filter]);
  const create = async e => { e.preventDefault(); if (!title.trim()) return; try { await apiClient('/tasks', { method: 'POST', body: { title } }); setTitle(''); load(); } catch (e) { setError(e.message); } };
  const update = async (t, patch) => { await apiClient(`/tasks/${t._id}`, { method: 'PUT', body: patch }); load(); };
  const remove = async t => { await apiClient(`/tasks/${t._id}`, { method: 'DELETE' }); load(); };
  return <AppShell pageTitle="Tasks"><div style={{ maxWidth: 900 }}><form onSubmit={create} style={{ ...box, display: 'flex', gap: 10 }}><input aria-label="New task" value={title} onChange={e => setTitle(e.target.value)} placeholder="Add a task" style={{ flex: 1, padding: 12 }} /><button><Plus size={18} /> Add task</button></form><div style={box}><select value={filter} onChange={e => setFilter(e.target.value)}>{['all','today','upcoming','overdue','completed'].map(x => <option key={x}>{x}</option>)}</select> <button onClick={load} aria-label="Refresh"><RefreshCw size={16}/></button></div>{error && <p role="alert">{error}</p>}{tasks.map(t => <div key={t._id} style={{ ...box, display: 'flex', alignItems: 'center', gap: 12 }}><button onClick={() => update(t, { completed: !t.completed })} aria-label="Toggle completion"><Check size={16}/></button><div style={{ flex: 1 }}><input value={t.title} onChange={e => setTasks(xs => xs.map(x => x._id === t._id ? { ...x, title: e.target.value } : x))} onBlur={() => update(t, { title: t.title })} /><p>{t.description}</p></div><input type="date" value={t.dueDate ? new Date(t.dueDate).toISOString().slice(0,10) : ''} onChange={e => update(t, { dueDate: e.target.value || null })}/><select value={t.priority} onChange={e => update(t, { priority: e.target.value })}>{['Low','Medium','High'].map(x => <option key={x}>{x}</option>)}</select><button onClick={() => remove(t)} aria-label="Delete task"><Trash2 size={16}/></button></div>)}{!tasks.length && <p>No tasks found.</p>}</div><MusicPlayerBar /></AppShell>;
};

export const CalendarPage = () => {
  const [events, setEvents] = useState([]); const [title, setTitle] = useState(''); const [date, setDate] = useState(new Date().toISOString().slice(0,10)); const [error, setError] = useState('');
  const load = () => apiClient('/calendar/events').then(r => setEvents(r.events || [])).catch(e => setError(e.message));
  useEffect(() => { load(); }, []);
  const create = async e => { e.preventDefault(); try { await apiClient('/calendar/events', { method: 'POST', body: { title, date: new Date(`${date}T12:00:00`).toISOString() } }); setTitle(''); load(); } catch (e) { setError(e.message); } };
  return <AppShell pageTitle="Calendar"><form onSubmit={create} style={box}><input aria-label="Event title" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Event title" required/> <input type="date" value={date} onChange={e=>setDate(e.target.value)}/><button>Create event</button></form>{error && <p>{error}</p>}{events.map(e=><div key={e._id} style={box}><b>{e.title}</b><div>{e.date ? new Date(e.date).toLocaleString() : 'Date not set'}</div>{e.meetLink && <a href={e.meetLink} target="_blank" rel="noreferrer">Join meeting</a>}</div>)}{!events.length && <p>No calendar events. Connect Google in Integrations to sync your calendar.</p>}<MusicPlayerBar /></AppShell>;
};

export const ActivityPage = () => {
  const [items, setItems] = useState([]); const [error, setError] = useState('');
  const load = () => apiClient('/activity').then(r => { setItems(r.activities || []); setError(''); }).catch(e => setError(e.message));
  useEffect(() => { load(); }, []);
  return <AppShell pageTitle="Activity"><button onClick={load}><RefreshCw size={16}/> Refresh</button>{error && <p role="alert">{error}</p>}{items.map(a=><div key={a.id} style={box}><small>{a.type} · {a.timestamp && new Date(a.timestamp).toLocaleString()}</small><h3>{a.title}</h3><p>{a.detail}</p>{a.url && <a href={a.url.startsWith('/') ? a.url : a.url} target={a.url.startsWith('/') ? undefined : '_blank'} rel="noreferrer">Open item</a>}</div>)}{!items.length && !error && <p>No activity yet.</p>}<MusicPlayerBar /></AppShell>;
};

export const SettingsPage = () => <AppShell pageTitle="Settings"><p>Theme preferences are available from the top bar. Manage connected accounts in Integrations.</p></AppShell>;
export const ProfilePage = () => <AppShell pageTitle="Profile"><p>Profile details are managed by your Digital Desk account.</p></AppShell>;
