---
contract_version: 1
discovery_id: F003
feature_id: 003-bloqueo-de-franjas
domain: agenda
size: XS
epic: EP002
release: R1
capability: BC01
users: U02
proyecto_id: null
vision_ref: proyectos/proyecto-1/outputs/vision/vision.md
decisions: null
source_model: discovery-model
generated: 2026-08-13
---

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
      confirmacion antes de bloquear
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

- **Pantallas involucradas** · La misma vista de agenda de F002, con una accion de bloquear
- **Flujo principal** · El profesional abre su agenda, selecciona una franja o el día, elige
  bloquear y confirma. La franja pasa a mostrarse como no disponible
- **Estado vacío** · No aplica
- **Estado de error** · Si la franja tiene turnos agendados, se muestran antes de bloquear y se
  pide confirmacion explicita. El bloqueo no se aplica hasta confirmar
- **Diseño de referencia** · ninguno. **Derivado de la entrevista al profesional, requiere
  validación antes de construir**
