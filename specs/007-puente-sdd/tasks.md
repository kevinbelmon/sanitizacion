# Tasks — 007 Puente con SDD

> **Provisional.** Se refina en su gate.

| # | Tarea | US |
|---|---|---|
| T001 | `/dsc-estimate`: los 6 factores ponderados, score, talle XS–XL, justificación y recomendación por talle | US-1 |
| T002 | `/dsc-split`: propuesta de división, herencia de épica/capacidad/release/usuarios, IDs nuevos, `SUPERSEDED` de la original, decisión registrada | US-2 |
| T003 | `contracts/handoff.md` con `contract_version`: estructura del paquete, frontmatter, mapeos deterministas | US-3 |
| T004 | `lib/handoff.mjs`: mapeo `F001-slug` → `001-slug`, resolución de `domain` vía `capabilities.yaml`, validación de destino | US-3 |
| T005 | Validador de handoff: 6 secciones, placeholders, `XL`, `domain`, colisión de `feature_id`, patrones de secreto | US-3 |
| T006 | `/dsc-handoff` parte 1: validación, generación de `brief.md` con frontmatter y las 6 secciones literales, `context.md` y `assets/` | US-3 |
| T007 | `/dsc-handoff` parte 2: `--target` con verificación de repo SDD real, rechazo de `..`, confirmación antes de sobreescribir | US-3 |
| T008 | `/dsc-handoff` parte 3: fallback sin `--target` a `outputs/handoff/` con instrucciones de entrega manual | US-3 |
| T009 | `/dsc-handoff` parte 4: actualización del registry a `HANDED_OFF`, registro de decisión, evento, próximo comando literal | US-3 |
| T010 | **Parche P1** en `sdd-model`: campos opcionales de trazabilidad en `features.template.yaml` | US-4 |
| T011 | **Parche P2** en `sdd-model`: bypass de grilling en `/sdd-refine` ante brief válido; grilling parcial; check de seguridad siempre | US-4 |
| T012 | **Parche P3** en `sdd-model`: uso de `feature_id` y `domain` del brief en `/sdd-generate` y propagación al registro | US-4 |
| T013 | Verificación de no regresión en SDD: ciclo completo sobre un `drafts/` sin brief, comportamiento idéntico al actual | US-4 |
| T014 | Verificación punta a punta: minuta cruda → features → handoff → `/sdd-refine` con `rondas_de_preguntas: 0` | US-1..US-4 |

## Gate de cierre

- Una feature XL no puede exportarse.
- Un brief con un placeholder o un secreto no puede exportarse.
- `/sdd-refine` sobre un brief exportado registra `rondas_de_preguntas: 0` y `categorias_faltantes: 0`.
- Un brief con una sección incompleta dispara grilling **solo** de esa sección.
- `sdd-model` sin brief de Discovery se comporta exactamente como antes de los parches.
- La trazabilidad `PRY-001 → BC01 → EP001 → R1 → F001 → 001-gestion-usuarios` se puede recorrer entera.
