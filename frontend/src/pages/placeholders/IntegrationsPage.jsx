import React, { useState, useEffect } from 'react';
import AppShell from '../../components/layout/AppShell';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';
import { 
  Github, 
  Mail, 
  Calendar, 
  CloudSun, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck,
  ExternalLink,
  Plus
} from 'lucide-react';

export const IntegrationsPage = () => {
  const toast = useToast();
  const [integrations, setIntegrations] = useState(null);
  const [loading, setLoading] = useState(true);

  // GitHub Connect Modal state
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
  const [githubUsername, setGithubUsername] = useState('Vidhi-bhutia');
  const [githubToken, setGithubToken] = useState('');
  const [githubLoading, setGithubLoading] = useState(false);

  // Google Connect Modal state
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await apiClient('/integrations/status');
      if (res && res.integrations) {
        setIntegrations(res.integrations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleConnectGitHub = async (e) => {
    e.preventDefault();
    if (!githubUsername.trim()) return;

    setGithubLoading(true);
    try {
      await apiClient('/integrations/github/connect', {
        method: 'POST',
        body: { username: githubUsername.trim(), token: githubToken },
      });
      toast.success(`Connected GitHub account @${githubUsername.trim()}!`);
      setIsGithubModalOpen(false);
      fetchStatus();
    } catch (err) {
      toast.error('Failed to connect GitHub account.');
    } finally {
      setGithubLoading(false);
    }
  };

  const handleConnectGoogle = async (e) => {
    e.preventDefault();
    setGoogleLoading(true);
    try {
      await apiClient('/integrations/google/connect', {
        method: 'POST',
        body: { email: googleEmail },
      });
      toast.success('Connected Google Services (Gmail & Calendar)!');
      setIsGoogleModalOpen(false);
      fetchStatus();
    } catch (err) {
      toast.error('Failed to connect Google account.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AppShell pageTitle="Integrations & API Connections">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1200px', paddingBottom: '80px' }}>
        {/* Header Hero Banner */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text)', fontFamily: 'var(--font-heading)', marginBottom: '6px' }}>
              Connected Digital Services
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', maxWidth: '600px' }}>
              Manage authorization tokens, OAuth credentials, and live API sync settings for GitHub, Gmail, Google Calendar, and OpenWeather.
            </p>
          </div>

          <Button variant="outline" icon={RefreshCw} onClick={fetchStatus} isLoading={loading}>
            Sync All Services
          </Button>
        </div>

        {/* Integration Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px',
          }}
        >
          {/* GitHub Integration Card */}
          <Card
            title="GitHub Repositories & Events"
            action={<Badge variant="success">Connected</Badge>}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Github size={26} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text)' }}>
                  @{integrations?.github?.username || 'Vidhi-bhutia'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  Syncs pull requests, issues, commits, and activity stream directly to your home dashboard timeline.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--color-border-subtle)' }}>
              <Button variant="primary" size="sm" icon={RefreshCw} onClick={() => setIsGithubModalOpen(true)}>
                Configure GitHub
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={ExternalLink}
                onClick={() => window.open(`https://github.com/${integrations?.github?.username || 'Vidhi-bhutia'}`, '_blank')}
              >
                View Profile
              </Button>
            </div>
          </Card>

          {/* Google Services Integration Card */}
          <Card
            title="Google Workspace (Gmail & Calendar)"
            action={<Badge variant="success">Connected</Badge>}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: '#EFF6FF',
                  color: '#3B82F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Mail size={26} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text)' }}>
                  {integrations?.google?.email || 'Google Account Active'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  Unified inbox unread counter, Google Meet link launcher, and Google Calendar event sync.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--color-border-subtle)' }}>
              <Button variant="primary" size="sm" icon={RefreshCw} onClick={() => setIsGoogleModalOpen(true)}>
                Configure Google
              </Button>
              <Button variant="outline" size="sm" icon={ExternalLink} onClick={() => window.open('https://calendar.google.com', '_blank')}>
                Open Calendar
              </Button>
            </div>
          </Card>

          {/* OpenWeather Card */}
          <Card
            title="OpenWeather API"
            action={<Badge variant="success">Active</Badge>}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: '#FEF3C7',
                  color: '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <CloudSun size={26} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text)' }}>
                  {integrations?.openweather?.city || 'Indore, India'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  Powers real-time weather forecasts, humidity, wind speeds, and environmental air quality alerts.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--color-border-subtle)' }}>
              <Button variant="outline" size="sm" icon={CheckCircle2}>
                Live API Active
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* GitHub Modal */}
      <Modal
        isOpen={isGithubModalOpen}
        onClose={() => setIsGithubModalOpen(false)}
        title="Connect GitHub Account"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsGithubModalOpen(false)}>Cancel</Button>
            <Button variant="primary" isLoading={githubLoading} onClick={handleConnectGitHub}>Save & Sync</Button>
          </>
        }
      >
        <form onSubmit={handleConnectGitHub} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="GitHub Username"
            placeholder="e.g. Vidhi-bhutia"
            value={githubUsername}
            onChange={(e) => setGithubUsername(e.target.value)}
            required
          />

          <Input
            label="Personal Access Token (Optional)"
            type="password"
            placeholder="ghp_••••••••••••••••••••"
            value={githubToken}
            onChange={(e) => setGithubToken(e.target.value)}
            helpText="Optional for accessing private repositories and higher rate limits."
          />
        </form>
      </Modal>

      {/* Google Modal */}
      <Modal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        title="Connect Google Services"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsGoogleModalOpen(false)}>Cancel</Button>
            <Button variant="primary" isLoading={googleLoading} onClick={handleConnectGoogle}>Connect Account</Button>
          </>
        }
      >
        <form onSubmit={handleConnectGoogle} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Google Account Email"
            type="email"
            placeholder="user@gmail.com"
            value={googleEmail}
            onChange={(e) => setGoogleEmail(e.target.value)}
            required
          />
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
            Connecting your Google Account enables live sync for Gmail unread inbox counts, Google Calendar meetings, and Google Meet video links.
          </p>
        </form>
      </Modal>
    </AppShell>
  );
};

export default IntegrationsPage;
