# Plan — 006 Dashboard

> **Provisional.** Se refina en su gate.

## Flujo de datos

```
events.jsonl  ─┐
registry/     ─┼→  /dsc-metrics  →  project-metrics.json  ─┐
audit-result  ─┘                                           ├→ gen-dashboard.mjs → dashboard/data.js
governance.yaml (umbrales) ────────────────────────────────┘                            ↓
                                                                              dashboard/index.html
```

**Un solo proyector por eslabón.** `/dsc-metrics` es el único que escribe `project-metrics.json`; `gen-dashboard.mjs` el único que escribe `data.js`; el HTML nunca lee archivos. Esto resuelve la contradicción que hoy existe entre los agentes `metrics` y `dashboard`, donde ambos declaran ser la fuente.

## Componentes

```
.claude/commands/dsc-metrics.md · dsc-dashboard.md · dsc-portfolio.md
scripts/gen-dashboard.mjs        ← ampliado desde 001 con las tres vistas
lib/metrics.mjs                  ← cálculo sobre eventos
dashboard/index.html             ← tres pestañas, un solo archivo
dashboard/vendor/chart.umd.js
dashboard/data.js                ← window.DSC_DATA
```

## Cálculo sobre eventos

| Métrica | Derivación |
|---|---|
| Progreso | Etapas `APPROVED` sobre etapas del `workflow.yaml` |
| Cycle time por etapa | `STAGE_COMPLETED.ts − STAGE_STARTED.ts` |
| Rework | `FEEDBACK_ISSUED` con severidad bloqueante ÷ artefactos generados |
| Flow efficiency | Tiempo en `IN_PROGRESS` ÷ tiempo total transcurrido |
| Throughput | Artefactos aprobados por período |
| Índice de calidad | Completitud, placeholders, trazabilidad y hallazgos del audit |

Si faltan los eventos necesarios: `No disponible`. Nunca un número estimado.

## El shell HTML

Un solo archivo con tres pestañas. Sin router, sin build, sin framework: `<div>` por vista y un toggle de clase. Chart.js solo donde un gráfico aporta — el resto son tablas, que para esta audiencia se leen mejor.

Seguridad, heredada de la constitución:
- CSP `default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;`
- Todo dato entra por `textContent` o helper `esc()`
- Chart.js vendorizado, fuentes del sistema

## Portfolio y repos SDD

`/dsc-portfolio` intenta leer el `specs/_registry/features.yaml` de cada `target_repo` registrado. Si no es accesible (otra máquina, permisos, ruta cambiada), usa la última lectura cacheada y la marca con su fecha. Nunca falla por un repo inalcanzable — el PMO igual necesita ver el resto.

## Decisiones de diseño

- **Solo `data.js` cambia** en cada regeneración: menos ruido de sincronización en OneDrive y menos chance de conflicto.
- **Tres vistas, un archivo.** Un PM comparte un `.html` por mail y funciona. Tres archivos se desincronizan.
- **Regeneración automática** solo en `/dsc-approve` y `/dsc-status`. No en los 24 comandos: sería ruido constante sobre la carpeta sincronizada.
- **`project-metrics.json` es contrato estable.** Es el punto de integración para Power BI o Grafana sin tocar el modelo.
