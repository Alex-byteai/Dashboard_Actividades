# Esquema del dashboard de actividades

## 1. Fuente revisada

Archivo: `Registro_y_Seguimiento_Actividades.xlsx`

Hojas encontradas:

- `Actividades_Joselyn_L`: registro principal de actividades. Tiene 16 campos y actualmente 1 actividad cargada.
- `Flujo de trabajo`: detalle del flujo de una actividad. Tiene 12 pasos, porcentaje de cumplimiento por paso y porcentaje ponderado.

La actividad de ejemplo es `Actualizacion mensual de publicaciones cientificas`.

## 2. Modelo de datos recomendado

### Tabla `Actividades`

Una fila por actividad o entregable.

| Campo original | Campo normalizado | Tipo | Uso |
|---|---|---|---|
| Tarea o entregable | `actividad` | Texto | Identificador visible |
| Descripcion de la actividad | `descripcion` | Texto largo | Detalle |
| Categoria de la actividad | `categoria` | Categoria | Segmentacion |
| Periodicidad | `periodicidad` | Categoria | Mensual, semanal, etc. |
| Responsable | `responsable` | Persona | Analisis por miembro |
| Participantes | `participantes` | Texto/lista | Colaboradores |
| Fecha de asignacion | `fecha_asignacion` | Fecha | Inicio |
| Fecha prevista de entrega | `fecha_prevista` | Fecha | Compromiso |
| Prioridad | `prioridad` | Categoria | Alta, media, baja |
| Estado | `estado` | Categoria | Pendiente, en curso, culminada, bloqueada |
| Porcentaje de avance | `avance_reportado` | Numero 0-100 | Avance declarado |
| Avance realizado o principal resultado alcanzado | `resultado` | Texto largo | Ultimo resultado |
| Proxima accion | `proxima_accion` | Texto largo | Siguiente paso |
| Bloqueos, dificultades o requerimientos | `bloqueos` | Texto largo | Riesgos y dependencias |
| Evidencia/Producto | `evidencia` | Texto largo o enlace | Verificacion |
| Fecha de culminacion real | `fecha_culminacion` | Fecha | Cierre real |

### Tabla `PasosFlujo`

Una fila por paso, no una columna por paso. Esta transformacion permite graficos, filtros y calculos sin depender de que existan exactamente 12 pasos.

| Campo | Descripcion |
|---|---|
| `actividad` | Relacion con `Actividades.actividad` |
| `paso_numero` | Numero secuencial del paso |
| `paso_descripcion` | Texto del paso |
| `cumplimiento_paso` | Porcentaje de cumplimiento |
| `peso_paso` | Ponderacion del paso |
| `aporte_ponderado` | `cumplimiento_paso * peso_paso` |

### Tabla derivada `Calendario`

Calendario diario o mensual para analizar vencimientos, entregas y carga de trabajo por periodo.

## 3. Calculos principales

- **Avance ponderado del flujo**: suma de `aporte_ponderado` dividida entre suma de `peso_paso`.
- **Avance visible**: usar `avance_reportado` cuando exista; si esta vacio, mostrar `Sin reportar`, no 0%.
- **Dias restantes**: `fecha_prevista - fecha_actual`.
- **Dias de desviacion**: `fecha_culminacion - fecha_prevista`.
- **Cumplimiento de plazo**: `Cumplida en plazo`, `Culminada con retraso`, `Vencida` o `En plazo`.
- **Actividades bloqueadas**: actividades con estado bloqueado o con `bloqueos` no vacio.
- **Carga por responsable**: conteo de actividades asignadas y suma de pesos, cuando se requiera medir esfuerzo.

## 4. Vista principal: Resumen ejecutivo

### Filtros superiores

- Periodo de asignacion o entrega
- Responsable
- Categoria
- Estado
- Prioridad
- Periodicidad

### Tarjetas KPI

1. Total de actividades
2. Actividades culminadas
3. Actividades en curso
4. Actividades vencidas
5. Actividades bloqueadas
6. Avance promedio reportado
7. Avance promedio ponderado del flujo

Los KPI de avance deben incluir un indicador de calidad de dato: cantidad de actividades con avance reportado y cantidad calculada desde el flujo.

### Visualizaciones

- **Distribucion por estado**: barras o dona.
- **Actividades por responsable**: barras apiladas por estado.
- **Avance por actividad**: barras horizontales, comparando avance reportado contra avance ponderado.
- **Prioridad y vencimiento**: matriz con prioridad, estado y dias de desviacion.
- **Evolucion temporal**: actividades asignadas, previstas y culminadas por mes.

## 5. Vista por miembro

Selector de `responsable` como elemento principal.

Contenido:

- Total asignado, culminado, en curso y bloqueado.
- Avance promedio del miembro.
- Lista de actividades con prioridad, fecha prevista, estado y proxima accion.
- Calendario de entregas.
- Distribucion por categoria.
- Indicador de actividades sin avance reportado.

`Participantes` debe conservarse como colaboracion secundaria; no debe duplicar actividades en los KPI del responsable principal.

## 6. Vista de detalle de actividad

Al seleccionar una actividad, mostrar:

- Descripcion, responsable, participantes, prioridad y periodicidad.
- Fecha de asignacion, fecha prevista y fecha de culminacion real.
- Estado y avance reportado.
- Resultado alcanzado, proxima accion y bloqueos.
- Evidencia o producto.
- Flujo de pasos como una secuencia horizontal o tabla con porcentaje y peso.
- Avance ponderado acumulado del flujo.

## 7. Alertas operativas

- **Vencida**: fecha prevista anterior a hoy y actividad no culminada.
- **Por vencer**: fecha prevista dentro de los proximos 7 dias.
- **Bloqueada**: estado bloqueado o bloqueo informado.
- **Sin avance**: actividad activa sin porcentaje de avance.
- **Flujo inconsistente**: pesos que no suman 100 o cumplimiento fuera de 0-100.
- **Fecha inconsistente**: culminacion real anterior a asignacion o posterior a la fecha prevista.

## 8. Reglas de calidad detectadas en el archivo actual

- `Porcentaje de avance` esta vacio en la actividad de ejemplo.
- El flujo tiene avance por paso al 100% y ponderaciones que suman 100%, por lo que puede calcularse un avance ponderado independiente.
- Las fechas estan almacenadas como seriales de Excel y deben convertirse a fecha antes de graficar.
- Solo hay un responsable y una actividad cargada actualmente; el dashboard mostrara su verdadero potencial cuando se agreguen mas registros.
- La hoja principal tiene un nombre especifico de persona. Para escalar, conviene consolidar todas las actividades en una tabla unica con el campo `responsable`.

## 9. Estructura visual sugerida

```text
[Logo / titulo] [Periodo] [Responsable] [Estado] [Categoria] [Prioridad]

[Total] [Culminadas] [En curso] [Vencidas] [Bloqueadas] [Avance]

[Estado por responsable]       [Avance por actividad]

[Calendario de entregas]       [Prioridad vs. vencimiento]

[Tabla de actividades: responsable | actividad | estado | avance | entrega | alerta]
```

## 10. Orden recomendado de implementacion

1. Consolidar las hojas de cada miembro en `Actividades`.
2. Convertir `Flujo de trabajo` de formato ancho a formato largo.
3. Estandarizar estados, prioridades y nombres de responsables.
4. Convertir fechas y porcentajes a tipos numericos/fecha.
5. Crear calculos de avance, vencimiento y calidad de dato.
6. Construir resumen ejecutivo, vista por miembro y detalle de actividad.
7. Validar los KPI contra el registro fuente con varios miembros y actividades.
