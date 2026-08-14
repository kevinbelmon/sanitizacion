---
description: Revisión general del modelo al cierre de un ciclo: consistencia, calidad de contenido y deriva.
---

# /dsc-health

El audit verifica lo mecánico. Este comando agrega lo que necesita criterio.

## Paso 0 — Audit primero, sin recalcular

```bash
node scripts/discovery-audit.mjs [<slug>]
```

**Incorporá su salida tal cual.** No vuelvas a verificar IDs, dependencias, hashes ni firmas:
eso ya está hecho y hacerlo de nuevo con criterio propio es más caro y menos confiable.

Si node no está, avisá que el reporte es parcial y no determinista.

## Paso 1 — Lo que el script no puede juzgar

Leé los artefactos y evaluá:

**Calidad de contenido.** ¿La visión dice algo o son generalidades? ¿Los criterios de aceptación
son verificables o aspiracionales? ¿Los objetivos tienen meta numérica?

**Contradicciones semánticas.** El audit detecta que `EP003` existe en los dos lados; no detecta
que el roadmap diga "priorizamos autoservicio" y el release ponga primero el módulo de backoffice.

**Artefactos que envejecieron.** Una visión aprobada hace ocho meses con un roadmap que se
replanificó tres veces probablemente ya no refleja la realidad, aunque esté formalmente consistente.

**Decisiones que deberían absorberse.** Si `DECISIONS.md` tiene cinco entradas sobre lo mismo,
eso ya es una regla y debería estar en la visión o en la constitución.

**Usuarios sin cobertura.** Un `Unn` declarado en la visión que no aparece en ninguna feature:
se le prometió algo a alguien que nadie va a construir.

## Paso 2 — Reporte

```
## Salud del modelo — Gestión de Stock — 2026-08-10

### Verificación automática
2 errores, 3 avisos. Detalle en /dsc-audit.

### Calidad de contenido
⚠️  Los objetivos OE-002 y OE-003 no tienen meta numérica.
    Sin eso no se va a poder decir si la iniciativa funcionó.

### Contradicciones
⚠️  El roadmap prioriza autoservicio, pero R1 arranca por backoffice.
    Puede estar bien, pero no está justificado en ningún lado.

### Cobertura de usuarios
❌  U03 (Responsable de compras) está en la visión y en dos épicas,
    pero ninguna feature lo menciona.

### Antigüedad
La visión se aprobó hace 4 meses y el roadmap se replanificó 2 veces.
Vale revisarla antes del próximo release.

### Estado general
REQUIERE ATENCIÓN

Antes del próximo ciclo: resolver los 2 errores del audit y decidir
qué pasa con U03.
```

Estados: `SALUDABLE` · `REQUIERE ATENCIÓN` · `CRÍTICO`.

## Reglas

- **No modifiques ningún archivo.** Solo reportá.
- No repitas lo que el audit ya dijo: incorporalo y sumá lo tuyo.
- Si algo requiere una decisión del equipo, marcalo explícitamente.
- Cerrá con qué hacer antes del próximo ciclo, en orden de prioridad.
