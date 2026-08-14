---
description: Restaura un artefacto a una versión anterior desde el historial. Es la única red de rollback del modelo.
---

# /dsc-restore

Sin control de versiones, `outputs/history/` es la única forma de volver atrás. Este comando es la
única manera soportada de usarla: copiar el archivo a mano deja el estado, el hash y los
descendientes desincronizados.

Solo se archivan las versiones **aprobadas**. Si algo nunca se aprobó, no hay a qué volver.

## Paso 1 — Listar

```bash
node scripts/restore.mjs <slug> <etapa>[/<item>]
```

Mostrá las versiones con su fecha y cuál es la vigente. Si hay firmas registradas, decí quién
aprobó cada una: ayuda a elegir.

## Paso 2 — Confirmar

Restaurar tiene consecuencias. Explicalas antes:

```
Vas a volver la visión a la v1, del 3 de agosto, aprobada por Ana Gómez.

Tres cosas que van a pasar:

  1. La v2 actual se archiva. No se pierde.
  2. La v1 vuelve a estado "en revisión": nadie firmó ESTA restauración,
     así que hay que volver a aprobarla.
  3. Todo lo que se construyó sobre la v2 queda obsoleto.

¿Confirmás?
```

Si no sabés qué queda obsoleto, corré `/dsc-impact` primero.

## Paso 3 — Restaurar

```bash
node scripts/restore.mjs <slug> <etapa>[/<item>] <version> --by "<nombre>"
```

Pedí el nombre: una restauración es una decisión y tiene que quedar con autor. Nunca lo infieras.

## Paso 4 — Registrar

Una restauración **siempre** se registra. Invocá `/dsc-log` inmediatamente después.

## Cierre

```
Visión restaurada a v1. Está en revisión: necesita firmarse de nuevo.
2 artefactos quedaron obsoletos: roadmap, release R1.

Próximo paso: /dsc-log para registrar el motivo, después /dsc-review.
```

## Reglas

- Nunca restaures sin confirmación explícita.
- Nunca marques la versión restaurada como aprobada: nadie firmó esa restauración.
- Nunca copies archivos de `history/` a mano.
- Si no hay historial, decí por qué: solo se archivan versiones aprobadas.
