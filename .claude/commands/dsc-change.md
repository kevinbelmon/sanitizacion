---
description: Aplica un cambio acotado sobre un artefacto aprobado, sin re-correr toda la cadena.
---

# /dsc-change

Para ajustes chicos: corregir un criterio de aceptación, precisar una restricción, agregar un
caso al alcance. Evita pagar el ciclo completo por un cambio menor.

Tiene un techo explícito. Sin ese techo se convierte en la puerta de atrás que esquiva toda la
gobernanza.

## Paso 1 — ¿Entra en el techo?

`/dsc-change` **solo** aplica si el cambio:

- Toca **un solo artefacto**
- **No** cambia el alcance del release ni del roadmap
- **No** agrega, quita ni renombra usuarios, capacidades, épicas o features
- **No** invalida artefactos aguas abajo más allá del propio

Si se pasa de ahí, decilo y derivá:

```
Lo que querés cambiar no entra en un ajuste acotado: mover EP003 de Q2 a Q1
cambia la planificación, y eso afecta el release y las features que ya se
derivaron de él.

Corresponde regenerar el roadmap: /dsc-roadmap
Antes, mirá qué cuesta: /dsc-impact roadmap
```

Es el mismo criterio que `/sdd-fix` en desarrollo: si el fix crece, se promueve a feature.

## Paso 2 — Mostrar el impacto

Aunque sea chico, corré primero:

```bash
node scripts/impact.mjs <slug> <etapa>[/<item>]
```

Si el artefacto está aprobado, cambiarlo **lo devuelve a revisión** y puede marcar descendientes
como obsoletos. Decilo antes de tocar nada y pedí confirmación.

## Paso 3 — Aplicar

- Editá **solo** lo que se pidió. No aproveches para mejorar otras partes: eso rompe la
  trazabilidad entre el feedback y el cambio.
- Incrementá la versión en el frontmatter.
- El artefacto vuelve a `IN_REVIEW`: el cambio no está firmado por nadie.

## Paso 4 — Registrar

Un cambio sobre algo aprobado **siempre** se registra. Invocá `/dsc-log` inmediatamente después.

## Cierre

```
Ajustado F001 a v2: se precisó el criterio de aceptación sobre diferencias
de remito.

Volvió a estado "en revisión" — necesita firmarse de nuevo.
Su estimación quedó obsoleta.

Próximo paso: /dsc-log, después /dsc-review.
```

## Reglas

- Nunca apliques un cambio sin confirmación explícita.
- Nunca dejes el artefacto en `APPROVED` después de cambiarlo: nadie firmó esa versión.
- Si el usuario insiste en usar `/dsc-change` para algo que excede el techo, explicá una vez por
  qué no corresponde y, si lo reafirma, derivá igual al comando correcto: el techo existe para
  que la cadena siga siendo confiable, no para discutir.
