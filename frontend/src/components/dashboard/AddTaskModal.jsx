import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { Plus, CalendarDays, Clock3 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AddTaskModal = ({ isOpen, onClose, onAddTask }) => {
  const [title, setTitle] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [noDeadline, setNoDeadline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deadlineError, setDeadlineError] = useState('');
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (!noDeadline && (!deadlineDate || !deadlineTime)) { setDeadlineError('Choose both a date and time, or select “This task has no deadline”.'); return; }

    setLoading(true);
    try {
      const localDeadline = !noDeadline ? new Date(`${deadlineDate}T${deadlineTime}`) : null;
      await onAddTask({ title: title.trim(), dueDate: localDeadline ? localDeadline.toISOString() : null, noDeadline, dueText: localDeadline ? localDeadline.toLocaleString() : '', priority, description: '' });
      setTitle('');
      setDeadlineDate(''); setDeadlineTime(''); setPriority('Medium'); setNoDeadline(false);
      setDeadlineError('');
      onClose();
    } catch (error) {
      toast.error(error.message || 'Task could not be created.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Task"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" icon={Plus} isLoading={loading} disabled={!title.trim() || (!noDeadline && (!deadlineDate || !deadlineTime))} onClick={handleSubmit}>
            Create Task
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input
          label="Task Title"
          placeholder="e.g. Prepare interview slides"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />

        <div><div style={{display:'grid',gridTemplateColumns:'1.2fr 1fr',gap:12}}><label style={{display:'flex',flexDirection:'column',gap:7,color:'var(--color-text)',fontSize:13,fontWeight:700}}><span style={{display:'flex',alignItems:'center',gap:7}}><CalendarDays size={15} color="var(--color-brand)"/>Deadline date</span><input type="date" value={deadlineDate} onChange={e=>{setDeadlineDate(e.target.value);setDeadlineError('');}} disabled={noDeadline} required={!noDeadline} style={{height:44,width:'100%',padding:'0 11px',border:'1px solid var(--color-border)',borderRadius:'var(--radius-md)',background:'var(--color-bg)',color:'var(--color-text)',font:'14px var(--font-sans)'}}/></label><label style={{display:'flex',flexDirection:'column',gap:7,color:'var(--color-text)',fontSize:13,fontWeight:700}}><span style={{display:'flex',alignItems:'center',gap:7}}><Clock3 size={15} color="var(--color-brand)"/>Deadline time</span><input type="time" value={deadlineTime} onChange={e=>{setDeadlineTime(e.target.value);setDeadlineError('');}} disabled={noDeadline} required={!noDeadline} style={{height:44,width:'100%',padding:'0 11px',border:'1px solid var(--color-border)',borderRadius:'var(--radius-md)',background:'var(--color-bg)',color:'var(--color-text)',font:'14px var(--font-sans)'}}/></label></div><label style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10, color: 'var(--color-text-muted)', fontSize: 13 }}><input type="checkbox" checked={noDeadline} onChange={e => { setNoDeadline(e.target.checked); setDeadlineError(''); if (e.target.checked) {setDeadlineDate('');setDeadlineTime('');} }} /> This task has no deadline</label>{deadlineError && <div role="alert" style={{color:'var(--color-danger)',fontSize:12,marginTop:6}}>{deadlineError}</div>}</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>
            Priority
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {['Low', 'Medium', 'High'].map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={priority === p}
                onClick={() => setPriority(p)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: priority === p ? '2px solid var(--color-brand)' : '1px solid var(--color-border)',
                  backgroundColor: priority === p ? 'var(--color-brand-subtle)' : 'var(--color-surface)',
                  color: priority === p ? 'var(--color-brand)' : 'var(--color-text)',
                  cursor: 'pointer',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AddTaskModal;
