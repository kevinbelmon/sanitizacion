# Discovery Model — Gap Analysis y Diseño de Concatenación con SDD Model

Fecha: 2026-08-03
Alcance: `discovery-model/` (41 archivos) + punto de acople con `sdd-model/`

---

## 1. Qué hay hoy

### 1.1 Cadena funcional declarada

```
ideas/  →  Vision Creator  →  Roadmap Creator  →  Release Planner  →  Feature Decomposer  →  (Feature Estimator, huérfano)
              │                    │                   │                     │
              └────────────────────┴───────────────────┴─────────────────────┘
                                   ↓
                    Reviewer → Decision Log → Metrics → Dashboard
                                   ↑
                            Orchestrator (loop)
```

### 1.2 Inventario real

| Capa | Archivos | Estado |
|---|---|---|
| Orquestación | `commands/orchestrator.md` | Especificado, sin estado ejecutable |
| Creators | `vision-creator`, `roadmap-creator`, `release-planner`, `features-decomposer` | Especificados, rutas incoherentes |
| Governance | `reviewer`, `decisions-log`, `metrics`, `dashboard` | Especificados, sin contrato de datos |
| Estimación | `features-estimation` | **Huérfano** — no está en `workflow.yaml` ni en el orquestador |
| Config | `workflow.yaml`, `gobernance.yaml`, `review-policy.yaml` | 2 de 3 no los lee nadie |
| Contratos | `artifact-creator-contract.md` | Único contrato real del modelo |
| Skills | 7 archivos | **6 de 7 vacíos (0 bytes)** |
| Templates | 8 archivos | **2 vacíos** (`decision-template`, `review-template`) |
| Estado | `metrics/dashboard-data.json` | **Vacío (1 byte)** |

---

## 2. Gaps funcionales

### BLOQUE A — El harness no arranca (severidad: bloqueante)

**A1. Los agentes no son descubribles por Claude Code.**
`agents/` y `commands/` están en la raíz del repo, no en `.claude/agents/` y `.claude/commands/`. `.claude/` sólo contiene `settings.local.json`. Ningún agente se puede invocar hoy.

**A2. Los IDs de `workflow.yaml` no resuelven a ningún agente.**

| `workflow.yaml` dice | Archivo real | `name:` en frontmatter |
|---|---|---|
| `vision-agent` | `vision-creator.md` | *(sin frontmatter)* |
| `roadmap-agent` | `roadmap-creator.md` | `RoadMap Creator` |
| `release-agent` | `release-planner.md` | `Release Planner` |
| `feature-agent` | `features-decomposer.md` | `Feature Decomposer` |
| `review-approval-agent` | `reviewer.md` | *(sin `name`)* |
| `decision-agent` | `decisions-log.md` | *(sin `name`)* |
| `metrics-agent` | `metrics.md` | *(sin `name`)* |
| `dashboard-agent` | `dashboard.md` | *(sin `name`)* |

Cero coincidencias. El orquestador no puede despachar nada.

**A3. Frontmatter inconsistente.** `vision-creator.md` no tiene frontmatter en absoluto (no es un subagente válido). Cuatro agentes tienen sólo `description`. Sólo cuatro declaran `model`.

