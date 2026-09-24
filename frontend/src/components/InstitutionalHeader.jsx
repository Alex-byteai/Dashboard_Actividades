import React from 'react';
import { CalendarBlank, ArrowsClockwise, CloudCheck, HardDrive } from '@phosphor-icons/react';

export function InstitutionalHeader({ dataSource = 'local', lastUpdated = null, onRefresh, refreshing = false }) {
  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-content">
          <h1>Seguimiento de Actividades</h1>
        </div>
        <p className="header-subtitle">
          Panel de monitoreo integral de entregables, responsables, avances ponderados y cumplimiento de metas del área de Inteligencia e Integridad.
        </p>
        <div className="header-meta" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarBlank size={14} />
            <span>Periodo institucional <strong>2026</strong></span>
            <span>·</span>
            <span>Área de Inteligencia e Integridad</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                padding: '0.2rem 0.55rem',
                borderRadius: '999px',
                background: dataSource === 'sheets' ? 'rgba(46, 125, 50, 0.12)' : 'rgba(237, 108, 2, 0.12)',
                color: dataSource === 'sheets' ? '#2e7d32' : '#b26a00',
                fontWeight: 600
              }}
              title={dataSource === 'sheets' ? 'Conectado a Google Sheets en tiempo real' : 'Usando datos locales de respaldo'}
            >
              {dataSource === 'sheets' ? <CloudCheck size={14} weight="bold" /> : <HardDrive size={14} weight="bold" />}
              <span>{dataSource === 'sheets' ? 'En vivo (Google Sheets)' : 'Modo local (Copia)'}</span>
            </div>

            {formattedTime && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {formattedTime}
              </span>
            )}

            {onRefresh && (
              <button
                type="button"
                onClick={() => onRefresh(true)}
                disabled={refreshing}
                title="Actualizar datos ahora"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  background: 'var(--bg-card, #ffffff)',
                  border: '1px solid var(--border-color, #e0e0e0)',
                  color: 'var(--text-main, #333333)',
                  cursor: refreshing ? 'not-allowed' : 'pointer',
                  fontWeight: 500,
                  transition: 'all 0.2s ease'
                }}
              >
                <ArrowsClockwise
                  size={13}
                  weight="bold"
                  className={refreshing ? 'rotating-spin' : ''}
                  style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }}
                />
                <span>{refreshing ? 'Sincronizando…' : 'Actualizar'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

