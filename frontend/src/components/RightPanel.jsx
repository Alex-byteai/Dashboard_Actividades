import React from 'react';
import { Users, ChartBar } from '@phosphor-icons/react';

export function RightPanel({ activities, teamMembers = [], isOpen = false, onClose }) {
  // Calcular cuántas actividades En Curso tiene cada persona
  const activeActivities = activities.filter(a => {
    const s = a.status?.toLowerCase() || '';
    return !s.includes('culminada') && !s.includes('completad');
  });
  
  const workloadMap = activeActivities.reduce((acc, curr) => {
    const person = curr.responsible || 'Sin Asignar';
    acc[person] = (acc[person] || 0) + 1;
    return acc;
  }, {});

  // Combinar con la lista maestra de integrantes
  // teamMembers puede ser [{nombre, cargo}] o ["string"]
  let fullTeamWorkload = [];
  
  if (teamMembers && teamMembers.length > 0) {
    fullTeamWorkload = teamMembers.map(member => {
      const isObj = typeof member === 'object';
      const nombre = isObj ? member.nombre : member;
      const cargo = isObj ? (member.cargo || '') : '';
      return {
        name: nombre,
        cargo: cargo,
        count: workloadMap[nombre] || 0
      };
    });
    
    // Si hay responsables que no están en la hoja de integrantes
    Object.keys(workloadMap).forEach(key => {
      const exists = fullTeamWorkload.some(m => m.name === key);
      if (!exists) {
        fullTeamWorkload.push({ name: key, cargo: '', count: workloadMap[key] });
      }
    });
  } else {
    // Fallback: solo los que tienen carga
    fullTeamWorkload = Object.entries(workloadMap).map(([name, count]) => ({ name, cargo: '', count }));
  }

  // Ordenar: primero los que tienen más carga, luego alfabéticamente
  fullTeamWorkload.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.name.localeCompare(b.name);
  });

  const maxWorkload = Math.max(...fullTeamWorkload.map(t => t.count), 1);

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

  return (
    <aside className={`main-right-panel ${isOpen ? 'panel-open' : ''}`}>
      <div className="panel-section">
        <h3 className="panel-section-title" style={{ marginBottom: '1.25rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} weight="bold" /> 
            Carga de Equipo
          </span>
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {fullTeamWorkload.length === 0 ? (
            <div className="empty-state" style={{ padding: '1rem', borderRadius: '8px' }}>
              <p style={{ fontSize: '0.8rem', margin: 0 }}>No hay integrantes registrados.</p>
            </div>
          ) : (
            fullTeamWorkload.map(member => (
              <div key={member.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ 
                  width: '36px', height: '36px', borderRadius: '50%', 
                  background: member.count > 0 ? getAvatarColor(member.name) : '#E2E8F0', 
                  color: member.count > 0 ? 'white' : '#94A3B8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700, flexShrink: 0
                }}>
                  {getInitials(member.name)}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.15rem' }}>
                    <span style={{ 
                      fontSize: '0.82rem', fontWeight: 600, 
                      color: member.count > 0 ? 'var(--text)' : 'var(--text-muted)', 
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' 
                    }}>
                      {member.name}
                    </span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: member.count > 0 ? 'var(--accent)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {member.count}
                    </span>
                  </div>
                  
                  {/* Cargo del integrante */}
                  {member.cargo && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '0.25rem', lineHeight: 1.2 }}>
                      {member.cargo}
                    </div>
                  )}
                  
                  <div style={{ width: '100%', height: '4px', background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', 
                      width: member.count > 0 ? `${(member.count / maxWorkload) * 100}%` : '0%', 
                      background: 'var(--accent)',
                      borderRadius: 'inherit',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="panel-section" style={{ marginTop: '1.5rem' }}>
        <h3 className="panel-section-title" style={{ marginBottom: '0.75rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ChartBar size={18} weight="bold" /> 
            Resumen
          </span>
        </h3>
        <div style={{ background: 'var(--card-bg-alt)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Tareas Activas</span>
            <strong style={{ color: 'var(--primary)' }}>{activeActivities.length}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Integrantes</span>
            <strong style={{ color: 'var(--primary)' }}>{fullTeamWorkload.length}</strong>
          </div>
        </div>
      </div>
    </aside>
  );
}
