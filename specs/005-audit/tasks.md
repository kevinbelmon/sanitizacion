# Tasks — 005 Audit determinista

> **Provisional.** Se refina en su gate.

| # | Tarea | US |
|---|---|---|
| T001 | `lib/yaml-min.mjs`: completar escritura y fallo ruidoso ante sintaxis fuera del subconjunto | US-3 |
| T002 | `lib/registry.mjs`: lectura/escritura de los cuatro YAML del registry y asignación atómica de IDs | US-1 |
| T003 | `scripts/discovery-audit.mjs` esqueleto: carga del modelo, ejecución de checks, formato de hallazgo, `audit-result.json`, código de salida | US-1 |
| T004 | Checks 1–4: registry↔archivos, IDs huérfanos, cadena, dependencias y ciclos | US-1 |
| T005 | Checks 5–8: estimación, aprobaciones completas, handoff consistente, placeholders | US-1 |
| T006 | Checks 9–11: cascada, unicidad de IDs, tamaño de artefactos | US-1 |
| T007 | Checks 12–15: hash drift, colisión de claims, releases vencidos, patrones de secreto | US-1 |
| T008 | `/dsc-audit`: invocación del script, presentación del reporte en lenguaje de negocio con el `hint` accionable | US-1 |
| T009 | Modo degradado: detección de node, subconjunto de checks por LLM, marca explícita de no determinismo | US-1 |
| T010 | `/dsc-health`: paso 0 que consume `audit-result.json` sin recalcular, más el análisis que requiere juicio | US-2 |
| T011 | `package.json` sin `dependencies` y allowlist actualizada con la ruta exacta del script | US-3 |
| T012 | Verificación: un modelo sano da 0 errores; se rompe cada check a propósito y se confirma que lo detecta | US-1 |

## Gate de cierre

- `node scripts/discovery-audit.mjs` sobre un modelo sano devuelve 0 errores y código 0.
- Cada uno de los 15 checks se dispara cuando se rompe su condición a propósito.
- `package.json` no declara ninguna dependencia.
- Un YAML con una ancla falla con mensaje claro, no se interpreta mal.
- `/dsc-health` no recalcula nada de lo que el script ya verificó.
- Sin node, el reporte queda marcado como no determinista.
