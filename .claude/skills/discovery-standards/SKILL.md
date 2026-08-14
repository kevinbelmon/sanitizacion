---
name: discovery-standards
description: Reglas del Discovery Model. Usar al generar o revisar artefactos, resolver dudas de proceso (gates, aprobaciones, cascada), auditar consistencia o preparar una entrega a desarrollo. Carga referencias por contexto para no inflar el contexto en cada turno.
---

# discovery-standards

Enruta hacia la regla correcta sin duplicar el modelo. No reemplaza a los comandos ni a los
contratos: los referencia.

## Cuándo activarlo

- Generar o revisar cualquier artefacto de la cadena
- Dudas de proceso: gates, aprobaciones, qué invalida qué
- Auditoría de consistencia
- Preparar una entrega al equipo de desarrollo

## Tres reglas de oro

1. **Lo que `scripts/discovery-audit.mjs` verifica, no lo recalcules.** Leé `audit-result.json`.
   El script es más barato, más rápido y no se equivoca contando.
2. **Ante conflicto entre este skill y un comando, manda el comando.** El skill orienta; el
   comando es la fuente de verdad de su etapa.
3. **No introduzcas procesos nuevos sin registrarlos.** Si hace falta una regla que no existe,
   va a un contrato y a `DECISIONS.md`, no a la conversación.

## Routing

Leé **solo** la referencia que aplica.

| Si la tarea es sobre… | Leé |
|---|---|
| La cadena, los gates, la anatomía de un comando | `references/discovery-lifecycle.md` |
| Quién firma qué, cascada `STALE`, roles | `references/governance-roles.md` |
| Calidad de artefactos: tamaño, placeholders, ambigüedad | `references/artifact-quality.md` |
| Los 15 checks y el modo degradado | `references/deterministic-audit.md` |
| La entrega a desarrollo | `references/sdd-handoff.md` |

Si la tarea cruza varias áreas, cargá varias — pero no leas las cinco por las dudas.

## Lo que nunca cambia

- **El modelo no aprueba.** Registra firmas que dio una persona identificada.
- **No se inventa información de negocio.** Si falta y es crítica, se pregunta.
- **La audiencia es de negocio.** Nada de exit codes, stderr ni parsers.
- **Todo comando termina** diciendo el próximo comando literal.
