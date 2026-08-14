# Discovery Model — Blueprint

**Documento maestro de diseño y planning.**
Diagnóstico del modelo anterior: [gap-analysis.md](gap-analysis.md) · El plan de implementación se reemplazó por las specs de cada fase en `specs/`
Fecha: 2026-08-03 · Estado: **pendiente de validación**

---

## 0. Objetivo

Reconstruir el Discovery Model con **paridad funcional total** respecto de lo que hoy declara, pero:

- **orientado a comandos** de ejecución, como el `sdd-model`
- con **dashboard generado** como salida de primera clase
- **bien diseñado**: contratos explícitos, estado persistente, audit determinista
- **concatenable** con `sdd-model` sin pérdida de trazabilidad

Nada de lo que hoy existe se pierde. Lo que hoy es una intención declarada en un `.md`, pasa a ser un comando que corre.

| | SDD Model | Discovery Model |
|---|---|---|
| Audiencia | Devs, tech leads | **PM, PO, BA, stakeholders** |
| Entrada | `drafts/` | `ideas/` (minutas, entrevistas, relevamientos) |
| Salida | Código + tests | **Features listas para SDD + dashboards** |
| Lenguaje | Técnico | **Negocio** |
| Gate | Tests + code review | **Aprobación humana por rol** |
| Runtime | Claude Code | Claude Code (app de escritorio) |
| Persistencia | Repo git | **Carpeta sincronizada (OneDrive/SharePoint)** |

---

## 1. Decisiones de arquitectura

| # | Decisión | Consecuencia |
|---|---|---|
| D1 | Runtime: **app de escritorio de Claude Code** | Slash commands nativos. Se copia la arquitectura del sdd-model, no se reinventa |
| D2 | Persistencia: **carpeta sincronizada, sin git** | Hay que reemplazar 3 cosas que git daba gratis: historial, drift y colisiones (§8) |
| D3 | Audit determinista con **script node** | Se conserva el pilar #7. El PM nunca lo tipea — lo corre el modelo |
| D4 | **Dos modelos separados**: Discovery ≠ SDD | El puente es `/dsc-handoff` |
| D5 | Prefijo `dsc-` | Corto, sin colisión con `sdd-`, ambos modelos pueden convivir |
| D6 | **Namespace por proyecto desde el día 1** | `outputs/<proyecto>/…`. Ver gap G12 — cuesta nada con un proyecto, evita reescribir todo con cinco |

---

## 2. Los 12 pilares del sdd-model, traducidos

| # | Pilar SDD | En Discovery |
|---|---|---|
| 1 | Cadena de artefactos | `ideas/ → iniciativa → visión → roadmap → release → features → brief` |
| 2 | Un comando = una fase | 24 comandos atómicos y reanudables |
| 3 | Gates de prerequisito | Cada comando exige que el anterior exista **y esté APROBADO**. Más duro que en SDD |
| 4 | La IA avisa y para | `/dsc-validate` y `/dsc-audit` reportan y no modifican. Ninguna aprobación la da el modelo |
| 5 | Grilling estructurado | `/dsc-refine`: **7 categorías** × CLARO/AMBIGUO/FALTANTE, una pregunta por vez, reanudable |
| 6 | Registro maestro | `registry/` con proyectos, capabilities, features, ids |
| 7 | Audit determinista | `scripts/discovery-audit.mjs` — 15 checks (§7) |
| 8 | Trazabilidad de decisiones | `/dsc-log` → `DECISIONS.md`, mismo formato que SDD |
| 9 | Telemetría obligatoria | Hook al cierre de cada comando → `metrics/events.jsonl` |
| 10 | Límites de tamaño | visión ≤160 · roadmap ≤200 · release ≤130 · feature ≤120 · iniciativa ≤100 líneas (DEC-006) |
| 11 | Progressive disclosure | Trigger-table en `CLAUDE.md` + skill `discovery-standards` con `references/` |
| 12 | Health + drift | `/dsc-health`. Drift por **hash de contenido**, no por SHA de git |
| T1 | Input no confiable | Check de inyección/secretos sobre `ideas/` — vienen de mails y minutas de terceros |
| T2 | Onboarding | `/dsc-explain` escrito para alguien **no técnico** |

---

## 3. Matriz de paridad funcional

Todo lo que Discovery tiene hoy, y dónde vive en el modelo nuevo. **Ninguna capacidad se pierde.**

### Agentes actuales

