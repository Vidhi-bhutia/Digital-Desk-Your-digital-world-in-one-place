import React, { useEffect, useState } from 'react';
import { Search as SearchIcon, Plus, Trash2, Check, RefreshCw, CalendarDays, CircleCheck, ListTodo, AlertCircle } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import SearchModal from '../../components/dashboard/SearchModal';
import MusicPlayerBar from '../../components/layout/MusicPlayerBar';
import { apiClient } from '../../services/apiClient';
import Button from '../../components/common/Button';

const box = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 14 };

export const SearchPage = () => <AppShell pageTitle="Search"><SearchModal isOpen onClose={() => {}} inline /></AppShell>;

export const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [counts, setCounts] = useState({ total: 0, today: 0, upcoming: 0, overdue: 0, completed: 0 });
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const load = async (quiet = false) => {
    if (!quiet) setLoading(true);
    try { const r = await apiClient(`/tasks?filter=${filter}`); setTasks(r.tasks || []); setCounts(r.counts || counts); setError(''); }
    catch (e) { setError(e.message || 'Could not load tasks.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [filter]);
  const create = async e => {
    e.preventDefault(); if (!title.trim()) return;
    setSaving(true);
    try {
      await apiClient('/tasks', { method: 'POST', body: { title: title.trim(), dueDate: dueDate ? new Date(dueDate).toISOString() : null, dueText: dueDate ? new Date(dueDate).toLocaleString() : '', priority } });
      setTitle(''); setDueDate(''); setPriority('Medium'); await load(true);
    } catch (e) { setError(e.message || 'Could not create task.'); }
    finally { setSaving(false); }
  };
  const update = async (task, patch) => {
    try { await apiClient(`/tasks/${task._id}`, { method: 'PUT', body: patch }); await load(true); }
    catch (e) { setError(e.message || 'Could not update task.'); }
  };
  const remove = async task => {
    try { await apiClient(`/tasks/${task._id}`, { method: 'DELETE' }); await load(true); }
    catch (e) { setError(e.message || 'Could not delete task.'); }
  };
  const visibleTasks = tasks.filter(task => `${task.title} ${task.description || ''}`.toLowerCase().includes(search.toLowerCase()));
  const filters = [ ['all','All tasks',counts.total,ListTodo], ['today','Today',counts.today,CalendarDays], ['upcoming','Upcoming',counts.upcoming,CalendarDays], ['overdue','Overdue',counts.overdue,AlertCircle], ['completed','Completed',counts.completed,CircleCheck] ];
  const inputStyle = { width: '100%', height: 44, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', padding: '0 14px', fontFamily: 'var(--font-sans)', fontSize: 14, outlineColor: 'var(--color-brand)' };
  return <AppShell pageTitle="Tasks">
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 92 }}>
      <section style={{ ...box, margin: 0, padding: '24px 28px', background: 'linear-gradient(120deg,var(--color-surface),var(--color-brand-subtle))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div><div style={{ color: 'var(--color-brand)', fontSize: 12, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>Your workspace</div><h2 style={{ margin: '6px 0', font: '800 26px var(--font-heading)', color: 'var(--color-text)' }}>A clear list, one task at a time.</h2><p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 14 }}>Tasks save to your account and stay in sync across visits.</p></div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{[['Open',Math.max(0,counts.total-counts.completed)],['Due today',counts.today],['Overdue',counts.overdue]].map(([label,value])=><div key={label} style={{ minWidth: 98, padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}><div style={{ fontSize: 21, fontWeight: 800, color: 'var(--color-text)' }}>{value}</div><div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{label}</div></div>)}</div>
      </section>

      <form onSubmit={create} style={{ ...box, margin: 0, padding: 20 }}>
        <label htmlFor="new-task-title" style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 12 }}>Add a task</label>
        <div className="task-create-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(220px,1fr) 190px 140px auto', gap: 10, alignItems: 'center' }}>
          <input id="new-task-title" autoComplete="off" value={title} onChange={e=>setTitle(e.target.value)} placeholder="What needs to get done?" style={inputStyle} />
          <input aria-label="Due date" type="datetime-local" value={dueDate} onChange={e=>setDueDate(e.target.value)} style={inputStyle} />
          <select aria-label="Priority" value={priority} onChange={e=>setPriority(e.target.value)} style={inputStyle}>{['Low','Medium','High'].map(p=><option key={p}>{p}</option>)}</select>
          <Button type="submit" icon={Plus} isLoading={saving} disabled={!title.trim()}>Add task</Button>
        </div>
      </form>

      <section style={{ ...box, margin: 0, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>{filters.map(([id,label,count,Icon])=><button key={id} onClick={()=>setFilter(id)} style={{ display:'inline-flex',alignItems:'center',gap:7,padding:'8px 12px',borderRadius:'var(--radius-full)',border:filter===id?'1px solid var(--color-brand-light)':'1px solid transparent',background:filter===id?'var(--color-brand-subtle)':'transparent',color:filter===id?'var(--color-brand)':'var(--color-text-muted)',font:'600 13px var(--font-sans)',cursor:'pointer' }}><Icon size={15}/>{label}<span style={{fontSize:11,padding:'2px 7px',borderRadius:99,background:filter===id?'var(--color-brand)':'var(--color-surface-hover)',color:filter===id?'white':'var(--color-text-muted)'}}>{count}</span></button>)}</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: '0 1 290px' }}><div style={{ position:'relative',flex:1 }}><SearchIcon size={16} style={{position:'absolute',left:12,top:13,color:'var(--color-text-subtle)'}}/><input aria-label="Search tasks" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Find a task" style={{...inputStyle,paddingLeft:36,height:40}}/></div><Button variant="outline" size="sm" icon={RefreshCw} onClick={load}>Refresh</Button></div>
        </div>
      </section>

      {error && <div role="alert" style={{ padding: 14, borderRadius: 'var(--radius-md)', color: 'var(--color-danger)', background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)' }}>{error}</div>}
      {loading ? <div style={{ ...box, margin: 0, textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading your tasks…</div> : visibleTasks.length ? <div style={{ display:'flex',flexDirection:'column',gap:10 }}>{visibleTasks.map(task=><TaskRow key={task._id} task={task} onUpdate={update} onDelete={remove} inputStyle={inputStyle}/>)}</div> : <div style={{ ...box, margin: 0, padding: '44px 20px', textAlign: 'center' }}><div style={{ width:48,height:48,borderRadius:'50%',margin:'0 auto 12px',display:'grid',placeItems:'center',background:'var(--color-brand-subtle)',color:'var(--color-brand)' }}><ListTodo size={22}/></div><h3 style={{margin:'0 0 6px',font:'700 17px var(--font-heading)',color:'var(--color-text)'}}>{search?'No matching tasks':'Nothing on this list yet'}</h3><p style={{margin:0,color:'var(--color-text-muted)',fontSize:13}}>{search?'Try another search.':'Add a task above to get started.'}</p></div>}
    </div><MusicPlayerBar />
  </AppShell>;
};

const TaskRow = ({ task, onUpdate, onDelete, inputStyle }) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const overdue = !task.completed && task.dueDate && new Date(task.dueDate) < new Date(new Date().setHours(0,0,0,0));
  const priorityStyle = task.priority === 'High' ? ['var(--color-danger-bg)','var(--color-danger)'] : task.priority === 'Low' ? ['var(--color-surface-hover)','var(--color-text-muted)'] : ['var(--color-warning-bg)','var(--color-warning)'];
  return <article style={{ ...box, margin:0, padding:'16px 18px', display:'flex', gap:14, alignItems:'flex-start', boxShadow:'var(--shadow-sm)' }}>
    <button aria-label={task.completed?'Mark task incomplete':'Mark task complete'} onClick={()=>onUpdate(task,{completed:!task.completed})} style={{ width:24,height:24,marginTop:2,flex:'0 0 24px',borderRadius:8,border:task.completed?'1px solid var(--color-brand)':'2px solid var(--color-border)',background:task.completed?'var(--color-brand)':'transparent',color:'white',display:'grid',placeItems:'center',cursor:'pointer' }}>{task.completed&&<Check size={15} strokeWidth={3}/>}</button>
    <div style={{ minWidth:0,flex:1 }}><input aria-label="Task title" value={title} onChange={e=>setTitle(e.target.value)} onBlur={()=>title.trim()&&title!==task.title&&onUpdate(task,{title:title.trim()})} onKeyDown={e=>e.key==='Enter'&&e.currentTarget.blur()} style={{...inputStyle,height:34,padding:'0 9px',background:'transparent',borderColor:'transparent',fontSize:15,fontWeight:700,textDecoration:task.completed?'line-through':'none',color:task.completed?'var(--color-text-muted)':'var(--color-text)'}}/><textarea aria-label="Task description" value={description} onChange={e=>setDescription(e.target.value)} onBlur={()=>description!==(task.description||'')&&onUpdate(task,{description})} placeholder="Add a note" rows={1} style={{width:'100%',resize:'vertical',border:0,outline:0,background:'transparent',font:'13px var(--font-sans)',color:'var(--color-text-muted)',padding:'4px 9px'}}/></div>
    <div className="task-row-controls" style={{display:'flex',alignItems:'center',gap:9,flexWrap:'wrap',justifyContent:'flex-end'}}><label style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:overdue?'var(--color-danger)':'var(--color-text-muted)'}}><CalendarDays size={14}/><input aria-label="Task due date" type="datetime-local" value={task.dueDate?new Date(new Date(task.dueDate).getTime()-new Date(task.dueDate).getTimezoneOffset()*60000).toISOString().slice(0,16):''} onChange={e=>onUpdate(task,{dueDate:e.target.value?new Date(e.target.value).toISOString():null})} style={{...inputStyle,width:180,height:34,padding:'0 8px',fontSize:12,borderColor:'transparent',background:'transparent'}}/>{overdue?'Overdue':''}</label><select aria-label="Task priority" value={task.priority} onChange={e=>onUpdate(task,{priority:e.target.value})} style={{border:0,borderRadius:99,padding:'6px 10px',background:priorityStyle[0],color:priorityStyle[1],font:'700 11px var(--font-sans)',cursor:'pointer'}}>{['Low','Medium','High'].map(p=><option key={p}>{p}</option>)}</select><button aria-label="Delete task" onClick={()=>onDelete(task)} style={{width:34,height:34,display:'grid',placeItems:'center',border:'1px solid var(--color-border)',borderRadius:10,background:'transparent',color:'var(--color-text-muted)',cursor:'pointer'}}><Trash2 size={15}/></button></div>
  </article>;
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
  const [updatedAt, setUpdatedAt] = useState(null);
  const load = (force = false) => apiClient(`/activity${force ? '?refresh=1' : ''}`).then(r => { setItems(r.activities || []); setError(''); setUpdatedAt(new Date()); }).catch(e => setError(e.message));
  useEffect(() => { load(); const timer = window.setInterval(() => load(true), 60000); return () => window.clearInterval(timer); }, []);
  return <AppShell pageTitle="Activity"><button onClick={() => load(true)}><RefreshCw size={16}/> Refresh from GitHub</button>{updatedAt && <small style={{marginLeft:10,color:'var(--color-text-muted)'}}>Updated {updatedAt.toLocaleTimeString()}</small>}{error && <p role="alert">{error}</p>}{items.map(a=><div key={a.id} style={box}><small>{a.type} · {a.timestamp && new Date(a.timestamp).toLocaleString()}</small><h3>{a.title}</h3><p>{a.detail}</p>{a.url && <a href={a.url} target={a.url.startsWith('/') ? undefined : '_blank'} rel="noreferrer">Open item</a>}</div>)}{!items.length && !error && <p>No activity found in the available recent activity window.</p>}<MusicPlayerBar /></AppShell>;
};

export const SettingsPage = () => <AppShell pageTitle="Settings"><p>Theme preferences are available from the top bar. Manage connected accounts in Integrations.</p></AppShell>;
export const ProfilePage = () => <AppShell pageTitle="Profile"><p>Profile details are managed by your Digital Desk account.</p></AppShell>;
