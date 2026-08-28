---
description: Selecciona del roadmap las épicas de los próximos 1 a 3 meses y las organiza en un release plan ejecutable.
---

# /dsc-release

Convierte el roadmap en uno o más release plans. Selecciona y organiza: no crea nada nuevo.

Seguí `contracts/command-anatomy.md`. Lo específico está abajo.

## Gate

La etapa `roadmap` tiene que estar `APPROVED` y no `STALE`.

Si ya existen releases, leelos: el nuevo tiene que continuar la numeración y no puede replanificar
épicas ya entregadas.

## Contexto

Al subagente `release-planner` pasale `outputs/roadmap/roadmap.md`, el template, los releases
previos y el feedback si es `UPDATE`.

## Cuántos releases

Preguntá al usuario si no está claro:

```
El roadmap tiene 6 épicas distribuidas en 3 trimestres.

¿Planificamos solo el próximo release (R1, las épicas de Q1), o querés
también R2 y R3 en esta pasada?

Recomiendo empezar por R1: los siguientes se van a ajustar con lo que
aprendamos ejecutando el primero.
```

## Al seleccionar: mostrar de qué depende cada épica

Antes de escribir el release, mostrá el estado de dependencias de las épicas seleccionadas. La
columna **Depende de** de la tabla del roadmap es la fuente. Lo que le importa al PO es una sola
cosa: **si la dependencia entra en este release o queda afuera.**

```
R1 incluye EP001, EP002 y EP004.

  EP001   no depende de nada
  EP002   depende de EP001 — dentro de este release
  EP004   depende de EP003 — FUERA de este release (planificada en Q2 / R2)

EP004 no se puede terminar hasta que salga R2. Tres opciones: la sacamos
de R1, traemos EP003 a R1, o la dejamos sabiendo que queda bloqueada.
```

Presentá las opciones con `AskUserQuestion` cuando haya al menos una dependencia fuera del release.
Si todas las dependencias caen dentro, decilo en una línea y seguí: **el release es autocontenido.**

No lo dejes solo como verificación silenciosa. Una dependencia que cruza el borde del release es una
decisión de negocio, y se toma con el PO mirándola.

## Verificaciones antes de escribir

- Toda épica incluida existe en el roadmap aprobado
- Ninguna épica va antes que aquello de lo que depende. Si la dependencia queda fuera del release, está indicado dónde se resuelve
- Las dependencias de cada épica se leyeron de la columna **Depende de** del roadmap, no del texto del bloque
- Las prioridades del roadmap se respetan: Must antes que Should, Should antes que Could
- Los usuarios impactados se propagaron tal cual desde cada épica
- Los criterios de finalización son verificables — alguien tiene que poder marcarlos ✅ o ❌
- El alcance declara explícitamente qué queda afuera

El último punto importa más de lo que parece: lo que se liste en "excluye" se propaga a la sección
`## OUT OF SCOPE` de cada feature, y de ahí al contrato negativo de la spec en desarrollo.

## Cierre

Estado a `IN_REVIEW`, evento, dashboard.

```
Release R<n> generado: <n> épicas, <n> features estimadas.
Próximo paso: revisarlo.
/dsc-review
```

## Reglas

- No crees épicas nuevas.
- No modifiques prioridades del roadmap. Si hace falta cambiarlas, se cambia el roadmap y se
  vuelve a aprobar — con la cascada `STALE` que eso implica.
- No definas features: eso es `/dsc-features`.
- No definas arquitectura ni tareas técnicas.
- Si el roadmap es ambiguo o hay dependencias irresolubles, el agente falla y no se genera nada.