| Capacidad actual | Dónde vive ahora | Comando nuevo | Notas |
|---|---|---|---|
| Visión + gap analysis + clarification loop | `agents/vision-creator.md` | `/dsc-vision` | Se extiende con usuarios, alcance, restricciones, riesgos, dependencias (gap D8) |
| Épicas, MoSCoW, dependencias, trimestres, tabla resumen | `agents/roadmap-creator.md` | `/dsc-roadmap` | |
| **Roadmap HTML ejecutivo** | idem, sección "Generación de Roadmap HTML" | `/dsc-roadmap` | Se conserva. Pasa a usar el motor de render compartido (§6) |
| Riesgos estratégicos, entregables | idem | `/dsc-roadmap` | |
| Selección de épicas, releases, criterios de finalización | `agents/release-planner.md` | `/dsc-release` | |
| Descomposición en features, numeración, independencia | `agents/features-decomposer.md` | `/dsc-features` | + captura de USUARIO y UI/FLUJO |
| Estimación 6 factores ponderados, score, talle | `agents/features-estimation.md` | `/dsc-estimate` | Modelo de puntaje intacto |
| Recomendación de split si XL | idem | `/dsc-split` | Hoy solo recomienda; pasa a ejecutarse |
| Review genérico multi-artefacto | `agents/reviewer.md` | `/dsc-review` | |
| Review feature-por-feature con cursor | idem | `/dsc-review` | Con cursor persistente (gap G18) |
| Autoevaluación de calidad previa | idem | `/dsc-review` paso 0 | |
| Aprobación por rol | idem + `review-policy.yaml` | `/dsc-approve` | **Comando nuevo**: la aprobación se separa del review (gap G5) |
| Estados APPROVED / CHANGES_REQUESTED / REJECTED | idem | `/dsc-review` + estado | |
| DEC-nnn, tipos, ACTIVE/SUPERSEDED/OBSOLETE | `agents/decisions-log.md` | `/dsc-log` | + índice |
| ~15 grupos de métricas, bloqueos, próxima acción | `agents/metrics.md` | `/dsc-metrics` | Calculadas sobre `events.jsonl` — recién ahí son reales |
| **Dashboard Ejecutivo** | `agents/dashboard.md` | `/dsc-dashboard` | §6 |
| **Dashboard Técnico** (→ Operativo) | idem | `/dsc-dashboard` | Renombrado: la audiencia no es técnica |
| **Dashboard Portfolio** | idem, "responsabilidades futuras" | `/dsc-portfolio` | Multi-proyecto |
| Orquestación, loop, postApproval, manejo de errores | `commands/orchestrator.md` | `/dsc-run` | Config-driven, sobre estado persistente |
| Etapas configurables | `config/workflow.yaml` | igual | IDs saneados |
| Umbrales verde/amarillo/rojo (9 métricas) | `config/gobernance.yaml` | `config/governance.yaml` | **Pasa a leerse**: colorea el dashboard |
| Matriz de aprobadores por etapa | `config/review-policy.yaml` | igual | **Pasa a leerse** por `/dsc-approve` |
| Contrato CREATE/UPDATE, respuesta estructurada | `contracts/artifact-creator-contract.md` | igual, corregido | |
| Validación de template (7 tipos de check) | `skills/template_idea_validator.md` | skill `artifact-validator` | Se generaliza a todos los artefactos |
| Gap analyzer | `skills/gap_analyzer.md` (vacío) | `/dsc-validate` | Se implementa |
| Impact mapper | `skills/impact_mapper.md` (vacío) | `/dsc-impact` | Se implementa: qué se invalida si cambia X (gap G10) |
| Feature extension creator | `skills/feature_extension_creator.md` (vacío) | `/dsc-change` | Se implementa |
| Review skill | `skills/review.md` (vacío) | absorbido por `/dsc-review` | Se elimina el archivo |
| Task generator | `skills/task_generator.md` (vacío) | **no se porta** | Es responsabilidad de SDD |
| Deployment | `skills/deployment.md` (vacío) | **no se porta** | Es responsabilidad de SDD |
| Templates de visión/roadmap/release/idea | `templates/` | igual, extendidos | |
| Template de decisión / review | vacíos | se completan | |
| Template de dashboard HTML | `templates/dashboard.html` | `dashboard/` | Se saca del CDN (gap G3) |
| `portfolio/` (vacío, intención declarada) | — | `/dsc-portfolio` | Se implementa |

### Comandos sin equivalente actual (los que faltan para que funcione)

