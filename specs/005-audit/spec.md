# Spec — 005 Audit determinista

> **Provisional.** Se refina en su gate.

El pilar #7: lo que un script verifica, el LLM no lo recalcula.

## US-1 · Verificar el modelo sin gastar juicio del LLM

**Como** modelo
**Quiero** que las verificaciones mecánicas las haga un script
**Para** que sean baratas, repetibles y confiables

- **Dado** que corro `node scripts/discovery-audit.mjs`, **entonces** se ejecutan los 15 checks y se produce salida legible + `metrics/audit-result.json`.
- **Dado** que hay errores, **entonces** el script sale con código distinto de 0.
- **Dado** que existe `audit-result.json` reciente, **entonces** ningún comando recalcula lo que el script ya verificó: lee su salida.
- **Dado** que node no está disponible, **entonces** `/dsc-audit` degrada a juicio del LLM **anunciándolo explícitamente** y marca el resultado como no determinista.

### Los 15 checks

| # | Check | Sev |
|---|---|---|
| 1 | Registry ↔ archivos en ambas direcciones | ERROR |
| 2 | IDs huérfanos: épica sin capacidad, feature sin épica, feature sin release | ERROR |
| 3 | Cadena: toda épica existe en la visión; toda feature en su release | ERROR |
| 4 | Dependencias: ciclos, referencias inexistentes, orden violado | ERROR |
| 5 | Feature aprobada sin estimar, o `XL` sin split | ERROR |
| 6 | Artefacto `APPROVED` sin approval de cada rol `required` | ERROR |
| 7 | Feature `HANDED_OFF` sin `feature_id`, `target_repo` o `domain` | ERROR |
| 8 | Placeholders en artefactos aprobados | ERROR |
| 9 | Cascada: artefacto aprobado cuyo antecesor cambió después | ERROR |
| 10 | Unicidad de IDs: duplicados o saltos | ERROR |
| 11 | Tamaño de artefactos contra los límites de la constitución | WARN |
| 12 | Hash drift: artefacto editado a mano después de aprobado | WARN |
| 13 | Colisión: dos `claimed_by` sobre artefactos acoplados | WARN |
| 14 | Releases vencidos con features abiertas | WARN |
| 15 | Patrones de secreto (API key, token, password, connection string) | ERROR |

## US-2 · Ver la salud del modelo

**Como** PM al cierre de un ciclo
**Quiero** saber si algo se está pudriendo
**Para** arreglarlo antes de que sea caro

- **Dado** que corro `/dsc-health`, **entonces** el paso 0 es correr el audit e **incorporar su salida sin recalcularla**.
- **Dado** eso, **entonces** el reporte agrega lo que requiere juicio: calidad de contenido, contradicciones semánticas, artefactos que envejecieron.
- **Dado** el reporte, **entonces** no se modifica ningún archivo. Solo se reporta.

## US-3 · Sin dependencias de terceros

- **Dado** `package.json`, **entonces** no tiene `dependencies`. Solo builtins de node.
- **Dado** un YAML del modelo, **entonces** `lib/yaml-min.mjs` lo lee correctamente.
- **Dado** un YAML con sintaxis fuera del subconjunto soportado (anclas, tags, multi-documento), **entonces** el parser **falla ruidosamente**, nunca lo interpreta mal en silencio.

## Fuera de scope

- Métricas de proceso (cycleTime, throughput, rework) — es 006. Acá se verifica consistencia, no se mide productividad.
