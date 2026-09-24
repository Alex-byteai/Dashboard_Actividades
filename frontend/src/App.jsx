import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { IconContext } from '@phosphor-icons/react';
import { filterActivities, getAlerts, getMetrics } from './utils/activityMetrics';
import { fetchActivitiesData } from './services/activitiesService';

import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { RightPanel } from './components/RightPanel';
import { DashboardWidgets } from './components/DashboardWidgets';
import { DashboardFilters } from './components/DashboardFilters';
import { ActivityStrips } from './components/ActivityStrips';
import { ActivityDetail } from './components/ActivityDetail';

const initialFilters = {
  search: '',
  responsible: 'all',
  status: 'all',
  priority: 'all',
  category: 'all'
};

export default function App() {
  const [allActivities, setAllActivities] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dataSource, setDataSource] = useState('local');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState(initialFilters);
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedId, setSelectedId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  
  // Inicializar actividad destacada desde localStorage
  const [featuredId, setFeaturedId] = useState(() => {
    return localStorage.getItem('idic_featured_activity') || null;
  });

  const loadData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const result = await fetchActivitiesData();
      setAllActivities(result.data);
      if (result.teamMembers) setTeamMembers(result.teamMembers);
      setDataSource(result.source);
      setLastUpdated(result.lastUpdated);
      setError(null);
    } catch (err) {
      console.error('Error al obtener datos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      if (isManualRefresh) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const visibleActivities = useMemo(() => filterActivities(allActivities, filters), [allActivities, filters]);
  const metrics = useMemo(() => getMetrics(allActivities), [allActivities]);
  const alerts = useMemo(() => getAlerts(allActivities), [allActivities]);
  const selectedActivity = allActivities.find((item) => item.id === selectedId) ?? null;
  const featuredActivity = allActivities.find((item) => item.id === featuredId) ?? null;

  const responsibleOptions = useMemo(
    () => [...new Set(allActivities.map((item) => item.responsible))].sort(),
    [allActivities]
  );

  const categoryOptions = useMemo(
    () => [...new Set(allActivities.map((item) => item.category))].sort(),
    [allActivities]
  );

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function resetFilters() {
    setFilters(initialFilters);
  }

  function toggleFeatured(id) {
    setFeaturedId(prev => {
      const newVal = prev === id ? null : id;
      if (newVal) {
        localStorage.setItem('idic_featured_activity', newVal);
      } else {
        localStorage.removeItem('idic_featured_activity');
      }
      return newVal;
    });
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p className="loading-text">Cargando centro de control…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-screen">
        <p className="loading-text" style={{ color: 'var(--danger)' }}>
          Error al cargar los datos: {error}
        </p>
      </div>
    );
  }

  return (
    <IconContext.Provider value={{ weight: 'bold' }}>
      <div className="app-shell">
        <Sidebar 
          activeView={activeView} 
          onChangeView={(v) => { setActiveView(v); setSidebarOpen(false); }} 
          dataSource={dataSource} 
          alertCount={alerts.length}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        {sidebarOpen && <div className="mobile-overlay" onClick={() => setSidebarOpen(false)} />}
        
        <div className="main-wrapper">
          <TopBar 
            onRefresh={() => loadData(true)} 
            isLoading={refreshing} 
            lastUpdate={lastUpdated} 
            activeView={activeView}
            onToggleSidebar={() => setSidebarOpen(prev => !prev)}
            onTogglePanel={() => setPanelOpen(prev => !prev)}
          />
          
          <div className="main-content-area">
            <main className="main-center">
              
              {activeView === 'dashboard' && (
                <DashboardWidgets 
                  metrics={metrics} 
                  activities={allActivities} 
                  featuredActivity={featuredActivity}
                  onSelectActivity={setSelectedId}
                />
              )}

              {activeView === 'actividades' && (
                <>
                  <DashboardFilters
                    filters={filters}
                    responsibleOptions={responsibleOptions}
                    categoryOptions={categoryOptions}
                    onChange={updateFilter}
                    onReset={resetFilters}
                  />
                  
                  {visibleActivities.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">🔍</div>
                      <h3>No hay resultados</h3>
                      <p>No se encontraron actividades con los filtros actuales.</p>
                      <button className="btn-reset" onClick={resetFilters} style={{ margin: '1rem auto 0' }}>
                        Limpiar Filtros
                      </button>
                    </div>
                  ) : (
                    <ActivityStrips
                      activities={visibleActivities}
                      onSelect={setSelectedId}
                    />
                  )}
                </>
              )}

              {activeView === 'alertas' && (
                <div className="alerts-wrapper">
                  <h2 style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '1rem' }}>
                    Alertas Operativas ({alerts.length})
                  </h2>
                  {alerts.length === 0 ? (
                    <div className="empty-state">
                      <h3>Todo en orden</h3>
                      <p>No hay alertas activas en este momento.</p>
                    </div>
                  ) : (
                    alerts.map((alert, idx) => (
                      <div key={`alert-${alert.activityId}-${idx}`} className="alert-card">
                        <div className="alert-card-icon">⚠</div>
                        <div className="alert-card-content">
                          <strong>{alert.title}</strong>
                          <p>{alert.message}</p>
                          <button 
                            style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 700, marginTop: '0.5rem', cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => setSelectedId(alert.activityId)}
                          >
                            Ver Actividad
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

            </main>

            <RightPanel activities={allActivities} teamMembers={teamMembers} isOpen={panelOpen} onClose={() => setPanelOpen(false)} />
            {panelOpen && <div className="mobile-overlay" onClick={() => setPanelOpen(false)} />}
          </div>
        </div>
      </div>

      {/* Modal de Detalles */}
      {selectedActivity && (
        <ActivityDetail
          activity={selectedActivity}
          onClose={() => setSelectedId(null)}
          onToggleFeatured={toggleFeatured}
          isFeatured={featuredId === selectedActivity.id}
        />
      )}
    </IconContext.Provider>
  );
}