| Comando | Por qué |
|---|---|
| `/dsc-setup` | Verifica entorno: node, carpeta sincronizada, permisos |
| `/dsc-explain` | Onboarding para PM/PO |
| `/dsc-new <proyecto>` | Inicializa un proyecto dentro del modelo (gap G12/G16) |
| `/dsc-refine` | El grilling. Hoy no existe: la visión se genera adivinando |
| `/dsc-status` | Dónde estamos, qué falta, quién tiene la pelota |
| `/dsc-approve` | Aprobación por rol, en sesión separada del review |
| `/dsc-audit` | Corre el script determinista |
| `/dsc-health` | Drift, tamaños, huérfanos, artefactos vencidos |
| `/dsc-restore` | Rollback desde `history/` — sin git es la única red (gap G17) |
| `/dsc-handoff` | **El puente con SDD** |
| `/dsc-checklist` | Criterios de negocio a validar con stakeholders |
| `/dsc-snapshot` | Handoff de sesión |
| `/dsc-test` | Smoke test del propio modelo |

**Total: 24 comandos.**

---

## 4. La cadena de artefactos

```
ideas/                          ← minutas, entrevistas, relevamientos, mails
  │  /dsc-refine · GRILLING 7 categorías · reanudable
  ↓
iniciativa.md                   ← brief de negocio sin ambigüedad
  │  /dsc-vision → /dsc-review → /dsc-approve
  ↓
outputs/<prod>/vision/vision.md
  │  /dsc-roadmap → review → approve
  ↓
outputs/<prod>/roadmap/roadmap.md  +  roadmap.html
  │  /dsc-release → review → approve
  ↓
outputs/<prod>/releases/R1.md
  │  /dsc-features → review (cursor) → approve
  ↓
outputs/<prod>/features/F001-<slug>.md
  │  /dsc-estimate      XL → /dsc-split (no cruza)
  ↓
outputs/<prod>/estimations/F001.md
  │  /dsc-handoff F001 --target <repo-sdd>
  ↓
<repo-sdd>/drafts/brief.md  →  /sdd-refine (0 preguntas)  →  /sdd-generate
```

Transversal en cada paso: `/dsc-log` · `events.jsonl` · `/dsc-dashboard`.

### Las 7 categorías del grilling

| # | Categoría | Qué tiene que quedar sin ambigüedad |
|---|---|---|
| 1 | **PROBLEMA** | Qué duele, a quién, con qué frecuencia, cuánto cuesta |
| 2 | **USUARIOS** | Quiénes, qué rol, qué necesitan lograr, nivel técnico |
| 3 | **ESTADO ACTUAL** | Cómo se hace hoy, qué sistemas, qué es manual |
| 4 | **ESTADO DESEADO** | Cómo debería ser, qué desaparece, qué capacidades nuevas |
| 5 | **RESULTADOS ESPERADOS** | Qué mejora, cómo se mide, meta numérica |
| 6 | **RESTRICCIONES** | Presupuesto, plazo, normativa, sistemas obligatorios |
| 7 | **URGENCIA** | Por qué ahora, qué cambió, qué pasa si no se hace en 12 meses |

Las categorías 2 y 4 hoy **no existen en ningún punto del modelo** (gap D8) y son la causa raíz de que el handoff a SDD no funcione.

---

## 5. Estructura de carpetas

```
discovery-model/
├── CLAUDE.md · README.md · DECISIONS.md · package.json
│
├── .claude/
│   ├── commands/              ← 24 comandos
│   ├── agents/                ← 9 subagentes saneados
│   ├── skills/discovery-standards/{SKILL.md, references/}
│   ├── hooks/dsc-session-capture.mjs
│   └── settings.json
│
├── config/{workflow, governance, review-policy}.yaml
├── contracts/{artifact-creator, feedback, state, paths, ids, handoff}.md
├── templates/
├── ideas/
├── scripts/{discovery-audit, gen-dashboard, gen-roadmap}.mjs
│
├── proyectos/                       ← namespace por proyecto (D6)
│   └── <proyecto>/
│       ├── iniciativa.md
│       ├── outputs/{vision,roadmap,releases,features,estimations}/
│       ├── outputs/{reviews,approvals,handoff,history}/
│       └── metrics/{workflow-status.json, events.jsonl}
│
├── registry/{proyectos, capabilities, features, ids}.yaml
│
└── dashboard/
    ├── index.html              ← shell estático, sin CDN
    ├── vendor/chart.umd.js     ← vendorizado
    └── data.js                 ← window.DSC_DATA = {...}  (ver gap G2)
```

---

## 6. El dashboard

