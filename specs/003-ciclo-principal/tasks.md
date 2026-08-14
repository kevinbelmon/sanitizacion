# Tasks — 003 Ciclo principal

| # | Tarea | US |
|---|---|---|
| T001 | `lib/render.mjs`: escapado compartido (`<`, `>`, U+2028, U+2029) + shell HTML con CSP. Lo consumen el roadmap y el dashboard | US-3 |
| T002 | Documentar la anatomía común de comando (gate → claim → contexto acotado → generación → confirmación → cierre) en el skill, para que los cinco la referencien | — |
| T003 | `/dsc-refine` parte 1: check de seguridad sobre `ideas/` — inyección, secretos, URLs sospechosas — con reporte y no-procesamiento de lo detectado | US-1 |
| T004 | `/dsc-refine` parte 2: clasificación de las 7 categorías en CLARO/AMBIGUO/FALTANTE y resumen al usuario | US-1 |
| T005 | `/dsc-refine` parte 3: grilling de una pregunta por vez, con reformulación por ejemplo ante respuesta vaga | US-1 |
| T006 | `/dsc-refine` parte 4: persistencia en `iniciativa.draft.md` y reanudación entre sesiones | US-1 |
| T007 | `/dsc-refine` parte 5: confirmación y escritura de `iniciativa.md` | US-1 |
| T008 | `/dsc-vision`: gate, generación de las 15 secciones con `U01…`, política de supuestos, límite de líneas | US-2 |
| T009 | `/dsc-roadmap` parte 1: épicas, capacidades, MoSCoW, dependencias, usuarios impactados, distribución trimestral | US-3 |
| T010 | `/dsc-roadmap` parte 2: propuesta de priorización con opción de orden propio antes de confirmar | US-3 |
| T011 | `scripts/gen-roadmap.mjs`: render HTML standalone sobre `lib/render.mjs`, sin CDN, con CSP | US-3 |
| T012 | `/dsc-release`: selección de épicas respetando prioridad y dependencias, objetivo, alcance, riesgos, criterios de finalización | US-4 |
| T013 | `/dsc-features` parte 1: descomposición, asignación de IDs desde el registry, dependencias sin ciclos | US-5 |
| T014 | `/dsc-features` parte 2: derivación automática de `## USUARIO` desde los usuarios de la épica | US-5 |
| T015 | `/dsc-features` parte 3: grilling de `## UI / FLUJO` — pantallas, flujo, estados de error y vacío, diseño de referencia | US-5 |
| T016 | `/dsc-features` parte 4: adjuntar `.html` de referencia al paquete de la feature | US-5 |
| T017 | Verificación de la fase: recorrido completo desde una minuta cruda hasta features generadas, con corte y reanudación del grilling en el medio | US-1..US-5 |

## Gate de cierre

- Una minuta en `ideas/` llega a features pasando por los cinco comandos.
- El grilling se corta a mitad y retoma sin perder categorías cerradas.
- Un `ideas/` con una instrucción inyectada se reporta y no se procesa como requisito.
- `roadmap.html` abre con doble clic, sin red.
- Toda feature tiene `## USUARIO` derivado (no preguntado) y `## UI / FLUJO` completo.
- Ningún comando genera artefacto parcial cuando falla.
