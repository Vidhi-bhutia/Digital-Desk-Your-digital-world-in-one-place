import React, { useState, useEffect } from 'react';
import { Search, X, Mail, Github, Calendar, CheckSquare, Sparkles } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

export const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      apiClient(`/search?q=${encodeURIComponent(query)}`)
        .then((res) => {
          if (res && res.results) setResults(res.results);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'gmail': return <Mail size={16} color="#EA4335" />;
      case 'github': return <Github size={16} color="#0F172A" />;
      case 'calendar': return <Calendar size={16} color="#3B82F6" />;
      default: return <CheckSquare size={16} color="#10B981" />;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '80px',
        paddingLeft: '16px',
        paddingRight: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '600px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <Search size={20} color="var(--color-brand)" />
          <input
            type="text"
            placeholder="Search emails, repositories, tasks, calendar..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '16px',
              fontFamily: 'var(--font-sans)',
              color: 'var(--color-text)',
              backgroundColor: 'transparent',
            }}
          />
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '16px 20px', maxHeight: '360px', overflowY: 'auto' }}>
          {!query ? (
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center', padding: '24px' }}>
              Type to search across all your digital accounts and local desk files.
            </div>
          ) : loading ? (
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center', padding: '24px' }}>
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center', padding: '24px' }}>
              No results found for "{query}"
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {results.map((r, i) => (
                <div
                  key={i}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {getIcon(r.type)}
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>
                        {r.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {r.subtitle}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-brand)', backgroundColor: 'var(--color-brand-subtle)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                    {r.category}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
