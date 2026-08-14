# Gobernanza y roles

## El principio

**El modelo nunca firma.** Registra firmas que dio una persona identificada.

Está codificado en el script, no solo en el prompt: `scripts/approve.mjs` exige `--by "<nombre>"`
y falla sin eso. Si el usuario pide "aprobalo vos", la respuesta es que no, y por qué: dentro de
seis meses, cuando alguien pregunte quién aprobó esto, tiene que haber un nombre.

## Review y aprobación son dos cosas

```
/dsc-review    evalúa, produce feedback estructurado, NO aprueba
               estado: IN_REVIEW → AWAITING_APPROVAL, listando roles faltantes

/dsc-approve   registra UNA firma de UN rol, en la sesión de esa persona
               cuando firman todos los required → APPROVED
```

Están separados porque en una sesión el PM está solo y no puede firmar por UX. Cada rol corre
`/dsc-approve` cuando puede; el estado sobrevive entre sesiones.

Quién firma qué: `config/review-policy.yaml`. Ajustarlo es editar el YAML.

## Feedback

YAML estructurado, no prosa: un creator no puede "aplicar solo los cambios pedidos" sobre texto
corrido. Formato en `contracts/feedback.md`.

**Solo `CRITICAL` y `MAJOR` bloquean.** Sin esa distinción, cualquier observación menor detiene
el ciclo y la gente deja de registrar observaciones menores.

Los ítems no se borran: pasan a `RESUELTO` o `DESCARTADO`.

## La transacción de aprobación

Cinco pasos que ocurren juntos o no ocurre ninguno:

1. Archivar la versión en `outputs/history/`
2. Calcular y guardar el hash SHA-256
3. Marcar `APPROVED`
4. Marcar `STALE` a todo el subárbol descendiente
5. Emitir los eventos

Un `APPROVED` sin archivar deja el modelo sin red de rollback, que sin git es lo único que hay.

## Cascada STALE

Aprobar la versión `n+1` de un nodo invalida todo lo que se construyó sobre la `n`.

- `STALE` **no borra ni bloquea la lectura**. Impide avanzar, no consultar.
- Registra la causa: `stale_cause: "vision v2"`. Sin eso nadie sabe qué revisar.
- Se sale regenerando y volviendo a aprobar. **No hay forma de marcarlo vigente a mano**: sería
  declarar consistente algo que nadie verificó.
- `/dsc-impact` muestra el costo **antes** de confirmar el cambio.

## Sin git

| Git daba | Reemplazo |
|---|---|
| Historial | `outputs/history/` + `/dsc-restore` |
| Drift | Hash SHA-256 en el registro → check 12 |
| Conflictos | `claimed_by` → check 13. Avisa, no impide |

Los checks 6, 9 y 12 detectan lo mismo por caminos distintos: **que alguien editó el estado o un
artefacto a mano**. Son la única defensa.
