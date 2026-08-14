# Spec — 002 Templates y cadena

Que cada template produzca exactamente lo que el siguiente agente consume, y que la información de usuarios exista en la cadena.

Contexto: hoy el Roadmap Creator declara leer 11 secciones de la Visión y el template solo produce 4 de ellas. Y ni la Visión, ni el Roadmap, ni el Release, ni el template de feature capturan **usuarios** en ningún punto — que es exactamente lo que `/sdd-refine` exige aguas abajo.

## US-1 · Capturar usuarios en el origen

**Como** PM
**Quiero** que la Visión declare quiénes van a usar el proyecto
**Para** no tener que reconstruir esa información feature por feature al final

- **Dado** el template de Visión, **entonces** contiene una sección `Usuarios Objetivo` con formato `U01 — <rol> · qué necesita lograr · frecuencia · nivel técnico`.
- **Dado** un roadmap, **entonces** cada épica declara qué usuarios (`U01`, `U03`…) impacta.
- **Dado** un release plan, **entonces** cada épica incluida propaga sus usuarios impactados.
- **Dado** una feature, **entonces** su sección `USUARIO` se deriva de los usuarios de su épica, sin preguntar de nuevo.

## US-2 · Cerrar el contrato Visión → Roadmap

**Como** modelo
**Quiero** que la Visión produzca las 11 secciones que el Roadmap consume
**Para** que el Roadmap no tenga que inventar objetivos, riesgos ni dependencias

- **Dado** el template de Visión, **entonces** incluye: Usuarios Objetivo, Alcance General (incluye/no incluye), Beneficios Esperados, Restricciones, Dependencias Estratégicas y Riesgos Estratégicos.
- **Dado** que el template de Roadmap ya tiene secciones `OE-nnn`, `DE-nnn` y `RE-nnn`, **entonces** la Visión renombra `Resultados Esperados` a `Objetivos Estratégicos (OE-nnn)` para empalmar sin traducción.
- **Dado** cualquier par (agente, template antecesor), **entonces** toda sección declarada en "Entradas" existe en el template que la produce.

## US-3 · Saber qué se rompe cuando algo cambia

**Como** PM que tiene que cambiar la visión con 20 features ya definidas
**Quiero** ver qué queda invalidado antes de confirmar
**Para** no descubrirlo cuando ya es tarde

- **Dado** que apruebo una versión nueva de un artefacto, **entonces** sus descendientes quedan marcados `STALE` en el registry.
- **Dado** un artefacto `STALE`, **cuando** corro cualquier comando que lo consume, **entonces** el comando se detiene y explica qué antecesor cambió.
- **Dado** que voy a cambiar un artefacto, **cuando** corro `/dsc-impact <artefacto>`, **entonces** veo la lista de descendientes que quedarían `STALE`, **antes** de confirmar.

## US-4 · Agentes sobre una raíz única

**Como** modelo
**Quiero** que los 9 agentes escriban y lean del mismo lugar
**Para** que la cadena no se corte

- **Dado** cualquier agente, **entonces** su frontmatter tiene `name`, `description`, `model` y `tools`, y el `name` coincide con el nombre de archivo y con su ID en `workflow.yaml`.
- **Dado** cualquier agente, **entonces** sus rutas de entrada y salida viven bajo `proyectos/<p>/outputs/` y coinciden con `contracts/paths.md`.
- **Dado** el `vision-creator`, **entonces** ya no declara dos destinos contradictorios ni apunta a `sdd-harness/ideas/`.
- **Dado** el `release-planner`, **entonces** ya no declara dos destinos contradictorios.
- **Dado** el `feature-estimator`, **entonces** deja de estar huérfano: figura en `workflow.yaml` y sus rutas existen.

## Fuera de scope (v1 de esta fase)

- Los comandos que usan estos templates — es 003.
- El comando `/dsc-impact` se especifica acá pero se implementa en 004, junto con las aprobaciones que disparan la cascada.
- Validación automática de la coherencia template↔agente — es el check #3 del audit, fase 005.

## Measurable Process Outcomes (DX)

- **DX-001** — Menos de 3 ciclos de autocorrección.
- **DX-002** — Densidad de ambigüedad 0.
