# Tasks — 008 Pulido

> **Provisional.** Se refina en su gate.

| # | Tarea | US |
|---|---|---|
| T001 | `SKILL.md` de `discovery-standards`: activación, tres reglas de oro, tabla de routing a `references/` | US-1 |
| T002 | `references/discovery-lifecycle.md`: la cadena, los gates y la anatomía común de comando (extraída de 003) | US-1 |
| T003 | `references/governance-roles.md`: review-policy, firmas, cascada `STALE` | US-1 |
| T004 | `references/artifact-quality.md`: límites de tamaño, placeholders, detección de ambigüedad | US-1 |
| T005 | `references/deterministic-audit.md`: los 15 checks y la regla de no recalcular | US-1 |
| T006 | `references/sdd-handoff.md`: el contrato de borde y sus mapeos | US-1 |
| T007 | Reemplazar en los 24 comandos las reglas repetidas por referencias al skill | US-1 |
| T008 | `/dsc-checklist`: generación de ítems `CHK001…` sobre criterios que requieren juicio humano, sin duplicar el audit | US-2 |
| T009 | `/dsc-change`: cambio acotado, versión, decisión registrada, confirmación de impacto y techo que deriva al ciclo completo | US-3 |
| T010 | `/dsc-snapshot`: resumen de estado, decisiones recientes, artefactos en curso y próximo paso | US-4 |
| T011 | `fixtures/`: proyecto de prueba con ideas, para el smoke test | US-5 |
| T012 | `/dsc-test`: recorrido completo sobre fixtures, reporte del paso que falla, limpieza al terminar | US-5 |
| T013 | `/dsc-run`: orquestador config-driven, detención en cada gate humano, manejo de error reanudable, `REJECTED` termina el flujo | US-6 |
| T014 | Cierre: `/dsc-explain` actualizado con el modelo completo y `CLAUDE.md` con los 24 comandos en la trigger-table | US-1 |

## Gate de cierre

- Los 24 comandos figuran en la trigger-table de `CLAUDE.md`.
- Ningún comando repite una regla que ya vive en el skill.
- `/dsc-test` corre la cadena completa sobre fixtures y no deja residuos.
- `/dsc-run` se detiene en cada gate de aprobación y nunca firma.
- `/dsc-change` se niega a aplicar un cambio que excede su techo.
- Un PM que nunca vio el modelo puede correr `/dsc-explain` y arrancar sin ayuda.
