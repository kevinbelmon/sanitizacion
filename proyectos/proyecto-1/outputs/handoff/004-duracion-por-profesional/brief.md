---
contract_version: 1
discovery_id: F004
feature_id: 004-duracion-por-profesional
domain: agenda
size: S
epic: EP002
release: R1
capability: BC01
users: U01, U02
proyecto_id: null
vision_ref: proyectos/proyecto-1/outputs/vision/vision.md
decisions: null
source_model: discovery-model
generated: 2026-08-13
---

## PROBLEMA

No todos los profesionales atienden en el mismo tiempo: una consulta puede durar 15 minutos o
45 segun la especialidad y el profesional. Si el sistema asume una duración única, la agenda
ofrece huecos que no existen o desperdicia tiempo real.

Las notas del relevamiento lo marcan explicitamente como algo que no se puede asumir.

## USUARIO

| ID | Rol | Qué necesita lograr con esta feature |
|---|---|---|
| U01 | Administración | Que la agenda ofrezca huecos reales, sin tener que calcularlos de memoria |
| U02 | Profesional | Que su agenda respete el tiempo que realmente necesita por paciente |

## DONE CRITERIA

- [ ] Cada profesional tiene una duración de consulta configurable
- [ ] La grilla de disponibilidad se calcula con la duración del profesional, no con una fija
- [ ] Se puede definir una duración distinta para primera consulta y para control
- [ ] Cambiar la duración no altera los turnos ya agendados

## OUT OF SCOPE

- Duración distinta por especialidad dentro del mismo profesional: en R1 la duración es del
  profesional, no de la práctica
- Duración variable por paciente

## RESTRICCIONES TÉCNICAS

- **Integraciones** · Ninguna
- **Seguridad** · Solo administración configura duraciones
- **Normativa** · No aplica
- **Plataforma** · Sin requisitos particulares

## UI / FLUJO

- **Pantallas involucradas** · Configuracion del profesional, dentro de la administración de la
  agenda
- **Flujo principal** · Administración abre la ficha del profesional, define la duración de
  primera consulta y de control, y guarda. La grilla de ese profesional se recalcula
- **Estado vacío** · Un profesional sin duración configurada usa un valor por defecto de la
  clínica, y se muestra que esta usando el default
- **Estado de error** · Una duración de cero o negativa se rechaza antes de guardar
- **Diseño de referencia** · ninguno. **Derivado de las notas, requiere validación**
