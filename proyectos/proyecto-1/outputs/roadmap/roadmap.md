---
proyecto: proyecto-1
proyecto_id: PRY-001
version: 1
status: DRAFT
created: 2026-08-12
horizon: 4 meses (12/08/2026 – 12/12/2026)
source: outputs/vision/vision.md
source_version: 1
---

# Roadmap — Plataforma de turnos

## Resumen ejecutivo

Cuatro meses hasta el 12/12/2026, con la campaña de publicidad como fecha dura. El orden lo
manda una dependencia externa: **el alta de la API de WhatsApp puede tomar semanas y no
depende del equipo**, así que EP001 arranca el día uno aunque su desarrollo venga después.

Q1 cierra el circuito que hoy pierde turnos: agenda centralizada más notificación. Q2 suma la
autogestión del paciente y la recuperación de franjas, que es lo que absorbe el volumen de la
campaña.

## Tabla del roadmap

| Épica | Objetivo | Capacidad | Prioridad | Usuarios | Trimestre |
|---|---|---|---|---|---|
| EP001 | Habilitar el canal de notificación | BC02 | Must Have | U03 | Q1 |
| EP002 | Centralizar la agenda de las 3 sedes | BC01 | Must Have | U01, U02 | Q1 |
| EP003 | Avisar al paciente cada cambio | BC02 | Must Have | U03 | Q1 |
| EP004 | Trazar cada movimiento de turno | BC05 | Must Have | U01, U02 | Q1 |
| EP005 | Que el paciente reserve solo | BC03 | Should Have | U03 | Q2 |
| EP006 | Recuperar las franjas liberadas | BC04 | Should Have | U01, U03 | Q2 |

## Épicas

### EP001 — Habilitación del canal WhatsApp

**Objetivo** · tener la cuenta de WhatsApp Business operativa y las plantillas aprobadas
**Capacidades asociadas** · BC02
**Objetivos estratégicos** · OE-001
**Usuarios impactados** · U03
**Prioridad** · Must Have
**Dependencias** · DE-001. Externa a la fábrica: depende de Meta y del cliente
**Riesgos** · RE-001
**Valor de negocio observable** · sin esto no hay notificación, y sin notificación el proyecto
no resuelve el problema que lo justifica

### EP002 — Agenda centralizada

**Objetivo** · una agenda única por profesional, especialidad y sede, con disponibilidad real
**Capacidades asociadas** · BC01
**Objetivos estratégicos** · OE-001, OE-002
**Usuarios impactados** · U01, U02
**Prioridad** · Must Have
**Dependencias** · ninguna
**Riesgos** · la duración de consulta variable por profesional condiciona el cálculo de huecos
**Valor de negocio observable** · reemplaza la planilla de Drive como fuente de verdad

### EP003 — Notificación de cambios

**Objetivo** · que todo cambio o cancelación le llegue al paciente por WhatsApp
**Capacidades asociadas** · BC02
**Objetivos estratégicos** · OE-001
**Usuarios impactados** · U03
**Prioridad** · Must Have
**Dependencias** · EP001 y EP002
**Riesgos** · RE-002 (qué puede viajar en el mensaje), RE-003 (que tampoco lo lea)
**Valor de negocio observable** · es la épica que mueve KPI-001

### EP004 — Trazabilidad de turnos

**Objetivo** · estados del turno y registro de quién modificó qué
**Capacidades asociadas** · BC05
**Objetivos estratégicos** · OE-003
**Usuarios impactados** · U01, U02
**Prioridad** · Must Have
**Dependencias** · EP002
**Riesgos** · ninguno propio
**Valor de negocio observable** · el profesional puede marcar atendido, ausente o cancelado, y
queda historia de cada movimiento

### EP005 — Reserva por el paciente

**Objetivo** · autogestión online por especialidad, sin registro previo
**Capacidades asociadas** · BC03
**Objetivos estratégicos** · OE-002
**Usuarios impactados** · U03
**Prioridad** · Should Have
**Dependencias** · EP002 y EP003
**Riesgos** · RE-004, pacientes homónimos sin identificador único
**Valor de negocio observable** · descarga a administración y absorbe el volumen de la campaña

### EP006 — Lista de espera

**Objetivo** · reasignar automáticamente una franja que se libera
**Capacidades asociadas** · BC04
**Objetivos estratégicos** · OE-001
**Usuarios impactados** · U01, U03
**Prioridad** · Should Have
**Dependencias** · EP003 y EP005
**Riesgos** · ninguno propio
**Valor de negocio observable** · recupera las franjas que igual queden vacías. Mueve KPI-002

## Priorización

Criterio: **primero lo que cierra el circuito de la pérdida de turnos**, después lo que
absorbe el crecimiento.

EP001 va primera aunque sea la de menor desarrollo: es un trámite externo con plazo
incontrolable. Si arranca tarde, EP003 no llega al 12/12 aunque el software esté terminado.

EP005 y EP006 son Should Have porque el problema declarado se resuelve sin ellas. Pasan a
críticas si la campaña arranca antes de lo previsto.

## Distribución temporal

### Q1 · agosto a octubre

**Objetivo del trimestre** · dejar de perder turnos
**Épicas** · EP001, EP002, EP003, EP004
**Resultado esperado** · el cambio de un turno le llega al paciente por WhatsApp y queda
trazado quién lo hizo

### Q2 · octubre a diciembre

**Objetivo del trimestre** · absorber el volumen de la campaña
**Épicas** · EP005, EP006
**Resultado esperado** · el paciente reserva sin llamar y una franja liberada se reasigna sola

## Dependencias estratégicas

| ID | Dependencia | Épicas afectadas | Impacto |
|---|---|---|---|
| DE-001 | Alta de la API de WhatsApp Business | EP001, EP003, EP006 | Camino crítico. Sin esto no hay notificación |
| DE-002 | Detalle de la normativa de datos de salud | EP003, EP005 | Puede invalidar qué viaja en el mensaje y qué se guarda |
| DE-003 | Tamaño esperado de la campaña | EP005, EP006 | Sin eso no se dimensiona el volumen ni se recalibra la meta |

## Riesgos estratégicos

| ID | Riesgo | Impacto | Mitigación |
|---|---|---|---|
| RE-001 | El alta de WhatsApp llega tarde | Alto | EP001 arranca el día uno, en paralelo con EP002 |
| RE-002 | La normativa restringe el contenido del mensaje | Alto | Pedir el detalle antes de diseñar EP003 |
| RE-003 | El paciente tampoco lee WhatsApp | Medio | Medir tasa de lectura desde el primer mes |
| RE-004 | Pacientes homónimos sin identificador único | Medio | Resolver antes de habilitar EP005 |

## Releases tentativos

| Release | Épicas | Objetivo |
|---|---|---|
| R1 | EP001, EP002, EP003, EP004 | Dejar de perder turnos |
| R2 | EP005, EP006 | Absorber el volumen de la campaña |

## Métricas de éxito

| KPI | Meta | Épicas que contribuyen |
|---|---|---|
| KPI-001 | −85% de turnos perdidos | EP001, EP002, EP003 |
| KPI-002 | > 50% de franjas liberadas reasignadas | EP006 |
| KPI-003 | > 40% de turnos reservados por el paciente | EP005 |