Requisito de primera clase. Tres vistas sobre un único dato.

### Vistas

| Vista | Audiencia | Contenido |
|---|---|---|
| **Ejecutivo** | Sponsor, dirección | Estado, etapa, progreso, semáforo de las 9 métricas de `governance.yaml`, riesgos altos, próxima acción, decisiones clave |
| **Operativo** | PM, PO | Tabla de artefactos (estado/versión/última actualización), features por estado, revisiones y aprobaciones pendientes, bloqueos, dependencias sin resolver, cursor de review |
| **Portfolio** | PMO | Multi-proyecto: iniciativas activas, features en Discovery vs. entregadas a SDD, estado leído de los `features.yaml` de cada repo SDD destino |

### Arquitectura

```
events.jsonl  →  /dsc-metrics  →  project-metrics.json  →  gen-dashboard.mjs  →  dashboard/data.js
                                          ↑                                              ↓
                                  governance.yaml                              dashboard/index.html
                                  (umbrales de color)                           (abre con doble clic)
```

Un solo proyector de datos (`/dsc-metrics`), un solo renderizador (`gen-dashboard.mjs`). El HTML nunca lee artefactos — resuelve la contradicción actual entre los agentes `metrics` y `dashboard`.

### Restricciones técnicas resueltas

- **`data.js` y no `data.json`.** Un HTML abierto con `file://` no puede hacer `fetch()` de un JSON vecino — el navegador lo bloquea por CORS. Un `<script src="./data.js">` que define `window.DSC_DATA = {…}` sí carga. Es la diferencia entre un dashboard que funciona con doble clic y uno que muestra la pantalla en blanco.
- **Chart.js vendorizado** en `dashboard/vendor/`, no por CDN. Un proxy corporativo o una sesión sin internet rompen el CDN.
- **Fuentes del sistema**, no Google Fonts.
- **Solo `data.js` cambia** en cada regeneración. El shell HTML es estable → menos ruido de sincronización en OneDrive.
- **Regeneración**: automática al cierre de `/dsc-approve` y `/dsc-status`; manual con `/dsc-dashboard`.

---

## 7. El audit determinista — `scripts/discovery-audit.mjs`

**Lo que el script verifica, el LLM no lo recalcula.**

| # | Check | Sev |
|---|---|---|
| 1 | Registry ↔ archivos: toda feature del registro tiene archivo y viceversa | ERROR |
| 2 | IDs huérfanos: épica sin capacidad, feature sin épica, feature sin release | ERROR |
| 3 | Cadena: toda épica existe en la visión; toda feature existe en su release | ERROR |
| 4 | Dependencias: ciclos, referencias inexistentes, feature planificada antes que su dependencia | ERROR |
| 5 | Estimación: feature aprobada sin estimar; `XL` sin split | ERROR |
| 6 | Aprobaciones: artefacto `APPROVED` sin el archivo de approval de cada rol `required` | ERROR |
| 7 | Handoff: feature `HANDED_OFF` sin `feature_id`, `target_repo` o `domain` | ERROR |
| 8 | Placeholders (`TBD`, `[Completar]`, `Pendiente`, `N/A`, `???`) en artefactos aprobados | ERROR |
| 9 | **Cascada**: artefacto aprobado cuyo antecesor cambió después → `STALE` | ERROR |
| 10 | **Unicidad de IDs**: F/EP/BC/DEC/R duplicados o saltados | ERROR |
| 11 | Tamaño de artefactos contra los límites del pilar 10 | WARN |
| 12 | **Hash drift**: artefacto editado a mano después de aprobado | WARN |
| 13 | **Colisión de edición**: dos `claimed_by` sobre artefactos acoplados | WARN |
| 14 | Releases vencidos con features abiertas | WARN |
| 15 | **Secretos**: patrones de API key, token, password o connection string en cualquier artefacto | ERROR |

Salida: texto para el humano + `metrics/audit-result.json` para que los comandos lo lean sin re-ejecutar.

---

## 8. Lo que git daba gratis y hay que reemplazar

| Git daba | Reemplazo | Comando |
|---|---|---|
| Historial de versiones | `outputs/history/<artefacto>/v<n>.md`, archivado en cada aprobación | `/dsc-restore` |
| Drift por SHA | SHA-256 del contenido guardado en el registry al aprobar → check #12 | `/dsc-health` |
| Detección de conflictos | `claimed_by` + timestamp en el registry → check #13 | `/dsc-status` |

