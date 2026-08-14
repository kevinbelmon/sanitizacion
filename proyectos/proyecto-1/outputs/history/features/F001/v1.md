---
discovery_id: F001
proyecto: proyecto-1
slug: canal-whatsapp
capability: BC02
epic: EP001
release: R1
users: [U03]
priority: Crítica
depends_on: []
size: null
version: 1
status: DRAFT
created: 2026-08-12
---

# F001 — Habilitación del canal WhatsApp

# BLOQUE SDD

## PROBLEMA

Toda la notificación al paciente depende de poder mandar mensajes por WhatsApp, y eso no se
hace desde un número común: requiere una cuenta de WhatsApp Business API con plantillas
aprobadas por Meta. El trámite puede tomar semanas y no depende del equipo de desarrollo.

Sin esto, F005 y F006 no se pueden ni probar, y la plataforma no resuelve el problema que la
justifica.

## USUARIO

| ID | Rol | Qué necesita lograr con esta feature |
|---|---|---|
| U03 | Paciente | Recibir los mensajes de la clínica en el canal donde efectivamente mira |

El paciente no interactúa con esta feature: la habilita. Pero es quien sufre si falta.

## DONE CRITERIA

- [ ] Existe una cuenta de WhatsApp Business API operativa a nombre de la clínica
- [ ] El sistema puede enviar un mensaje de prueba a un número real y se recibe
- [ ] Hay al menos una plantilla aprobada por Meta para cada tipo de mensaje de R1: aviso de
      reserva, recordatorio y cambio de turno
- [ ] Las credenciales viven fuera del código, como variables de entorno
- [ ] Está documentado el costo por mensaje y el volumen mensual estimado

## OUT OF SCOPE

- Mensajes entrantes: el paciente no responde por WhatsApp en R1
- Canal de respaldo por mail o SMS: se evalúa solo si RE-003 se materializa
- Chatbot o menú interactivo

## RESTRICCIONES TÉCNICAS

- **Integraciones** · WhatsApp Business API de Meta. Es un proveedor externo con proceso de
  alta propio
- **Seguridad** · Las credenciales de la API se referencian como variables de entorno, nunca
  en el código ni en un artefacto
- **Normativa** · El contenido de las plantillas depende de la normativa de datos de salud que
  el cliente todavía no detalló. **Puede que el motivo de consulta no pueda viajar en el
  mensaje**: diseñar las plantillas recién cuando esté definido
- **Plataforma** · Costo por mensaje. El volumen impacta el presupuesto operativo

## UI / FLUJO

- **Pantallas involucradas** · Ninguna de cara al usuario. Es configuración de plataforma
- **Flujo principal** · Un administrador del sistema carga las credenciales de la cuenta de
  WhatsApp Business y verifica la conexión con un mensaje de prueba
- **Estado vacío** · Si no hay credenciales cargadas, el sistema muestra que el canal está
  inactivo y ninguna feature dependiente puede enviar
- **Estado de error** · Si el envío de prueba falla, se muestra el motivo devuelto por Meta y
  no se marca el canal como operativo
- **Diseño de referencia** · ninguno

# BLOQUE DISCOVERY

## Valor para el negocio

Es el habilitador de todo el proyecto. Sin canal no hay notificación, y sin notificación no se
recuperan los 15 a 40 turnos que hoy se pierden.

## Reglas de negocio

- Ninguna feature dependiente puede pasar a producción con el canal inactivo

## Dependencias

| Depende de | Tipo | Estado |
|---|---|---|
| Alta de la cuenta ante Meta | Externa (DE-001) | Pendiente |
| Detalle de la normativa | Externa (DE-002) | Pendiente |

## Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| El alta llega tarde y bloquea R1 | Alto | Arrancar el día uno, en paralelo con EP002 |
| La normativa restringe el contenido de las plantillas | Alto | No diseñar plantillas hasta tener el detalle |
