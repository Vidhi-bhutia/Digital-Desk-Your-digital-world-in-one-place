import React from 'react';
import AppShell from '../../components/layout/AppShell';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { 
  Mail, 
  Github, 
  Calendar, 
  CloudSun, 
  Search, 
  CheckSquare, 
  Music, 
  Sparkles,
  Layers
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const plannedIntegrations = [
    { name: 'Gmail', desc: 'Unified inbox and smart email summaries', icon: Mail },
    { name: 'GitHub', desc: 'Pull requests, issues, and commit activity', icon: Github },
    { name: 'Google Calendar', desc: 'Upcoming meetings and schedule management', icon: Calendar },
    { name: 'Weather', desc: 'Local weather forecasts and environmental conditions', icon: CloudSun },
    { name: 'Tasks', desc: 'Cross-platform task lists and priority management', icon: CheckSquare },
    { name: 'Web & Desk Search', desc: 'Unified global search across all your digital assets', icon: Search },
    { name: 'Music', desc: 'Playback controller and audio widget', icon: Music },
  ];

  return (
    <AppShell pageTitle="Home Dashboard">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Welcome Header Hero Banner */}
        <Card
          style={{
            background: 'linear-gradient(135deg, var(--color-brand) 0%, var(--color-brand-dark) 100%)',
            color: '#FFFFFF',
            border: 'none',
            padding: '36px 32px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Sparkles size={20} color="var(--color-brand-light)" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-brand-light)', letterSpacing: '0.04em' }}>
              PHASE 1 FOUNDATION COMPLETE
            </span>
          </div>

          <h2
            style={{
              fontSize: '32px',
              fontWeight: 800,
              color: '#FFFFFF',
              fontFamily: 'var(--font-heading)',
              marginBottom: '10px',
            }}
          >
            {getGreeting()}, {user?.name || 'User'}!
          </h2>

          <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.85)', maxWidth: '640px', lineHeight: 1.6 }}>
            Welcome to Digital Desk. Your digital world foundation is now ready. This dashboard will eventually bring your digital world together.
          </p>
        </Card>

        {/* Phase 1 Status Summary */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '16px' }}>
            System Architecture Status
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            <Card title="Authentication System">
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
                Secure HTTP-only cookies, password hashing with bcrypt, JWT authentication, and token reset flows.
              </p>
              <Badge variant="success">Active & Protected</Badge>
            </Card>

            <Card title="Database Connection">
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
                MongoDB database connected with graceful failure modes and normalized schema structure.
              </p>
              <Badge variant="success">Connected</Badge>
            </Card>

            <Card title="Brand Design System">
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
                Dark forest green palette, light/dark mode CSS tokens, responsive layouts, and UI component suite.
              </p>
              <Badge variant="brand">Light / Dark Ready</Badge>
            </Card>
          </div>
        </div>

        {/* Upcoming Phase 2 Integrations Roadmap Grid */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)' }}>
              Upcoming Integrations (Phase 2+)
            </h3>
            <Badge variant="info">Planned Modules</Badge>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
            }}
          >
            {plannedIntegrations.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card
                  key={index}
                  hoverable
                  action={<Badge variant="default">Phase 2</Badge>}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-brand-subtle)',
                        color: 'var(--color-brand)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={22} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text)' }}>
                        {item.name}
                      </h4>
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                    {item.desc}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default DashboardPage;