Consideraciones de OneDrive/SharePoint:
- **Latencia de sync**: `/dsc-status` avisa si el `updated` del registry es más nuevo que el mtime local.
- **Archivos bloqueados** durante la sincronización: los comandos reintentan la escritura una vez.
- **Rutas con espacios y acentos** (`C:\Users\PatricioMillán\…`): script y comandos citan las rutas siempre. Causa habitual de fallos silenciosos en Windows.
- **Sin rollback real**: `history/` es la única red. Se documenta explícitamente en `/dsc-explain`.

---

## 9. Gaps de diseño detectados antes de implementar

Estos **no** son los gaps del modelo actual (esos están en [gap-analysis.md](gap-analysis.md)). Son problemas del diseño nuevo que aparecerían durante la implementación si no se resuelven ahora.

### Bloqueantes — hay que decidir antes de escribir código

| # | Gap | Resolución propuesta |
|---|---|---|
| **G1** | El dashboard promete `cycleTime`, `throughput`, `rework`, tokens. Sin log de eventos nace vacío o mintiendo | `events.jsonl` desde la **Fase 1**, no como pulido final. El dashboard es consumidor, nunca proyector |
| **G2** | Un HTML abierto con `file://` no puede `fetch()` un JSON vecino — CORS lo bloquea. La implementación ingenua da pantalla en blanco | `data.js` con `window.DSC_DATA = {…}` vía `<script src>`. Ver §6 |
| **G5** | `review-policy.yaml` exige PO required + UX optional, pero en la sesión el PM está **solo**. El modelo no puede simular la aprobación de UX | Separar `/dsc-review` (genera feedback) de `/dsc-approve` (registra una firma). Estado `AWAITING_APPROVAL` persistente; cada rol corre `/dsc-approve <artefacto> --as UX` en su propia sesión |
| **G10** | Si la visión cambia después de tener features, **nada invalida lo de abajo**. Hoy no existe la noción de cascada | Política de invalidación: aprobar una versión nueva de un artefacto marca a sus descendientes como `STALE`. Check #9 del audit lo reporta. `/dsc-impact` lo muestra antes de confirmar el cambio |
| **G12** | `portfolio/` está declarado pero vacío. Con 5 proyectos, `outputs/vision/` colisiona | **Namespace por proyecto desde el día 1** (D6). Con un solo proyecto no cuesta nada; sin esto hay que reescribir todas las rutas después |
| **G7** | F001, EP001, DEC-001, BC01, R1 con dos personas trabajando en paralelo = colisión garantizada | `registry/ids.yaml` como asignador central con lectura-escritura en el mismo turno + check #10. Documentado en `contracts/ids.md` |

### Importantes — se pueden resolver durante la implementación, pero hay que tenerlos en el radar

| # | Gap | Resolución propuesta |
|---|---|---|
| **G3** | El `dashboard.html` actual usa Chart.js y Google Fonts por CDN; el agente exige "abrir con doble clic" | Vendorizar Chart.js, fuentes del sistema |
| **G4** | El agente dashboard dice "después de cada ejecución de cualquier agente" — con 24 comandos son 24 puntos de invocación | Regeneración automática solo en `/dsc-approve` y `/dsc-status`. Manual con `/dsc-dashboard` |
| **G6** | "Escritor único del estado" no aplica con dos instancias de Claude Code sobre la misma carpeta sincronizada | Releer siempre antes de escribir + `claimed_by` con timestamp. Lock cooperativo: avisa, no impide |
| **G8** | 7 categorías × una pregunta por vez ≈ 40 turnos. Si la sesión se corta o compacta, se pierde todo | `/dsc-refine` persiste estado parcial en `iniciativa.draft.md` con las categorías ya cerradas. Reanudable |
| **G9** | Con 20 features de 100 líneas + roadmap + visión, el contexto explota | Límites de tamaño desde el día 1 + regla de routing: leer solo el artefacto de la etapa, nunca el árbol completo |
| **G18** | El reviewer feature-por-feature con 20 features son 20 ciclos manuales | Cursor persistente + modo batch: aprobar en tanda las que la autoevaluación marca limpias, revisar una por una solo las observadas |
| **G13** | Si el PM está en OneDrive y el repo SDD en la máquina de un dev, `/dsc-handoff --target` no puede escribir | Sin `--target` escribe en `outputs/handoff/` y muestra las instrucciones de entrega. El `--target` es el camino feliz, no el único |
| **G17** | Sin git, una visión corrompida no tiene vuelta atrás | `/dsc-restore <artefacto> <versión>` desde `history/` |

