---
discovery_id: F007
proyecto: proyecto-1
slug: estados-del-turno
capability: BC05
epic: EP004
release: R1
users: [U02, U01]
priority: Alta
depends_on: [F002]
size: null
version: 1
status: DRAFT
created: 2026-08-12
---

# F007 — Estados del turno

# BLOQUE SDD

## PROBLEMA

Hoy nadie registra qué pasó con un turno. La planilla dice que estaba agendado, pero no si el
paciente vino, si falto o si se cancelo. Sin ese dato no se puede saber cuantos turnos se
pierden ni si el proyecto esta funcionando: es el registro que alimenta KPI-001.

El profesional pidio explicitamente poder marcar atendido, ausente o cancelado.

## USUARIO

| ID | Rol | Qué necesita lograr con esta feature |
|---|---|---|
| U02 | Profesional | Marcar rápido qué pasó con cada turno, sin salir de su agenda del día |
| U01 | Administración | Ver cuantos turnos se perdieron y por que |

## DONE CRITERIA

- [ ] Un turno puede estar en agendado, atendido, ausente o cancelado
- [ ] El profesional cambia el estado de sus turnos desde su agenda, en un toque
- [ ] Administración puede cambiar el estado de cualquier turno
- [ ] Un turno cancelado libera la franja
- [ ] Se puede contar cuantos turnos quedaron en ausente en un periodo

## OUT OF SCOPE

- Motivo de la ausencia: en R1 se registra el estado, no la causa
- Reprogramación automática de un ausente
- Reportes de gestión: fuera del alcance del proyecto

## RESTRICCIONES TÉCNICAS

- **Integraciones** · Ninguna
- **Seguridad** · El profesional solo cambia el estado de sus propios turnos
- **Normativa** · El estado del turno es dato de atención: aplica la misma normativa pendiente
- **Plataforma** · Usable desde tablet en un toque: el profesional lo hace entre paciente y
  paciente

## UI / FLUJO

- **Pantallas involucradas** · La agenda del profesional de F002, con la acción de cambiar
  estado en cada turno
- **Flujo principal** · El profesional termina la consulta, toca el turno en su agenda y elige
  atendido. El turno cambia de color y sigue visible en el dia
- **Estado vacío** · Un día sin turnos muestra la agenda vacia, no un error
- **Estado de error** · Si el turno ya fue marcado por administración, se avisa el estado
  actual antes de sobrescribir
- **Diseño de referencia** · ninguno. **Derivado de la entrevista al profesional, requiere
  validación**

# BLOQUE DISCOVERY

## Valor para el negocio

Es la fuente de KPI-001. Sin registrar ausencias, no hay línea de base ni forma de medir si el
proyecto funciono.

## Reglas de negocio

- Un turno cancelado libera la franja para que pueda reasignarse
- El estado nunca se borra: se cambia, y queda el historial en F008

## Dependencias

| Depende de | Tipo | Estado |
|---|---|---|
| F002 | Feature | En el mismo release |

## Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| El profesional no marca los estados y el dato queda incompleto | Alto | Que sea un toque desde su propia agenda, sin pantallas intermedias |
