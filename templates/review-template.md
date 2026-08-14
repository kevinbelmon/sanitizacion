# Feedback — <artefacto> v<n>

Salida de `/dsc-review`. El formato estructurado no es capricho: un creator no puede
"aplicar únicamente los cambios solicitados" sobre prosa libre.

Se guarda en `outputs/reviews/<tipo>/<id>/v<n>-feedback.yaml`. Este `.md` es la vista
legible; el contrato de datos está en `contracts/feedback.md`.

---

## Autoevaluación

Corre antes de involucrar a una persona. No consume tiempo de nadie en errores que la
máquina detecta.

| Dimensión | Resultado | Detalle |
|---|---|---|
| Completitud | ✅ / ⚠️ / ❌ | secciones faltantes o vacías |
| Consistencia interna | ✅ / ⚠️ / ❌ | contradicciones dentro del artefacto |
| Alineación con el antecesor | ✅ / ⚠️ / ❌ | qué afirma que el anterior no respalda |
| Trazabilidad | ✅ / ⚠️ / ❌ | IDs huérfanos o referencias rotas |
| Placeholders | ✅ / ❌ | TBD, [Completar], Pendiente, N/A, ??? |
| Tamaño | ✅ / ⚠️ | contra el límite del artefacto |

---

## Observaciones

Solo `CRITICAL` y `MAJOR` bloquean la aprobación. El resto queda registrado y no frena.

### FB-001 · CRITICAL

**Sección** ·
**Revisor** · <nombre> (<rol>)
**Observación** ·
**Cambio requerido** ·
**Estado** · OPEN | RESUELTO | DESCARTADO

---

## Veredicto

`APPROVED` — sin observaciones bloqueantes abiertas
`CHANGES_REQUESTED` — recuperable con una iteración, vuelve al creator con este feedback
`REJECTED` — hay que replantear el artefacto; el workflow se detiene

**Veredicto:**

**Próxima acción:**
