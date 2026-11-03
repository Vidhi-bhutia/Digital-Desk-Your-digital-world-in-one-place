import React from 'react';
import { Mail, Github, Activity, CheckSquare } from 'lucide-react';

export const QuickLinksWidget = ({ onNavigate }) => {
  const links = [
    { name: 'Gmail', actionText: 'Open mail', icon: Mail, path: 'https://mail.google.com', external: true },
    { name: 'GitHub', actionText: 'Open GitHub', icon: Github, path: 'https://github.com', external: true },
    { name: 'Tasks', actionText: 'View tasks', icon: CheckSquare, path: '/tasks', external: false },
    { name: 'Activity', actionText: 'View activity', icon: Activity, path: '/activity', external: false },
  ];
  return <section style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 20, boxShadow: 'var(--shadow-sm)' }}>
    <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text)', marginBottom: 14, fontFamily: 'var(--font-heading)' }}>Quick Links</h4>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10 }}>{links.map(({ name, actionText, icon: Icon, path, external }) => <button key={path} onClick={() => external ? window.open(path, '_blank', 'noopener,noreferrer') : onNavigate?.(path)} style={{ minWidth: 0, textAlign: 'left', background: 'var(--color-bg)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', padding: 12, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}><span style={{ width: 34, height: 34, flex: '0 0 34px', borderRadius: 10, display: 'grid', placeItems: 'center', background: 'var(--color-surface)', color: 'var(--color-brand)' }}><Icon size={18}/></span><span style={{ minWidth: 0 }}><b style={{ display: 'block', color: 'var(--color-text)', fontSize: 13 }}>{name}</b><small style={{ color: 'var(--color-brand)' }}>{actionText}</small></span></button>)}</div>
  </section>;
};
export default QuickLinksWidget;