**A4. Ruta de config errónea.** [orchestrator.md:238](../commands/orchestrator.md#L238) lee `.claude/config/workflow.yaml`; el archivo está en `config/workflow.yaml`.

---

### BLOQUE B — No hay máquina de estados (severidad: bloqueante)

**B1. `workflow-status.json` no existe y nadie lo escribe.**
El orquestador lo declara como única fuente de verdad ([orchestrator.md:35](../commands/orchestrator.md#L35), `:151`, `:296`) pero:
- no existe el archivo,
- no existe su schema,
- el Metrics Agent produce otra cosa (`metrics/project-metrics.json`, [metrics.md:269](../agents/metrics.md#L269)),
- ningún agente tiene la responsabilidad de escribirlo.

El loop `read status → dispatch → update status` está roto en los dos extremos.

**B2. Dos fuentes de datos que se contradicen.**
Metrics declara que `project-metrics.json` es "la única fuente de datos para cualquier dashboard" ([metrics.md:338](../agents/metrics.md#L338)); Dashboard declara que él lee todos los artefactos y produce `dashboard/dashboard-data.json` ([dashboard.md:406](../agents/dashboard.md#L406)). Y el archivo que existe en disco es `metrics/dashboard-data.json`, vacío. Tres rutas, cero contratos.

**B3. No hay log de eventos → las métricas son incalculables.**
Metrics promete `cycleTime`, `throughput`, `flowEfficiency`, `rework`, `tiempo promedio entre aprobaciones`, `tokens por agente`. Nada de eso se puede derivar de artefactos markdown sin historial. Falta un `metrics/events.jsonl` append-only con `{ts, stage, agent, event, artifact, version, tokens_in, tokens_out}`.

**B4. `gobernance.yaml` y `review-policy.yaml` son código muerto.**
Definen umbrales verde/amarillo/rojo y matriz de aprobadores. Ningún agente los referencia. Además el archivo está mal escrito (`gobernance` → `governance`).

**B5. No hay recuperación.** El orquestador dice "permitir reanudar posteriormente" pero sin estado persistido no hay punto de reanudación. Un fallo a mitad de etapa pierde todo.

---

### BLOQUE C — Rutas incoherentes (severidad: alta)

Coexisten **tres raíces de salida** sin criterio:

| Agente | Lee de | Escribe en | Problema |
|---|---|---|---|
| Vision Creator | `sdd-harness/ideas/` ([:19](../agents/vision-creator.md#L19)) | `outputs/*-vision.md` ([:33](../agents/vision-creator.md#L33)) **y** `vision/product-vision.md` ([:287](../agents/vision-creator.md#L287)) | Se contradice a sí mismo; prefijo `sdd-harness/` no existe |
| Roadmap Creator | `outputs/*-vision.md` | `outputs/*-roadmap.md` + `.html` | OK |
| Release Planner | `outputs/*-roadmap.md` | `outputs/release-r1.md` ([:50](../agents/release-planner.md#L50)) **y** `product-planning/releases/release-r1.md` ([:180](../agents/release-planner.md#L180)) | Se contradice a sí mismo |
| Feature Decomposer | `product-planning/releases/` | `outputs/features/` | Lee de una raíz que el paso anterior puede no haber escrito |
| Feature Estimator | `discovery/` | `estimations/` | Directorio inexistente |
| Reviewer | — | `outputs/reviews/<art>/v<n>-*.md` | Cuarta convención |
| Dashboard / Metrics | `vision/ roadmap/ releases/ features/` | — | Quinta convención (raíces planas que nadie escribe) |
| Creator Contract | — | `vision/`, `roadmap/`, `releases/`, `features/` | Contradice a todos los creators |

Además: Vision Creator apunta a `templates/vision/product-vision-template.md`; el template real está en `templates/product-vision-template.md`.

**Consecuencia:** la cadena Vision→Roadmap→Release→Features se corta en al menos dos puntos.

---

### BLOQUE D — Contratos de agente incompletos (severidad: alta)

**D1. No existe el contrato de feedback.** El Creator Contract recibe un parámetro `feedback` pero nadie define su esquema. El Reviewer escribe markdown libre en `v<n>-feedback.md`. Un creator no puede "aplicar únicamente los cambios solicitados" sobre prosa no estructurada.

**D2. Versionado sin registro.** El contrato exige "incrementar la versión" pero no hay convención (¿frontmatter? ¿nombre de archivo? ¿`v2-` prefijo?) ni índice de versiones.

**D3. No hay context packing.** El contrato prohíbe explícitamente al creator "explorar libremente el proyecto" y exige que el orquestador le pase `context` consolidado. No existe ningún mecanismo, formato ni agente que arme ese paquete. Hoy o el creator explora (viola el contrato) o no tiene datos.

**D4. La aprobación humana no tiene mecanismo.** El Reviewer pide decisión a cada aprobador según `review-policy.yaml`, pero: nadie lee esa policy, no hay `approvals/`, no hay formato de firma, no hay forma de que el orquestador distinga "esperando humano" de "fallado".

**D5. No hay registro de features.** El Feature Decomposer debe "mantener continuidad con las features existentes" para numerar F001, F002… sin ningún índice que consultar. Colisión garantizada en la segunda corrida.

**D6. Feature Estimator desconectado.** No está en `workflow.yaml` ni en la lista de agentes soportados del orquestador. Lee de `discovery/` (inexistente) y deriva a "Spec Creator" y "Feature Splitter", que no existen en ningún modelo.

**D7. Skills vacías.** `gap_analyzer`, `impact_mapper`, `task_generator`, `feature_extension_creator`, `review`, `deployment` son archivos de 0 bytes referenciados conceptualmente pero sin contenido.

**D8. El template de Visión no produce lo que el Roadmap Creator consume.**
`roadmap-creator.md` §1 declara leer 11 secciones de la Visión. `templates/product-vision-template.md` produce 9, y sólo 4 coinciden:

| Roadmap Creator espera | ¿Lo produce el template de Visión? |
|---|---|
| Visión | ✅ Declaración de Visión |
| Problema | ✅ |
| Capacidades Principales | ✅ Capacidades de Negocio |
| Indicadores de Éxito | ✅ Métricas de Éxito |
| Objetivos Estratégicos | ⚠️ sólo `Resultados Esperados`, distinto nivel |
| Beneficios Esperados | ❌ |
| Alcance General | ❌ |
| **Usuarios Objetivo** | ❌ |
| Restricciones | ❌ |
| Dependencias Estratégicas | ❌ |
| Riesgos Estratégicos | ❌ |

El template de Roadmap **sí** tiene secciones `OE-nnn`, `DE-nnn`, `RE-nnn` — o sea que el Roadmap Creator las tiene que inventar, violando su propia Regla 1 ("no crear nada que no esté respaldado por la visión"). Es el único eslabón roto de la cadena: Roadmap→Release y Release→Features sí son consistentes.

**D8.b — causa raíz del gap USUARIO (E1).** Ni el template de Visión, ni el de Roadmap, ni el de Release, ni el `idea-template` capturan **usuarios objetivo o personas** en ningún punto. La información que `/sdd-refine` exige en la categoría USUARIO no existe en toda la cadena de Discovery. No es un problema del template de feature: es un agujero de origen.

---

### BLOQUE E — El acople con SDD no existe (severidad: es el objetivo del trabajo)

Discovery termina en `outputs/features/F001-*.md` con formato `idea-template.md`.
SDD arranca en `drafts/` → `/sdd-refine` → `input.md` → `/sdd-generate` → `specs/[feature_id]/`.

**E1. Desalineación semántica del formato.** `/sdd-refine` exige 6 categorías CLARAS. El `idea-template` cubre 4:

| Categoría `/sdd-refine` | ¿La cubre `idea-template`? | Fuente |
|---|---|---|
| PROBLEMA | ✅ | `## Problema` |
| USUARIO | ❌ **falta por completo** | — |
| DONE CRITERIA | ✅ | `# Criterios de Aceptación` |
| OUT OF SCOPE | ✅ | `## No Incluye` |
| RESTRICCIONES TÉCNICAS | ✅ parcial | `# Integraciones` + `# Restricciones` + `# Requisitos de Seguridad` |
| UI / FLUJO | ❌ **falta por completo** | — |

Toda feature que salga de Discovery entra a `/sdd-refine` con 2 categorías en estado FALTANTE. El grilling se dispara siempre → se pierde el valor de haber hecho Discovery. **Este es el gap central de la concatenación.**

**E2. Identificadores incompatibles.** Discovery: `F001-gestion-usuarios`. SDD: `feature_id = 001-gestion-usuarios` (nombre de carpeta en `specs/`). Sin regla de mapeo determinista, la trazabilidad se rompe en el borde.

**E3. Sin cadena de trazabilidad.** `specs/_registry/features.yaml` no tiene campos para `vision`, `epic`, `release`, `capability`. Se pierde la línea *outcome de negocio → épica → release → feature → spec → código*, que es justamente lo que justifica tener Discovery.

**E4. `domain` sin origen.** `/sdd-generate` exige un `domain` que exista en `graph/domain.yaml`. El productor natural son las Capacidades de Negocio (BC01…) de la Visión y las Épicas del Roadmap. Nada las mapea.

**E5. Release ≠ Sprint.** SDD tiene `specs/_registry/sprints/`; Discovery tiene Releases. Sin regla de correspondencia, el scope de sprint queda desconectado del release plan.

**E6. La estimación se descarta.** Discovery calcula XS…XL y bloquea en XL. `features.yaml` no tiene campo `size`, y `/sdd-generate` no conoce esa señal.

**E7. Dos registros de decisiones.** Discovery: `decisions/decision-log.md` + `decision-index.json` (DEC-001). SDD: `DECISIONS.md` vía `/sdd-log`. Sin puente ni referencias cruzadas.

**E8. Dos sistemas de métricas.** Discovery: `metrics/project-metrics.json`. SDD: `metrics/[feature_id]-metrics.md` + `/sdd-metrics-summary`. No hay rollup de portfolio.

**E9. Brownfield no cruza el borde.** SDD produce `existing-arch.md` con restricciones técnicas no negociables. Discovery no lo consume, y su "Estado Actual" es puramente de negocio. Un roadmap puede planificar algo que el codebase prohíbe.

**E10. Topología física indefinida.** No está decidido si Discovery y SDD son un repo o dos, y por lo tanto no hay mecanismo de entrega (¿Discovery escribe en `drafts/` de SDD? ¿un paquete exportable? ¿un MCP?).

---

## 3. Modelo objetivo

### 3.1 Cadena completa

```
                    DISCOVERY (negocio/producto)                     │        SDD (ingeniería)
                                                                     │
ideas/ ─→ Vision ─→ Roadmap ─→ Release Plan ─→ Features ─→ Estimate ─┼─→ handoff ─→ /sdd-refine ─→ input.md
           BC01…      EP001…       R1, R2…      F001…       XS…XL    │   package      (0 rondas)
             │          │            │            │                  │       │
             └──────────┴────────────┴────────────┴──────────────────┼───────┘
                        governance loop                              │  ─→ /sdd-generate ─→ specs/[id]/
              Reviewer → Decisions → Metrics → Dashboard             │  ─→ /sdd-implement ─→ /sdd-review
                                                                     │
                        events.jsonl ────────────────────────────────┴──→ portfolio rollup
```

### 3.2 Principio rector

**Discovery no le entrega documentos a SDD; le entrega un contrato tipado.**
El artefacto de borde es un *handoff package* con las 6 categorías de `/sdd-refine` ya resueltas más los metadatos de gobernanza que `/sdd-generate` necesita. Objetivo medible: **`/sdd-refine` con 0 rondas de grilling** (medible con el hook de métricas que ya tiene el comando: `rondas_de_preguntas: 0`, `categorias_faltantes: 0`).

### 3.3 Estructura de directorios propuesta (Discovery)

```
discovery-model/
├── .claude/
│   ├── agents/            ← mover agents/ acá, con frontmatter válido
│   ├── commands/          ← discovery-init, -vision, -roadmap, -release,
│   │                        -features, -estimate, -review, -status, -handoff
│   └── skills/
├── config/
│   ├── workflow.yaml      ← IDs alineados con los name: reales
│   ├── governance.yaml    ← (renombrado) + leído por metrics
│   └── review-policy.yaml ← leído por reviewer
├── contracts/
│   ├── artifact-creator-contract.md
│   ├── feedback-contract.md      ← NUEVO (D1)
│   ├── state-contract.md         ← NUEVO (B1) schema de workflow-status.json
│   └── handoff-contract.md       ← NUEVO (E) contrato de borde con SDD
├── templates/
│   ├── feature-template.md       ← idea-template + USUARIO + UI/FLUJO (E1)
│   └── …
├── outputs/               ← RAÍZ ÚNICA de artefactos
│   ├── vision/  roadmap/  releases/  features/  estimations/
│   ├── reviews/  approvals/  decisions/
│   └── handoff/           ← paquetes listos para SDD
├── registry/
│   ├── features.yaml      ← índice de F001… (D5) + mapeo a feature_id SDD
│   └── capabilities.yaml  ← BC → épica → dominio SDD (E4)
└── metrics/
    ├── workflow-status.json   ← estado de la máquina (B1)
    ├── project-metrics.json   ← derivado, para dashboard (B2)
    └── events.jsonl           ← append-only, base de todo cálculo (B3)
```

---

## 4. El contrato de handoff (núcleo de la concatenación)

### 4.1 `outputs/handoff/<feature_id>/brief.md`

Escrito con las 6 secciones exactas que `/sdd-refine` busca, con los mismos nombres:

```markdown
---
discovery_id: F001
feature_id: 001-gestion-usuarios     # ← nombre de carpeta en specs/ (E2)
vision: outputs/vision/idm-vision.md
epic: EP001
capability: BC01
release: R1
domain: identidades                  # ← alimenta graph/domain.yaml (E4)
size: M                              # ← del Feature Estimator (E6)
sprint: null
decisions: [DEC-004, DEC-011]        # ← referencias al decision log (E7)
source_repo: discovery-model
generated: 2026-08-03
---

## PROBLEMA
## USUARIO            ← sección nueva, obligatoria
## DONE CRITERIA
## OUT OF SCOPE
## RESTRICCIONES TÉCNICAS
## UI / FLUJO         ← sección nueva, obligatoria
```

### 4.2 Reglas de mapeo (deterministas)

| Discovery | SDD | Regla |
|---|---|---|
| `F001-gestion-usuarios` | `001-gestion-usuarios` | quitar prefijo `F`, conservar slug |
| Épica `EP001` | `domain` en `graph/domain.yaml` | vía `registry/capabilities.yaml` |
| Release `R1` | `specs/_registry/sprints/YYYY-SNN` | 1 release → 1..N sprints, declarado en el release plan |
| Estimación `XL` | **no cruza** | Feature Splitter obligatorio antes del handoff |
| `DEC-nnn` | `DECISIONS.md` | referencia por ID, no copia |

### 4.3 Cambios requeridos del lado SDD (mínimos, no invasivos)

1. **`specs/_registry/features.template.yaml`** — agregar campos opcionales:
   ```yaml
   discovery_id: F001        # null si la feature no vino de Discovery
   epic: EP001
   release: R1
   size: M
   ```
2. **`/sdd-refine`** — regla de bypass: si existe `drafts/brief.md` con frontmatter `discovery_id`, validar las 6 secciones y, si están completas, generar `input.md` sin grilling (registrando `rondas_de_preguntas: 0`).
3. **`/sdd-generate`** — si el brief trae `feature_id` y `domain`, usarlos en vez de proponerlos.

Nada de esto rompe el uso actual de SDD sin Discovery: todos los campos son opcionales y el comportamiento por defecto no cambia.

### 4.4 Entrega física

Recomendado: **dos repos, un comando de exportación.**
`/discovery-handoff F001` valida el paquete y lo escribe en `<sdd-project>/drafts/`. Discovery queda como capa de portfolio (multi-producto); SDD queda por repo de producto. El vínculo lo mantiene `registry/features.yaml` (`discovery_id ↔ feature_id ↔ repo`).

---

## 5. Plan de implementación

| Fase | Objetivo | Entregables | Desbloquea |
|---|---|---|---|
| **0** | Que el harness arranque | Mover a `.claude/`, frontmatter válido, IDs de `workflow.yaml` alineados, ruta de config | A1–A4 |
| **1** | Raíz única de rutas | Reescribir I/O de los 4 creators + reviewer + metrics + dashboard sobre `outputs/` | C |
| **2** | Máquina de estados | `state-contract.md`, `workflow-status.json` inicial, `events.jsonl`, orquestador escribiendo estado | B1, B3, B5 |
| **3** | Contratos | `feedback-contract.md`, versionado, context packing, `approvals/`, lectura de `review-policy.yaml` y `governance.yaml` | B4, D1–D4 |
| **4** | Registro y estimación | `registry/features.yaml`, `registry/capabilities.yaml`, Feature Estimator dentro del workflow, Feature Splitter | D5, D6 |
| **5** | **Concatenación** | `templates/feature-template.md` (con USUARIO + UI/FLUJO), `handoff-contract.md`, comando `/discovery-handoff`, parches a SDD (4.3) | E1–E6, E10 |
| **6** | Observabilidad unificada | Rollup de métricas Discovery+SDD, puente de decisiones, dashboard con datos reales, skills vacías | B2, D7, E7, E8 |
| **7** | Brownfield bidireccional | Discovery consume `existing-arch.md` como restricción de roadmap | E9 |

**Ruta crítica hacia el objetivo declarado (concatenar con SDD): fases 0 → 1 → 5.**
Las fases 2–4 son necesarias para que el modelo sea *operable*, pero no bloquean el acople.

---

## 6. Resumen ejecutivo

El Discovery Model está **bien pensado y no ejecutable**. Las especificaciones de agente son sólidas a nivel de responsabilidad y separación de concerns; lo que falta es la capa de infraestructura: descubrimiento de agentes, resolución de nombres, coherencia de rutas, estado persistido y contratos de datos entre agentes.

Para la concatenación con SDD, el gap real es **uno solo y es acotado**: el artefacto de salida de Discovery (`idea-template`) no cubre las categorías USUARIO ni UI/FLUJO que `/sdd-refine` exige, y no transporta los metadatos de gobernanza (`feature_id`, `domain`, `size`, trazabilidad) que `/sdd-generate` necesita. Se resuelve con un template extendido, un contrato de handoff tipado y tres parches menores del lado SDD.
