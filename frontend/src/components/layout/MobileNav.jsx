import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import { X } from 'lucide-react';

export const MobileNav = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        animation: 'fadeIn 200ms ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '280px',
          height: '100%',
          backgroundColor: 'var(--color-surface)',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close menu"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 50,
            background: 'none',
            border: 'none',
            color: 'var(--color-text)',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>
        <Sidebar onCloseMobile={onClose} />
      </div>
    </div>
  );
};

export default MobileNav;
