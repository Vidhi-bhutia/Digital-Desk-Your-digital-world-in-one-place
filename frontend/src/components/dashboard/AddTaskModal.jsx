import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { Plus } from 'lucide-react';

export const AddTaskModal = ({ isOpen, onClose, onAddTask }) => {
  const [title, setTitle] = useState('');
  const [dueText, setDueText] = useState('Today, 4:00 PM');
  const [priority, setPriority] = useState('Medium');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onAddTask({ title: title.trim(), dueText, priority });
      setTitle('');
      onClose();
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
          <Button variant="primary" icon={Plus} isLoading={loading} onClick={handleSubmit}>
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

        <Input
          label="Due Date / Time"
          placeholder="Today, 4:00 PM"
          value={dueText}
          onChange={(e) => setDueText(e.target.value)}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>
            Priority
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {['Low', 'Medium', 'High'].map((p) => (
              <button
                key={p}
                type="button"
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
