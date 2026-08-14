# Plan — 008 Pulido

> **Provisional.** Se refina en su gate.

## Componentes

```
.claude/skills/discovery-standards/
  SKILL.md
  references/
    discovery-lifecycle.md      ← la cadena, los gates, la anatomía de comando
    governance-roles.md         ← review-policy, firmas, cascada STALE
    artifact-quality.md         ← límites de tamaño, placeholders, ambigüedad
    deterministic-audit.md      ← los 15 checks y la regla de no recalcular
    sdd-handoff.md              ← el contrato de borde
.claude/commands/
  dsc-checklist.md · dsc-change.md · dsc-snapshot.md · dsc-test.md · dsc-run.md
fixtures/                       ← datos de prueba para /dsc-test
```

## El skill

Estructura calcada de `coding-standards` del sdd-model, que ya resolvió bien el problema:

- `SKILL.md` corto: cuándo activarlo, tres reglas de oro, tabla de routing a `references/`.
- Regla de oro #1: lo que `discovery-audit.mjs` verifica, no se recalcula.
- Regla de oro #2: ante conflicto entre skill y comando, manda el comando.
- Regla de oro #3: no introducir procesos nuevos sin registrarlos en artefactos versionados.

La **anatomía común de comando** (definida en 003) vive acá, en `discovery-lifecycle.md`. Los 24 comandos la referencian en vez de repetirla.

## `/dsc-run`: el orquestador

Es el último comando que se implementa a propósito: no puede orquestar lo que no existe.

```
leer workflow-status
    ↓
determinar etapa según workflow.yaml
    ↓
ejecutar el comando de esa etapa
    ↓
¿gate humano?  ── sí →  DETENER, informar qué firma falta
    ↓ no
actualizar estado · evento · dashboard
    ↓
continuar
```

Sin lógica de negocio propia: todo sale de `workflow.yaml`. Agregar una etapa es editar el YAML, no el comando. Y nunca atraviesa un gate de aprobación — se detiene y le devuelve el control al humano.

## `/dsc-test`

Corre sobre `fixtures/` con un proyecto descartable, no sobre `proyectos/` real. Verifica que la cadena completa siga funcionando después de un cambio al modelo. Al terminar, limpia. Es el equivalente de `/sdd-test`: prueba el modelo, no el proyecto.

## Decisiones de diseño

- **El skill se escribe al final**, cuando ya sabemos qué reglas se repitieron en los 24 comandos. Escribirlo antes sería adivinar.
- **`/dsc-run` es opcional.** El modelo funciona corriendo los comandos a mano; el orquestador es conveniencia. Por eso va último y no bloquea nada.
- **`/dsc-change` tiene techo explícito.** Si el cambio crece, deriva al ciclo completo — igual que `/sdd-fix` se promueve a feature. Sin ese techo se convierte en la puerta de atrás que evita toda la gobernanza.
- **`/dsc-scan` no se porta.** Se deja documentada la decisión: no hay nada automático que escanear en Discovery, y la conversación que produciría ya la hace `/dsc-refine`.
