import React from 'react';
import { CaretRight, ChartDonut, Heartbeat, ShieldWarning, PresentationChart, CheckCircle, Star } from '@phosphor-icons/react';

export function DashboardWidgets({ metrics, activities, featuredActivity, onSelectActivity }) {
  // Calcular distribución de categorías
  const categories = activities.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {});

  const categoryData = Object.entries(categories)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
    
  const totalCategory = categoryData.reduce((sum, item) => sum + item.count, 0);
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* KPI Widgets */}
      <div className="kpi-widgets-row">
        <div className="kpi-widget widget-glow-hover">
          <div className="kpi-widget-icon" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
            <PresentationChart size={24} weight="duotone" />
          </div>
          <div className="kpi-widget-body">
            <div className="kpi-widget-value">{metrics.enCurso}</div>
            <div className="kpi-widget-label">Actividades Activas</div>
          </div>
        </div>
        
        <div className="kpi-widget widget-glow-hover">
          <div className="kpi-widget-icon" style={{ background: '#ECFDF5', color: '#10B981' }}>
            <Heartbeat size={24} weight="duotone" />
          </div>
          <div className="kpi-widget-body">
            <div className="kpi-widget-value">{metrics.healthScore}%</div>
            <div className="kpi-widget-label">Eficiencia de Ejecución</div>
          </div>
        </div>
        
        <div className="kpi-widget widget-glow-hover">
          <div className="kpi-widget-icon" style={{ background: '#FEF2F2', color: '#EF4444' }}>
            <ShieldWarning size={24} weight="duotone" />
          </div>
          <div className="kpi-widget-body">
            <div className="kpi-widget-value">{metrics.bloqueadas}</div>
            <div className="kpi-widget-label">Actividades Bloqueadas</div>
          </div>
        </div>
        
        <div className="kpi-widget widget-glow-hover">
          <div className="kpi-widget-icon" style={{ background: '#F5F3FF', color: '#8B5CF6' }}>
            <CheckCircle size={24} weight="duotone" />
          </div>
          <div className="kpi-widget-body">
            <div className="kpi-widget-value">{metrics.culminadas}</div>
            <div className="kpi-widget-label">Actividades Completadas</div>
          </div>
        </div>
      </div>

      {featuredActivity && (
        <div 
          style={{
            background: 'linear-gradient(120deg, #1e293b 0%, #0f172a 100%)',
            borderRadius: 'var(--radius-xl)', padding: '2rem 2.5rem',
            position: 'relative', overflow: 'hidden', color: 'white',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            display: 'flex', flexDirection: 'column', gap: '1.25rem',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Fondo decorativo */}
          <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60A5FA', padding: '0.4rem 0.8rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                <Star size={14} weight="fill" /> Destacada
              </div>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>{featuredActivity.id}</span>
            </div>
            
            <button 
              onClick={() => onSelectActivity(featuredActivity.id)}
              style={{ background: 'white', color: '#0f172a', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'transform 0.2s' }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              Abrir Ficha <CaretRight size={14} weight="bold" />
            </button>
          </div>
          
          <div style={{ zIndex: 1 }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.5rem 0', lineHeight: 1.2, color: 'white' }}>
              {featuredActivity.activity || featuredActivity.title}
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', margin: 0, maxWidth: '80%' }}>
              {featuredActivity.description}
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginTop: '0.5rem', zIndex: 1, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 700, marginBottom: '0.2rem' }}>Responsable</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#E2E8F0' }}>{featuredActivity.responsible || 'General'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 700, marginBottom: '0.2rem' }}>Estado</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#E2E8F0' }}>{featuredActivity.status}</div>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 700 }}>Progreso General</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#60A5FA' }}>{featuredActivity.progress || featuredActivity.flowProgress || 0}%</div>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${featuredActivity.progress || featuredActivity.flowProgress || 0}%`, height: '100%', background: '#3B82F6', borderRadius: 'inherit', boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Widgets Row */}
      <div className="bottom-widgets-row" style={{ gridTemplateColumns: '2fr 1fr' }}>
        
        <div className="widget-card">
          <div className="widget-card-header">
            <h3 className="widget-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ChartDonut size={20} color="var(--accent)" weight="duotone" />
              Distribución por Ejes
            </h3>
          </div>
          
          <div className="category-list" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {categoryData.map((item, index) => (
              <div key={item.name} className="category-item" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="category-color" style={{ width: '12px', height: '12px', borderRadius: '50%', background: colors[index % colors.length] }} />
                <div className="category-name" style={{ flex: '0 0 140px', fontWeight: 600 }}>{item.name}</div>
                <div className="category-bar-track" style={{ flex: 1, height: '8px' }}>
                  <div 
                    className="category-bar-fill" 
                    style={{ 
                      width: `${(item.count / totalCategory) * 100}%`,
                      background: colors[index % colors.length] 
                    }} 
                  />
                </div>
                <div className="category-count" style={{ flex: '0 0 40px', textAlign: 'right', fontSize: '1rem' }}>{item.count}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Widget: Resumen del Total */}
        <div className="widget-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', background: 'linear-gradient(135deg, #ffffff, #f8fafc)' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--accent-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: 'inset 0 4px 6px rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                {metrics.total}
              </span>
            </div>
            <h3 className="widget-card-title" style={{ marginBottom: '0.5rem', fontSize: '1.15rem' }}>Total Registros</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Actividades administradas por el IDIC.
            </p>
        </div>
      </div>

      {/* Tip si no hay destacada */}
      {!featuredActivity && (
        <div style={{ 
          background: 'var(--accent-pale)', border: '1px dashed var(--accent-light)', 
          borderRadius: 'var(--radius-md)', padding: '1.25rem 1.5rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem'
        }}>
          <Star size={20} color="var(--accent)" weight="duotone" />
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            <strong style={{ color: 'var(--primary)' }}>¿Quieres destacar una actividad?</strong> Ve a la sección <em>Actividades</em>, abre cualquier ficha y pulsa la estrella ⭐ para fijarla aquí.
          </p>
        </div>
      )}
    </div>
  );
}