### Decisiones pendientes de tu validación

Quedaron abiertas de la ronda anterior. Propongo un default para cada una para no bloquear; confirmá o corregí.

| # | Pregunta | Default propuesto |
|---|---|---|
| **G11** | `/dsc-scan` (relevar procesos existentes) — ¿aporta, o los `ideas/` ya lo cubren? | **No portarlo en v1.** No hay fuente automática que escanear; sería una entrevista guiada, y eso ya lo hace `/dsc-refine`. Se puede agregar después |
| **G14** | ¿Jira arranca en Discovery o recién en SDD? | **Recién en SDD.** Discovery genera épicas y features como artefactos; Jira se puebla cuando la feature entra a desarrollo. Evita tickets que después se descartan |
| **G15** | ¿La matriz de roles de `review-policy.yaml` (PO/UX/Arquitectura/QA) refleja tu organización? | Se mantiene como está y se ajusta en Fase 1 — es un YAML, cambiarlo es trivial |
| **G16** | ¿El modelo de estimación de 6 factores ponderados se mantiene? | **Sí, intacto.** Está bien diseñado y es determinista |
| **G19** | ¿Un `discovery-model` global multi-proyecto, o una instancia por proyecto? | **Global con namespace por proyecto** (D6). Habilita el dashboard de Portfolio, que hoy está declarado y vacío |

---

## 10. Planning

| Fase | Nombre | Entregables | Peso |
|---|---|---|---|
| **1** | **Fundación** | Estructura `.claude/`, `CLAUDE.md` con trigger-table, `README`, config saneada (3 yaml), `registry/` vacío, `events.jsonl`, `state-contract`, `ids-contract`, `paths-contract`. Comandos: `/dsc-setup`, `/dsc-explain`, `/dsc-new`, `/dsc-status` **+ dashboard mínimo** (progreso y estado de artefactos) | M |
| **2** | **Templates y cadena** | Templates extendidos (usuarios, alcance, restricciones, riesgos, dependencias — cierra D8). Política de invalidación en cascada. 9 agentes saneados sobre las rutas nuevas | M |
| **3** | **Ciclo principal** | `/dsc-refine` (grilling reanudable), `/dsc-vision`, `/dsc-roadmap` (+ HTML), `/dsc-release`, `/dsc-features` | **L** |
| **4** | **Gobernanza** | `/dsc-review`, `/dsc-approve`, `/dsc-log`, `/dsc-validate`, `/dsc-impact`, `/dsc-restore`, `feedback-contract`, `approvals/`, `history/` | L |
| **5** | **Audit** | `registry/` completo, `discovery-audit.mjs` con los 14 checks, `/dsc-audit`, `/dsc-health` | M |
| **6** | **Dashboard completo** | `/dsc-metrics` sobre eventos, `gen-dashboard.mjs`, las 3 vistas, semáforos desde `governance.yaml`, `/dsc-portfolio` | M |
| **7** | **Puente con SDD** | `/dsc-estimate`, `/dsc-split`, `handoff-contract`, `/dsc-handoff`, los 3 parches aditivos en `sdd-model` | M |
| **8** | **Pulido** | Skill `discovery-standards` + references, `/dsc-checklist`, `/dsc-change`, `/dsc-snapshot`, `/dsc-test`, `/dsc-run` (orquestador) | S |

**Ruta mínima con valor demostrable: 1 → 2 → 3 → 7.** Una idea llega a un brief que SDD consume sin preguntas.
**Ruta para uso en equipo: + 4 → 5.**
**Dashboard completo: 6** (pero desde la Fase 1 hay uno mínimo que crece).

### Parches del lado SDD (Fase 7, aditivos)

| # | Archivo | Cambio |
|---|---|---|
| P1 | `specs/_registry/features.template.yaml` | Campos opcionales `discovery_id`, `epic`, `release`, `size` |
| P2 | `.claude/commands/sdd-refine.md` | Si existe `drafts/brief.md` con `discovery_id`: validar y saltear el grilling. Si falta algo, preguntar **solo lo incompleto**. El check de seguridad se mantiene siempre |
| P3 | `.claude/commands/sdd-generate.md` | Usar `feature_id` y `domain` del brief en vez de proponerlos. Propagar trazabilidad al registro |

SDD sin Discovery sigue funcionando idéntico.

---

## 11. Riesgos de ejecución

