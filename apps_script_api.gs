/**
 * Dashboard Actividades IDIC — Apps Script API
 * =============================================
 * Expone los datos del Google Sheet como JSON para el dashboard React.
 *
 * Despliegue:
 *   1. En Google Sheets: Extensiones → Apps Script → pegar este código
 *   2. Implementar → Nueva implementación → Tipo: Aplicación web
 *      - Ejecutar como: Yo (tu cuenta)
 *      - Quién tiene acceso: Cualquier usuario (Anyone)
 *   3. Copiar la URL generada y añadirla a frontend/.env como VITE_SHEETS_API_URL
 */

// ── Utilidades ───────────────────────────────────────────────────────────────

const SPREADSHEET_ID = '1YiIZaoY6Xf-tg5d-ZnrS0Uo0JXM9fqGQcbo7Ttunz1Y';

/**
 * Obtiene la hoja activa o la abre por ID si el script es independiente
 */
function getSpreadsheet() {
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {}
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

/**
 * Verifica si un valor representa "activo" (soporta TRUE, true, sí, si, s, 1)
 */
function isActive(val) {
  if (val === true) return true;
  const s = String(val || '').trim().toLowerCase();
  return ['sí', 'si', 's', 'true', 'verdadero', '1'].includes(s);
}

/**
 * Lee una hoja y devuelve un array de objetos usando la primera fila como cabecera.
 */
function readSheet(sheetName) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  const headers = data[0].map(String);
  const rows = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    // Saltar filas completamente vacías
    if (row.every(cell => cell === '' || cell === null || cell === undefined)) continue;

    const record = {};
    headers.forEach((h, j) => {
      const val = row[j];
      // Convertir fechas de Google Sheets a string ISO
      if (val instanceof Date) {
        record[h] = Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      } else {
        record[h] = (val === '' || val === null || val === undefined) ? null : val;
      }
    });
    rows.push(record);
  }
  return rows;
}

/**
 * Parsea porcentajes numéricos o cadenas como '15%', '100%', '0.15'
 */
function parsePercent(val) {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return val > 1 ? val / 100 : val;
  var cleaned = String(val).replace('%', '').trim().replace(',', '.');
  var num = parseFloat(cleaned);
  if (isNaN(num)) return 0;
  return num > 1 ? num / 100 : num;
}

// ── Lógica principal de transformación ───────────────────────────────────────

