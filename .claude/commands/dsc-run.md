---
description: Recorre el ciclo automáticamente, deteniéndose en cada punto donde hace falta una firma humana.
---

# /dsc-run

El orquestador. Lee el estado, determina la etapa siguiente según `config/workflow.yaml`, ejecuta
el comando de esa etapa y se detiene en cada gate.

**Es una conveniencia, no un requisito.** El modelo funciona corriendo los comandos a mano; esto
solo evita tipear el próximo cuando ya sabés que querés seguir.

## El bucle

```
leer workflow-status
    ↓
determinar la etapa siguiente según workflow.yaml
    ↓
¿el antecesor está APPROVED y no STALE?  ── no →  DETENER, decir qué falta
    ↓ sí
ejecutar el comando de esa etapa
    ↓
¿la etapa necesita firma?  ── sí →  DETENER, decir qué rol y con qué comando
    ↓ no
actualizar estado · evento · dashboard
    ↓
continuar
```

## La regla que no se negocia

**`/dsc-run` nunca atraviesa un gate de aprobación.** Llega hasta él, informa qué firma falta y
devuelve el control.

Si el usuario pide "corré todo y aprobá vos", la respuesta es la misma que en `/dsc-approve`:
el modelo registra firmas, no las emite. Un ciclo que se auto-aprueba no es gobernanza, es un
generador de documentos.

## Sin lógica propia

Todo sale de `config/workflow.yaml`: qué etapas hay, en qué orden, qué comando ejecuta cada una,
qué agente usa y qué corre después de aprobar.

Agregar una etapa es editar el YAML, no este comando. Si te encontrás queriendo agregar un caso
especial acá, probablemente falte un campo en la configuración.

## Manejo de error

Ante un fallo:

1. Registrar la causa en `last_error` del estado
2. Detener el bucle
3. Informar qué pasó y en qué etapa
4. Dejar el estado reanudable: `/dsc-run` retoma desde ahí

Nunca sigas a la etapa siguiente después de un error, ni siquiera si parece menor.

## Rechazo

Si un artefacto quedó `REJECTED`, el bucle termina y no se reanuda hasta que alguien replantee
el artefacto y lo registre con `/dsc-log`.

## Cuándo NO usarlo

- La primera vez en un proyecto: conviene ir comando por comando para entender qué hace cada uno
- Cuando hay un `STALE` sin resolver: primero `/dsc-impact` y decidir qué regenerar
- Cuando el grilling de `/dsc-refine` está a medias: retomalo directo, no por acá

## Cierre

Siempre indicá dónde se detuvo y por qué:

```
Avancé hasta el roadmap.

  Iniciativa   ✅ aprobada
  Visión       ✅ aprobada
  Roadmap      ⏳ generado, espera firma del Product Owner

Me detengo acá: no puedo firmar por vos.

/dsc-approve roadmap --as "Product Owner"
```

## Reglas

- No inventes etapas que no estén en `workflow.yaml`.
- No saltees un gate ni aunque el usuario lo pida: explicá por qué y ofrecé el comando de firma.
- Después de cada etapa aprobada, corré el pipeline `postApproval` que declara la configuración.
