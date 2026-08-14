---
discovery_id: F006
proyecto: proyecto-1
slug: plantillas-de-mensaje
capability: BC02
epic: EP003
release: R1
users: [U01, U03]
priority: Alta
depends_on: [F001]
size: null
version: 1
status: DRAFT
created: 2026-08-12
---

# F006 — Plantillas de mensaje

# BLOQUE SDD

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

# BLOQUE DISCOVERY

## Valor para el negocio

El mensaje es la cara de la clínica ante el paciente. Un texto confuso hace que el aviso llegue
pero no se entienda, que es el mismo resultado que no llegue.

## Reglas de negocio

- Ningún aviso sale con texto libre: siempre desde plantilla aprobada

## Dependencias

| Depende de | Tipo | Estado |
|---|---|---|
| F001 | Feature | En el mismo release |
| Detalle de la normativa | Externa (DE-002) | Pendiente |

## Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Meta rechaza una plantilla y demora el release | Medio | Enviar a aprobación apenas se tenga el detalle de la normativa |
