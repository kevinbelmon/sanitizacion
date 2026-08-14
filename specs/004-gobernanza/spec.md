# Spec — 004 Gobernanza

> **Provisional.** Se refina en su gate, con lo aprendido en 003.

El gate humano: revisar, aprobar, registrar decisiones y poder volver atrás.

## US-1 · Revisar un artefacto

**Como** PO
**Quiero** que el modelo evalúe el artefacto antes de que lo mire un humano
**Para** no gastar tiempo de gente en errores que la máquina detecta

- **Dado** un artefacto generado, **cuando** corro `/dsc-review`, **entonces** primero se hace autoevaluación de completitud, consistencia interna, alineación con el antecesor, trazabilidad y placeholders.
- **Dado** el resultado, **entonces** se produce feedback **estructurado** en YAML con `id`, `severity`, `section`, `required_change` y `status`. No prosa libre.
- **Dado** el feedback, **entonces** solo `CRITICAL` y `MAJOR` bloquean la aprobación.
- **Dado** una lista de 20 features, **entonces** las que la autoevaluación marca limpias se ofrecen en tanda, y solo las observadas se revisan una por una.
- **Dado** que reviso features, **entonces** el cursor persiste: si corto, retomo donde iba.

## US-2 · Aprobar como rol, en mi propia sesión

**Como** UX que no estaba cuando el PM corrió el review
**Quiero** poder firmar mi aprobación después
**Para** que el proceso no dependa de que estemos todos juntos

- **Dado** `review-policy.yaml`, **cuando** un artefacto entra a revisión, **entonces** el estado pasa a `AWAITING_APPROVAL` listando qué roles faltan.
- **Dado** que corro `/dsc-approve <artefacto> --as <rol>`, **entonces** se registra mi firma con nombre, rol, fecha y comentario en `approvals/`.
- **Dado** que firmaron todos los roles `required`, **entonces** el artefacto pasa a `APPROVED`, se archiva la versión anterior en `history/`, se registra el hash y se marcan `STALE` los descendientes.
- **Dado** que un rol firma `Rejected`, **entonces** el workflow se detiene y ningún comando posterior puede avanzar.
- **PROHIBITED** — que el modelo registre una firma que un humano no dio.

## US-3 · Registrar decisiones

**Como** PM que se desvió del artefacto anterior
**Quiero** dejar constancia de por qué
**Para** que dentro de seis meses se entienda

- **Dado** que corro `/dsc-log`, **entonces** se me pregunta una cosa por vez: qué cambió, qué alternativas evalué, por qué las descarté, por qué decidí esto, qué artefactos toqué y quién decidió.
- **Dado** las respuestas, **entonces** se agrega `DEC-nnn` a `DECISIONS.md` con ID asignado desde el registry y estado `ACTIVE`.
- **Dado** que una decisión reemplaza a otra, **entonces** la vieja pasa a `SUPERSEDED` referenciando a la nueva.

## US-4 · Validar cobertura

**Como** PM
**Quiero** saber si todo lo que pedí en la iniciativa está cubierto
**Para** no descubrir un faltante en desarrollo

- **Dado** que corro `/dsc-validate`, **entonces** por cada punto de `iniciativa.md` se reporta ✅ cubierto / ⚠️ parcial / ❌ sin cobertura, indicando en qué artefacto.
- **Dado** que hay gaps, **entonces** se indica exactamente qué archivo editar y **no se modifica nada**. El humano decide.

## US-5 · Ver el impacto antes de cambiar

- **Dado** que corro `/dsc-impact <artefacto>`, **entonces** veo la lista de descendientes que quedarían `STALE`, con su estado actual, **antes** de confirmar el cambio.

## US-6 · Volver atrás

**Como** PM que aprobó una visión que resultó equivocada
**Quiero** restaurar la versión anterior
**Para** no depender de que alguien tenga una copia

- **Dado** que corro `/dsc-restore <artefacto>`, **entonces** veo las versiones disponibles en `history/` con fecha y aprobadores.
- **Dado** que elijo una, **entonces** se restaura, se archiva la actual, se registra la decisión y se recalcula el estado de los descendientes.

## Fuera de scope

- El audit que verifica que las aprobaciones sean consistentes — es 005.
- Métricas de retrabajo derivadas del feedback — es 006.
