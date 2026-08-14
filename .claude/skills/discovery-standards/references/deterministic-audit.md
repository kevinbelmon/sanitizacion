# Audit determinista

## La regla

**Lo que `scripts/discovery-audit.mjs` verifica, ningún comando lo recalcula.** Se lee su salida
desde `metrics/audit-result.json`.

Recalcular con criterio del LLM es más caro, más lento y menos confiable que leer un JSON.

## Los 15 checks

| # | Verifica | Sev |
|---|---|---|
| 1 | Registro contra archivos, en ambas direcciones | ERROR |
| 2 | IDs huérfanos: épica, release o capacidad faltante | ERROR |
| 3 | Integridad de la cadena: nada inventado aguas abajo | ERROR |
| 4 | Dependencias: ciclos, referencias rotas, orden violado | ERROR |
| 5 | Feature aprobada sin estimar, o XL sin dividir | ERROR |
| 6 | `APPROVED` sin todas las firmas requeridas | ERROR |
| 7 | Handoff sin `feature_id`, `target_repo` o dominio | ERROR |
| 8 | Placeholders en artefactos aprobados | ERROR |
| 9 | Cascada: aprobado antes que su antecesor | ERROR |
| 10 | IDs duplicados o fuera del contador | ERROR |
| 11 | Artefactos por encima del límite de tamaño | WARN |
| 12 | Editado a mano después de aprobado | WARN |
| 13 | Dos personas a la vez, o claim abandonado | WARN |
| 14 | Releases vencidos con features abiertas | WARN |
| 15 | Secretos en artefactos | ERROR |

Los WARN no bloquean: un modelo con avisos sigue siendo usable.

## Estructura

Cada check es una función pura `(modelo) → hallazgos[]`. El modelo se carga una vez. Agregar un
check es agregar una función; el orden no importa.

Cada hallazgo trae `hint`: **qué comando lo resuelve**. Sin eso el reporte no es accionable para
un PM.

## Modo degradado

Sin node, `/dsc-audit` hace con criterio propio los cinco checks que se pueden leer —registro,
IDs huérfanos, cadena, placeholders, secretos— y **lo anuncia explícitamente**:

```
⚠️  MODO DEGRADADO — sin Node no puedo correr la verificación automática.
    Los otros diez necesitan cálculo y no los voy a poder verificar.
    El resultado NO es determinista: es una opinión, no una verificación.
```

**Nunca reportes como verificado algo que corriste en modo degradado.**

## Sin dependencias

`package.json` no declara ninguna. Solo builtins de node, con parser YAML propio
(`lib/yaml-min.mjs`) para el subconjunto que controlamos.

Nada de terceros se ejecuta en la máquina de un PM. Si hace falta una capacidad nueva, se escribe;
no se instala.
