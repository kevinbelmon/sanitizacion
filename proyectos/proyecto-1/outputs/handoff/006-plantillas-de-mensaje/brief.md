---
contract_version: 1
discovery_id: F006
feature_id: 006-plantillas-de-mensaje
domain: notificaciones
size: XS
epic: EP003
release: R1
capability: BC02
users: U01, U03
proyecto_id: null
vision_ref: proyectos/proyecto-1/outputs/vision/vision.md
decisions: null
source_model: discovery-model
generated: 2026-08-13
---

## PROBLEMA

Meta exige que todo mensaje que la clínica inicie use una plantilla aprobada previamente. No se
puede escribir texto libre. Cada tipo de aviso —reserva, recordatorio, cambio, cancelación—
necesita su plantilla, y cambiar el texto implica volver a pedir aprobación.

Sin plantillas gestionadas, cualquier ajuste de redaccion se convierte en un cambio de código y
en una espera de dias.

## USUARIO

| ID | Rol | Qué necesita lograr con esta feature |
|---|---|---|
| U01 | Administración | Saber que dice cada mensaje que sale a nombre de la clínica |
| U03 | Paciente | Recibir un mensaje claro, que se entienda de una lectura |

## DONE CRITERIA

- [ ] Existe una plantilla por tipo de aviso: reserva, recordatorio, cambio y cancelación
- [ ] Cada plantilla tiene sus variables definidas: fecha, hora, profesional, sede
- [ ] Las plantillas están aprobadas por Meta antes de salir a produccion
- [ ] Administración puede ver el texto exacto de cada plantilla desde el sistema
- [ ] El texto es legible para alguien mayor, sin jerga ni abreviaturas

## OUT OF SCOPE

- Edición de plantillas desde el sistema: cambiarlas exige reaprobación de Meta y en R1 se
  hace por fuera
- Plantillas por especialidad o por profesional
- Multiidioma

## RESTRICCIONES TÉCNICAS

- **Integraciones** · Formato y proceso de aprobación de plantillas de Meta
- **Seguridad** · Ninguna particular
- **Normativa** · **Bloqueante.** Que información puede contener el mensaje depende de la
  normativa de datos de salud pendiente
- **Plataforma** · Las plantillas se aprueban por fuera del sistema

## UI / FLUJO

- **Pantallas involucradas** · Una vista de solo lectura con las plantillas vigentes
- **Flujo principal** · Administración entra y ve el texto exacto de cada tipo de mensaje, con
  un ejemplo de como se ve con datos reales
- **Estado vacío** · Si una plantilla no está aprobada todavia, se muestra su estado y que
  avisos quedan sin poder enviarse
- **Estado de error** · Una plantilla rechazada por Meta se muestra con el motivo
- **Diseño de referencia** · ninguno. **El contenido depende de la normativa pendiente**
