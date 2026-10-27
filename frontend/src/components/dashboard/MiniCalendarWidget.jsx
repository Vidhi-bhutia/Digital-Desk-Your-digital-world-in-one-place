import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const MiniCalendarWidget = ({ events = [] }) => {
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const today = new Date();
  const days = useMemo(() => {
    const offset = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
    const length = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [...Array(offset).fill(null), ...Array.from({ length }, (_, i) => i + 1)];
  }, [month]);
  const dayEvents = events.filter(e => { const d = new Date(e.date); return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate(); });
  return <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}><h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text)' }}>{month.toLocaleDateString(undefined,{month:'long',year:'numeric'})}</h4><div><button aria-label="Previous month" onClick={()=>setMonth(d=>new Date(d.getFullYear(),d.getMonth()-1,1))}><ChevronLeft size={18}/></button><button aria-label="Next month" onClick={()=>setMonth(d=>new Date(d.getFullYear(),d.getMonth()+1,1))}><ChevronRight size={18}/></button></div></div>
    <div style={{ display:'grid',gridTemplateColumns:'repeat(7,1fr)',textAlign:'center',fontSize:11,fontWeight:600,color:'var(--color-text-subtle)' }}>{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=><span key={d}>{d}</span>)}</div>
    <div style={{ display:'grid',gridTemplateColumns:'repeat(7,1fr)',textAlign:'center',margin:'8px 0 16px',fontSize:13 }}>{days.map((d,i)=><span key={i} style={{height:32,width:32,margin:'auto',display:'grid',placeItems:'center',borderRadius:'50%',background:d===today.getDate()&&month.getMonth()===today.getMonth()&&month.getFullYear()===today.getFullYear()?'var(--color-brand)':'transparent',color:d===today.getDate()&&month.getMonth()===today.getMonth()&&month.getFullYear()===today.getFullYear()?'white':'var(--color-text)'}}>{d}</span>)}</div>
    <div style={{ borderTop:'1px solid var(--color-border-subtle)',paddingTop:14,display:'flex',flexDirection:'column',gap:10 }}>{dayEvents.map(e=><div key={e._id||e.googleId} style={{display:'flex',gap:8,fontSize:12}}><span>{e.time || new Date(e.date).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}</span><b>{e.title}</b></div>)}{!dayEvents.length&&<span style={{fontSize:12,color:'var(--color-text-muted)'}}>No events today.</span>}</div>
  </div>;
};
export default MiniCalendarWidget;