function buildActivitiesData() {
  // 1. Cargar todas las tablas
  const integrantes   = Object.fromEntries(readSheet('Integrantes').map(r => [r.integrante_id, r]));
  const actividadesArr = readSheet('Actividades');
  const ejecucionesArr = readSheet('Ejecuciones');
  const pasosArr       = readSheet('Pasos');
  const seguimientoArr = readSheet('Seguimiento_Pasos');
  const participantesArr = readSheet('Participantes');

  // 2. Índices auxiliares
  const pasosByAct = {};
  pasosArr.forEach(p => {
    const id = p.actividad_id;
    if (!pasosByAct[id]) pasosByAct[id] = [];
    pasosByAct[id].push(p);
  });
  // Ordenar pasos por campo 'orden'
  Object.keys(pasosByAct).forEach(id => {
    pasosByAct[id].sort((a, b) => (Number(a.orden) || 0) - (Number(b.orden) || 0));
  });

  const segByEje = {};
  seguimientoArr.forEach(s => {
    if (!segByEje[s.ejecucion_id]) segByEje[s.ejecucion_id] = {};
    segByEje[s.ejecucion_id][s.paso_id] = s;
  });

  const particByAct = {};
  participantesArr.forEach(p => {
    if (!particByAct[p.actividad_id]) particByAct[p.actividad_id] = [];
    particByAct[p.actividad_id].push(p);
  });

  const ejeByAct = {};
  ejecucionesArr.forEach(e => {
    if (!ejeByAct[e.actividad_id]) ejeByAct[e.actividad_id] = [];
    ejeByAct[e.actividad_id].push(e);
  });
  // Ordenar ejecuciones por fecha de asignación descendente (más reciente primero)
  Object.keys(ejeByAct).forEach(id => {
    ejeByAct[id].sort((a, b) => {
      const da = a.fecha_asignacion || '0000-00-00';
      const db = b.fecha_asignacion || '0000-00-00';
      return db.localeCompare(da);
    });
  });

  // 3. Construir objetos de salida
  const output = [];
  const STATUS_ORDER  = { 'En curso': 0, 'No iniciada': 1, 'Bloqueada': 2, 'Culminada': 3 };
  const PRIORITY_ORDER = { 'Alta': 0, 'Media': 1, 'Baja': 2 };

  actividadesArr.forEach(act => {
    // Solo actividades activas
    if (!isActive(act.activo)) return;

    const actId = act.actividad_id;

    // Ejecución más reciente
    const ejecList = ejeByAct[actId] || [];
    const eje = ejecList[0] || null;

    // Responsable
    const respObj = integrantes[act.responsable_id] || {};
    const responsibleName = respObj.nombre || act.responsable_id || '';

    // Participantes (excluye al responsable)
    const participantsNames = (particByAct[actId] || [])
      .filter(p => p.rol !== 'Responsable')
      .map(p => (integrantes[p.integrante_id] || {}).nombre || p.integrante_id);

    // Pasos con seguimiento
    const pasosDeAct = (pasosByAct[actId] || []).filter(p => isActive(p.activo));

    const segEje = eje ? (segByEje[eje.ejecucion_id] || {}) : {};
    const stepsBuilt = pasosDeAct.map(paso => {
      const pasoId = paso.paso_id;
      const seg = segEje[pasoId] || {};
      const pesoVal = parsePercent(paso.peso || seg.peso_paso);
      const peso = Math.round(pesoVal * 100); // 0.05 o '5%' → 5
      const rawEstado = String(seg.estado_paso || '').trim();
      const rawPct = parsePercent(seg.porcentaje_paso);

      // Normalizar estado según catálogo
      let estadoPaso = 'Pendiente';
      const estadoLower = rawEstado.toLowerCase();
      if (estadoLower.includes('completa') || estadoLower === 'culminado' || estadoLower === 'listo') {
        estadoPaso = 'Completado';
      } else if (estadoLower.includes('progres') || estadoLower.includes('curso') || estadoLower.includes('ejecuci')) {
        estadoPaso = 'En progreso';
      } else if (estadoLower.includes('bloque')) {
        estadoPaso = 'Bloqueado';
      } else if (estadoLower.includes('pend')) {
        estadoPaso = 'Pendiente';
      }

      // Porcentaje efectivo según el estado real
      let porcentaje = 0;
      if (estadoPaso === 'Completado') {
        porcentaje = 1;
      } else if (estadoPaso === 'Pendiente') {
        porcentaje = 0; // Un paso pendiente NUNCA puede sumar avance
      } else if (estadoPaso === 'Bloqueado') {
        porcentaje = (rawPct > 0 && rawPct < 1) ? rawPct : 0;
      } else if (estadoPaso === 'En progreso') {
        porcentaje = (rawPct > 0 && rawPct < 1) ? rawPct : (rawPct === 0 ? 0.15 : 0.5);
      }

      return {
        id:         pasoId,
        desc:       paso.nombre_paso || '',
        weight:     peso,
        estado:     estadoPaso,
        porcentaje: porcentaje
      };
    });

    // Calcular avance ponderado real según pasos
    let flowProgress = 0;
    if (stepsBuilt.length > 0) {
      const sumaPesos = stepsBuilt.reduce((s, p) => s + p.weight, 0);
      if (sumaPesos > 0) {
        flowProgress = Math.round(
          stepsBuilt.reduce((s, p) => s + p.porcentaje * p.weight, 0) / sumaPesos * 100
        );
      }
    } else if (eje) {
      flowProgress = Math.round((Number(eje.avance_calculado) || 0) * 100);
    }

    // Determinar estado de la actividad: respetar el estado oficial de la hoja
    const rawStatus = (eje ? eje.estado : 'No iniciada') || 'No iniciada';
    let activityStatus = rawStatus;
    if (stepsBuilt.length > 0) {
      const allCompleted = stepsBuilt.every(s => s.estado === 'Completado');
      const anyBlocked = stepsBuilt.some(s => s.estado === 'Bloqueado');
      const allPending = stepsBuilt.every(s => s.estado === 'Pendiente');

      if (allCompleted && flowProgress === 100) {
        activityStatus = 'Culminada';
      } else if (anyBlocked || rawStatus.toLowerCase() === 'bloqueada') {
        activityStatus = 'Bloqueada';
      } else if (['En curso', 'Culminada', 'No iniciada', 'Bloqueada'].includes(rawStatus)) {
        activityStatus = rawStatus;
      } else if (flowProgress > 0 && flowProgress < 100) {
        activityStatus = 'En curso';
      } else if (allPending) {
        activityStatus = 'No iniciada';
      }
    }

    output.push({
      id:           actId,
      ejecucionId:  eje ? eje.ejecucion_id : null,
      activity:     act.nombre || '',
      description:  act.descripcion || '',
      category:     act.categoria || '',
      periodicity:  act.periodicidad || '',
      priority:     act.prioridad || '',
      responsible:  responsibleName,
      participants: participantsNames,
      periodo:      eje ? eje.periodo : null,
      assigned:     eje ? eje.fecha_asignacion : null,
      due:          eje ? eje.fecha_prevista : null,
      completed:    (activityStatus === 'Culminada') ? (eje ? eje.fecha_culminacion : null) : null,
      status:       activityStatus,
      flowProgress: flowProgress,
      result:       eje ? eje.resultado : null,
      nextAction:   eje ? eje.proxima_accion : null,
      blockers:     eje ? eje.bloqueos : null,
      evidence:     eje ? eje.evidencia : null,
      steps:        stepsBuilt,
      executions:   ejecList.map(e => ({
        id:        e.ejecucion_id,
        periodo:   e.periodo,
        status:    e.estado,
        assigned:  e.fecha_asignacion,
        due:       e.fecha_prevista,
        completed: e.fecha_culminacion
      }))
    });
  });

  // Ordenar: En curso > No iniciada > Bloqueada > Culminada, luego Alta > Media > Baja
  output.sort((a, b) => {
    const sd = (STATUS_ORDER[a.status] || 9) - (STATUS_ORDER[b.status] || 9);
    if (sd !== 0) return sd;
    return (PRIORITY_ORDER[a.priority] || 9) - (PRIORITY_ORDER[b.priority] || 9);
  });

  return output;
}

// ── Entry point HTTP ──────────────────────────────────────────────────────────

function doGet(e) {
  try {
    const data = buildActivitiesData();
    const json = JSON.stringify(data);
    return ContentService
      .createTextOutput(json)
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    const errorPayload = JSON.stringify({ error: err.message, stack: err.stack });
    return ContentService
      .createTextOutput(errorPayload)
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── Test local (ejecutar desde el editor de Apps Script) ─────────────────────

function testBuild() {
  const result = buildActivitiesData();
  Logger.log('Total actividades: ' + result.length);
  result.forEach(r => Logger.log(r.id + ' — ' + r.activity + ' [' + r.status + '] ' + r.flowProgress + '%'));
}
