/**
 * Normaliza y valida una actividad y sus pasos para garantizar consistencia:
 * - Un paso "Pendiente" siempre tiene 0% de avance (evita que residuos de celda inflen el progreso).
 * - Un paso "Completado" tiene 100% de avance.
 * - El avance ponderado (flowProgress) se calcula con los porcentajes reales.
 * - El estado general de la actividad refleja fielmente el avance de sus pasos.
 */
export function normalizeActivity(item) {
  const steps = Array.isArray(item.steps) ? item.steps : [];

  const normalizedSteps = steps.map((step) => {
    const rawEstado = String(step.estado || '').trim();
    const rawPct = Number(step.porcentaje);

    let estado = 'Pendiente';
    const lower = rawEstado.toLowerCase();
    if (lower.includes('completa') || lower === 'culminado' || lower === 'listo') {
      estado = 'Completado';
    } else if (lower.includes('progres') || lower.includes('curso') || lower.includes('ejecuci')) {
      estado = 'En progreso';
    } else if (lower.includes('bloque')) {
      estado = 'Bloqueado';
    } else if (lower.includes('pend')) {
      estado = 'Pendiente';
    }

    let porcentaje = 0;
    if (estado === 'Completado') {
      porcentaje = 1;
    } else if (estado === 'Pendiente') {
      porcentaje = 0; // Un paso pendiente NUNCA puede aportar 100% de avance
    } else if (estado === 'Bloqueado') {
      porcentaje = (!isNaN(rawPct) && rawPct > 0 && rawPct < 1) ? rawPct : 0;
    } else if (estado === 'En progreso') {
      porcentaje = (!isNaN(rawPct) && rawPct > 0 && rawPct < 1) ? rawPct : 0.5;
    }

    return {
      ...step,
      estado,
      porcentaje
    };
  });

  // Calcular flowProgress real
  let flowProgress = Number(item.flowProgress) || 0;
  if (normalizedSteps.length > 0) {
    const sumWeights = normalizedSteps.reduce((sum, s) => sum + (Number(s.weight) || 0), 0);
    if (sumWeights > 0) {
      const weightedSum = normalizedSteps.reduce((sum, s) => sum + (s.porcentaje * (Number(s.weight) || 0)), 0);
      flowProgress = Math.round((weightedSum / sumWeights) * 100);
    }
  }

  // Respetar el estado oficial de la actividad
  const rawStatus = (item.status || 'No iniciada').trim();
  let status = rawStatus;
  if (normalizedSteps.length > 0) {
    const allCompleted = normalizedSteps.every((s) => s.estado === 'Completado');
    const anyBlocked = normalizedSteps.some((s) => s.estado === 'Bloqueado');
    const allPending = normalizedSteps.every((s) => s.estado === 'Pendiente');

    if (allCompleted && flowProgress === 100) {
      status = 'Culminada';
    } else if (anyBlocked || rawStatus.toLowerCase() === 'bloqueada') {
      status = 'Bloqueada';
    } else if (['En curso', 'Culminada', 'No iniciada', 'Bloqueada'].includes(rawStatus)) {
      status = rawStatus;
    } else if (flowProgress > 0 && flowProgress < 100) {
      status = 'En curso';
    } else if (allPending) {
      status = 'No iniciada';
    }
  }

  return {
    ...item,
    steps: normalizedSteps,
    flowProgress,
    status
  };
}

export async function fetchActivitiesData() {
  const apiUrl = import.meta.env.VITE_SHEETS_API_URL;

  if (apiUrl && apiUrl.trim() !== '') {
    try {
      const response = await fetch(apiUrl.trim(), {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Error al conectar con Google Sheets`);
      }

      const data = await response.json();

      if (data && data.error) {
        throw new Error(`Error en Apps Script: ${data.error}`);
      }

      if (Array.isArray(data)) {
        // Fallback: Si el API solo devuelve un array, tratamos de sacar los integrantes del JSON local
        let fallbackMembers = [];
        try {
          const localFallback = await fetch('/activities-data.json');
          if (localFallback.ok) {
            const lData = await localFallback.json();
            fallbackMembers = lData.integrantes || [];
          }
        } catch (e) {
          console.warn('No se pudieron obtener integrantes del fallback local.');
        }
        
        return {
          data: data.map(normalizeActivity),
          teamMembers: fallbackMembers,
          source: 'sheets',
          lastUpdated: new Date()
        };
      } else if (data && data.activities) {
        return {
          data: data.activities.map(normalizeActivity),
          teamMembers: data.integrantes || [],
          source: 'sheets',
          lastUpdated: new Date()
        };
      }
    } catch (err) {
      console.warn('Fallo al obtener datos desde Google Apps Script. Usando respaldo local.', err);
    }
  }

  // Fallback a JSON local estático
  const localRes = await fetch('/activities-data.json');
  if (!localRes.ok) {
    throw new Error(`HTTP ${localRes.status}: No se pudo cargar el archivo local activities-data.json`);
  }
  const localData = await localRes.json();
  return {
    data: Array.isArray(localData) ? localData.map(normalizeActivity) : (localData.activities ? localData.activities.map(normalizeActivity) : []),
    teamMembers: localData.integrantes || [],
    source: 'local',
    lastUpdated: new Date()
  };
}

