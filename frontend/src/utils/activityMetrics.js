export const formatCount = (value) => String(value).padStart(2, '0');

export function filterActivities(activities, filters) {
  const searchLower = filters.search ? filters.search.trim().toLowerCase() : '';

  return activities.filter((item) => {
    const matchesSearch =
      !searchLower ||
      item.activity?.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower) ||
      item.responsible?.toLowerCase().includes(searchLower) ||
      item.category?.toLowerCase().includes(searchLower) ||
      item.id?.toLowerCase().includes(searchLower);

    const matchesResponsible =
      filters.responsible === 'all' || item.responsible === filters.responsible;

    const matchesStatus =
      filters.status === 'all' || 
      item.status?.toLowerCase() === filters.status.toLowerCase();

    const matchesPriority =
      filters.priority === 'all' || item.priority === filters.priority;

    const matchesCategory =
      !filters.category || filters.category === 'all' || item.category === filters.category;

    return (
      matchesSearch &&
      matchesResponsible &&
      matchesStatus &&
      matchesPriority &&
      matchesCategory
    );
  });
}

export function getMetrics(activities) {
  const total = activities.length;
  
  // Normalizar estados para evitar problemas de mayúsculas
  const getCount = (statusCheck) => activities.filter(a => {
    const s = a.status?.toLowerCase() || '';
    return statusCheck.some(sc => s.includes(sc));
  }).length;

  const culminadas = getCount(['culminada', 'completad']);
  const enCurso = getCount(['en curso', 'proceso']);
  const bloqueadas = getCount(['bloqueada', 'detenid']);
  
  // Health Score: Porcentaje de actividades que NO están bloqueadas
  const healthScore = total === 0 ? 100 : Math.round(((total - bloqueadas) / total) * 100);
  
  // Progreso promedio general
  const avgProgress = total === 0 
    ? 0 
    : Math.round(activities.reduce((sum, item) => sum + (item.progress || item.flowProgress || 0), 0) / total);

  return { 
    total, 
    culminadas, 
    enCurso, 
    bloqueadas, 
    healthScore,
    avgProgress 
  };
}

export function getAlerts(activities) {
  const alerts = [];
  
  activities.forEach(item => {
    const status = item.status?.toLowerCase() || '';
    
    if (status.includes('bloqueada')) {
      alerts.push({
        activityId: item.id,
        title: `Bloqueo Crítico: ${item.id}`,
        message: `${item.activity || item.title}. Motivo o requerimiento: ${item.blockers || 'Requiere atención inmediata.'}`
      });
    } else if (item.priority?.toLowerCase() === 'alta' && (item.progress || item.flowProgress || 0) < 10) {
       alerts.push({
        activityId: item.id,
        title: `Alerta Prioridad Alta: ${item.id}`,
        message: `La actividad "${item.activity || item.title}" tiene máxima prioridad pero reporta poco avance.`
      });
    }
  });
  
  return alerts;
}
