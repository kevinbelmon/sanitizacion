---
proyecto: proyecto-1
proyecto_id: PRY-001
version: 1
status: DRAFT
created: 2026-08-12
---

# Visión del Proyecto — Plataforma de turnos

## 1. Misión

Que ningún paciente pierda un turno porque no se enteró de un cambio, y que la clínica pueda
crecer en volumen sin que la gestión de turnos se rompa.

## 2. Problema

Con 10 profesionales en 3 sedes, los turnos se gestionan entre teléfono, WhatsApp y una
planilla en Drive. Los cambios se avisan por mail directo al paciente: el que no lo lee no
viene. Se pierden 15 a 40 turnos por mes, cerca de uno por día hábil. El aviso se emite: el
problema no es la agenda, es el **canal**.

## 3. Usuarios Objetivo

| ID | Rol | Qué necesita lograr | Frecuencia | Nivel técnico |
|---|---|---|---|---|
| U01 | Administración | Gestionar la agenda completa: alta, cambio y cancelación, sin recargar datos | Todo el día | Medio |
| U02 | Profesional | Ver su agenda del día y registrar qué pasó con cada turno | Varias veces por día | Bajo |
| U03 | Paciente | Conseguir un turno y enterarse si algo cambia | 1–2 veces al año | Muy variable |

U02 solo ve y modifica lo propio. U03 opera sin registro previo, desde un celular.

## 4. Estado Actual

Planilla compartida en Drive para las 3 sedes, mantenida por administración. Turnos por
teléfono y WhatsApp, cambios por mail del profesional al paciente, sin trazabilidad de quién
modificó qué. Los datos de pacientes y el motivo de consulta viven en esa planilla.

## 5. Estado Deseado

Una agenda única por profesional, especialidad y sede, con disponibilidad en tiempo real. El
paciente reserva solo y recibe por WhatsApp el aviso, el recordatorio y cualquier cambio. Una
franja liberada la reasigna la lista de espera sin intervención, y administración pasa de
coordinar por WhatsApp a gestionar excepciones.

## 6. Declaración de Visión

Convertir la gestión de turnos en un proceso que se sostiene solo, para que la clínica pueda
duplicar su volumen de pacientes sin duplicar su trabajo administrativo.

## 7. Principios (Tenets)

- El aviso llega por donde el paciente mira, no por donde es cómodo mandarlo
- Todo movimiento de un turno queda trazado con autor y momento
- Una franja liberada se reasigna sola antes que quedar vacía
- Simplicidad sobre completitud: la v1 resuelve el turno, no la clínica entera

## 8. Objetivos Estratégicos

| ID | Objetivo | Resultado esperado |
|---|---|---|
| OE-001 | Dejar de perder turnos por avisos que no llegan | −85% sobre la línea de base |
| OE-002 | Sostener el crecimiento de la campaña sin sumar administración | Mismo equipo con más volumen |
| OE-003 | Tener trazabilidad de cada movimiento de turno | 100% de los cambios con autor |

## 9. Beneficios Esperados

La clínica recupera facturación que hoy pierde en franjas vacías y llega a la campaña con
capacidad de absorber la demanda. El profesional deja de descubrir ausencias en el momento y
el paciente consigue turno sin llamar.

## 10. Capacidades de Negocio

| ID | Capacidad | Descripción | Objetivos que sirve |
|---|---|---|---|
| BC01 | Gestión de agenda | Alta, cambio, cancelación y bloqueo de franjas por profesional, especialidad y sede | OE-001, OE-002 |
| BC02 | Notificación al paciente | Aviso de reserva, recordatorio y cambio, por WhatsApp | OE-001 |
| BC03 | Reserva por el paciente | Autogestión online por especialidad, sin registro previo | OE-002 |
| BC04 | Recuperación de franjas | Lista de espera que reasigna un turno liberado | OE-001 |
| BC05 | Trazabilidad de turnos | Estados del turno y registro de quién modificó qué | OE-003 |

## 11. Alcance General

**Incluye** · agenda multi-sede y multi-profesional · notificación por WhatsApp · reserva
online por especialidad · lista de espera · estados del turno y trazabilidad.

**No incluye** · pagos online · confirmación de asistencia · sobreturnos · derivación previa ·
reportes de gestión · historia clínica.

## 12. Restricciones

- Fecha comprometida: **12/12/2026**. El alcance se acomoda a la fecha.
- **WhatsApp Business API** obligatoria: costo por mensaje, plantillas aprobadas por Meta,
  alta de semanas que no depende del equipo.
- **Normativa de datos de salud**: aplica y el cliente sabe cuál. Falta el detalle.
- Debe soportar el volumen de la campaña, no el actual.
- La duración de consulta no es igual para todos los profesionales.

## 13. Dependencias Estratégicas

| ID | Dependencia | Impacto si no se resuelve |
|---|---|---|
| DE-001 | Alta de la API de WhatsApp Business | Sin esto no hay notificación: cae la capacidad central del proyecto |
| DE-002 | Detalle de la normativa que el cliente conoce | Puede invalidar qué viaja en un mensaje y dónde viven los datos |
| DE-003 | Tamaño esperado de la campaña | Sin eso no se puede dimensionar el volumen ni recalibrar la meta |

## 14. Riesgos Estratégicos

| ID | Riesgo | Impacto | Mitigación |
|---|---|---|---|
| RE-001 | El alta de WhatsApp llega tarde y no se cumple el 12/12 | Alto | Arrancar el trámite antes que el desarrollo, en paralelo |
| RE-002 | La normativa restringe qué se puede mandar por WhatsApp | Alto | Pedir el detalle antes de diseñar los mensajes |
| RE-003 | El paciente tampoco lee WhatsApp y la meta no se alcanza | Medio | Medir tasa de lectura desde el primer mes y evaluar un segundo canal |
| RE-004 | Sin identificador único, dos pacientes homónimos se pisan | Medio | Resolverlo antes de habilitar la reserva sin registro |

## 15. Métricas de Éxito

| ID | Métrica | Hoy | Meta | Cuándo se mide |
|---|---|---|---|---|
| KPI-001 | Turnos perdidos por mes | 15–40 | −85% sobre la línea de base | Mensual desde el primer mes |
| KPI-002 | Franjas liberadas reasignadas por lista de espera | 0 | > 50% | Mensual |
| KPI-003 | Turnos reservados por el paciente sin llamar | 0 | > 40% del total | Mensual desde el mes 2 |

## Supuestos declarados

- **Presupuesto**: sin tope declarado, se asume definido en la propuesta comercial.
- **Registro del paciente**: derivado del perfil de U03, no decidido por el cliente.
- **KPI-002 y KPI-003**: propuestos por el equipo. La única meta acordada es KPI-001.
