---
description: Regenera el tablero de tres vistas. Se abre con doble clic, sin servidor ni internet.
---

# /dsc-dashboard

Regenera `dashboard/index.html` a partir de las métricas de todos los proyectos.

## Cómo se arma

```
events.jsonl ──┐                                                          dashboard/shell.html
registry/      ├──→ /dsc-metrics ──→ project-metrics.json ──┐                      ↓
audit-result   ─┘                                            ├──→ gen-dashboard.mjs ──→ index.html
governance.yaml (umbrales) ──────────────────────────────────┘                      └──→ data.js
```

`shell.html` es la plantilla que se edita a mano. `index.html` es el tablero, con los datos
inyectados adentro: un solo archivo, sin dependencias, que se puede mandar por mail.

**Un solo proyector por eslabón.** El HTML nunca lee archivos: solo consume `window.DSC_DATA`.

## Paso 1 — Datos frescos

Si las métricas son viejas, el tablero muestra el pasado. Corré primero:

```bash
node scripts/discovery-audit.mjs
node scripts/gen-metrics.mjs
```

## Paso 2 — Generar

```bash
node scripts/gen-dashboard.mjs
```

## Paso 3 — Avisar

```
Tablero actualizado con 2 proyectos.
Abrilo con doble clic: dashboard/index.html

  Ejecutivo   estado, progreso, indicadores y qué está frenando
  Operativo   artefactos, features, revisiones y consistencia
  Portfolio   todos los proyectos y lo entregado a desarrollo
```

Si algún repo SDD no fue accesible, decilo: el tablero muestra la última lectura conocida y la
marca como desactualizada, pero conviene que el usuario sepa por qué.

## Sin node

El tablero generado necesita el script. Si node no está disponible, avisá:

```
⚠️  Sin Node no puedo regenerar el tablero.

El archivo dashboard/index.html sigue abriéndose, pero muestra los datos
de la última vez que se generó con Node. Te doy el estado al día acá en
la conversación con /dsc-status.
```

**Nunca escribas el HTML a mano.** El escapado de datos vive en un solo lugar (`lib/render.mjs`)
y ese es el que impide que el nombre de una feature ejecute código en el navegador de quien
abre el tablero.

## Cuándo se regenera solo

En `/dsc-approve` y `/dsc-status`. No en los 24 comandos: sobre una carpeta sincronizada, eso
sería ruido constante.

## Reglas

- El tablero se regenera completo. No hay actualizaciones parciales.
- `index.html` y `data.js` son generados. Lo que se edita a mano es `dashboard/shell.html`.
- No editar el HTML generado: se pierde en la próxima corrida.
- El tablero no carga ningún archivo externo. Se abre con `file://` y ahí un `<script src>`
  queda bloqueado por el navegador, sin mensaje de error: pantalla en blanco. Ver DEC-005.
- Los colores salen de `config/governance.yaml`.
