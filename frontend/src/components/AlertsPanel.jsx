import React from 'react';
import { WarningCircle, CheckCircle } from '@phosphor-icons/react';

export function AlertsPanel({ alerts = [] }) {
  if (!alerts.length) {
    return (
      <div style={{ background: 'var(--pastel-green-bg)', border: '1px solid var(--success)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <CheckCircle size={24} weight="bold" style={{ color: 'var(--success)', flexShrink: 0 }} />
        <div>
          <strong style={{ color: 'var(--pastel-green-text)', fontSize: '0.9rem' }}>
            Operación conforme
          </strong>
          <p style={{ margin: 0, color: '#166534', fontSize: '0.82rem' }}>
            No se identifican alertas operativas ni bloqueos en las actividades filtradas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="alerts-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--primary)', margin: 0 }}>
          Alertas de Gestión y Bloqueos
        </h3>
        <span className="badge priority-alta">
          {alerts.length} alerta{alerts.length === 1 ? '' : 's'} activa{alerts.length === 1 ? '' : 's'}
        </span>
      </div>

      {alerts.map((alert, index) => (
        <div key={`${alert.title}-${index}`} className="alert-card">
          <WarningCircle size={22} weight="bold" className="alert-card-icon" />
          <div className="alert-card-content">
            <strong>{alert.title}</strong>
            <p>{alert.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
