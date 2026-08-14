# Plan — 003 Ciclo principal

## Componentes

```
.claude/commands/
  dsc-refine.md · dsc-vision.md · dsc-roadmap.md · dsc-release.md · dsc-features.md
scripts/gen-roadmap.mjs        ← render del roadmap HTML, mismo motor que el dashboard
lib/render.mjs                 ← escapado + shell HTML compartido
```

## Anatomía común de un comando

Los cinco comparten la misma estructura. Es lo que hace que el modelo sea predecible:

1. **Gate de prerequisito** — el artefacto antecesor existe, está `APPROVED` y no está `STALE`. Si no, se detiene indicando el comando exacto que falta correr.
2. **Claim** — se registra `claimed_by` en el registry. Si ya está tomado por otra persona, se avisa con nombre y timestamp.
3. **Carga de contexto acotada** — solo el artefacto antecesor y el template. Nunca el árbol completo.
4. **Generación** contra el template, respetando el límite de líneas.
5. **Confirmación humana** antes de escribir.
6. **Cierre** — escritura, liberación del claim, evento en `events.jsonl`, y el próximo comando literal.

Ese esqueleto se documenta una vez en el skill `discovery-standards` y cada comando lo referencia, en vez de repetirlo cinco veces.

## `/dsc-refine`: el grilling reanudable

Es el comando más largo y el que más riesgo de abandono tiene (~40 turnos posibles).

```
ideas/*  →  [check de seguridad]  →  clasificación 7 categorías
                                            ↓
                              iniciativa.draft.md  ←──┐
                                            ↓         │ una pregunta por vez
                                    ¿queda alguna     │ persistiendo cada cierre
                                    AMBIGUA/FALTANTE? ─┘
                                            ↓ no
                                    confirmación → iniciativa.md
```

`iniciativa.draft.md` guarda, por categoría: estado, contenido consolidado y preguntas ya respondidas. Es lo que hace el comando reanudable entre sesiones.

## Render HTML compartido

`lib/render.mjs` lo usan tanto `gen-roadmap.mjs` como `gen-dashboard.mjs`. Un solo lugar donde se escapa y un solo shell con CSP — si el escapado está bien una vez, está bien en los dos.

## Modelo de fallo

Los cinco comandos fallan **ruidosamente y sin producir artefactos parciales**. Un roadmap a medias es peor que ninguno: el siguiente comando lo tomaría como válido.

| Situación | Comportamiento |
|---|---|
| Antecesor ausente, no aprobado o `STALE` | Detener, indicar el comando que falta |
| Información insuficiente en dimensiones críticas | Detener y preguntar |
| Información insuficiente en dimensiones menores | Continuar declarando el supuesto |
| Artefacto tomado por otra persona | Avisar, permitir continuar bajo decisión del usuario |
| Límite de líneas excedido | Generar, avisar qué quedó afuera |

## Decisiones de diseño

- **UI/FLUJO se interroga acá, no en SDD.** No se puede derivar de Discovery, así que hay que preguntarlo. La diferencia es que acá se pregunta una vez con la visión y el roadmap en contexto, en vez de feature por feature a ciegas en `/sdd-refine`. Mismo costo, mejor momento.
- **USUARIO no se pregunta.** Se deriva de los `U01…` de la Visión vía la épica. Si hubiera que preguntarlo, la fase 002 falló.
- **Un comando por etapa, no uno que genere los cuatro.** A diferencia de `/sdd-generate`, cada artefacto de Discovery necesita su propio gate de aprobación humana antes del siguiente.
- **El HTML del roadmap no es la fuente de verdad.** Es una vista del `.md`. Se regenera, nunca se edita.
