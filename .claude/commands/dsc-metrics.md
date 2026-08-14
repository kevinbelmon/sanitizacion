---
description: Calcula las métricas del proyecto sobre el historial de eventos y las deja listas para el tablero.
---

# /dsc-metrics

Único proyector de `project-metrics.json`. El tablero lo consume; nadie más lo escribe.

## Paso 1 — Audit primero

```bash
node scripts/discovery-audit.mjs [<slug>]
```

Las métricas de calidad y bloqueos se apoyan en los hallazgos del audit. Sin correrlo antes,
el índice de calidad sale sin esa componente y hay que decirlo.

## Paso 2 — Calcular

```bash
node scripts/gen-metrics.mjs [<slug>]
```

## Paso 3 — Presentar

Traducí a lenguaje de negocio. Lo importante no son los números sino qué significan.

```
Gestión de Stock — 3 de 7 etapas aprobadas (43%)

  Calidad          92 / 100
  Bloqueos         2
  Tiempo de ciclo  1,2 días promedio por artefacto
  Retrabajo        14% — de cada 7 artefactos generados, 1 volvió con
                   observaciones bloqueantes

  Todavía sin datos: eficiencia de flujo. Se calcula cuando haya al menos
  dos etapas cerradas de punta a punta.

Qué está frenando:
  · El release espera la firma del Product Owner
  · F001 tiene observaciones bloqueantes sin resolver
```

## La regla que no se rompe

**Si faltan eventos para una métrica, se dice "sin datos suficientes".**

Nunca la estimes, nunca la infieras de fechas de archivo, nunca pongas cero. Una métrica
inventada es peor que una ausente: alguien va a tomar una decisión sobre ella.

Cuando una métrica no está disponible, explicá **qué falta para que aparezca** — no dejes al
usuario pensando que el modelo está roto.

## Los semáforos

Los colores salen de `config/governance.yaml`, no están hardcodeados. Si el equipo cambia el
umbral de retrabajo aceptable, cambia el color sin tocar código.

Si el usuario pregunta por qué algo está en rojo, mostrale el umbral configurado.

## Cierre

Regenerá el tablero y avisá:

```bash
node scripts/gen-dashboard.mjs
```

## Reglas

- No modifiques ningún artefacto.
- No le pidas información al usuario: todo sale de los eventos y los artefactos.
- No generes HTML: eso es de `gen-dashboard.mjs`.
- `project-metrics.json` es contrato estable. Se puede extender, no romper: es el punto de
  integración si mañana quieren llevarlo a Power BI o Grafana.
