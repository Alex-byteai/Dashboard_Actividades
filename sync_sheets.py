"""
Sincronizador Google Sheets -> Dashboard Actividades IDIC
===========================================================
Consume directamente la Google Sheets API usando la Service Account (google_key.json).
Sin dependencias de Apps Script, sin bloqueos de inicio de sesión de Google Workspace.

Uso:
    python sync_sheets.py
"""

import json
import os
import sys
import requests
from google.oauth2 import service_account
from google.auth.transport.requests import Request

# Configuración
SHEET_ID = "1YiIZaoY6Xf-tg5d-ZnrS0Uo0JXM9fqGQcbo7Ttunz1Y"
KEY_FILE = os.path.join(os.path.dirname(__file__), "google_key.json")
OUTPUT_JSON = os.path.join(os.path.dirname(__file__), "frontend", "public", "activities-data.json")

STATUS_ORDER = {"En curso": 1, "No iniciada": 2, "Bloqueada": 3, "Culminada": 4}
PRIORITY_ORDER = {"Alta": 1, "Media": 2, "Baja": 3}


def parse_pct(val):
    """Parsea porcentajes numéricos o strings tipo '15%', '100%', '0.15'."""
    if val is None or val == "":
        return 0.0
    if isinstance(val, (int, float)):
        return float(val) if val <= 1.0 else float(val) / 100.0
    s = str(val).replace("%", "").strip().replace(",", ".")
    try:
        n = float(s)
        return n / 100.0 if n > 1.0 else n
    except:
        return 0.0


def fetch_sheet_table(service_headers, tab_name):
    url = f"https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/{tab_name}!A1:Z500"
    res = requests.get(url, headers=service_headers)
    if not res.ok:
        raise RuntimeError(f"Error al leer hoja '{tab_name}': {res.status_code} - {res.text}")
    rows = res.json().get("values", [])
    if not rows:
        return []
    header = [str(c).strip() for c in rows[0]]
    records = []
    for r in rows[1:]:
        if not any(r):
            continue
        d = {}
        for idx, h in enumerate(header):
            d[h] = r[idx] if idx < len(r) else None
        records.append(d)
    return records


