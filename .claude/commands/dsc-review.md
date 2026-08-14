---
description: Evalúa un artefacto y produce feedback estructurado. No aprueba: la firma la da una persona con /dsc-approve.
---

# /dsc-review

**Este comando no aprueba nada.** Evalúa y produce feedback. La firma la da una persona con
`/dsc-approve`, posiblemente en otra sesión y otro día.

Es la separación que hace que el modelo funcione en equipo: el PM corre el review, y UX o QA
firman cuando pueden, sin necesidad de estar todos en la misma conversación.

## Paso 0 — Audit primero

Si existe `proyectos/<slug>/metrics/audit-result.json` reciente, leelo. **Lo que el audit ya
verificó no se recalcula**: incorporá su salida y dedicate a lo que requiere juicio.

Si no existe o es viejo, corré `/dsc-audit` primero.

## Paso 1 — Qué revisar

Si el usuario nombró un artefacto, ese. Si no, tomá el que esté en `IN_REVIEW` según
`workflow-status.json`. Si hay varios, listalos y preguntá.

## Paso 2 — Autoevaluación

Corre siempre, antes de involucrar a nadie. Las siete dimensiones están en `contracts/feedback.md`:
completitud, consistencia, alineación con el antecesor, trazabilidad, placeholders, ambigüedad y
tamaño.

Cada hallazgo entra como ítem con `reviewer: modelo`, `role: autoevaluación`.

Para la alineación, usá `contracts/chain.md`: qué secciones consume esta etapa del antecesor, y
si el artefacto afirma algo que el antecesor no respalda.

## Paso 3 — Revisión humana

Presentá los hallazgos y pedí las observaciones del revisor. Cada observación necesita sección,
severidad y **cambio requerido accionable**. Una observación sin qué hacer al respecto es una
opinión: no se registra.

## Paso 4 — Listas de features

Cuando hay muchas features, no las revises una por una a ciegas:

```
R1 tiene 7 features.

  Sin observaciones automáticas    F001, F002, F004, F006, F007
  Con observaciones                F003 (2 mayores), F005 (1 crítica)

¿Revisamos en tanda las 5 limpias y después una por una las 2 observadas?
```

Guardá el cursor en el estado (`stages.features.cursor`): revisar veinte features puede llevar
varias sesiones y hay que poder retomar.

## Paso 5 — Veredicto

| Veredicto | Cuándo | Qué hacer |
|---|---|---|
| `APPROVED` | Sin ítems `CRITICAL` ni `MAJOR` abiertos | Estado a `AWAITING_APPROVAL` con los roles de `review-policy.yaml`. Decir quién tiene que firmar |
| `CHANGES_REQUESTED` | Hay bloqueantes recuperables | Estado a `CHANGES_REQUESTED`. Volver al comando generador en modo UPDATE |
| `REJECTED` | Problema de fondo | Registrar y frenar. La decisión de rechazar la toma una persona con `/dsc-approve --verdict rejected` |

Solo `CRITICAL` y `MAJOR` bloquean.

## Paso 6 — Escribir

Guardá el feedback en `outputs/reviews/<tipo>/<id>/v<n>-feedback.yaml` con el formato de
`contracts/feedback.md`. Actualizá el estado y emití el evento `FEEDBACK_ISSUED`.

Cerrá indicando el comando exacto:

```
Revisión terminada: sin observaciones bloqueantes.
Falta la firma de: Product Owner, QA.

/dsc-approve features/F001 --as "Product Owner"
```

## Reglas

- **Nunca modifiques el artefacto que revisás.**
- **Nunca registres una aprobación ni firmes por nadie.** `verdict: APPROVED` significa "el
  revisor no tiene objeciones", no que el artefacto esté aprobado.
- No inventes observaciones para parecer riguroso. Si está bien, decilo.
- Los ítems no se borran: pasan a `RESUELTO` o `DESCARTADO`.
