# Tasks — 006 Dashboard

> **Provisional.** Se refina en su gate.

| # | Tarea | US |
|---|---|---|
| T001 | `lib/metrics.mjs`: cálculo sobre `events.jsonl` — progreso, cycle time, rework, flow efficiency, throughput, índice de calidad | US-1 |
| T002 | Política de `No disponible` cuando faltan eventos, en vez de estimar | US-1 |
| T003 | `/dsc-metrics`: proyector único de `project-metrics.json`, con colores derivados de `governance.yaml` | US-1 |
| T004 | Detección de bloqueos y cálculo de próxima acción a partir del estado y del audit | US-1, US-3 |
| T005 | `dashboard/index.html`: shell de tres pestañas con CSP, sin framework, fuentes del sistema | US-5 |
| T006 | Vista Ejecutivo: estado, progreso de la cadena, semáforo de las 9 métricas, riesgos, decisiones, próxima acción | US-2 |
| T007 | Vista Operativo: tabla de artefactos, features por estado, pendientes, dependencias sin resolver, `STALE`, cursor de review | US-3 |
| T008 | Vista Portfolio: agregación multi-proyecto y lectura de los `features.yaml` de los repos SDD destino | US-4 |
| T009 | Tolerancia a repo SDD inaccesible: última lectura cacheada con fecha y marca de desactualizado | US-4 |
| T010 | `gen-dashboard.mjs`: serialización de las tres vistas a `data.js` con el escapado de `lib/render.mjs` | US-5 |
| T011 | `/dsc-dashboard` manual + regeneración automática en `/dsc-approve` y `/dsc-status` | US-5 |
| T012 | `/dsc-portfolio`: reporte en consola además de la vista, para consulta rápida | US-4 |
| T013 | Verificación: caso XSS en las tres vistas, caso sin internet, caso sin eventos suficientes, caso repo SDD ausente | US-1, US-4, US-5 |

## Gate de cierre

- `dashboard/index.html` abre con doble clic, sin red, y las tres pestañas muestran datos reales.
- Un artefacto llamado `</script><script>alert(1)</script>` se ve como texto en las tres vistas.
- Con eventos insuficientes, la métrica dice `No disponible` en vez de un número.
- Los colores del semáforo salen de `governance.yaml`, no están hardcodeados.
- Un repo SDD inaccesible no rompe la vista Portfolio.
- Una regeneración modifica `data.js` y ningún otro archivo.
