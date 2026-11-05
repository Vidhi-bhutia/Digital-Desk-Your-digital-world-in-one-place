import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Search, CheckSquare, Activity, Settings, UserRound, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const stops = [
  { icon: Compass, title: 'Your home base', text: 'Your dashboard brings together today’s tasks, activity, meetings, email, and useful quick links.' },
  { icon: Search, title: 'Find things fast', text: 'Use Search to look across your workspace and connected services. Tasks keeps your to-dos organized, while Activity shows recent updates.' },
  { icon: Settings, title: 'Connect your services', text: 'Open Settings, then Integrations to connect Gmail, Google Calendar, and GitHub. You can choose which services to connect.' },
  { icon: UserRound, title: 'Make it yours', text: 'Your Profile is in the left navigation. Update your name and photo, manage your password, and review account security there.' },
];

export default function WelcomeTour() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const key = `digital-desk-tour:${user?._id || user?.id || user?.email || 'account'}`;
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user && !localStorage.getItem(key)) setOpen(true);
  }, [key, user]);

  const finish = () => {
    localStorage.setItem(key, 'done');
    setOpen(false);
  };
  const start = () => { setStep(0); setOpen(true); };
  const Icon = stops[step].icon;

  return <>
    <button type="button" className="welcome-tour-help" onClick={start} aria-label="Open workspace guide" title="Workspace guide"><Compass size={17}/><span>Workspace guide</span></button>
    {open && <div className="welcome-tour-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) finish(); }}>
      <section className="welcome-tour-dialog" role="dialog" aria-modal="true" aria-labelledby="welcome-tour-title">
        <button type="button" className="welcome-tour-close" onClick={finish} aria-label="Close guide"><X size={18}/></button>
        <div className="welcome-tour-icon"><Icon size={23}/></div>
        <span className="welcome-tour-step">YOUR DIGITAL DESK · {step + 1} OF {stops.length}</span>
        <h2 id="welcome-tour-title">{stops[step].title}</h2>
        <p>{stops[step].text}</p>
        {step === 2 && <button type="button" className="welcome-tour-settings" onClick={() => { finish(); navigate('/settings'); }}>Go to Settings <ChevronRight size={16}/></button>}
        {step === 3 && <button type="button" className="welcome-tour-settings" onClick={() => { finish(); navigate('/profile'); }}>Open Profile <ChevronRight size={16}/></button>}
        <div className="welcome-tour-footer">
          <button type="button" className="welcome-tour-skip" onClick={finish}>Skip guide</button>
          <div className="welcome-tour-controls">
            {step > 0 && <button type="button" className="welcome-tour-back" onClick={() => setStep(value => value - 1)}><ChevronLeft size={16}/> Back</button>}
            <button type="button" className="welcome-tour-next" onClick={() => step === stops.length - 1 ? finish() : setStep(value => value + 1)}>{step === stops.length - 1 ? 'Get started' : 'Next'}{step < stops.length - 1 && <ChevronRight size={16}/>}</button>
          </div>
        </div>
      </section>
    </div>}
  </>;
}
