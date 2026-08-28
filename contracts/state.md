# Contrato de estado

El modelo no tiene git. El estado es lo único que sabe dónde está cada cosa.

## `workflow-status.json`

Ruta: `proyectos/<slug>/metrics/workflow-status.json`

```json
{
  "schema_version": 1,
  "proyecto": "gestion-identidades",
  "initiative": "PRY-001",
  "updated": "2026-08-03T14:22:00Z",
  "updated_by": "Ana Gomez",
  "current_stage": "features",
  "stages": {
    "iniciativa": { "status": "APPROVED",  "version": 1, "hash": "sha256:…", "started_at": "…", "started_by": "Ana Gomez", "approved_at": "…", "approvals": { "Product Owner": { "by": "…", "at": "…", "verdict": "approved" } } },
    "vision":     { "status": "APPROVED",  "version": 2, "hash": "sha256:…", "started_at": "…", "approved_at": "…", "iterations": 1 },
    "roadmap":    { "status": "STALE",     "version": 1, "started_at": "…", "approved_at": "…", "stale_since": "…", "stale_cause": "vision v2" },
    "release":    { "status": "PENDING" },
    "features":   { "status": "IN_REVIEW", "started_at": "…", "cursor": "F003", "pending_roles": ["QA"] },
    "estimation": { "status": "PENDING" },
    "handoff":    { "status": "PENDING" }
  },
  "blocked_by": null,
  "next_action": "Aprobar F003 con QA",
  "next_command": "/dsc-approve F003 --as QA",
  "last_error": null
}
```

## Estados de etapa

| Estado | Significado | ¿Permite avanzar? |
|---|---|---|
| `PENDING` | No se generó | No |
| `IN_PROGRESS` | Comando corriendo o interrumpido | No |
| `IN_REVIEW` | Generado, en autoevaluación o review | No |
| `AWAITING_APPROVAL` | Esperando firmas. `pending_roles` dice cuáles | No |
| `CHANGES_REQUESTED` | Hay feedback bloqueante abierto | No |
| `APPROVED` | Firmado por todos los roles `required` | **Sí** |
| `STALE` | Aprobado, pero un antecesor cambió después | No |
| `REJECTED` | Replanteo total. El flujo se detiene | No |
| `FAILED` | El comando falló. `last_error` dice por qué | No, pero reanudable |

Un artefacto `STALE` sigue siendo legible. `STALE` impide avanzar, no leer.

## Fechas de una etapa

Cada etapa —y cada item de una etapa con items— lleva dos fechas. Son las que responden
"¿cuánto tardó esto?" sin recorrer el log de eventos.

| Campo | Cuándo se escribe | Quién |
|---|---|---|
| `started_at` · `started_by` | Al arrancar el comando que genera la etapa, **antes de la primera pregunta** | `marcarInicio()` de `lib/cascade.mjs`, que además emite `STAGE_STARTED` |
| `approved_at` | Cuando firma el **último rol requerido**, no el primero | `scripts/approve.mjs`, junto con `approvals` |

`approvals` guarda además la fecha de cada firma por separado
(`approvals["Product Owner"].at`), así que la fecha en que firmó un rol concreto no se pierde
cuando firma el siguiente.

**`started_at` es de la versión en curso.** Regenerar una etapa lo resetea: es la fecha en que
arrancó el trabajo que produjo la versión que está en disco. El histórico completo vive en
`events.jsonl`, que nunca se reescribe — si hace falta el primer inicio de todos, sale de ahí.
Una sola fuente de verdad por pregunta.

**Escribirlo antes de preguntar, no después.** Un comando que se interrumpe a mitad de una
conversación tiene que conservar su inicio: si la fecha se escribiera al terminar, toda corrida
interrumpida quedaría sin inicio y el tiempo de la etapa se calcularía mal.

**Ausencia no es error.** Una etapa aprobada antes de que estos campos existieran no los tiene.
El chequeo 17 lo reporta como aviso y solo sobre etapas que arrancaron después: un dato que no
se pudo escribir no es una inconsistencia del modelo.

## Reglas

**Escritor único.** Solo el comando que ejecuta la etapa escribe su entrada en `stages`. `/dsc-metrics` no toca este archivo; escribe `project-metrics.json`. El dashboard no escribe nada.

**Releer antes de escribir.** Dos instancias de Claude Code pueden estar sobre la misma carpeta sincronizada, así que "escritor único" no alcanza. Todo comando relee `workflow-status.json` inmediatamente antes de escribirlo y aborta si `updated` cambió desde que lo cargó.

**Escritura atómica.** Escribir a `workflow-status.json.tmp` y renombrar. OneDrive puede tener el archivo tomado durante la sincronización: si el rename falla, reintentar una vez antes de reportar.

**Ausencia no es error.** Si el archivo no existe, la etapa es `iniciativa` y todo lo demás `PENDING`. Se informa, no se falla.

**Reanudable siempre.** Un comando que espera al humano persiste su estado parcial antes de preguntar. Si la sesión se corta, se retoma donde iba.

## Lock cooperativo

En `registry/features.yaml` y en el estado, cada artefacto puede llevar:

```yaml
claimed_by: "Ana Gomez"
claimed_at: "2026-08-03T14:10:00Z"
```

Avisa, no impide. `/dsc-status` lo reporta con nombre y timestamp; el check 13 del audit lo marca cuando dos claims tocan artefactos acoplados. Un claim de más de 24 horas se reporta como probablemente abandonado.

## Cascada `STALE`

Aprobar la versión `n+1` de un artefacto marca `STALE` a todo su subárbol descendiente, en la misma transacción que la aprobación:

```
iniciativa → vision → roadmap → release → feature → estimation → handoff
```

Si algún paso de la transacción falla, no se marca `APPROVED`. Un estado a medias es peor que no haber aprobado.

## `events.jsonl`

Append-only. Nunca se reescribe ni se trunca. Es la base de todo cálculo de métricas: sin esto, `cycleTime` y `rework` son inventados.

```json
{"ts":"2026-08-03T14:10:02Z","stage":"vision","command":"/dsc-vision","event":"ARTIFACT_CREATED","artifact":"outputs/vision/vision.md","version":1,"actor":"Ana Gomez"}
```

Eventos: `STAGE_STARTED` · `ARTIFACT_CREATED` · `ARTIFACT_UPDATED` · `REVIEW_STARTED` · `FEEDBACK_ISSUED` · `APPROVAL_GRANTED` · `APPROVAL_REJECTED` · `STAGE_COMPLETED` · `HANDED_OFF` · `ERROR`

No se registra contenido de artefactos ni de prompts. Solo qué pasó, cuándo y quién.
