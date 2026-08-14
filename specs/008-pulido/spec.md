# Spec — 008 Pulido

> **Provisional.** Se refina en su gate.

Lo que hace que el modelo sea usable a diario y no solo demostrable.

## US-1 · Reglas cargadas por contexto, no siempre

**Como** modelo
**Quiero** cargar solo la referencia que aplica a la tarea
**Para** no inflar el contexto en cada turno

- **Dado** el skill `discovery-standards`, **entonces** su `SKILL.md` enruta a `references/` por área: ciclo, gobernanza y roles, calidad de artefactos, audit determinista, handoff a SDD.
- **Dado** una tarea, **entonces** se lee solo la referencia que aplica.
- **Dado** una regla que el audit ya verifica, **entonces** el skill indica explícitamente no recalcularla.
- **Dado** un conflicto entre el skill y un comando, **entonces** manda el comando.

## US-2 · Validar lo que la máquina no puede

**Como** PO
**Quiero** una lista de criterios que requieren juicio humano
**Para** validarlos con los stakeholders antes de cerrar

- **Dado** que corro `/dsc-checklist`, **entonces** se genera una lista de ítems verificables (`CHK001`…) sobre criterios de negocio que ningún check automático puede cubrir: viabilidad operativa, aceptación de usuarios, alineación con política interna, supuestos regulatorios.
- **Dado** cada ítem, **entonces** es accionable: alguien puede marcarlo ✅ o ❌.
- **Dado** el checklist, **entonces** no repite nada que el audit ya verifica.

## US-3 · Cambios chicos sin re-correr la cadena

**Como** PM al que le pidieron ajustar el alcance de una feature
**Quiero** hacerlo sin regenerar todo
**Para** no pagar el ciclo completo por un cambio menor

- **Dado** que corro `/dsc-change <artefacto>`, **entonces** se aplica un cambio acotado, se incrementa la versión y se registra la decisión.
- **Dado** que el cambio afecta descendientes, **entonces** se muestra el impacto (vía `/dsc-impact`) y se pide confirmación antes de aplicar.
- **Dado** que el cambio crece (toca más de un artefacto o cambia el alcance del release), **entonces** se avisa que corresponde el ciclo completo y no se aplica.

## US-4 · Continuar en otra sesión

- **Dado** que corro `/dsc-snapshot`, **entonces** se produce un resumen del estado, decisiones recientes, artefactos en curso y próximo paso, apto para retomar en otra sesión o pasárselo a otra persona.

## US-5 · Verificar el propio modelo

**Como** quien mantiene el Discovery Model
**Quiero** un smoke test del modelo mismo
**Para** detectar que un cambio rompió el flujo

- **Dado** que corro `/dsc-test`, **entonces** se ejecuta un recorrido con datos de fixture: proyecto nuevo → iniciativa → visión → roadmap → release → features → estimación → handoff.
- **Dado** el resultado, **entonces** se reporta qué paso falló, sin dejar residuos en `proyectos/`.

## US-6 · Correr el ciclo completo

- **Dado** que corro `/dsc-run`, **entonces** el orquestador lee el estado, determina la etapa siguiente según `workflow.yaml`, ejecuta el comando correspondiente y se detiene en cada gate humano.
- **Dado** un fallo, **entonces** se registra la causa, se detiene el flujo y el estado queda reanudable.
- **Dado** un `REJECTED`, **entonces** el flujo se detiene definitivamente.
- **PROHIBITED** — que `/dsc-run` atraviese un gate de aprobación sin firma humana.

## Fuera de scope

- `/dsc-scan` (relevamiento de procesos existentes): no se porta en v1. No hay fuente automática que escanear y el grilling de `/dsc-refine` ya cubre esa conversación.
- Integración con Jira: arranca en SDD.
- `/dsc-context-budget`: el análogo SDD es de perfil técnico y esta audiencia no lo consume.
