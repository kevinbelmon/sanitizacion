---
description: Genera el roadmap con épicas, prioridades, dependencias y distribución trimestral, más su vista ejecutiva en HTML.
---

# /dsc-roadmap

Convierte la Visión en un roadmap de 6 a 12 meses. Produce dos archivos: el `.md`, que es la
fuente de verdad, y el `.html`, que es la vista para stakeholders.

Seguí `contracts/command-anatomy.md`. Lo específico está abajo.

## Gate

La etapa `vision` tiene que estar `APPROVED` y no `STALE`.

Si la visión está `STALE` porque cambió la iniciativa, decilo con la causa y frená: regenerar el
roadmap sobre una visión obsoleta propaga el problema hacia abajo.

## Contexto

Al subagente `roadmap-creator` pasale solo `outputs/vision/vision.md`, el template, y el feedback
si es `UPDATE`. Las once secciones que consume están en `contracts/chain.md` y todas existen en el
template de visión.

## Paso de priorización

Cuando el agente devuelva las épicas, **no las escribas todavía**. Presentá el orden propuesto con
su justificación y ofrecé cambiarlo:

```
Orden propuesto:

  Q1   EP001 Gestión de usuarios      Must    depende de: nada
       EP002 Gestión de roles         Must    depende de: EP001
  Q2   EP003 Auditoría                Should  depende de: EP002
  Q3   EP004 Asistente IA             Could   depende de: nada

Lo ordené así porque EP002 no puede ir antes que EP001, y EP003 necesita
el modelo de roles ya definido.

¿Lo dejamos así, o preferís otro orden? Si querés cambiarlo, indicame
los IDs en el orden que quieras.
```

Usá `AskUserQuestion`. Si el PO elige otro orden:

1. Verificá que no viole dependencias. Si las viola, decilo y pedí confirmación explícita.
2. Regenerá la distribución con ese orden.
3. Recordale registrar la decisión: `/dsc-log`.

Es el único punto del ciclo donde el modelo propone y el humano dispone sobre una decisión de
proyecto. Vale la pena hacerlo bien.

## Al cerrar: qué dependencias generan espera

Después de escribir el roadmap, cerrá diciendo qué dependencias **cruzan de trimestre**, que son
las únicas que cuestan tiempo de calendario. Las de dentro del mismo trimestre son orden, no espera:

```
Dependencias que generan espera entre trimestres:

  EP003 (Q2) espera a EP001 (Q1)
  EP005 (Q3) espera a EP003 (Q2)

Las demás dependencias caen dentro del mismo trimestre: definen el orden
de trabajo, no una espera de calendario.

Quedan dibujadas en roadmap.html con una flecha ↗, para que se vean sin
tener que correr ningún comando.
```

Si ninguna cruza de trimestre, decilo: **no hay esperas entre trimestres**. Es información buena
y hay que darla, no omitirla por ser una buena noticia.

## Verificaciones antes de escribir

- Toda épica está asociada a al menos un objetivo estratégico (`OE-nnn`) de la Visión
- Toda épica declara sus usuarios impactados (`Unn`), heredados de la sección 3
- Ninguna épica se planifica antes que aquello de lo que depende
- No hay ciclos de dependencia
- Las dependencias (`DE-nnn`) y riesgos (`RE-nnn`) estratégicos de la Visión están heredados
- La tabla del roadmap está completa: es lo que lee el generador de HTML
- La columna **Depende de** de la tabla está llena para toda épica: los IDs de las épicas de las
  que depende, separados por coma, o `—` si no depende de ninguna. Es la columna **última** de la
  tabla y no se reordena: el generador la lee por posición. Tiene que coincidir con el campo
  `**Dependencias**` del bloque de cada épica — la tabla declara de qué depende, el bloque explica
  por qué. Una dependencia a una épica que no existe en la tabla es un error, no un aviso

## Generar la vista

Después de escribir el `.md`:

```bash
node scripts/gen-roadmap.mjs <slug>
```

El script parsea la tabla del roadmap. Si falla porque la tabla falta o está mal formada, es un
problema del `.md`: arreglalo y volvé a correrlo. **No escribas el HTML a mano** — el escapado
vive en un solo lugar.

Si node no está disponible, avisá que la vista no se pudo generar y que el `.md` está completo.

## Cierre

```
Roadmap generado (v<n>): <n> épicas en <n> trimestres.
Vista ejecutiva: proyectos/<slug>/outputs/roadmap/roadmap.html

Próximo paso: revisarlo.
/dsc-review
```

## Reglas

- Nada que la Visión no respalde.
- No diseñes arquitectura, no propongas tecnologías, no definas APIs ni bases de datos.
- No definas features.
- El `.html` es una vista: se regenera y nunca se edita a mano.
- Si la Visión está incompleta o el alcance es ambiguo, el agente falla y no se genera nada.
