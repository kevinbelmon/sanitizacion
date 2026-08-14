# Spec — 003 Ciclo principal

Los cinco comandos que convierten una idea cruda en features. Es la fase más grande y la que da el valor visible.

## US-1 · Convertir ideas crudas en una iniciativa clara

**Como** PM con minutas, entrevistas y un relevamiento sueltos
**Quiero** que el modelo me interrogue hasta que no quede ambigüedad
**Para** no arrastrar supuestos hasta el final de la cadena

- **Dado** que hay archivos en `ideas/`, **cuando** corro `/dsc-refine`, **entonces** primero se escanea el contenido buscando inyección de instrucciones, secretos y URLs sospechosas. Lo detectado se reporta y **no se procesa como requisito**.
- **Dado** el contenido limpio, **entonces** el sistema clasifica las 7 categorías en CLARO / AMBIGUO / FALTANTE y me muestra el resumen.
- **Dado** una categoría AMBIGUA o FALTANTE, **entonces** se hace **una** pregunta concreta y se espera la respuesta antes de la siguiente. Nunca todas juntas.
- **Dado** que respondo de forma vaga, **entonces** la pregunta se reformula con un ejemplo concreto, y no se avanza.
- **Dado** que cierro la sesión a mitad del grilling, **cuando** vuelvo a correr `/dsc-refine`, **entonces** retoma desde la primera categoría abierta: las cerradas están persistidas en `iniciativa.draft.md`.
- **Dado** que las 7 categorías están CLARO, **entonces** se pide confirmación explícita antes de escribir `iniciativa.md`.
- **Dado** un secreto detectado, **entonces** nunca se copia al artefacto: se referencia como variable de entorno y se recomienda rotarlo.

## US-2 · Generar la Visión

**Como** PM con una iniciativa aprobada
**Quiero** una Visión del Proyecto estructurada
**Para** alinear al equipo y habilitar el roadmap

- **Dado** que `iniciativa.md` está aprobada, **cuando** corro `/dsc-vision`, **entonces** se genera la Visión con las 15 secciones del template, incluyendo `Usuarios Objetivo` con IDs `U01…`.
- **Dado** que la iniciativa **no** está aprobada, **entonces** el comando se detiene indicando qué falta. No genera nada.
- **Dado** que falta información que afecta problema, estado actual, estado deseado, resultados o capacidades, **entonces** se detiene y pregunta. No se asume.
- **Dado** que falta información menor, **entonces** continúa declarando explícitamente el supuesto tomado.
- **Dado** que la Visión supera 160 líneas, **entonces** se avisa qué quedó afuera para revisión humana.

## US-3 · Generar el Roadmap

**Como** PM con la Visión aprobada
**Quiero** épicas priorizadas y distribuidas en el tiempo
**Para** poder planificar releases

- **Dado** que la Visión está aprobada, **cuando** corro `/dsc-roadmap`, **entonces** se generan épicas (`EP nnn`) con capacidades asociadas, prioridad MoSCoW, dependencias, usuarios impactados y distribución por trimestre.
- **Dado** el roadmap, **entonces** toda épica está asociada a al menos un objetivo estratégico de la Visión y toda dependencia queda documentada.
- **Dado** el roadmap generado, **entonces** también se produce `roadmap.html`: standalone, sin CDN, con CSP, que abre con doble clic.
- **Dado** que el roadmap propone una priorización, **entonces** se me ofrece aceptarla o dar un orden propio antes de confirmar.
- **Dado** que la Visión es ambigua o le faltan objetivos estratégicos, **entonces** el comando falla explícitamente y no genera roadmap parcial.

## US-4 · Generar el Release Plan

**Como** PO
**Quiero** seleccionar qué épicas entran en los próximos 1–3 meses
**Para** tener un alcance ejecutable

- **Dado** que el roadmap está aprobado, **cuando** corro `/dsc-release`, **entonces** se generan uno o más `R n` respetando prioridades y dependencias.
- **Dado** que `EP002` depende de `EP001`, **entonces** nunca se planifica `EP002` en un release anterior.
- **Dado** cada release, **entonces** tiene objetivo, alcance (incluye/excluye), valor esperado, riesgos, criterios de finalización y usuarios impactados.
- **Dado** que el comando corre, **entonces** no crea épicas nuevas ni modifica prioridades del roadmap.

## US-5 · Descomponer en Features

**Como** PO
**Quiero** features independientes y verificables
**Para** entregárselas a desarrollo

- **Dado** un release aprobado, **cuando** corro `/dsc-features`, **entonces** se genera una feature por unidad funcional, con ID asignado desde `registry/ids.yaml`.
- **Dado** cada feature, **entonces** su sección `## USUARIO` se deriva de los usuarios de su épica **sin preguntar**.
- **Dado** cada feature, **entonces** su sección `## UI / FLUJO` se completa mediante grilling: pantallas, flujo principal paso a paso, estados de error y vacío, y si hay diseño de referencia.
- **Dado** que existe un `.html` de referencia, **entonces** se adjunta al paquete y se registra para que `/sdd-refine` resuelva su cascada CSS aguas abajo.
- **Dado** que las features se generan, **entonces** las dependencias entre ellas quedan documentadas y sin ciclos.
- **Dado** que el release es ambiguo, **entonces** el comando falla y no genera features parciales.

## Fuera de scope (v1 de esta fase)

- Review y aprobación de los artefactos — es 004. Acá los comandos **verifican** el estado de aprobación pero no lo producen.
- Estimación y split — es 007.
- El audit que valida la coherencia de lo generado — es 005.

## Measurable Process Outcomes (DX)

- **DX-001** — Menos de 3 ciclos de autocorrección por comando.
- **DX-002** — Densidad de ambigüedad 0.
- **DX-003** — `/dsc-refine` deja las 7 categorías en CLARO sin que el usuario tenga que repetir información ya presente en `ideas/`.
