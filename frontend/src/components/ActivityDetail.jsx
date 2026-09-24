import React, { useState } from 'react';
import { 
  X, Flag, Users, ListChecks, WarningCircle, CheckCircle, Info, Star, ClockCounterClockwise
} from '@phosphor-icons/react';

// Funciones de avatar compartidas (misma lógica que RightPanel)
const getInitials = (name) => {
  if (!name || name === 'Sin Asignar') return '?';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const getAvatarColor = (name) => {
  if (!name || name === 'Sin Asignar') return '#94A3B8';
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];
  const charCode = name.charCodeAt(0) || 0;
  return colors[charCode % colors.length];
};

export function ActivityDetail({ activity, onClose, onToggleFeatured, isFeatured }) {
  const [activeTab, setActiveTab] = useState('ejecucion');

  if (!activity) return null;

  const { steps = [], participants = [], executions = [] } = activity;
  const p = activity.progress || activity.flowProgress || 0;
  const statusLower = activity.status?.toLowerCase() || '';
  const isEnCurso = statusLower.includes('curso');
  const isCulminada = statusLower.includes('culminada') || statusLower.includes('completad');

  const showBlockers = statusLower.includes('curso') || statusLower.includes('no iniciada') || statusLower.includes('bloqueada');

  const getStatusClass = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('culminada') || s.includes('completad')) return 'status-culminada';
    if (s.includes('bloqueada')) return 'status-bloqueada';
    if (s.includes('curso')) return 'status-en-curso';
    return 'status-pendiente';
  };

  const statusClass = getStatusClass(activity.status);

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
      background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      padding: 'clamp(0.5rem, 2vw, 2rem)'
    }}>
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--card-bg)', width: '100%', maxWidth: '900px', 
          maxHeight: '95vh', borderRadius: 'var(--radius-xl)', 
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Header */}
        <div className="detail-header" style={{
          padding: 'clamp(1rem, 3vw, 2rem) clamp(1rem, 3vw, 2.5rem) clamp(0.75rem, 2vw, 1.5rem)', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem'
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <span className="strip-id">{activity.id}</span>
              <span className={`badge ${statusClass}`}>{activity.status}</span>
              {activity.priority && (
                <span className={`priority-indicator priority-${activity.priority.toLowerCase()}`}>
                  <Flag size={14} weight="fill" /> {activity.priority}
                </span>
              )}
            </div>
            <h2 style={{ fontSize: 'clamp(1rem, 3vw, 1.4rem)', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.3, marginBottom: '0.5rem' }}>
              {activity.activity || activity.title}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
              {activity.description}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {/* Botón Destacar */}
              {onToggleFeatured && (
                <button 
                  onClick={() => onToggleFeatured(activity.id)}
                  title={isFeatured ? 'Quitar de destacados' : 'Destacar en Dashboard'}
                  style={{ 
                    background: isFeatured ? 'var(--warning)' : 'var(--card-bg-alt)', 
                    border: 'none', width: '32px', height: '32px', borderRadius: '50%', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', 
                    color: isFeatured ? 'white' : 'var(--text-muted)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Star size={16} weight={isFeatured ? 'fill' : 'bold'} />
                </button>
              )}
              <button 
                onClick={onClose}
                style={{ background: 'var(--card-bg-alt)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={16} weight="bold" />
              </button>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 900, color: 'var(--accent)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                {p}%
              </div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                Avance
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - scrollable on mobile */}
        <div style={{ display: 'flex', padding: '0 clamp(1rem, 3vw, 2.5rem)', borderBottom: '1px solid var(--border)', background: 'var(--card-bg-alt)', overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
          {[
            { id: 'ejecucion', label: 'Ejecución Actual', icon: Info },
            { id: 'pasos', label: 'Flujo de Pasos', icon: ListChecks },
            { id: 'participantes', label: 'Participantes', icon: Users },
            { id: 'historial', label: 'Historial', icon: ClockCounterClockwise }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1rem',
                background: 'none', border: 'none', borderBottom: `2.5px solid ${activeTab === tab.id ? 'var(--accent)' : 'transparent'}`,
                color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: activeTab === tab.id ? 700 : 600, fontSize: '0.82rem', cursor: 'pointer',
                transition: 'all 0.15s ease', whiteSpace: 'nowrap', flexShrink: 0
              }}
            >
              <tab.icon size={18} /> {tab.label}
              {tab.id === 'pasos' && steps.length > 0 && <span className="tab-badge">{steps.length}</span>}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'clamp(1rem, 3vw, 2rem) clamp(1rem, 3vw, 2.5rem)' }}>
          
          {/* TAB: Ejecución Actual */}
          {activeTab === 'ejecucion' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* BLOQUEO: Mostrar cuando está En Curso o No Iniciada y tiene bloqueos */}
              {showBlockers && activity.blockers && (
                <div className="alert-card">
                  <div className="alert-card-icon"><WarningCircle size={20} weight="fill" /></div>
                  <div className="alert-card-content">
                    <strong>Atención Requerida (Bloqueo)</strong>
                    <p>{activity.blockers}</p>
                  </div>
                </div>
              )}

              {/* Grid de Metadatos */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="secondary-meta-box">
                  <div className="secondary-meta-header">Fechas Clave</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Asignación</span>
                      <strong style={{ color: 'var(--primary)' }}>{activity.assigned || '-'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Prevista</span>
                      <strong style={{ color: 'var(--primary)' }}>{activity.due || '-'}</strong>
                    </div>
                    {activity.completed && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Culminada</span>
                        <strong style={{ color: 'var(--success)' }}>{activity.completed}</strong>
                      </div>
                    )}
                  </div>
                </div>

                <div className="secondary-meta-box">
                  <div className="secondary-meta-header">Detalles Operativos</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Categoría</span>
                      <strong style={{ color: 'var(--primary)' }}>{activity.category || '-'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Responsable</span>
                      <strong style={{ color: 'var(--primary)' }}>{activity.responsible || '-'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Período</span>
                      <strong style={{ color: 'var(--primary)' }}>{activity.periodo || '-'}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* ENTREGABLES: Solo mostrar cuando está Culminada */}
              {isCulminada && (activity.result || activity.evidence || activity.nextAction) && (
                <div style={{ background: '#F0FDF4', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid #BBF7D0' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--success)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={18} weight="fill" /> Entregables y Resultados
                  </h4>
                  
                  {activity.result && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Resultado Alcanzado</strong>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text)', margin: 0 }}>{activity.result}</p>
                    </div>
                  )}
                  {activity.evidence && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Evidencia</strong>
                      <p style={{ fontSize: '0.85rem', color: 'var(--accent)', margin: 0, wordBreak: 'break-all' }}>{activity.evidence}</p>
                    </div>
                  )}
                  {activity.nextAction && (
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Próxima Acción</strong>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text)', margin: 0 }}>{activity.nextAction}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB: Flujo de Pasos */}
          {activeTab === 'pasos' && (
            <div className="wow-stepper-timeline" style={{ paddingLeft: '1rem' }}>
              {steps.length === 0 ? (
                <div className="empty-state">
                  <p>No se han registrado pasos para esta actividad.</p>
                </div>
              ) : (
                steps.map((step, index) => {
                  const isCompleted = step.estado === 'Completado';
                  const isActive = step.estado === 'En progreso';
                  
                  return (
                    <div key={step.id || index} className={`wow-step-row ${isCompleted ? 'is-completed' : ''} ${isActive ? 'is-active' : ''}`}>
                      {index < steps.length - 1 && <div className="wow-connector-line" />}
                      
                      <div className="wow-node">
                        {isCompleted ? <CheckCircle size={18} weight="bold" /> : index + 1}
                      </div>

                      <div className="wow-step-card">
                        <div className="wow-step-info">
                          <div className="wow-step-title">{step.desc || `Paso ${index + 1}`}</div>
                          <div className="wow-step-status-text">
                            {step.estado} · Peso: {step.weight}%
                          </div>
                        </div>
                        
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: isCompleted ? 'var(--success)' : (isActive ? 'var(--accent)' : 'var(--text-muted)') }}>
                          {isCompleted ? '100' : Math.round((step.porcentaje || 0) * 100)}%
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB: Participantes */}
          {activeTab === 'participantes' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
              
              {/* Responsable Principal */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--accent-pale)', borderRadius: 'var(--radius-md)', border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: getAvatarColor(activity.responsible), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                  {getInitials(activity.responsible)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem' }}>{activity.responsible || 'Sin asignar'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>Responsable Principal</div>
                </div>
              </div>

              {/* Participantes */}
              {participants.map((pName, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--card-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: getAvatarColor(pName), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                    {getInitials(pName)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem' }}>{pName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Participante</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: Historial de Ejecuciones */}
          {activeTab === 'historial' && (
            <div style={{ background: 'var(--card-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflow: 'hidden' }}>
              {executions.length === 0 ? (
                <div className="empty-state" style={{ padding: '2rem' }}>
                  <p>No existen registros históricos para esta actividad.</p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                    <tr>
                      <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600 }}>Código Ejecución</th>
                      <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600 }}>Período</th>
                      <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600 }}>Asignada</th>
                      <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600 }}>Culminada</th>
                      <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600 }}>Estado Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    {executions.map((eje, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: 'var(--primary)' }}>{eje.id}</td>
                        <td style={{ padding: '0.75rem 1.5rem' }}>{eje.periodo || '-'}</td>
                        <td style={{ padding: '0.75rem 1.5rem' }}>{eje.assigned || '-'}</td>
                        <td style={{ padding: '0.75rem 1.5rem' }}>{eje.completed || '-'}</td>
                        <td style={{ padding: '0.75rem 1.5rem' }}>
                          <span className={`badge ${getStatusClass(eje.status)}`}>{eje.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