| # | Riesgo | Mitigación |
|---|---|---|
| R1 | **`node` no disponible** en la máquina del PM | `/dsc-setup` lo verifica en el paso 0. Si falta, el audit degrada a juicio del LLM **avisando explícitamente** que está en modo degradado. El dashboard sí lo necesita — sin node no hay dashboard generado |
| R2 | Conflictos de sync en OneDrive | `claimed_by` + check #13 + `history/` |
| R3 | 24 comandos es mucho para un PM | `/dsc-status` siempre dice el próximo comando literal. La trigger-table hace que el modelo los sugiera sin que el PM los sepa |
| R4 | El grilling de 7 categorías cansa al stakeholder | Una pregunta por vez con ejemplo concreto, reanudable (G8) |
| R5 | UI/FLUJO no se deriva de Discovery | Se interroga en `/dsc-features`, una vez, con visión y roadmap en contexto. Mismo costo, mejor momento |
| R6 | Costo en tokens con audiencia no técnica | Límites de tamaño + routing + `/dsc-metrics` |
| R7 | Deriva entre Discovery y SDD al evolucionar uno | `handoff-contract.md` versionado + `/dsc-test` |

---

## 12. Seguridad

Audiencia no técnica, input de terceros y carpeta sincronizada corporativa. El modelo de amenazas no es opcional.

### 12.1 Principio: cero servidores

El `sdd-model` incluye `kanban-server.mjs` (HTTP en el puerto 3131, bindeado a `127.0.0.1`). **Discovery no porta ningún servidor.**

- El dashboard es un archivo estático que se abre con doble clic (`file://`).
- Ningún script abre puertos, escucha conexiones ni queda residente.
- Ningún comando hace `curl` a localhost.
- Los scripts (`discovery-audit.mjs`, `gen-dashboard.mjs`) leen, escriben y terminan.

Esto es una restricción de diseño, no una decisión diferida.

### 12.2 Modelo de amenazas

