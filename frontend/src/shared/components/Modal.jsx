import React, { useState, useEffect } from 'react';
import { X } from '@phosphor-icons/react';
import useBodyScrollLock from '../hooks/useBodyScrollLock';

export default function Modal({ isOpen, onClose, icon: Icon, title, subtitle, maxWidth = '760px', children }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    }
    setIsVisible(false);
  }, [isOpen]);

  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 200);
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(17, 17, 17, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.2s ease-out',
        padding: '1.25rem'
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--card-bg)',
          borderRadius: 'var(--radius-lg)',
          padding: '0',
          width: '100%',
          maxWidth,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 48px rgba(17, 17, 17, 0.16)',
          position: 'relative',
          overflow: 'hidden',
          transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(18px)',
          transition: isVisible ? 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)' : 'transform 0.2s ease-out',
          border: '1px solid var(--border)'
        }}
      >
        <div
          style={{
            padding: '1.5rem 1.75rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
            background: 'var(--card-bg-alt)'
          }}
        >
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {Icon && (
              <div
                style={{
                  padding: '0.75rem',
                  background: 'var(--accent-pale)',
                  border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Icon size={24} />
              </div>
            )}
            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.35rem',
                  fontWeight: 600,
                  margin: subtitle ? '0 0 0.2rem 0' : 0,
                  color: 'var(--text)',
                  lineHeight: '1.25'
                }}
              >
                {title}
              </h2>
              {subtitle && (
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: '1.4' }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label="Cerrar ventana"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '0.45rem',
              borderRadius: '50%',
              transition: 'background 0.15s ease-out, color 0.15s ease-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--border)';
              e.currentTarget.style.color = 'var(--text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ overflowY: 'auto', padding: '1.75rem' }}>
          {typeof children === 'function' ? children(handleClose) : children}
        </div>
      </div>
    </div>
  );
}
