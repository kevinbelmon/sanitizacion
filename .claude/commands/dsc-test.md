---
description: Smoke test del propio modelo. Recorre la cadena completa sobre datos de prueba y reporta qué se rompió.
---

# /dsc-test

Prueba **el modelo**, no un proyecto. Se corre después de tocar un comando, un contrato, un
script o un template.

No confundir con `/dsc-audit`, que verifica la consistencia de los **proyectos reales**.

## Correr

```bash
node scripts/smoke.mjs
```

Recorre once pasos sobre un proyecto descartable: crear proyecto, escribir la cadena, registrar,
aprobar, generar el roadmap visual, estimar, auditar, calcular métricas, generar el tablero,
exportar el handoff, y verificar que una feature XL sea rechazada.

## Qué garantiza

- **No toca el registro real.** Lo respalda antes y lo restaura al terminar, incluso si falla.
- **No deja residuos.** El último paso verifica que `proyectos/` quedó limpio.
- El tablero se regenera al final para que no quede apuntando al proyecto de prueba.

## Si un paso falla

El reporte dice cuál y por qué. Interpretalo así:

| Paso que falla | Qué mirar |
|---|---|
| crear proyecto | `scripts/new-proyecto.mjs`, reserva de IDs |
| escribir la cadena | los fixtures o las rutas de `contracts/paths.md` |
| roadmap visual | `gen-roadmap.mjs`, o el formato de la tabla del template |
| estimar | `scripts/estimate.mjs`, tabla de puntajes |
| audit | un check nuevo que da falso positivo, o una regla que cambió |
| métricas | `lib/metrics.mjs`, o eventos que dejaron de emitirse |
| tablero | el escapado de `lib/render.mjs` |
| handoff | las seis secciones, el gate, o el mapeo de IDs |
| gate XL | la regla más importante del borde: **una feature XL no puede cruzar** |
| limpieza | ver abajo |

## Sobre la limpieza

En Windows el borrado puede fallar con `EPERM` si el indexador, el antivirus o el sincronizador
de la nube todavía tienen un archivo tomado. El script reintenta con espera creciente.

Si aun así falla, **no es una falla del modelo**: es el sistema de archivos ocupado. Borrá la
carpeta a mano y volvé a correr.

## Cuándo correrlo

- Después de modificar cualquier comando, contrato, script o template
- Antes de cerrar una fase de construcción del modelo
- Cuando algo se comporta raro y no sabés si es el modelo o los datos

## Reglas

- No lo uses para verificar un proyecto real: para eso está `/dsc-audit`.
- Si agregás una capacidad al modelo, agregá su paso al smoke. Un modelo que crece sin cobertura
  se rompe en silencio.