| # | Amenaza | Riesgo | Control | Dónde |
|---|---|---|---|---|
| **S1** | **Inyección de prompt vía `ideas/`** — minutas, mails y PDFs de terceros con instrucciones dirigidas al agente | **Alto** | Check obligatorio antes de procesar: instrucciones al agente, comentarios HTML ocultos, texto invisible. Lo detectado se reporta y **no se procesa como requisito** | `/dsc-refine` paso 0 |
| **S2** | **Secretos en artefactos** — API keys o credenciales que aparecen en un relevamiento y terminan en la visión, en un sincronizado compartido | **Alto** | Ningún secreto entra a un artefacto. Se referencia como variable de entorno. Si se detecta: alerta + recomendación de rotación | `/dsc-refine`, `/dsc-audit` check #15 |
| **S3** | **XSS en el HTML generado** — un nombre de feature con `</script>` ejecuta JS al abrir el dashboard | **Alto** | Triple control (§12.3) | `gen-dashboard.mjs`, `gen-roadmap.mjs` |
| **S4** | **Cadena de suministro npm** — cada dependencia es código de terceros ejecutándose en la máquina de un PM | Medio | **Cero dependencias.** Solo builtins de node. Parser YAML propio para el subconjunto restringido que definimos nosotros | `package.json` sin `dependencies` |
| **S5** | **Permisos de Bash demasiado amplios** — `Bash(node *)` habilita ejecutar cualquier script | Medio | Allowlist exacta de dos comandos, con la ruta completa. Nada de comodines | `.claude/settings.json` |
| **S6** | **Escritura fuera del proyecto** — `/dsc-handoff --target <ruta>` puede sobreescribir cualquier cosa | Medio | Validar que el destino sea un repo SDD real (existe `.claude/commands/sdd-refine.md`). Rechazar rutas con `..`. Nunca sobreescribir sin confirmación explícita | `/dsc-handoff` |
| **S7** | **Alcance de compartición** — visión, presupuestos, restricciones organizacionales y análisis competitivo en una carpeta que puede estar compartida con toda la organización | **Alto** | `/dsc-setup` verifica y advierte sobre el alcance de compartición. Carpeta dedicada, nunca la raíz de OneDrive. Se documenta en `/dsc-explain` | `/dsc-setup` |
| **S8** | **Datos personales** — `ideas/entrevistas.md` tiene nombres, roles y citas textuales de empleados | Medio | `ideas/` queda fuera del alcance compartido. Los artefactos usan roles (`U01 — Operario de depósito`), no nombres propios | `contracts/paths.md`, `/dsc-refine` |
| **S9** | **Sin trazabilidad de autoría** — sin git no se sabe quién editó una visión aprobada | Medio | `claimed_by` + firma en `approvals/` + hash drift (check #12). Detecta edición no autorizada, aunque no identifique al autor | `registry/`, `/dsc-audit` |
| **S10** | **Ejecución en `SessionStart`** — el hook corre código al abrir cada sesión | Bajo | Hook mínimo, auditable, solo escribe `sessions.jsonl`. Sin red, sin escritura fuera de `metrics/` | `.claude/hooks/` |
| **S11** | **Exfiltración desde el dashboard** — si S3 se materializa, el JS puede llamar a internet | Medio | CSP con `default-src 'none'` bloquea fetch/XHR/WebSocket. Aun con inyección exitosa, no hay canal de salida | `dashboard/index.html` |
| **S12** | Servidor local expuesto | — | **No aplica: no hay servidor** (§12.1) | — |

### 12.3 Control de XSS en el HTML generado

Tres capas, porque una sola falla:

**1. Escapado en la generación** — `JSON.stringify` **no** escapa `</script>`. Es la falla clásica:

```js
const safe = JSON.stringify(data)
  .replace(/</g, '\\u003c')
  .replace(/>/g, '\\u003e')
  .replace(/\u2028/g, '\\u2028')   // separadores de linea: rompen el JS, no el JSON
  .replace(/\u2029/g, '\\u2029');
// dashboard/data.js  →  window.DSC_DATA = <safe>;
```

Es el patrón que `sdd-model` ya aplica en `gen-kanban.mjs:461`.

**2. Nada de `innerHTML` con datos** — todo texto proveniente de artefactos va por `textContent` o por un helper `esc()` que escapa `& < > "`. Solo se usa `innerHTML` con markup literal del template.

**3. CSP en el shell** — corta la exfiltración incluso si 1 y 2 fallan:

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;">
```

`default-src 'none'` implica `connect-src 'none'`: sin fetch, sin XHR, sin WebSocket. El dashboard no necesita red — vendorizamos Chart.js y usamos fuentes del sistema (§6), así que la política no rompe nada.

### 12.4 Cero dependencias

`sdd-model` usa un único paquete npm (`yaml`). Para Discovery lo eliminamos:

- **Config y registry**: subconjunto YAML plano que definimos nosotros (mapas, listas, escalares — sin anclas, sin tags, sin multi-documento). Parser propio de ~80 líneas sobre builtins.
- **Estado y métricas**: JSON, que node parsea nativo.
- **`package.json` sin `dependencies`.** No hay `npm install`, no hay lockfile que auditar, no hay superficie de supply chain en la máquina del PM.

El costo es un parser propio; el beneficio es que nada de terceros se ejecuta en las máquinas del negocio.

### 12.5 Allowlist de permisos

```json
{
  "permissions": {
    "allow": [
      "Bash(node scripts/discovery-audit.mjs)",
      "Bash(node scripts/gen-dashboard.mjs)"
    ]
  }
}
```

Exacto, sin comodines. `Bash(node *)` habilitaría ejecutar cualquier script del disco.

### 12.6 La decisión sobre node

**El dashboard generado y el audit determinista son las únicas dos cosas que necesitan node.** No hace falta para el resto del modelo.

| Modo | Requiere node | Audit | Dashboard |
|---|---|---|---|
| **Completo** | Sí | Determinista, 15 checks, gratis en tokens | Generado por script, consistente |
| **Degradado** | No | Por juicio del LLM: más caro, menos confiable | Lo escribe el agente en cada regeneración |

El diseño soporta los dos. `/dsc-setup` detecta cuál aplica y **el modelo avisa explícitamente cuando está en modo degradado** — nunca en silencio.

Recomendación: **node solo en las máquinas que generan** (PM/PO que corren el ciclo). Los stakeholders que solo consumen el dashboard no necesitan nada: abren un HTML.

Vale verificar antes de decidir si `node` ya está disponible en el Bash de la app de escritorio de Claude Code — si lo está, la discusión de instalación desaparece.

---

## 13. Criterio de aceptación

Una minuta cruda en `ideas/` recorre el modelo completo y termina en un `brief.md` que `/sdd-refine` consume **sin una sola pregunta** (`rondas_de_preguntas: 0`, `categorias_faltantes: 0`), con trazabilidad:

```
PRY-001 → BC01 → EP001 → R1 → F001 → 001-gestion-usuarios → specs/001-gestion-usuarios/
```

`node scripts/discovery-audit.mjs` devuelve 0 errores, y `dashboard/index.html` abre con doble clic mostrando las tres vistas con datos reales.
