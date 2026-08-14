# Plan — 005 Audit determinista

> **Provisional.** Se refina en su gate.

## Componentes

```
scripts/discovery-audit.mjs     ← los 15 checks
lib/yaml-min.mjs                ← ampliado desde 001 con escritura
lib/registry.mjs                ← lectura/escritura del registry, asignación de IDs
.claude/commands/dsc-audit.md · dsc-health.md
proyectos/<p>/metrics/audit-result.json
```

## Estructura del script

Cada check es una función pura `(modelo) → hallazgos[]`. El script carga el modelo una vez (registry + índice de archivos + frontmatters) y lo pasa a los 15. Eso evita releer el disco quince veces y hace que agregar un check sea agregar una función.

```js
const modelo = cargar(raiz);           // registry + archivos + frontmatters
const hallazgos = CHECKS.flatMap(c => c(modelo));
escribir('audit-result.json', hallazgos);
process.exit(hallazgos.some(h => h.sev === 'ERROR') ? 1 : 0);
```

Formato de hallazgo: `{ check, sev, entity, message, hint }`. El `hint` dice el comando que lo resuelve — es lo que hace el reporte accionable para un PM.

## Parser YAML propio

Subconjunto soportado, deliberadamente chico porque nosotros controlamos el formato:

- Mapas anidados por indentación de 2 espacios
- Listas con `-`
- Escalares: string, número, booleano, `null`
- Strings entre comillas y bloques `>` de una línea
- Comentarios `#`

Fuera de alcance, y **falla ruidosa** si aparecen: anclas (`&`/`*`), tags (`!!`), multi-documento (`---`), claves complejas, flow style (`{}`/`[]`).

Fallar es intencional: preferimos un error claro a una interpretación silenciosamente equivocada de un registry.

## Modo degradado

`/dsc-audit` detecta si node está disponible. Si no:

- Corre una versión reducida por juicio del LLM (checks 1, 2, 3, 8, 15 — los que se pueden leer)
- Marca el resultado como **no determinista** en el reporte y en `audit-result.json`
- `/dsc-health` propaga esa marca a su salida

Nunca se reporta como verificado algo que corrió degradado.

## Decisiones de diseño

- **Un check = una función pura.** Testeable, agregable, y el orden no importa.
- **El script no arregla nada.** Reporta. Arreglar es decisión humana, coherente con el pilar #4.
- **`audit-result.json` es contrato.** Otros comandos lo consumen; su forma no cambia sin versionar.
- **Los WARN no bloquean.** Solo los ERROR. Un modelo con warnings sigue siendo usable.
