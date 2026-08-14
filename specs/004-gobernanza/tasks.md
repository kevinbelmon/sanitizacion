# Tasks — 004 Gobernanza

> **Provisional.** Se refina en su gate.

| # | Tarea | US |
|---|---|---|
| T001 | `contracts/feedback.md`: schema YAML del feedback, severidades y regla de bloqueo | US-1 |
| T002 | `/dsc-review` parte 1: autoevaluación de completitud, consistencia, alineación, trazabilidad y placeholders | US-1 |
| T003 | `/dsc-review` parte 2: emisión de feedback estructurado y transición a `AWAITING_APPROVAL` con roles faltantes | US-1 |
| T004 | `/dsc-review` parte 3: modo lista para features — tanda para las limpias, una por una para las observadas, con cursor persistente | US-1 |
| T005 | `/dsc-approve`: lectura de `review-policy.yaml`, registro de una firma por rol, detección de firmas completas | US-2 |
| T006 | Transición atómica de aprobación: archivar en `history/` → hash → `APPROVED` → `STALE` descendientes → evento → dashboard | US-2 |
| T007 | Manejo de `Rejected`: detener el workflow y bloquear los comandos posteriores | US-2 |
| T008 | `/dsc-log`: preguntas de a una, asignación de `DEC-nnn` desde el registry, formato de `DECISIONS.md`, transición a `SUPERSEDED` | US-3 |
| T009 | `/dsc-validate`: cobertura punto a punto de la iniciativa contra los artefactos, sin modificar nada | US-4 |
| T010 | `/dsc-impact`: recorrido del subárbol y listado de descendientes que quedarían `STALE` | US-5 |
| T011 | `/dsc-restore`: listado de versiones de `history/`, restauración, archivado de la actual, registro de decisión y recálculo de estado | US-6 |
| T012 | Verificación: aprobación multi-rol en dos sesiones separadas, rechazo que bloquea, cascada `STALE`, y restore completo | US-2, US-5, US-6 |

## Gate de cierre

- Dos personas aprueban el mismo artefacto en sesiones distintas y el estado converge a `APPROVED`.
- Un `Rejected` impide que corra el comando siguiente.
- Aprobar una visión nueva marca `STALE` a roadmap, releases y features.
- `/dsc-restore` devuelve una visión anterior y recalcula el estado de los descendientes.
- Ningún comando registra una firma sin intervención humana.
