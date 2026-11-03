import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { Plus } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AddTaskModal = ({ isOpen, onClose, onAddTask }) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [noDeadline, setNoDeadline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deadlineError, setDeadlineError] = useState('');
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (!noDeadline && !dueDate) { setDeadlineError('Choose a deadline or select “This task has no deadline”.'); return; }

    setLoading(true);
    try {
      await onAddTask({ title: title.trim(), dueDate: !noDeadline && dueDate ? new Date(dueDate).toISOString() : null, noDeadline, dueText: !noDeadline && dueDate ? new Date(dueDate).toLocaleString() : '', priority, description: '' });
      setTitle('');
      setDueDate(''); setPriority('Medium'); setNoDeadline(false);
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
          <Button variant="primary" icon={Plus} isLoading={loading} disabled={!title.trim() || (!noDeadline && !dueDate)} onClick={handleSubmit}>
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

        <div><Input label="Deadline" type="datetime-local" value={dueDate} onChange={(e) => { setDueDate(e.target.value); setDeadlineError(''); }} disabled={noDeadline} required={!noDeadline} /><label style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8, color: 'var(--color-text-muted)', fontSize: 13 }}><input type="checkbox" checked={noDeadline} onChange={e => { setNoDeadline(e.target.checked); setDeadlineError(''); if (e.target.checked) setDueDate(''); }} /> This task has no deadline</label>{deadlineError && <div role="alert" style={{color:'var(--color-danger)',fontSize:12,marginTop:6}}>{deadlineError}</div>}</div>

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
