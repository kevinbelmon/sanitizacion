# Spec — 006 Dashboard

> **Provisional.** Se refina en su gate.

Tres vistas sobre un único dato, generadas por script, abribles con doble clic.

## US-1 · Métricas reales, no declarativas

**Como** modelo
**Quiero** calcular las métricas sobre el log de eventos
**Para** que `cycleTime` y `rework` sean hechos y no promesas

- **Dado** `events.jsonl`, **cuando** corro `/dsc-metrics`, **entonces** se produce `project-metrics.json` con: progreso, estado por artefacto, revisiones y aprobaciones pendientes, decisiones, riesgos, bloqueos, próxima acción, índice de calidad 0–100 y productividad.
- **Dado** que faltan eventos para una métrica, **entonces** se reporta `No disponible`, nunca un número inventado.
- **Dado** `governance.yaml`, **entonces** cada métrica trae su color según los umbrales configurados.
- **Dado** que corro el comando, **entonces** `/dsc-metrics` es el **único** proyector de `project-metrics.json`.

## US-2 · Vista Ejecutivo

**Como** sponsor
**Quiero** entender el estado en 30 segundos
**Para** decidir si tengo que intervenir

- **Dado** que abro el dashboard, **entonces** veo proyecto, estado, etapa, barra de progreso de la cadena, semáforo de las 9 métricas de gobernanza, riesgos altos, decisiones clave y próxima acción.

## US-3 · Vista Operativo

**Como** PM
**Quiero** el detalle de qué está trabado y con quién
**Para** desbloquearlo

- **Dado** la vista Operativo, **entonces** veo tabla de artefactos (estado, versión, última actualización, aprobadores faltantes), features por estado, revisiones y aprobaciones pendientes, dependencias sin resolver, artefactos `STALE` y cursor de review.

## US-4 · Vista Portfolio

**Como** PMO
**Quiero** ver todos los proyectos juntos
**Para** comparar avance y detectar cuellos de botella

- **Dado** varios proyectos en `proyectos/`, **cuando** corro `/dsc-portfolio`, **entonces** veo iniciativas activas, features en Discovery vs. entregadas a SDD, y el estado leído del `features.yaml` de cada repo SDD destino accesible.
- **Dado** un repo SDD inaccesible, **entonces** se muestra la última información conocida con su fecha, y se marca como desactualizada.

## US-5 · Que abra y sea seguro

- **Dado** que abro `dashboard/index.html` con doble clic desde `file://`, **entonces** carga sin errores, sin red y sin consola con errores de CORS.
- **Dado** un nombre de artefacto con `</script>`, `<img onerror=…>` o U+2028, **entonces** se muestra como texto plano.
- **Dado** el HTML, **entonces** declara CSP `default-src 'none'`: aun con inyección exitosa no hay canal de exfiltración.
- **Dado** que no hay internet, **entonces** el dashboard se ve igual.
- **Dado** una regeneración, **entonces** solo cambia `data.js`. El shell HTML es estable.

## Fuera de scope

- Integraciones con Power BI o Grafana. `project-metrics.json` es contrato estable y suficiente para construirlas después.
- Series históricas: se capturan los eventos, pero la v1 muestra estado presente, no tendencia.
