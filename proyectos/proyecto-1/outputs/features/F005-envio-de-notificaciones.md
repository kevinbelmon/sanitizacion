---
discovery_id: F005
proyecto: proyecto-1
slug: envio-de-notificaciones
capability: BC02
epic: EP003
release: R1
users: [U03]
priority: Critica
depends_on: [F001, F002]
size: null
version: 1
status: DRAFT
created: 2026-08-12
---

# F005 — Envío de notificaciones al paciente

# BLOQUE SDD

## PROBLEMA

Es la feature que resuelve el problema del proyecto. Hoy el aviso de un cambio sale por mail y
el paciente no lo lee: se pierden 15 a 40 turnos por mes. El aviso tiene que salir por
WhatsApp, automáticamente, cada vez que algo cambia.

## USUARIO

| ID | Rol | Qué necesita lograr con esta feature |
|---|---|---|
| U03 | Paciente | Enterarse de que tiene un turno, de que se acerca, y de cualquier cambio, por el canal donde efectivamente mira |

## DONE CRITERIA

- [ ] Al agendarse un turno, el paciente recibe un WhatsApp con fecha, hora, profesional y sede
- [ ] El paciente recibe un recordatorio antes del turno
- [ ] Si el turno se mueve, el paciente recibe un aviso con los datos nuevos
- [ ] Si el turno se cancela, el paciente recibe un aviso de cancelación
- [ ] Cada envío queda registrado con el resultado devuelto por Meta
- [ ] Si el envío falla, queda visible para administración y se puede reintentar

## OUT OF SCOPE

- Respuestas del paciente por WhatsApp
- Confirmación de asistencia: fuera del alcance del proyecto
- Reintento automático ante fallo: en R1 el reintento es manual
- Canal de respaldo por mail o SMS

## RESTRICCIONES TÉCNICAS

- **Integraciones** · WhatsApp Business API. Depende de F001
- **Seguridad** · El envío se dispara desde el sistema, nunca desde el número personal de un
  profesional
- **Normativa** · **Bloqueante.** El contenido del mensaje maneja datos de salud. Hay que
  esperar el detalle de la normativa antes de definir que información viaja: puede que el
  motivo de consulta no pueda incluirse
- **Plataforma** · Costo por mensaje. Cada cambio de turno genera un envío

## UI / FLUJO

- **Pantallas involucradas** · Ninguna nueva para el paciente: recibe el mensaje. Para
  administración, una vista de envíos con su resultado
- **Flujo principal** · Administración mueve o cancela un turno; el sistema envía el WhatsApp
  correspondiente sin intervención adicional
- **Estado vacío** · Sin envíos en el día, la vista de administración lo indica
- **Estado de error** · Un envío fallido se muestra con el motivo y un botón de reintentar. No
  se pierde en silencio: es la falla que el proyecto existe para evitar
- **Diseño de referencia** · ninguno. **Requiere validación, y el contenido del mensaje depende
  de la normativa pendiente**

# BLOQUE DISCOVERY

## Valor para el negocio

Es la feature que mueve KPI-001. Todo el proyecto se justifica por esta.

## Reglas de negocio

- Ningún cambio de turno queda sin aviso al paciente
- Un envío fallido tiene que ser visible: el silencio es el problema original

## Dependencias

| Depende de | Tipo | Estado |
|---|---|---|
| F001 | Feature | En el mismo release |
| F002 | Feature | En el mismo release |
| Detalle de la normativa | Externa (DE-002) | Pendiente |

## Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| La normativa impide incluir el motivo de consulta | Alto | Disenar el mensaje recien con el detalle en mano |
| El paciente tampoco lee WhatsApp | Medio | Medir tasa de lectura desde el primer mes |
