---
description: Vista PMO de todos los proyectos, con lo que ya se entregó al equipo de desarrollo.
---

# /dsc-portfolio

Para quien mira varios proyectos a la vez: dónde está cada uno, cuánto se entregó y dónde están
los cuellos de botella.

## Paso 1 — Datos frescos de todos

```bash
node scripts/discovery-audit.mjs
node scripts/gen-metrics.mjs
node scripts/gen-dashboard.mjs
```

Sin `<slug>`, los tres corren sobre todos los proyectos.

## Paso 2 — Reportar

Leé la sección `portfolio` de `dashboard/data.js` o los `project-metrics.json` de cada proyecto.

```
Portfolio — 3 iniciativas

  PRY-001  Gestión de Stock       Ana Gómez     43%   92/100   2 bloqueos
           7 features · 5 en Discovery · 2 entregadas

  PRY-002  Portal de Clientes     Luis Paz      71%   88/100   sin bloqueos
           12 features · 3 en Discovery · 9 entregadas

  PRY-003  Asistente Interno      —              0%   —        sin arrancar

Entregado a desarrollo: 11 features

  F003 → 003-alta-clientes    en portal-repo     CLOSED
  F004 → 004-baja-clientes    en portal-repo     OPEN
  F001 → 001-ingresos         en stock-repo      repo no accesible

Dónde mirar:
  · Gestión de Stock tiene 2 bloqueos hace más de una semana
  · Asistente Interno no arrancó: sigue esperando los borradores en ideas/
```

## Repos de desarrollo inaccesibles

El comando lee el `specs/_registry/features.yaml` de cada repo SDD destino para saber si la
feature ya se cerró. Ese repo puede estar en otra máquina.

**Nunca falles por un repo inalcanzable.** Mostrá la última información conocida, marcala como
desactualizada y decí cuál es:

```
⚠️  No pude leer ../stock-repo desde esta máquina. Lo que muestro de esas
    3 features es lo último que se registró al entregarlas.
```

## Qué NO hacer

- No compares productividad entre equipos con estos números. Miden madurez del proceso de
  discovery, no desempeño de personas. Si alguien lo pide en esos términos, decilo.
- No inventes un estado en SDD que no pudiste leer.
- No modifiques nada: es una vista.

## Reglas

- Cerrá siempre con dónde mirar, no solo con la tabla.
- Si un proyecto no arrancó, decí qué falta para que arranque.
