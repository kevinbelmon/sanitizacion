# Plan — 002 Templates y cadena

## Artefactos a producir

```
templates/
  iniciativa-template.md      ← nuevo · salida de /dsc-refine, 7 categorías
  vision-template.md          ← extendido · 15 secciones (9 actuales + 6 nuevas)
  roadmap-template.md         ← + Usuarios Impactados por épica
  release-template.md         ← + Usuarios Impactados por épica
  feature-template.md         ← reemplaza idea-template · bloque SDD + bloque Discovery
  decision-template.md        ← hoy vacío
  review-template.md          ← hoy vacío
contracts/chain.md            ← el mapeo proyector → consumidor, sección por sección
.claude/agents/*.md           ← los 9, saneados
```

## El template de feature: dos bloques

Es la pieza que decide si el handoff a SDD funciona.

**Bloque SDD** — nombres de sección **literales**, iguales a los que `/sdd-refine` busca. De esto depende que el grilling dé 0 preguntas:

```
## PROBLEMA · ## USUARIO · ## DONE CRITERIA
## OUT OF SCOPE · ## RESTRICCIONES TÉCNICAS · ## UI / FLUJO
```

**Bloque Discovery** — lo que el negocio necesita y SDD no consume: Valor para el Negocio, Reglas de Negocio, Dependencias, Riesgos. No se exporta.

Frontmatter con `discovery_id`, `epic`, `capability`, `release`, `users`, `priority`, `depends_on`.

## Mapeo de secciones (ex `idea-template`)

| Sección actual | Destino |
|---|---|
| Problema | `## PROBLEMA` |
| Criterios de Aceptación | `## DONE CRITERIA` |
| No Incluye | `## OUT OF SCOPE` |
| Integraciones + Restricciones + Requisitos de Seguridad | `## RESTRICCIONES TÉCNICAS` |
| — | `## USUARIO` — **nuevo**, deriva de la Visión |
| — | `## UI / FLUJO` — **nuevo**, se interroga en 003 |
| Valor para el Negocio, Reglas de Negocio, Dependencias, Riesgos | Bloque Discovery |

## Los 9 agentes

Frontmatter uniforme. `name` == nombre de archivo == ID en `workflow.yaml`.

| Agente | model | Motivo |
|---|---|---|
| `vision-creator`, `roadmap-creator`, `feature-decomposer`, `reviewer` | opus | Juicio de negocio, priorización, grilling |
| `release-planner`, `feature-estimator`, `metrics`, `dashboard` | sonnet | Mecánicos sobre entradas estructuradas |
| `decision-logger` | haiku | Append estructurado |

Renombres: `features-decomposer` → `feature-decomposer`, `features-estimation` → `feature-estimator`, `decisions-log` → `decision-logger`.

## Cascada de invalidación

Se declara en `contracts/chain.md` como grafo explícito:

```
iniciativa → vision → roadmap → release → feature → estimation → handoff
```

Aprobar la versión `n+1` de un nodo marca `STALE` a todo su subárbol. El estado vive en el registry, no en los archivos — así un artefacto `STALE` sigue siendo legible y no se corrompe.

## Decisiones de diseño

- **Un template por artefacto, un archivo.** Sin herencia ni includes: un PM tiene que poder abrirlo y entenderlo.
- **Los IDs de usuario (`U01`) son la columna vertebral.** Atraviesan visión → épica → release → feature. Sin eso, `## USUARIO` se inventa al final.
- **`STALE` no borra ni bloquea la lectura.** Solo impide avanzar. Un roadmap `STALE` se sigue pudiendo leer y comparar.
