---
discovery_id: F008
proyecto: proyecto-1
slug: historial-de-movimientos
capability: BC05
epic: EP004
release: R1
users: [U01]
priority: Media
depends_on: [F002, F007]
size: null
version: 1
status: DRAFT
created: 2026-08-12
---

# F008 — Historial de movimientos

# BLOQUE SDD

## PROBLEMA

Hoy no queda registro de quien modifico o cancelo cada turno. Cuando un paciente reclama que
nadie le aviso, no hay forma de reconstruir qué pasó. El cliente lo pidio explicitamente en el
mail: necesita que quede registrado quien modifico o cancelo cada turno.

## USUARIO

| ID | Rol | Qué necesita lograr con esta feature |
|---|---|---|
| U01 | Administración | Reconstruir qué pasó con un turno cuando un paciente reclama |

## DONE CRITERIA

- [ ] Cada alta, cambio, cancelación y cambio de estado queda registrado con autor y momento
- [ ] El registro incluye que cambio: de que valor a que valor
- [ ] Administración consulta el historial completo de un turno desde el propio turno
- [ ] El historial no se puede editar ni borrar
- [ ] Queda registrado si se envío la notificación correspondiente y con que resultado

## OUT OF SCOPE

- Exportación del historial
- Auditoría de accesos de solo lectura: se registra quien modifica, no quien mira
- Retencion configurable: en R1 el historial se conserva sin límite

## RESTRICCIONES TÉCNICAS

- **Integraciones** · Ninguna
- **Seguridad** · Solo administración consulta el historial. El registro es inmutable
- **Normativa** · **Relevante.** La normativa de datos de salud suele exigir trazabilidad y un
  plazo de conservación. El detalle pendiente puede fijar ese plazo
- **Plataforma** · Sin requisitos particulares

## UI / FLUJO

- **Pantallas involucradas** · Un panel de historial dentro del detalle del turno
- **Flujo principal** · Administración abre un turno, entra al historial y ve la lista
  cronológica de qué pasó, quien lo hizo y cuando, incluidos los avisos enviados
- **Estado vacío** · Un turno recien creado muestra solo su alta
- **Estado de error** · Si no se puede leer el historial, se avisa sin bloquear el resto del
  detalle del turno
- **Diseño de referencia** · ninguno. **Derivado del mail del cliente, requiere validación**

# BLOQUE DISCOVERY

## Valor para el negocio

Cierra OE-003. Permite responder un reclamo con datos en vez de con memoria.

## Reglas de negocio

- El historial es inmutable: no se edita ni se borra

## Dependencias

| Depende de | Tipo | Estado |
|---|---|---|
| F002 | Feature | En el mismo release |
| F007 | Feature | En el mismo release |

## Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| La normativa fija un plazo de conservación que no contemplamos | Medio | Confirmar el plazo al recibir el detalle |
