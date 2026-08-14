# Tasks — 002 Templates y cadena

| # | Tarea | US |
|---|---|---|
| T001 | `templates/vision-template.md`: agregar Usuarios Objetivo, Alcance General, Beneficios Esperados, Restricciones, Dependencias Estratégicas y Riesgos Estratégicos; renombrar Resultados Esperados a Objetivos Estratégicos (`OE-nnn`) | US-1, US-2 |
| T002 | `templates/roadmap-template.md`: campo `Usuarios Impactados` por épica | US-1 |
| T003 | `templates/release-template.md`: propagación de `Usuarios Impactados` por épica incluida | US-1 |
| T004 | `templates/feature-template.md`: bloque SDD con las 6 secciones literales + bloque Discovery + frontmatter de trazabilidad. Reemplaza `idea-template.md` | US-1 |
| T005 | `templates/iniciativa-template.md`: las 7 categorías del grilling | US-2 |
| T006 | `templates/decision-template.md` y `templates/review-template.md` (hoy vacíos) | — |
| T007 | `contracts/chain.md`: mapeo proyector→consumidor sección por sección, y el grafo de invalidación | US-2, US-3 |
| T008 | Estado `STALE` en el esquema del registry + regla de gate en `contracts/state.md` | US-3 |
| T009 | Especificar `/dsc-impact` (se implementa en 004): recorre el subárbol y lista descendientes afectados | US-3 |
| T010 | Mover los 9 agentes a `.claude/agents/`, renombrar los tres que corresponde, uniformar frontmatter con `name`/`description`/`model`/`tools` | US-4 |
| T011 | Reescribir Entradas/Salidas de los 9 agentes contra `contracts/paths.md`. Resolver las dos auto-contradicciones (`vision-creator`, `release-planner`) y las rutas inexistentes (`sdd-harness/`, `discovery/`, `proyecto-planning/`, `templates/vision/`) | US-4 |
| T012 | Integrar `feature-estimator` a `workflow.yaml` y corregir sus derivaciones (hoy apunta a "Spec Creator" y "Feature Splitter", que no existen) | US-4 |
| T013 | Actualizar `contracts/artifact-creator-contract.md`: sus archivos de entrada y salida hoy contradicen a los cuatro creators | US-4 |
| T014 | Verificación: recorrer cada par (agente, template antecesor) y confirmar que no queda ninguna sección declarada sin proyector | US-2, US-4 |

## Gate de cierre

- Ningún agente declara una entrada que su template antecesor no produzca.
- `grep` de `proyecto-planning/`, `sdd-harness/`, `discovery/`, `templates/vision/` devuelve 0 resultados.
- Los 9 `name:` coinciden con nombre de archivo y con su ID en `workflow.yaml`.
- Un `U01` definido en la Visión se puede seguir hasta la sección `## USUARIO` de una feature.
- El template de feature tiene las 6 secciones con los nombres exactos que `/sdd-refine` busca.
