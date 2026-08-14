---
discovery_id: F003
proyecto: proyecto-1
slug: bloqueo-de-franjas
capability: BC01
epic: EP002
release: R1
users: [U02]
priority: Alta
depends_on: [F002]
size: null
version: 1
status: DRAFT
created: 2026-08-12
---

# F003 — Bloqueo de franjas por el profesional

# BLOQUE SDD

## PROBLEMA

Un profesional a veces necesita bloquear una franja completa porque tiene una reunión o porque
no va a atender ese día. Hoy lo avisa por mail y alguien tiene que acordarse de no agendar
sobre esa franja. Cuando no pasa, se agenda igual y el paciente viaja al pedo.

## USUARIO

| ID | Rol | Qué necesita lograr con esta feature |
|---|---|---|
| U02 | Profesional | Bloquear una franja o un día completo sin depender de que administración se entere |

## DONE CRITERIA

- [ ] El profesional bloquea una franja horaria indicando fecha, hora de inicio y de fin
- [ ] El profesional bloquea un día completo en una operacion
- [ ] Una franja bloqueada deja de aparecer como disponible
- [ ] Si ya habia turnos agendados en la franja que se bloquea, el sistema los lista y pide
      confirmación antes de bloquear
- [ ] El bloqueo queda registrado con autor y momento

## OUT OF SCOPE

- Reprogramación automática de los turnos afectados: administración los mueve a mano en R1
- Bloqueos recurrentes (todos los martes): no entra en R1
- Notificacion al paciente del turno afectado: eso lo cubre F005

## RESTRICCIONES TÉCNICAS

- **Integraciones** · Ninguna
- **Seguridad** · El profesional solo bloquea sus propias franjas. Administración puede
  bloquear las de cualquiera
- **Normativa** · No aplica: no maneja datos de paciente
- **Plataforma** · Usable desde tablet, en pocos toques

## UI / FLUJO

- **Pantallas involucradas** · La misma vista de agenda de F002, con una acción de bloquear
- **Flujo principal** · El profesional abre su agenda, selecciona una franja o el día, elige
  bloquear y confirma. La franja pasa a mostrarse como no disponible
- **Estado vacío** · No aplica
- **Estado de error** · Si la franja tiene turnos agendados, se muestran antes de bloquear y se
  pide confirmación explícita. El bloqueo no se aplica hasta confirmar
- **Diseño de referencia** · ninguno. **Derivado de la entrevista al profesional, requiere
  validación antes de construir**

# BLOQUE DISCOVERY

## Valor para el negocio

Evita que se agende sobre una franja que el profesional ya sabe que no va a atender. Ataca una
de las causas de turno perdido antes de que ocurra.

## Reglas de negocio

- Bloquear una franja con turnos agendados exige confirmación: no se pierden en silencio

## Dependencias

| Depende de | Tipo | Estado |
|---|---|---|
| F002 | Feature | En el mismo release |

## Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Se bloquea una franja con turnos y nadie reprograma | Medio | El sistema los lista al bloquear; la reprogramación queda a cargo de administración |
