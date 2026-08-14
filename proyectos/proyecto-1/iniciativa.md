---
proyecto_id: PRY-001
proyecto: proyecto-1
version: 2
status: DRAFT
created: 2026-08-12
sources: minuta.md, mail-cliente.md, entrevista-profesional.md, notas-sueltas.md
---

# Iniciativa — Plataforma de turnos

## 1. Problema

Clínica con 10 profesionales en 3 sedes. Los turnos se gestionan entre teléfono, WhatsApp y
una planilla en Drive. Cuando un profesional no puede atender avisa por mail directo al
paciente: el que no lo lee no viene, y la franja queda vacía sin reasignarse.

Se pierden **15 a 40 turnos por mes**, cerca de uno por día hábil. El aviso se emite: el
problema no es la agenda, es el **canal**.

## 2. Usuarios

| ID | Rol | Qué necesita lograr | Frecuencia | Nivel técnico |
|---|---|---|---|---|
| U01 | Administración | Alta, modificación y cancelación. Mover un turno de día sin recargarlo | Todo el día | Medio |
| U02 | Profesional | Ver solo sus turnos: paciente, hora, motivo, primera consulta o control. Bloquear franjas. Marcar atendido, ausente o cancelado | Varias veces por día | Bajo |
| U03 | Paciente | Reservar desde la web. Recibir aviso de reserva y recordatorio | 1–2 veces al año | Muy variable |

U02 no modifica turnos de otros. U03 reserva **sin registro previo**, desde un celular y sin
usar apps; la vista de U02 no pasa de una pantalla. **Sin rol de dirección: no hay reportes.**

## 3. Estado actual

Una planilla compartida en Drive para las 3 sedes, mantenida por administración. Turnos por
teléfono y WhatsApp; cambios por mail del profesional al paciente. Todo manual, sin registro
de quién modificó qué, y con datos de pacientes y motivo de consulta en esa planilla.

## 4. Estado deseado

Agenda centralizada por profesional, especialidad y sede: disponibilidad en tiempo real,
bloqueo de franjas, estados del turno y trazabilidad de cambios.

- **Notificación por WhatsApp.** Decisión central: es donde hoy se corta la cadena.
- **Reserva por especialidad**, el sistema asigna el hueco. El paciente no elige profesional:
  quien está en tratamiento no podrá pedir seguir con el mismo médico.
- **Lista de espera**: al liberarse un turno se avisa al próximo.

Fuera de la v1: pagos online, confirmación de asistencia (el turno queda vigente hasta que
alguien lo cancele), sobreturnos, derivación previa y reportes. La duración de consulta **no
es igual para todos los profesionales**.

Pendiente para la visión: sin registro no hay identificador único, y dos homónimos se pisan.

## 5. Resultados esperados

| Resultado | Métrica | Hoy | Meta |
|---|---|---|---|
| Dejar de perder turnos por avisos que no llegan | Turnos perdidos por mes | 15–40 | −85% sobre la línea de base |

En porcentaje porque la campaña aumenta el volumen y un absoluto dejaría de ser comparable.
Cerrar la línea de base en un valor único antes de medir.

## 6. Restricciones

- **12/12/2026**, fecha comprometida. El alcance se acomoda a la fecha, no al revés.
- **WhatsApp Business API** obligatoria: costo por mensaje, plantillas aprobadas por Meta y
  un alta de semanas. **No depende del equipo: es camino crítico y arranca antes que el
  desarrollo.**
- **Normativa de datos de salud: aplica y el cliente sabe cuál.** Falta el detalle; pedirlo
  **antes de la visión**. Condiciona qué viaja en un mensaje, qué se guarda de un paciente
  sin registro y dónde viven los datos.
- La plataforma debe soportar el volumen de la campaña, no el actual.

## 7. Urgencia

El año que viene arranca una campaña de publicidad activa y la fecha existe para estar en
marcha antes. La campaña **amplifica el problema**: con más demanda y el mismo esquema, los
turnos perdidos crecen en proporción — el costo de no actuar sube.

## Supuestos declarados

- **Presupuesto**: sin tope declarado. Se asume definido en la propuesta comercial.
- **Registro del paciente**: derivado del perfil de U03, no decidido explícitamente.
