"""
generate_data.py
----------------
Lee Modelo_Escalable_Registro_Actividades.xlsx y genera
frontend/public/activities-data.json listo para ser consumido
por el dashboard React.

Uso:
    python generate_data.py

El script debe ejecutarse cada vez que se actualice el Excel.
"""

import json
import os
from datetime import datetime, date
import openpyxl

# ── Configuración ────────────────────────────────────────────────────────────
EXCEL_FILE = "Modelo_Escalable_Registro_Actividades.xlsx"
OUTPUT_FILE = os.path.join("frontend", "public", "activities-data.json")

# ── Helpers ──────────────────────────────────────────────────────────────────
def serialize(value):
    """Convierte tipos de openpyxl a tipos JSON-serializables."""
    if isinstance(value, (datetime, date)):
        return value.strftime("%Y-%m-%d")
    return value


def read_sheet(wb, sheet_name):
    """Lee una hoja como lista de dicts usando la primera fila como cabecera."""
    ws = wb[sheet_name]
    rows = list(ws.iter_rows(values_only=True))
    if not rows:
        return []
    headers = [str(h).strip() if h is not None else f"col_{i}" for i, h in enumerate(rows[0])]
    result = []
    for row in rows[1:]:
        if all(v is None for v in row):
            continue  # saltar filas vacías
        record = {headers[i]: serialize(v) for i, v in enumerate(row)}
        result.append(record)
    return result


# ── Carga de tablas ──────────────────────────────────────────────────────────
print(f"Leyendo '{EXCEL_FILE}'...")
wb = openpyxl.load_workbook(EXCEL_FILE, read_only=True, data_only=True)

integrantes     = {r["integrante_id"]: r for r in read_sheet(wb, "Integrantes")}
actividades     = {r["actividad_id"]:  r for r in read_sheet(wb, "Actividades")}
ejecuciones_raw = read_sheet(wb, "Ejecuciones")
pasos_raw       = read_sheet(wb, "Pasos")
seguimiento_raw = read_sheet(wb, "Seguimiento_Pasos")
participantes_raw = read_sheet(wb, "Participantes")

# ── Índices auxiliares ───────────────────────────────────────────────────────
# Pasos por actividad
pasos_by_act = {}
for p in pasos_raw:
    act_id = p["actividad_id"]
    pasos_by_act.setdefault(act_id, []).append(p)
# Ordenar por campo 'orden'
for act_id in pasos_by_act:
    pasos_by_act[act_id].sort(key=lambda x: int(x["orden"]) if x["orden"] is not None else 0)

# Seguimiento por ejecución
seg_by_eje = {}
for s in seguimiento_raw:
    eje_id = s["ejecucion_id"]
    seg_by_eje.setdefault(eje_id, {})[s["paso_id"]] = s

# Participantes por actividad
partic_by_act = {}
for p in participantes_raw:
    act_id = p["actividad_id"]
    partic_by_act.setdefault(act_id, []).append(p)

# Ejecuciones agrupadas por actividad (ordenadas por fecha de asignación desc)
eje_by_act = {}
for e in ejecuciones_raw:
    act_id = e["actividad_id"]
    eje_by_act.setdefault(act_id, []).append(e)
for act_id in eje_by_act:
    eje_by_act[act_id].sort(
        key=lambda x: x.get("fecha_asignacion") or "0000-00-00",
        reverse=True
    )

# ── Construcción de objetos finales ──────────────────────────────────────────
output = []

