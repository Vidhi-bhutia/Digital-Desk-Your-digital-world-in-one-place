import React, { useState, useEffect } from 'react';
import { Search, X, Mail, Github, Calendar, CheckSquare, Globe, RefreshCw, ExternalLink } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

const labels = { web: 'Web', github: 'GitHub', gmail: 'Gmail', calendar: 'Calendar', tasks: 'Tasks' };
const icons = { web: Globe, github: Github, gmail: Mail, calendar: Calendar, tasks: CheckSquare };

export const SearchModal = ({ isOpen, onClose, inline = false }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState({});
  const [errors, setErrors] = useState({});
  const [activeSource, setActiveSource] = useState('all');

  useEffect(() => {
    const handleKeyDown = e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if (isOpen) onClose(); } };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) { setSections({}); setErrors({}); setLoading(false); return; }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      apiClient(`/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then(response => { setSections(response.sections || {}); setErrors({ ...(response.errors || {}), ...(response.unavailable || {}) }); })
        .catch(error => { if (error.name !== 'AbortError') setErrors({ search: error.message }); })
        .finally(() => setLoading(false));
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query]);

  if (!isOpen) return null;
  const sources = ['all', 'gmail', 'calendar', 'github', 'tasks', 'web'];
  const total = Object.values(sections).reduce((sum, rows) => sum + (rows?.length || 0), 0);
  const selectedSections = activeSource === 'all'
    ? Object.entries(sections).filter(([, rows]) => rows?.length)
    : (sections[activeSource]?.length ? [[activeSource, sections[activeSource]]] : []);
  const renderResult = (source, item) => {
    const Icon = icons[source] || ExternalLink;
    const internal = item.url?.startsWith('/');
    return <a key={item.id} href={item.url || '#'} target={internal ? undefined : '_blank'} rel={internal ? undefined : 'noreferrer'} className="search-result-card" onClick={e => { if (!item.url) e.preventDefault(); }}>
      <span className="search-result-icon"><Icon size={18}/></span>
      <span className="search-result-copy"><strong>{item.title}</strong><span>{item.subtitle}</span></span>
      <span className="search-result-source">{item.domain || labels[source] || item.source}</span>
    </a>;
  };

  return <div onClick={onClose} style={inline ? { position:'relative',inset:'auto',zIndex:1,background:'transparent',padding:0,display:'block' } : { position:'fixed',inset:0,zIndex:999,background:'rgba(15,23,42,.6)',backdropFilter:'blur(4px)',display:'flex',justifyContent:'center',alignItems:'flex-start',padding:'80px 16px' }}>
    <div onClick={e=>e.stopPropagation()} style={{ width:'100%',maxWidth:inline?'none':620,background:'var(--color-surface)',borderRadius:'var(--radius-xl)',border:'1px solid var(--color-border)',boxShadow:inline?'var(--shadow-sm)':'var(--shadow-xl)',overflow:'hidden' }}>
      <div className="search-input-row"><Search size={20} color="var(--color-brand)"/><input type="search" placeholder="Search web, Gmail, Calendar, GitHub, and tasks" value={query} onChange={e=>setQuery(e.target.value)} autoFocus/><button aria-label="Close search" onClick={onClose}><X size={19}/></button></div>
      <div style={{ padding:inline?'18px 22px 24px':16, maxHeight:inline?'none':520, overflowY:'auto' }}>
        <div className="search-tabs" role="tablist" aria-label="Search sources">{sources.map(source=>{const count=source==='all'?total:(sections[source]?.length||0);const Icon=source==='all'?Search:icons[source];return <button key={source} role="tab" aria-selected={activeSource===source} className={`search-tab ${activeSource===source?'active':''}`} onClick={()=>setActiveSource(source)}><Icon size={14}/>{source==='all'?'All':labels[source]}<span>{count}</span></button>;})}</div>
        {!query.trim() ? <div className="search-empty-state">Search your connected services and Digital Desk records. Private results stay within their source sections.</div>
          : loading ? <div className="search-empty-state"><RefreshCw className="search-spin" size={18}/> Searching your sources…</div>
          : <>
            {Object.entries(errors).map(([source,message])=><div key={source} className="search-source-error"><strong>{labels[source] || source}:</strong> {message}{source==='web' && <span> Add a Tavily API key as <code>TAVILY_API_KEY</code> in the backend environment.</span>}{(source==='gmail'||source==='calendar'||source==='github')&&message.toLowerCase().includes('disconnect')&&<a href="/integrations">Connect in Integrations</a>}</div>)}
            {selectedSections.length ? <div className={activeSource==='all'?'search-sections-grid':''}>{selectedSections.map(([source,rows])=><section className="search-source-section" key={source}><header><h2>{labels[source]||source}</h2><span>{rows.length} result{rows.length===1?'':'s'}</span></header>{rows.map(item=>renderResult(source,item))}</section>)}</div> : total===0&&Object.keys(errors).length===0 ? <div className="search-empty-state">No {activeSource==='all'?'':`${labels[activeSource]} `}results for “{query}”.</div> : null}
          </>}
      </div>
    </div>
  </div>;
};

export default SearchModal;
