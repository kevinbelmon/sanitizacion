---
description: Registra la firma de un rol sobre un artefacto. Cuando firman todos los roles requeridos, el artefacto queda aprobado.
---

# /dsc-approve

Registra **una firma de un rol**. Cuando están todas las requeridas por
`config/review-policy.yaml`, el artefacto pasa a `APPROVED` y se dispara la cascada.

Cada rol corre este comando en su propia sesión. No hace falta que estén todos juntos.

## La regla que no se negocia

**El modelo nunca firma.** Registra firmas que dio una persona identificada.

Si el usuario dice "aprobalo vos" o "firmá por el PO", explicá por qué no:

```
No puedo firmar por vos ni por nadie. La firma es lo que hace que el registro
sirva: dentro de seis meses, cuando alguien pregunte quién aprobó esto, tiene
que haber un nombre.

Decime tu nombre y en nombre de qué rol firmás, y lo registro.
```

## Paso 1 — Quién firma y en nombre de qué rol

Si no lo dijeron, preguntá las dos cosas. El rol tiene que estar en `review-policy.yaml` para
esa etapa; si no está, el script lo rechaza y dice cuáles son válidos.

Nunca infieras el nombre del `git config`, del email de la sesión ni de nada: preguntalo.

## Paso 2 — Aprobar o rechazar

```bash
node scripts/approve.mjs <slug> <etapa>[/<item>] --as "<rol>" --by "<nombre>" [--comment "<texto>"]
```

Para rechazar, agregá `--verdict rejected`. Un rechazo detiene el workflow: preguntá si es eso lo
que quiere hacer antes de correrlo.

Ejemplos:

```bash
node scripts/approve.mjs stock vision --as "Product Owner" --by "Ana Gomez"
node scripts/approve.mjs stock features/F001 --as "QA" --by "Luis Paz"
```

## Paso 3 — Interpretar

El script hace todo lo demás de forma atómica: archiva la versión en `history/`, calcula el hash,
marca `APPROVED` e invalida los descendientes.

**Si quedaron artefactos obsoletos, es lo más importante del resultado.** No lo escondas al final:

```
Aprobada la visión v2.

⚠️  Esto dejó obsoletos 4 artefactos, porque se construyeron sobre la v1:
      roadmap · release R1 · features F001, F002

    No se borraron: se pueden leer, pero no se puede avanzar hasta regenerarlos.

Próximo paso: /dsc-roadmap
```

## Paso 4 — Cerrar

Regenerá el dashboard con `node scripts/gen-dashboard.mjs` e indicá el próximo comando literal.

## Casos que vas a encontrar

| Situación | Qué decir |
|---|---|
| Faltan otros roles | Quiénes son y el comando exacto para cada uno |
| El rol ya firmó | Quién firmó y cuándo. No se firma dos veces |
| El artefacto está `STALE` | La causa, y que hay que regenerarlo antes de firmar |
| Ya está `APPROVED` | Que para cambiarlo hay que regenerarlo, con la cascada que eso implica |
| El archivo no existe | El script no aprueba nada. Es un problema de consistencia: correr `/dsc-audit` |

## Reglas

- Nunca corras el script sin nombre y rol dados por el usuario.
- Un rechazo detiene el workflow: confirmá antes.
- Después de aprobar, recordá `/dsc-log` si la aprobación vino con condiciones o desvíos.