def build_activities():
    if not os.path.exists(KEY_FILE):
        raise FileNotFoundError(f"No se encontró el archivo de credenciales: {KEY_FILE}")

    SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]
    creds = service_account.Credentials.from_service_account_file(KEY_FILE, scopes=SCOPES)
    creds.refresh(Request())
    headers = {"Authorization": f"Bearer {creds.token}"}

    print("Descargando tablas desde Google Sheets...")
    integrantes = {r.get("integrante_id"): r for r in fetch_sheet_table(headers, "Integrantes")}
    actividades = {r.get("actividad_id"): r for r in fetch_sheet_table(headers, "Actividades")}
    ejecuciones_raw = fetch_sheet_table(headers, "Ejecuciones")
    pasos_raw = fetch_sheet_table(headers, "Pasos")
    seguimiento_raw = fetch_sheet_table(headers, "Seguimiento_Pasos")
    participantes_raw = fetch_sheet_table(headers, "Participantes")

    # Mapeos auxiliares
    seg_by_eje = {}
    for s in seguimiento_raw:
        eje_id = s.get("ejecucion_id")
        paso_id = s.get("paso_id")
        if eje_id and paso_id:
            seg_by_eje.setdefault(eje_id, {})[paso_id] = s

    pasos_by_act = {}
    for p in pasos_raw:
        act_id = p.get("actividad_id")
        if act_id:
            pasos_by_act.setdefault(act_id, []).append(p)

    partic_by_act = {}
    for p in participantes_raw:
        act_id = p.get("actividad_id")
        if act_id:
            partic_by_act.setdefault(act_id, []).append(p)

    eje_by_act = {}
    for e in ejecuciones_raw:
        act_id = e.get("actividad_id")
        if act_id:
            eje_by_act.setdefault(act_id, []).append(e)

    for act_id in eje_by_act:
        eje_by_act[act_id].sort(key=lambda x: str(x.get("fecha_asignacion") or "0000"), reverse=True)

    output = []

    for act_id, act in actividades.items():
        activo_val = str(act.get("activo") or "").strip().lower()
        if activo_val not in ("sí", "si", "s", "true", "1"):
            continue

        ejecuciones_act = eje_by_act.get(act_id, [])
        eje = ejecuciones_act[0] if ejecuciones_act else None

        # Responsable
        resp_obj = integrantes.get(act.get("responsable_id"), {})
        responsable_name = resp_obj.get("nombre", act.get("responsable_id", "Sin asignar"))

        # Participantes
        part_names = []
        for p in partic_by_act.get(act_id, []):
            if p.get("rol") != "Responsable":
                int_obj = integrantes.get(p.get("integrante_id"), {})
                part_names.append(int_obj.get("nombre", p.get("integrante_id")))

        # Pasos
        pasos_act = pasos_by_act.get(act_id, [])
        steps_built = []
        seg_eje = seg_by_eje.get(eje.get("ejecucion_id"), {}) if eje else {}

        for paso in pasos_act:
            p_activo = str(paso.get("activo") or "").strip().lower()
            if p_activo not in ("sí", "si", "s", "true", "1"):
                continue

            paso_id = paso.get("paso_id")
            seg = seg_eje.get(paso_id, {})

            peso_raw = paso.get("peso") or seg.get("peso_paso") or 0
            peso = round(parse_pct(peso_raw) * 100)

            raw_estado = (seg.get("estado_paso") or "Pendiente").strip()
            raw_pct = parse_pct(seg.get("porcentaje_paso"))

            # Normalizar estado
            lower = raw_estado.lower()
            if "completa" in lower or lower in ("culminado", "listo"):
                estado_paso = "Completado"
                porcentaje = 1.0
            elif "progres" in lower or "curso" in lower or "ejecuci" in lower:
                estado_paso = "En progreso"
                porcentaje = raw_pct if 0.0 < raw_pct < 1.0 else 0.5
            elif "bloque" in lower:
                estado_paso = "Bloqueado"
                porcentaje = raw_pct if 0.0 < raw_pct < 1.0 else 0.0
            else:
                estado_paso = "Pendiente"
                porcentaje = 0.0

            steps_built.append({
                "id": paso_id,
                "desc": paso.get("nombre_paso", ""),
                "weight": peso,
                "estado": estado_paso,
                "porcentaje": porcentaje
            })

        # Avance ponderado real
        if steps_built:
            suma_pesos = sum(s["weight"] for s in steps_built)
            if suma_pesos > 0:
                flow_progress = round(sum(s["porcentaje"] * s["weight"] for s in steps_built) / suma_pesos * 100)
            else:
                flow_progress = 0
        else:
            flow_progress = round(parse_pct(eje.get("avance_calculado")) * 100) if eje else 0

        # Estado de la actividad: respetar el estado oficial registrado en la hoja
        raw_status = (eje.get("estado") or "No iniciada").strip() if eje else "No iniciada"

        if steps_built:
            all_completed = all(s["estado"] == "Completado" for s in steps_built)
            any_blocked = any(s["estado"] == "Bloqueado" for s in steps_built)
            all_pending = all(s["estado"] == "Pendiente" for s in steps_built)

            if all_completed and flow_progress == 100:
                activity_status = "Culminada"
            elif any_blocked or raw_status.lower() == "bloqueada":
                activity_status = "Bloqueada"
            elif raw_status in ("En curso", "Culminada", "No iniciada", "Bloqueada"):
                # Respetar el estado oficial de la ejecución
                # Si en la hoja dice "En curso", se mantiene "En curso"
                activity_status = raw_status
            elif 0 < flow_progress < 100:
                activity_status = "En curso"
            elif all_pending:
                activity_status = "No iniciada"
            else:
                activity_status = raw_status
        else:
            activity_status = raw_status

        output.append({
            "id": act_id,
            "ejecucionId": eje.get("ejecucion_id") if eje else None,
            "activity": act.get("nombre", ""),
            "description": act.get("descripcion", ""),
            "category": act.get("categoria", ""),
            "periodicity": act.get("periodicidad", ""),
            "priority": act.get("prioridad", ""),
            "responsible": responsable_name,
            "participants": part_names,
            "periodo": eje.get("periodo") if eje else None,
            "assigned": eje.get("fecha_asignacion") if eje else None,
            "due": eje.get("fecha_prevista") if eje else None,
            "completed": eje.get("fecha_culminacion") if (activity_status == "Culminada" and eje) else None,
            "status": activity_status,
            "flowProgress": flow_progress,
            "result": eje.get("resultado") if eje else None,
            "nextAction": eje.get("proxima_accion") if eje else None,
            "blockers": eje.get("bloqueos") if eje else None,
            "evidence": eje.get("evidencia") if eje else None,
            "steps": steps_built,
            "executions": [
                {
                    "id": e.get("ejecucion_id"),
                    "periodo": e.get("periodo"),
                    "status": e.get("estado"),
                    "assigned": e.get("fecha_asignacion"),
                    "due": e.get("fecha_prevista"),
                    "completed": e.get("fecha_culminacion"),
                }
                for e in ejecuciones_act
            ]
        })

    # Ordenar
    output.sort(key=lambda x: (
        STATUS_ORDER.get(x["status"], 9),
        PRIORITY_ORDER.get(x["priority"], 9)
    ))

    # Extraer todos los integrantes con nombre y cargo
    todos_integrantes = []
    nombres_vistos = set()
    for intg in integrantes.values():
        nombre = intg.get("nombre")
        if nombre and nombre not in nombres_vistos:
            nombres_vistos.add(nombre)
            todos_integrantes.append({
                "nombre": nombre,
                "cargo": intg.get("cargo", "")
            })
    todos_integrantes.sort(key=lambda x: x["nombre"])

    return {
        "activities": output,
        "integrantes": todos_integrantes
    }


def main():
    print(f"Conectando a Google Sheet ID: {SHEET_ID}...")
    activities = build_activities()

    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(activities, f, ensure_ascii=False, indent=2)

    print(f"\n[ÉXITO] Sincronizadas {len(activities['activities'])} actividades y {len(activities['integrantes'])} integrantes.")
    for a in activities['activities']:
        steps_comp = sum(1 for s in a["steps"] if s["estado"] == "Completado")
        steps_prog = sum(1 for s in a["steps"] if s["estado"] == "En progreso")
        steps_pend = sum(1 for s in a["steps"] if s["estado"] == "Pendiente")
        print(f"  • {a['id']} | {a['activity'][:40]}... [{a['status']}] Avance: {a['flowProgress']}% (Etapas: {steps_comp} comp, {steps_prog} prog, {steps_pend} pend)")


if __name__ == "__main__":
    main()
