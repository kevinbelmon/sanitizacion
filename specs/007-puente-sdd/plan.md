# Plan — 007 Puente con SDD

> **Provisional.** Se refina en su gate.

## Componentes

```
.claude/commands/dsc-estimate.md · dsc-split.md · dsc-handoff.md
.claude/skills/discovery-standards/references/sdd-handoff.md
contracts/handoff.md              ← versionado: el contrato de borde
lib/handoff.mjs                   ← validación y mapeo de IDs
proyectos/<p>/outputs/handoff/<feature_id>/{brief.md, context.md, assets/}
```

Y del lado `sdd-model`, tres parches **aditivos**:

| # | Archivo | Cambio |
|---|---|---|
| P1 | `specs/_registry/features.template.yaml` | Campos opcionales `discovery_id`, `epic`, `release`, `size` |
| P2 | `.claude/commands/sdd-refine.md` | Bypass de grilling ante brief válido; grilling parcial si falta algo; check de seguridad siempre |
| P3 | `.claude/commands/sdd-generate.md` | Usar `feature_id` y `domain` del brief; propagar trazabilidad al registro |

## El paquete de handoff

```
outputs/handoff/001-gestion-usuarios/
├── brief.md      ← frontmatter + las 6 secciones literales
├── context.md    ← extracto de visión/épica/release (informativo, no lo lee SDD)
└── assets/       ← .html de referencia, wireframes
```

`context.md` existe para el humano que quiera entender de dónde viene la feature. `/sdd-refine` solo consume `brief.md`.

## El validador de handoff

Es un gate duro. Rechaza y no exporta si:

- falta alguna de las 6 secciones del bloque SDD
- hay placeholders (`TBD`, `[Completar]`, `Pendiente`, `N/A`, `???`)
- `size == XL`
- `domain` no resuelve en `registry/capabilities.yaml`
- el `feature_id` ya existe en el repo destino
- hay patrones de secreto en el brief

El último es importante: es el mismo check que `/sdd-refine` hace sobre drafts, pero corriendo **antes** de que el secreto cruce el borde.

## Compatibilidad hacia atrás en SDD

Los tres parches son aditivos y verificables por separado:

- P1: campos opcionales, `null` cuando la feature no vino de Discovery.
- P2: una rama nueva al inicio del comando. Sin `drafts/brief.md` con `discovery_id`, el flujo es idéntico al actual.
- P3: una condición sobre el frontmatter. Sin frontmatter, comportamiento actual.

**Criterio no negociable:** `sdd-model` sin Discovery se comporta exactamente como hoy. Se verifica corriendo el ciclo SDD sobre un `drafts/` común, sin brief.

## Versionado del contrato

`contracts/handoff.md` lleva `contract_version`. El `brief.md` lo estampa en su frontmatter. Si SDD recibe una versión que no conoce, avisa en vez de interpretar mal. Es la defensa contra la deriva entre los dos modelos cuando evolucionen por separado (riesgo R7).

## Decisiones de diseño

- **`--target` es el camino feliz, no el único.** Si el repo SDD está en otra máquina, el export a `outputs/handoff/` con instrucciones sigue siendo un handoff válido.
- **XL no cruza.** Es una regla del modelo, no una advertencia. Una feature XL que llega a desarrollo es retrabajo garantizado.
- **Nunca se copian decisiones, se referencian.** Dos logs sincronizados divergen; dos logs referenciados no.
- **El brief es un subconjunto, no una traducción.** El bloque Discovery se queda en Discovery. SDD recibe exactamente lo que consume.