for act_id, act in actividades.items():
    # Solo actividades activas
    if (act.get("activo") or "").strip().lower() not in ("sí", "si", "s"):
        continue

    # Ejecución más reciente
    ejecuciones_de_act = eje_by_act.get(act_id, [])
    eje = ejecuciones_de_act[0] if ejecuciones_de_act else None

    # Responsable principal (de la tabla Actividades)
    responsable_obj = integrantes.get(act.get("responsable_id"), {})
    responsable_name = responsable_obj.get("nombre", act.get("responsable_id", ""))

    # Participantes (excluye al responsable principal)
    participantes_names = []
    for p in partic_by_act.get(act_id, []):
        int_obj = integrantes.get(p.get("integrante_id"), {})
        nombre = int_obj.get("nombre", p.get("integrante_id", ""))
        if p.get("rol") != "Responsable":
            participantes_names.append(nombre)

    # Pasos con su seguimiento
    pasos_de_act = pasos_by_act.get(act_id, [])
    steps_built = []
    seg_eje = seg_by_eje.get(eje["ejecucion_id"], {}) if eje else {}

    for paso in pasos_de_act:
        if (paso.get("activo") or "").strip().lower() not in ("sí", "si", "s"):
            continue
        paso_id = paso["paso_id"]
        seg = seg_eje.get(paso_id, {})
        peso = float(paso.get("peso") or 0)
        raw_estado = (seg.get("estado_paso") or "Pendiente").strip() if seg else "Pendiente"
        raw_pct = float(seg.get("porcentaje_paso") or 0) if seg else 0

        # Normalizar estado
        lower = raw_estado.lower()
        if "completa" in lower or lower in ("culminado", "listo"):
            estado_paso = "Completado"
        elif "progres" in lower or "curso" in lower or "ejecuci" in lower:
            estado_paso = "En progreso"
        elif "bloque" in lower:
            estado_paso = "Bloqueado"
        else:
            estado_paso = "Pendiente"

        # Porcentaje efectivo
        if estado_paso == "Completado":
            porcentaje = 1.0
        elif estado_paso == "Pendiente":
            porcentaje = 0.0
        elif estado_paso == "Bloqueado":
            porcentaje = raw_pct if 0 < raw_pct < 1 else 0.0
        elif estado_paso == "En progreso":
            porcentaje = raw_pct if 0 < raw_pct < 1 else 0.5
        else:
            porcentaje = 0.0

        steps_built.append({
            "id":         paso_id,
            "desc":       paso.get("nombre_paso", ""),
            "weight":     round(peso * 100),   # convertir 0.05 → 5 (%)
            "estado":     estado_paso,
            "porcentaje": porcentaje            # 0.0 – 1.0
        })

    # Avance calculado: Σ(porcentaje × peso) / Σ(pesos)  → 0-100
    if steps_built:
        suma_pesos = sum(s["weight"] for s in steps_built)
        flow_progress = round(
            sum(s["porcentaje"] * s["weight"] for s in steps_built) / suma_pesos * 100
        ) if suma_pesos > 0 else 0
    else:
        flow_progress = int((eje.get("avance_calculado") or 0) * 100) if eje else 0

    # Estado de la actividad coherente con sus pasos
    activity_status = eje.get("estado", "No iniciada") if eje else "No iniciada"
    if steps_built:
        all_completed = all(s["estado"] == "Completado" for s in steps_built)
        any_blocked = any(s["estado"] == "Bloqueado" for s in steps_built)
        all_pending = all(s["estado"] == "Pendiente" for s in steps_built)

        if all_completed or flow_progress == 100:
            activity_status = "Culminada"
        elif any_blocked or (eje and eje.get("bloqueos")):
            activity_status = "Bloqueada"
        elif 0 < flow_progress < 100:
            activity_status = "En curso"
        elif all_pending:
            activity_status = "No iniciada"

    record = {
        "id":           act_id,
        "ejecucionId":  eje["ejecucion_id"] if eje else None,
        "activity":     act.get("nombre", ""),
        "description":  act.get("descripcion", ""),
        "category":     act.get("categoria", ""),
        "periodicity":  act.get("periodicidad", ""),
        "priority":     act.get("prioridad", ""),
        "responsible":  responsable_name,
        "participants": participantes_names,
        # Fechas de la ejecución más reciente
        "periodo":      eje.get("periodo") if eje else None,
        "assigned":     eje.get("fecha_asignacion") if eje else None,
        "due":          eje.get("fecha_prevista") if eje else None,
        "completed":    eje.get("fecha_culminacion") if (activity_status == "Culminada" and eje) else None,
        "status":       activity_status,
        "flowProgress": flow_progress,
        # Narrativa de la ejecución
        "result":       eje.get("resultado") if eje else None,
        "nextAction":   eje.get("proxima_accion") if eje else None,
        "blockers":     eje.get("bloqueos") if eje else None,
        "evidence":     eje.get("evidencia") if eje else None,
        # Pasos del flujo
        "steps":        steps_built,
        # Histórico de ejecuciones (para futuro uso)
        "executions":   [
            {
                "id":        e["ejecucion_id"],
                "periodo":   e.get("periodo"),
                "status":    e.get("estado"),
                "assigned":  e.get("fecha_asignacion"),
                "due":       e.get("fecha_prevista"),
                "completed": e.get("fecha_culminacion"),
            }
            for e in ejecuciones_de_act
        ]
    }
    output.append(record)

# Ordenar: primero por estado (En curso > No iniciada > Bloqueada > Culminada), luego por prioridad
STATUS_ORDER = {"En curso": 0, "No iniciada": 1, "Bloqueada": 2, "Culminada": 3}
PRIORITY_ORDER = {"Alta": 0, "Media": 1, "Baja": 2}
output.sort(key=lambda x: (
    STATUS_ORDER.get(x["status"], 9),
    PRIORITY_ORDER.get(x["priority"], 9)
))

# ── Escritura del JSON ───────────────────────────────────────────────────────
os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"[OK] Generados {len(output)} registros en '{OUTPUT_FILE}'")
for r in output:
    print(f"  · {r['id']} — {r['activity'][:55]}  [{r['status']}] {r['flowProgress']}%")
