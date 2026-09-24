import React from 'react';
import { CaretRight, CalendarBlank, Flag } from '@phosphor-icons/react';

export function ActivityStrips({ activities, onSelect }) {
  
  // Helpers para estado y prioridad
  const getStatusClass = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('culminada') || s.includes('completad')) return 'status-culminada';
    if (s.includes('bloqueada')) return 'status-bloqueada';
    if (s.includes('curso')) return 'status-en-curso';
    return 'status-pendiente';
  };

  const getPriorityClass = (priority) => {
    const p = priority?.toLowerCase() || '';
    if (p === 'alta') return 'priority-alta';
    if (p === 'media') return 'priority-media';
    return 'priority-baja';
  };

  // Helper para Iniciales y Avatar
  const getInitials = (name) => {
    if (!name || name === 'Sin Asignar') return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name) => {
    if (!name) return '#94A3B8';
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];
    const charCode = name.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
  };

  // SVG Circular Progress (Donut)
  const CircularProgress = ({ pct, statusClass }) => {
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (pct / 100) * circumference;
    
    // Asignar color en base al estado
    let color = '#3B82F6'; // default accent
    if (statusClass === 'status-culminada') color = '#10B981';
    if (statusClass === 'status-bloqueada') color = '#EF4444';
    if (statusClass === 'status-pendiente') color = '#F59E0B';

    return (
      <div style={{ position: 'relative', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="56" height="56" style={{ transform: 'rotate(-90deg)' }}>
          <circle 
            cx="28" cy="28" r={radius} 
            fill="transparent" stroke="#E2E8F0" strokeWidth="4" 
          />
          <circle 
            cx="28" cy="28" r={radius} 
            fill="transparent" stroke={color} strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
          />
        </svg>
        <span style={{ position: 'absolute', fontSize: '0.75rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>
          {pct}%
        </span>
      </div>
    );
  };

  return (
    <div className="activity-cards-grid">
      {activities.map((item) => {
        const p = item.progress || item.flowProgress || 0;
        const statusClass = getStatusClass(item.status);
        
        return (
          <div 
            key={item.id} 
            className="modern-activity-card widget-glow-hover"
            onClick={() => onSelect(item.id)}
          >
            {/* Izquierda: Anillo de Progreso */}
            <div className="modern-card-left">
              <CircularProgress pct={p} statusClass={statusClass} />
            </div>

            {/* Centro: Info Principal */}
            <div className="modern-card-body">
              <div className="modern-card-top">
                <span className="strip-id">{item.id}</span>
                <span className={`badge ${statusClass}`}>{item.status}</span>
                {item.priority && (
                  <span className={`priority-indicator ${getPriorityClass(item.priority)}`}>
                    <Flag size={14} weight="fill" /> {item.priority}
                  </span>
                )}
              </div>
              
              <h3 className="modern-card-title">{item.title || item.activity}</h3>
              
              <div className="modern-card-meta">
                <span className="strip-category-tag">
                  {item.category}
                </span>
                {item.endDate && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <CalendarBlank size={14} />
                    Fin: {item.endDate}
                  </span>
                )}
              </div>
            </div>

            {/* Derecha: Responsable y Acción */}
            <div className="modern-card-right">
              <div 
                className="modern-avatar"
                title={item.responsible || 'Sin Asignar'}
                style={{ background: getAvatarColor(item.responsible) }}
              >
                {getInitials(item.responsible)}
              </div>
              
              <div className="modern-action-btn">
                <CaretRight size={20} weight="bold" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
