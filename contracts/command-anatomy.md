# Anatomía de un comando de etapa

Los cinco comandos del ciclo principal —`/dsc-refine`, `/dsc-vision`, `/dsc-roadmap`,
`/dsc-release`, `/dsc-features`— comparten esta estructura. Está acá una sola vez para que cada
comando la referencie en vez de repetirla, y para que el modelo sea predecible: quien aprende uno,
sabe usar los cinco.

---

## 1. Gate de prerequisito

Antes de leer nada del proyecto, verificá en `proyectos/<slug>/metrics/workflow-status.json`:

| Condición | Acción |
|---|---|
| El artefacto antecesor no existe | Detener. Indicar el comando que lo genera |
| El antecesor existe pero no está `APPROVED` | Detener. Indicar qué falta: review o firmas, y de qué roles |
| El antecesor está `STALE` | Detener. Nombrar la causa (`vision v2`) y el comando que lo regenera |
| El artefacto de esta etapa ya está `APPROVED` | Preguntar si se quiere regenerar. Advertir que dispara la cascada `STALE` |
| El estado no existe | Solo válido en `iniciativa`. En cualquier otra etapa, detener |

**No hay excepción silenciosa.** Saltarse un gate requiere confirmación humana explícita más una
entrada en `DECISIONS.md` vía `/dsc-log`.

## 2. Claim

Registrá `claimed_by` y `claimed_at` sobre el artefacto.

Si ya está tomado por otra persona, informalo con nombre y desde cuándo, y preguntá si continuar.
**Avisa, no impide** — es un lock cooperativo, no un candado. Si el claim tiene más de 24 horas,
señalalo como probablemente abandonado.

## 2b. Marcar el inicio

Antes de generar nada y **antes de la primera pregunta al humano**:

```js
marcarInicio(slug, etapa, { itemId, actor, command })   // lib/cascade.mjs
```

Escribe `started_at` y `started_by` en el estado y emite `STAGE_STARTED` en una sola operación.
Las dos cosas van juntas: el evento solo sirve para métricas y hay que recorrer el log entero
para leerlo; el estado es lo que muestran `/dsc-status` y el tablero.

Va antes de preguntar porque un comando interrumpido a mitad de conversación tiene que conservar
su fecha de inicio. Si se escribiera al cerrar, toda corrida interrumpida quedaría sin inicio.

Regenerar una etapa **resetea** `started_at`: es el inicio de la versión que queda en disco. El
histórico completo está en `events.jsonl`. Ver `contracts/state.md` → "Fechas de una etapa".

## 3. Contexto acotado

Leé **solo** el artefacto antecesor y el template. Las secciones que podés consumir de cada
antecesor están en `contracts/chain.md`.

No leas el árbol completo del proyecto. Con veinte features de cien líneas más el roadmap y la
visión, el contexto se infla y el agente empieza a razonar sobre artefactos que no son los suyos.

## 4. Generación

Delegá en el subagente que `config/workflow.yaml` declara para la etapa, pasándole el contexto
que exige `contracts/artifact-creator-contract.md`.

Respetá el límite de líneas del artefacto. Si no entra, generá igual y avisá qué quedó afuera.

## 5. Verificación automática, antes de mostrar nada

Escribí el artefacto y corré el audit **antes** de declararlo listo:

```bash
node scripts/discovery-audit.mjs <slug>
```

Si aparece un hallazgo que el comando puede corregir solo —tamaño excedido, un placeholder que
quedó, un ID mal formado— **corregilo y volvé a correr**. Recién después mostrás el resultado.

Esta verificación existe por una razón concreta: **no cuentes líneas a ojo ni des por cumplida
una regla que hay un script para medir.** En la primera corrida real del modelo, el agente
reportó 78 líneas cuando eran 103, y marcó como resuelto un ítem de tamaño sin volver a medir.
Las dos veces lo detectó el check 11, no el criterio del agente.

Lo que el audit ya verifica, no lo estimes.

## 6. Confirmación

Mostrá el resultado y pedí confirmación antes de darlo por cerrado. Si el agente declaró
supuestos o preguntas abiertas, listalos primero: es más barato corregir un supuesto ahora que
tres etapas después.

Si quedó algún hallazgo del audit que no podés resolver solo, decilo con el número de check y
qué haría falta para cerrarlo. No lo escondas: el review lo va a encontrar igual.

## 7. Cierre

En este orden:

1. Escribir el artefacto
2. Actualizar `workflow-status.json` — releyendo primero, para abortar si otra sesión escribió
3. Liberar el claim
4. Emitir el evento en `events.jsonl`
5. Indicar el **próximo comando literal**

---

## Modelo de fallo

**Un artefacto parcial es peor que ninguno**: el comando siguiente lo tomaría como válido y
avanzaría sobre información incompleta.

| Situación | Comportamiento |
|---|---|
| Antecesor ausente, no aprobado o `STALE` | Detener. No escribir nada |
| Falta información en una dimensión crítica | Detener y preguntar. No escribir nada |
| Falta información en una dimensión menor | Continuar y declarar el supuesto |
| Artefacto tomado por otra persona | Avisar. Continuar solo si el usuario lo decide |
| El estado cambió mientras trabajabas | Abortar la escritura. Pedir que se corra `/dsc-status` |
| Límite de líneas excedido | Generar y avisar qué quedó afuera |
| Placeholder detectado en el resultado | No escribir. Completar o preguntar |

Qué es crítico y qué es menor lo define `contracts/chain.md`: si la etapa siguiente consume esa
sección, es crítica.

---

## Reanudación

Todo comando que espera respuestas humanas persiste su estado parcial **antes** de preguntar.
Si la sesión se corta o se compacta, se retoma donde iba.

`/dsc-refine` es el caso extremo: siete categorías, una pregunta por vez, puede llevar cuarenta
turnos. Su estado parcial vive en `iniciativa.draft.md`.

---

## Lenguaje

La audiencia es PM, PO y BA. Nada de exit codes, stderr, parsers ni rutas absolutas salvo que
pregunten. Un problema por vez, con qué hacer al respecto.
