# Contrato de feedback

El feedback es YAML estructurado, no prosa.

La razón es concreta: `contracts/artifact-creator-contract.md` obliga al creator a "aplicar
únicamente los cambios solicitados y preservar todo el resto". Sobre texto corrido eso no es
verificable — el agente reinterpreta el artefacto entero y el resultado diverge. Con ítems
tipados, cada cambio tiene un origen rastreable y un estado.

Ruta: `proyectos/<slug>/outputs/reviews/<tipo>/<id>/v<n>-feedback.yaml`

---

## Formato

```yaml
artifact: proyectos/gestion-de-stock/outputs/roadmap/roadmap.md
type: roadmap
id: roadmap
version: 1
reviewed_at: 2026-08-10T15:22:00Z
verdict: CHANGES_REQUESTED

self_check:
  completitud: PASS
  consistencia: PASS
  alineacion: FAIL
  trazabilidad: PASS
  placeholders: PASS
  ambiguedad: WARN
  tamano: PASS

items:
  - id: FB-001
    severity: CRITICAL
    section: "Épicas / EP003"
    reviewer: "Ana Gómez"
    role: "Product Owner"
    comment: "EP003 depende de EP005, que está planificada en Q3."
    required_change: "Mover EP003 a Q3, o adelantar EP005 a Q2."
    status: OPEN

  - id: FB-002
    severity: MINOR
    section: "Riesgos estratégicos"
    reviewer: "modelo"
    role: "autoevaluación"
    comment: "RE-002 no declara mitigación."
    required_change: "Agregar mitigación o marcarlo como riesgo aceptado."
    status: OPEN
```

---

## Campos

| Campo | Obligatorio | Qué es |
|---|---|---|
| `id` | Sí | `FB-nnn`, correlativo dentro de este review |
| `severity` | Sí | Ver tabla de severidades |
| `section` | Sí | Dónde. Sin esto el creator tiene que adivinar |
| `reviewer` | Sí | Nombre de la persona, o `modelo` si salió de la autoevaluación |
| `role` | Sí | Rol de `review-policy.yaml`, o `autoevaluación` |
| `comment` | Sí | Qué está mal |
| `required_change` | Sí | **Qué hacer al respecto.** Accionable, no una queja |
| `status` | Sí | `OPEN` · `RESUELTO` · `DESCARTADO` |

Un ítem sin `required_change` accionable no es feedback: es una opinión. No se registra.

---

## Severidades

| Severidad | Significado | ¿Bloquea? |
|---|---|---|
| `CRITICAL` | El artefacto es inutilizable así. Contradice al antecesor, falta una sección, hay un ciclo de dependencias | **Sí** |
| `MAJOR` | Se puede usar pero induce error aguas abajo | **Sí** |
| `MINOR` | Mejora de calidad. No cambia lo que se va a construir | No |
| `QUESTION` | Duda del revisor. Puede resolverse con una respuesta, sin tocar el artefacto | No |
| `SUGGESTION` | Idea para considerar | No |

**Solo `CRITICAL` y `MAJOR` bloquean la aprobación.** El resto queda registrado y no frena el
workflow. Sin esta distinción, cualquier observación menor detiene el ciclo y la gente deja de
registrar observaciones menores.

---

## Autoevaluación

Corre siempre, antes de involucrar a una persona. Sus hallazgos entran como ítems con
`reviewer: modelo`.

| Dimensión | Qué verifica |
|---|---|
| `completitud` | Secciones del template faltantes o vacías |
| `consistencia` | Contradicciones dentro del mismo artefacto |
| `alineacion` | Afirmaciones que el antecesor no respalda |
| `trazabilidad` | IDs huérfanos, referencias rotas, dependencias inexistentes |
| `placeholders` | `TBD`, `[Completar]`, `Pendiente`, `N/A`, `???` |
| `ambiguedad` | "rápido", "simple", "según corresponda", "cuando sea necesario" |
| `tamano` | Contra el límite del artefacto |

Resultados: `PASS` · `WARN` · `FAIL`.

Lo que el audit determinista ya verifica **no se recalcula acá**: se lee de `audit-result.json`.

---

## Veredicto

| Veredicto | Cuándo | Qué pasa |
|---|---|---|
| `APPROVED` | Sin ítems bloqueantes abiertos | El artefacto pasa a `AWAITING_APPROVAL` con los roles de la política |
| `CHANGES_REQUESTED` | Hay bloqueantes, pero es recuperable | Vuelve al creator en modo `UPDATE` con este feedback |
| `REJECTED` | Problema de fondo, hay que replantear | El workflow se detiene |

`verdict: APPROVED` significa "el revisor no tiene objeciones". **No** significa que el artefacto
esté aprobado: eso requiere firmas humanas registradas con `/dsc-approve`.

---

## Ciclo de un ítem

```
OPEN ──→ el creator aplica el cambio ──→ RESUELTO
     └─→ el revisor lo retira        ──→ DESCARTADO
```

Los ítems nunca se borran. El historial de qué se observó y qué se decidió hacer es la mitad del
valor del review — sin él, la misma observación reaparece en cada versión.

Al generar la versión `n+1`, el creator recibe el feedback de la `n` y marca `RESUELTO` lo que
aplicó. Lo que quede `OPEN` se arrastra al review siguiente.
