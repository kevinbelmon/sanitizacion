# Ciclo y anatomía de comando

## La cadena

```
ideas/ → iniciativa → visión → roadmap → release → features → estimación → handoff
```

Cada nodo consume **solo a su antecesor directo**. La única excepción declarada es
`/dsc-features`, que lee la sección 3 de la visión para derivar los usuarios.

Qué sección consume cada etapa: `contracts/chain.md`.
Dónde vive cada archivo: `contracts/paths.md`.

## Anatomía de un comando de etapa

Los cinco del ciclo comparten esta estructura. Detalle completo en
`contracts/command-anatomy.md`.

1. **Gate** — el antecesor existe, está `APPROVED` y no está `STALE`. Si no, se detiene
   indicando el comando exacto que falta.
2. **Claim** — `claimed_by` en el estado. Avisa si ya está tomado; no impide.
3. **Contexto acotado** — solo el antecesor y el template. Nunca el árbol completo.
4. **Generación** — vía el subagente que declara `config/workflow.yaml`.
5. **Confirmación** — mostrar y pedir el sí antes de escribir.
6. **Cierre** — escribir, actualizar estado (releyendo antes), liberar claim, emitir evento,
   decir el próximo comando.

## Modelo de fallo

**Un artefacto parcial es peor que ninguno**: el comando siguiente lo tomaría como válido.

| Situación | Comportamiento |
|---|---|
| Antecesor ausente, no aprobado o `STALE` | Detener, no escribir nada |
| Falta información crítica | Detener y preguntar |
| Falta información menor | Continuar y declarar el supuesto |
| El estado cambió mientras trabajabas | Abortar la escritura |
| Límite de líneas excedido | Generar y avisar qué quedó afuera |

Crítico vs. menor lo define `contracts/chain.md`: si la etapa siguiente consume esa sección,
es crítica.

## Reanudación

Todo comando que espera respuestas humanas persiste antes de preguntar. `/dsc-refine` es el
caso extremo — siete categorías pueden ser cuarenta turnos — y guarda en `iniciativa.draft.md`.
