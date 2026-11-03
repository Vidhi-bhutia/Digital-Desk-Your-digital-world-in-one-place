import React, { useEffect, useState } from 'react';
import { Search as SearchIcon, Plus, Trash2, Check, RefreshCw, CalendarDays, CircleCheck, ListTodo, AlertCircle } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import SearchModal from '../../components/dashboard/SearchModal';
import MusicPlayerBar from '../../components/layout/MusicPlayerBar';
import { apiClient } from '../../services/apiClient';
import Button from '../../components/common/Button';
import AddTaskModal from '../../components/dashboard/AddTaskModal';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { IntegrationsPage as IntegrationSettings } from '../integrations/IntegrationsPage';
import { useToast } from '../../context/ToastContext';

const box = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 14 };

export const SearchPage = () => <AppShell pageTitle="Search"><SearchModal isOpen onClose={() => {}} inline /></AppShell>;

export const TasksPage = () => {
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [counts, setCounts] = useState({ total: 0, today: 0, upcoming: 0, overdue: 0, completed: 0 });
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [calendarBusy, setCalendarBusy] = useState('');
  const load = async (quiet = false) => {
    if (!quiet) setLoading(true);
    try { const r = await apiClient(`/tasks?filter=${filter}`); setTasks(r.tasks || []); setCounts(r.counts || counts); setError(''); }
    catch (e) { setError(e.message || 'Could not load tasks.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [filter]);
  const create = async task => { await apiClient('/tasks', { method: 'POST', body: task }); await load(true); };
  const update = async (task, patch) => {
    try { await apiClient(`/tasks/${task._id}`, { method: 'PUT', body: patch }); await load(true); }
    catch (e) { setError(e.message || 'Could not update task.'); }
  };
  const remove = async task => {
    try { await apiClient(`/tasks/${task._id}`, { method: 'DELETE' }); await load(true); }
    catch (e) { setError(e.message || 'Could not delete task.'); }
  };
  const addToCalendar = async task => {
    setCalendarBusy(task._id);
    try { const response = await apiClient(`/tasks/${task._id}/google-calendar`, { method: 'POST' }); toast.success(response.alreadyAdded ? 'This task is already in Google Calendar.' : 'Task added to Google Calendar.'); await load(true); }
    catch (e) { toast.error(e.message || 'Could not add task to Google Calendar.'); }
    finally { setCalendarBusy(''); }
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

      <section style={{ ...box, margin: 0, padding: 20, display:'flex', justifyContent:'space-between', alignItems:'center' }}><div><b style={{ color:'var(--color-text)' }}>Keep your next action clear</b><p style={{ margin:'4px 0 0', color:'var(--color-text-muted)', fontSize:13 }}>Add a task with a deadline, or mark it as having no deadline.</p></div><Button icon={Plus} onClick={() => setIsAddOpen(true)}>Add task</Button></section>

      <section style={{ ...box, margin: 0, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>{filters.map(([id,label,count,Icon])=><button key={id} onClick={()=>setFilter(id)} style={{ display:'inline-flex',alignItems:'center',gap:7,padding:'8px 12px',borderRadius:'var(--radius-full)',border:filter===id?'1px solid var(--color-brand-light)':'1px solid transparent',background:filter===id?'var(--color-brand-subtle)':'transparent',color:filter===id?'var(--color-brand)':'var(--color-text-muted)',font:'600 13px var(--font-sans)',cursor:'pointer' }}><Icon size={15}/>{label}<span style={{fontSize:11,padding:'2px 7px',borderRadius:99,background:filter===id?'var(--color-brand)':'var(--color-surface-hover)',color:filter===id?'white':'var(--color-text-muted)'}}>{count}</span></button>)}</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: '0 1 290px' }}><div style={{ position:'relative',flex:1 }}><SearchIcon size={16} style={{position:'absolute',left:12,top:13,color:'var(--color-text-subtle)'}}/><input aria-label="Search tasks" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Find a task" style={{...inputStyle,paddingLeft:36,height:40}}/></div><Button variant="outline" size="sm" icon={RefreshCw} onClick={load}>Refresh</Button></div>
        </div>
      </section>

      {error && <div role="alert" style={{ padding: 14, borderRadius: 'var(--radius-md)', color: 'var(--color-danger)', background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)' }}>{error}</div>}
      {loading ? <div style={{ ...box, margin: 0, textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading your tasks…</div> : visibleTasks.length ? <div style={{ display:'flex',flexDirection:'column',gap:10 }}>{visibleTasks.map(task=><TaskRow key={task._id} task={task} onUpdate={update} onDelete={remove} onAddToCalendar={addToCalendar} calendarBusy={calendarBusy===task._id} inputStyle={inputStyle}/>)}</div> : <div style={{ ...box, margin: 0, padding: '44px 20px', textAlign: 'center' }}><div style={{ width:48,height:48,borderRadius:'50%',margin:'0 auto 12px',display:'grid',placeItems:'center',background:'var(--color-brand-subtle)',color:'var(--color-brand)' }}><ListTodo size={22}/></div><h3 style={{margin:'0 0 6px',font:'700 17px var(--font-heading)',color:'var(--color-text)'}}>{search?'No matching tasks':'Nothing on this list yet'}</h3><p style={{margin:0,color:'var(--color-text-muted)',fontSize:13}}>{search?'Try another search.':'Add a task above to get started.'}</p></div>}
    </div><AddTaskModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAddTask={create}/><MusicPlayerBar />
  </AppShell>;
};

const TaskRow = ({ task, onUpdate, onDelete, onAddToCalendar, calendarBusy, inputStyle }) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const overdue = !task.completed && task.dueDate && new Date(task.dueDate) < new Date(new Date().setHours(0,0,0,0));
  const priorityStyle = task.priority === 'High' ? ['var(--color-danger-bg)','var(--color-danger)'] : task.priority === 'Low' ? ['var(--color-surface-hover)','var(--color-text-muted)'] : ['var(--color-warning-bg)','var(--color-warning)'];
  return <article style={{ ...box, margin:0, padding:'16px 18px', display:'flex', gap:14, alignItems:'flex-start', boxShadow:'var(--shadow-sm)' }}>
    <button aria-label={task.completed?'Mark task incomplete':'Mark task complete'} onClick={()=>onUpdate(task,{completed:!task.completed})} style={{ width:24,height:24,marginTop:2,flex:'0 0 24px',borderRadius:8,border:task.completed?'1px solid var(--color-brand)':'2px solid var(--color-border)',background:task.completed?'var(--color-brand)':'transparent',color:'white',display:'grid',placeItems:'center',cursor:'pointer' }}>{task.completed&&<Check size={15} strokeWidth={3}/>}</button>
    <div style={{ minWidth:0,flex:1 }}><input aria-label="Task title" value={title} onChange={e=>setTitle(e.target.value)} onBlur={()=>title.trim()&&title!==task.title&&onUpdate(task,{title:title.trim()})} onKeyDown={e=>e.key==='Enter'&&e.currentTarget.blur()} style={{...inputStyle,height:34,padding:'0 9px',background:'transparent',borderColor:'transparent',fontSize:15,fontWeight:700,textDecoration:task.completed?'line-through':'none',color:task.completed?'var(--color-text-muted)':'var(--color-text)'}}/><textarea aria-label="Task description" value={description} onChange={e=>setDescription(e.target.value)} onBlur={()=>description!==(task.description||'')&&onUpdate(task,{description})} placeholder="Add a note" rows={1} style={{width:'100%',resize:'vertical',border:0,outline:0,background:'transparent',font:'13px var(--font-sans)',color:'var(--color-text-muted)',padding:'4px 9px'}}/></div>
    <div className="task-row-controls" style={{display:'flex',alignItems:'center',gap:9,flexWrap:'wrap',justifyContent:'flex-end'}}><label style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:overdue?'var(--color-danger)':'var(--color-text-muted)'}}><CalendarDays size={14}/><input aria-label="Task deadline" type="datetime-local" value={task.dueDate?new Date(new Date(task.dueDate).getTime()-new Date(task.dueDate).getTimezoneOffset()*60000).toISOString().slice(0,16):''} onChange={e=>onUpdate(task,{dueDate:e.target.value?new Date(e.target.value).toISOString():null})} style={{...inputStyle,width:190,height:38,padding:'0 10px',fontSize:13}}/>{overdue?'Overdue':''}</label><select aria-label="Task priority" value={task.priority} onChange={e=>onUpdate(task,{priority:e.target.value})} style={{border:0,borderRadius:99,padding:'6px 10px',background:priorityStyle[0],color:priorityStyle[1],font:'700 11px var(--font-sans)',cursor:'pointer'}}>{['Low','Medium','High'].map(p=><option key={p}>{p}</option>)}</select>{task.googleCalendarEventId?<a className="task-calendar-link" href={task.googleCalendarEventUrl||'https://calendar.google.com/calendar/u/0/r'} target="_blank" rel="noreferrer">Added to Google Calendar</a>:<Button size="sm" variant="outline" icon={CalendarDays} disabled={!task.dueDate} isLoading={calendarBusy} onClick={()=>onAddToCalendar(task)}>Add to Google Calendar</Button>}<button aria-label="Delete task" onClick={()=>onDelete(task)} style={{width:38,height:38,display:'grid',placeItems:'center',border:'1px solid var(--color-border)',borderRadius:10,background:'transparent',color:'var(--color-text-muted)',cursor:'pointer'}}><Trash2 size={15}/></button></div>
  </article>;
};

export const CalendarPage = () => {
  const [events, setEvents] = useState([]); const [error, setError] = useState('');
  const load = () => apiClient('/calendar/events').then(r => setEvents((r.events || []).filter(event => event.provider === 'google'))).catch(e => setError(e.message));
  useEffect(() => { load(); }, []);
  return <AppShell pageTitle="Calendar"><div style={{maxWidth:900,margin:'0 auto'}}><section style={box}><h2>Google Calendar events</h2><p style={{marginTop:6,color:'var(--color-text-muted'}}>Events are read from your connected Google Calendar. Creating events is not available here, so nothing will be saved only inside Digital Desk by mistake.</p></section>{error && <p role="alert" style={{color:'var(--color-danger)'}}>{error}</p>}{events.map(e=><div key={e._id||e.googleId} style={box}><b>{e.title}</b><div>{e.date ? new Date(e.date).toLocaleString() : 'Date not set'}</div>{e.meetLink && <a href={e.meetLink} target="_blank" rel="noreferrer">Join meeting</a>}{e.htmlLink && <a style={{marginLeft:12}} href={e.htmlLink} target="_blank" rel="noreferrer">Open in Google Calendar</a>}</div>)}{!events.length && <p>No calendar events found. Connect Google in Settings to sync your calendar.</p>}</div><MusicPlayerBar /></AppShell>;
};

export const ActivityPage = () => {
  const [items, setItems] = useState([]); const [error, setError] = useState('');
  const [providerErrors, setProviderErrors] = useState({});
  const [updatedAt, setUpdatedAt] = useState(null);
  const load = (force = false) => apiClient(`/activity${force ? '?refresh=1' : ''}`).then(r => { setItems(r.activities || []); setProviderErrors(r.providers || {}); setError(''); setUpdatedAt(new Date()); }).catch(e => setError(e.message));
  useEffect(() => { load(); const timer = window.setInterval(() => load(true), 60000); return () => window.clearInterval(timer); }, []);
  return <AppShell pageTitle="Activity"><div style={{maxWidth:1000,margin:'0 auto',paddingBottom:24}}><header style={{display:'flex',alignItems:'center',gap:12,marginBottom:18,flexWrap:'wrap'}}><Button icon={RefreshCw} variant="outline" onClick={() => load(true)}>Refresh activity</Button>{updatedAt && <small style={{color:'var(--color-text-muted'}}>Updated {updatedAt.toLocaleTimeString()}</small>}</header>{error && <p role="alert" style={{...box,color:'var(--color-danger)'}}>{error}</p>}{Object.entries(providerErrors).map(([source,message])=><p key={source} role="status" style={{...box,color:'var(--color-warning)',fontSize:13}}>{source==='github'?'GitHub':source==='calendar'?'Google Calendar':source}: {message} <a href="/settings" style={{color:'var(--color-brand)',fontWeight:700}}>Check Settings</a></p>)}{items.map(a=><article key={a.id} style={{...box,marginBottom:12}}><small style={{color:'var(--color-text-muted)'}}>{a.type} · {a.timestamp && new Date(a.timestamp).toLocaleString()}</small><h3 style={{marginTop:4}}>{a.title}</h3><p style={{color:'var(--color-text-muted)',marginTop:4}}>{a.detail}</p>{a.url && <a href={a.url} target={a.url.startsWith('/') ? undefined : '_blank'} rel="noreferrer">Open item</a>}</article>)}{!items.length && !error && !Object.keys(providerErrors).length && <p style={box}>No activity found in the available recent activity window.</p>}</div><MusicPlayerBar /></AppShell>;
};

export const GmailPage = () => {
  const [data, setData] = useState(null); const [error, setError] = useState('');
  useEffect(() => { apiClient('/gmail/summary').then(setData).catch(e=>setError(e.message)); }, []);
  return <AppShell pageTitle="Gmail"><div style={{maxWidth:900,margin:'0 auto'}}><section style={box}><h2>Unread messages</h2><p style={{color:'var(--color-text-muted)',marginTop:6}}>{data?.summary?.unreadEmails ?? '—'} unread</p>{error&&<p role="alert" style={{color:'var(--color-danger)'}}>{error} · <a href="/settings">Manage connections</a></p>}</section>{(data?.latestEmails||[]).map(m=><a key={m.id} href={m.url} target="_blank" rel="noreferrer" style={{...box,display:'block',textDecoration:'none',color:'var(--color-text)'}}><b>{m.subject}</b><div style={{fontSize:13,color:'var(--color-text-muted)'}}>{m.sender} · {m.snippet}</div></a>)}{!error&&!data?.latestEmails?.length&&<p style={{color:'var(--color-text-muted)'}}>No unread messages to show.</p>}</div><MusicPlayerBar /></AppShell>;
};

export const GitHubPage = () => {
  const [data,setData]=useState(null);const [error,setError]=useState('');
  useEffect(()=>{apiClient('/github/summary').then(setData).catch(e=>setError(e.message));},[]);
  return <AppShell pageTitle="GitHub"><div style={{maxWidth:900,margin:'0 auto'}}>{error&&<p role="alert" style={{...box,color:'var(--color-danger)'}}>{error} · <a href="/settings">Manage connections</a></p>}{(data?.activities||[]).map(item=><a key={item.id} href={item.url} target="_blank" rel="noreferrer" style={{...box,display:'block',textDecoration:'none',color:'var(--color-text)'}}><small>{item.timestamp&&new Date(item.timestamp).toLocaleString()}</small><h3>{item.title}</h3><p>{item.detail}</p></a>)}{!error&&!data?.activities?.length&&<p style={{color:'var(--color-text-muted)'}}>No recent GitHub activity.</p>}</div><MusicPlayerBar /></AppShell>;
};

export const SettingsPage = () => { const {isDark,toggleTheme}=useTheme(); return <AppShell pageTitle="Settings"><div style={{maxWidth:1100,margin:'0 auto',display:'flex',flexDirection:'column',gap:22}}><section style={box}><h2 style={{fontSize:22,marginBottom:6}}>Appearance</h2><p style={{color:'var(--color-text-muted)',marginBottom:14}}>Choose the display theme for your workspace.</p><Button variant="outline" onClick={toggleTheme}>Switch to {isDark?'light':'dark'} theme</Button></section><section><h2 style={{fontSize:22,marginBottom:6}}>Connected services</h2><p style={{color:'var(--color-text-muted)',marginBottom:16}}>Connect or revoke Google and GitHub access, and check weather configuration.</p><IntegrationSettings embedded /></section></div></AppShell>; };

export const ProfilePage = () => {
  const { user, updateUser } = useAuth(); const toast=useToast();
  const [profile,setProfile]=useState({name:user?.name||'',email:user?.email||'',phone:user?.phone||'',avatar:user?.avatar||''});
  const [currentPassword,setCurrentPassword]=useState(''); const [profileSaving,setProfileSaving]=useState(false); const [profileError,setProfileError]=useState('');
  const [passwords,setPasswords]=useState({currentPassword:'',newPassword:'',confirmPassword:''}); const [passwordSaving,setPasswordSaving]=useState(false); const [passwordError,setPasswordError]=useState('');
  const handleImage=e=>{const file=e.target.files?.[0];if(!file)return;if(!file.type.startsWith('image/')||file.size>3*1024*1024){setProfileError('Choose an image smaller than 3 MB.');return;}const reader=new FileReader();reader.onload=()=>setProfile(p=>({...p,avatar:reader.result}));reader.readAsDataURL(file);};
  const saveProfile=async e=>{e.preventDefault();setProfileSaving(true);setProfileError('');try{await updateUser({...profile,currentPassword});setCurrentPassword('');toast.success('Profile updated.');}catch(error){setProfileError(error.message);}finally{setProfileSaving(false);}};
  const savePassword=async e=>{e.preventDefault();setPasswordError('');if(passwords.newPassword!==passwords.confirmPassword){setPasswordError('New passwords do not match.');return;}setPasswordSaving(true);try{await apiClient('/auth/password',{method:'PUT',body:{currentPassword:passwords.currentPassword,newPassword:passwords.newPassword}});setPasswords({currentPassword:'',newPassword:'',confirmPassword:''});toast.success('Password changed.');}catch(error){setPasswordError(error.message);}finally{setPasswordSaving(false);}};
  const field={width:'100%',height:44,padding:'0 12px',border:'1px solid var(--color-border)',borderRadius:10,background:'var(--color-bg)',color:'var(--color-text)',font:'14px var(--font-sans)'};
  return <AppShell pageTitle="Profile"><div style={{maxWidth:820,margin:'0 auto',display:'flex',flexDirection:'column',gap:20,paddingBottom:24}}><form style={box} onSubmit={saveProfile}><h2 style={{fontSize:22,marginBottom:18}}>Personal information</h2><div style={{display:'flex',alignItems:'center',gap:18,marginBottom:20}}><img src={profile.avatar||`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name||'User')}&background=0F5132&color=fff`} alt="Profile avatar" style={{width:76,height:76,borderRadius:'50%',objectFit:'cover'}}/><label style={{color:'var(--color-brand)',fontWeight:700,cursor:'pointer'}}>Upload profile photo<input type="file" accept="image/*" onChange={handleImage} style={{display:'block',maxWidth:220,marginTop:8,color:'var(--color-text-muted)',fontWeight:400}}/></label></div><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:14}}><label style={{color:'var(--color-text-muted)',fontSize:13}}>Full name<input style={{...field,display:'block',marginTop:6}} value={profile.name} onChange={e=>setProfile(p=>({...p,name:e.target.value}))} required/></label><label style={{color:'var(--color-text-muted)',fontSize:13}}>Email address<input style={{...field,display:'block',marginTop:6}} type="email" value={profile.email} onChange={e=>setProfile(p=>({...p,email:e.target.value}))} required/></label><label style={{color:'var(--color-text-muted)',fontSize:13}}>Phone number<input style={{...field,display:'block',marginTop:6}} type="tel" placeholder="Add a phone number" value={profile.phone} onChange={e=>setProfile(p=>({...p,phone:e.target.value}))}/></label>{profile.email!==user?.email&&<label style={{color:'var(--color-text-muted)',fontSize:13}}>Current password (required to change email)<input style={{...field,display:'block',marginTop:6}} type="password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} required/></label>}</div>{profileError&&<p role="alert" style={{color:'var(--color-danger)',marginTop:12}}>{profileError}</p>}<div style={{marginTop:18}}><Button type="submit" isLoading={profileSaving}>Save profile</Button></div></form><form style={box} onSubmit={savePassword}><h2 style={{fontSize:22,marginBottom:18}}>Change password</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:14}}>{[['Current password','currentPassword'],['New password','newPassword'],['Confirm new password','confirmPassword']].map(([label,key])=><label key={key} style={{color:'var(--color-text-muted)',fontSize:13}}>{label}<input required minLength={key==='currentPassword'?1:8} type="password" autoComplete={key==='currentPassword'?'current-password':'new-password'} style={{...field,display:'block',marginTop:6}} value={passwords[key]} onChange={e=>setPasswords(p=>({...p,[key]:e.target.value}))}/></label>)}</div>{passwordError&&<p role="alert" style={{color:'var(--color-danger)',marginTop:12}}>{passwordError}</p>}<div style={{marginTop:18}}><Button type="submit" isLoading={passwordSaving}>Update password</Button></div></form></div></AppShell>;
};
