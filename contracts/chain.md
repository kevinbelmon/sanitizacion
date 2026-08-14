# Contrato de cadena

Qué produce cada artefacto y qué consume el siguiente, sección por sección.

Existe porque el modelo anterior tenía un eslabón roto que nadie veía: el Roadmap Creator
declaraba leer once secciones de la Visión y el template producía cuatro. El Roadmap tenía que
inventar objetivos, dependencias y riesgos, violando su propia regla de no crear nada que la
Visión no respaldara.

**Regla:** ninguna sección declarada como entrada puede faltar en el template que la produce.
El check 3 del audit lo verifica.

---

## El grafo

```
ideas/ ──→ iniciativa ──→ vision ──→ roadmap ──→ release ──→ feature ──→ estimation ──→ handoff
```

Cada nodo consume **solo** a su antecesor directo. Ningún agente salta eslabones: si el Release
Planner necesita algo de la Visión, ese dato tiene que haber pasado por el Roadmap.

Es lo que hace la cadena auditable. Un salto crea una dependencia invisible que se rompe en silencio.

---

## ideas/ → iniciativa

`/dsc-refine` no tiene contrato de entrada: `ideas/` es material crudo y no confiable.
Su contrato es de **salida**: las 7 categorías, todas en estado CLARO.

| Produce | Consume |
|---|---|
| 1. Problema | Visión §2 |
| 2. Usuarios (`Unn`) | Visión §3 |
| 3. Estado actual | Visión §4 |
| 4. Estado deseado | Visión §5 |
| 5. Resultados esperados | Visión §8, §15 |
| 6. Restricciones | Visión §12 |
| 7. Urgencia | Visión §2 |

---

## iniciativa → vision

`/dsc-vision` lee las 7 categorías. No necesita nada más.

---

## vision → roadmap

El eslabón que estaba roto. `/dsc-roadmap` consume estas secciones y **todas existen**:

| Roadmap necesita | Visión produce | Se usa para |
|---|---|---|
| Declaración de visión | §6 | Resumen ejecutivo |
| Problema | §2 | Contexto |
| **Usuarios objetivo** (`Unn`) | **§3** | `Usuarios impactados` por épica |
| **Objetivos estratégicos** (`OE-nnn`) | **§8** | Asociar cada épica a ≥1 objetivo |
| **Beneficios esperados** | **§9** | Justificar prioridades |
| Capacidades de negocio (`BCnn`) | §10 | Origen de las épicas |
| **Alcance general** | **§11** | Límite de lo planificable |
| **Restricciones** | **§12** | Condiciona la distribución temporal |
| **Dependencias estratégicas** (`DE-nnn`) | **§13** | Se heredan al roadmap |
| **Riesgos estratégicos** (`RE-nnn`) | **§14** | Se heredan al roadmap |
| Métricas de éxito (`KPI-nnn`) | §15 | Qué épica contribuye a cada KPI |

Las seis en negrita son las que se agregaron en la fase 002. Sin ellas el Roadmap inventaba.

---

## roadmap → release

| Release necesita | Roadmap produce |
|---|---|
| Épicas (`EPnnn`) | Épicas |
| Prioridad MoSCoW | Épicas → Prioridad |
| Dependencias entre épicas | Épicas → Dependencias |
| **Usuarios impactados** | Épicas → Usuarios impactados |
| Objetivos que sirve | Épicas → Objetivos estratégicos |
| Riesgos | Riesgos estratégicos |
| Agrupación tentativa | Releases tentativos |

---

## release → feature

| Feature necesita | Release produce | Sección destino |
|---|---|---|
| Objetivo del release | Objetivo | `## PROBLEMA` (contexto) |
| Épicas incluidas | Épicas incluidas | frontmatter `epic` |
| **Usuarios impactados** | Épicas → Usuarios impactados | **`## USUARIO`** |
| Alcance incluye | Alcance | Alcance de la feature |
| Alcance excluye | Alcance | `## OUT OF SCOPE` |
| Dependencias | Dependencias | `depends_on` |
| Criterios de finalización | Criterios | `## DONE CRITERIA` |

`## UI / FLUJO` **no tiene proyector aguas arriba.** Es la única sección que `/dsc-features`
interroga, porque no se puede derivar de nada. Se pregunta una vez, con visión y roadmap en
contexto, en vez de feature por feature a ciegas en `/sdd-refine`.

---

## feature → estimation → handoff

`/dsc-estimate` lee la feature completa y produce el talle. `/dsc-handoff` exporta el bloque SDD
más el frontmatter de trazabilidad. Detalle en `handoff.md` (fase 007).

---

## La cadena de usuarios

Es la columna vertebral y merece leerse sola:

```
iniciativa §2   U01 — Operario de depósito · registrar ingresos · diario · bajo
      ↓
vision §3       U01 con el mismo ID y la misma definición
      ↓
roadmap         EP001 · Usuarios impactados: U01, U03
      ↓
release         EP001 incluida · Usuarios impactados: U01, U03
      ↓
feature F001    users: [U01]  →  ## USUARIO se completa sin preguntar
      ↓
brief.md        ## USUARIO cruza a SDD con /sdd-refine en 0 preguntas
```

Si en `/dsc-features` hay que preguntar quién es el usuario, la cadena se rompió antes.
Eso es un bug del modelo, no una pregunta legítima.

---

## Invalidación en cascada

Aprobar la versión `n+1` de un nodo marca `STALE` a **todo su subárbol descendiente**, en la
misma transacción que la aprobación.

```
iniciativa v2  →  vision, roadmap, release, features, estimations, handoffs quedan STALE
vision v2      →  roadmap, release, features, estimations, handoffs quedan STALE
roadmap v2     →  release, features, estimations, handoffs quedan STALE
release v2     →  features, estimations, handoffs de ese release quedan STALE
feature v2     →  su estimation y su handoff quedan STALE
```

Reglas:

1. **`STALE` no borra ni bloquea la lectura.** Impide avanzar, no consultar. Un roadmap `STALE`
   se sigue pudiendo leer y comparar contra la visión nueva.
2. **`STALE` registra la causa**: `stale_cause: "vision v2"`. Sin la causa, nadie sabe qué revisar.
3. **Salir de `STALE` es regenerar y volver a aprobar.** No hay forma de marcarlo vigente a mano:
   sería declarar consistente algo que nadie verificó.
4. **`/dsc-impact` muestra el subárbol antes de confirmar el cambio**, para que la decisión de
   cambiar la visión se tome sabiendo qué cuesta.
5. El alcance de la cascada es **por proyecto**. Un cambio en un proyecto nunca marca `STALE`
   artefactos de otro.
