# Spec — 007 Puente con SDD

> **Provisional.** Se refina en su gate.

La razón de ser del modelo: que una feature de Discovery entre a SDD sin que nadie repita el trabajo.

## US-1 · Estimar una feature

**Como** PO
**Quiero** saber si una feature es demasiado grande antes de mandarla a desarrollo
**Para** no descubrirlo a mitad del sprint

- **Dado** una feature aprobada, **cuando** corro `/dsc-estimate`, **entonces** se evalúan los 6 factores (funcional 35%, UI 15%, arquitectura 20%, integraciones 15%, seguridad 10%, testing 5%), se calcula el score y se asigna talle XS–XL.
- **Dado** el resultado, **entonces** se justifica indicando factores dominantes y riesgos.
- **Dado** talle `L`, **entonces** continúa con advertencia.
- **Dado** talle `XL`, **entonces** **no continúa** y deriva a `/dsc-split`.
- **Dado** información insuficiente, **entonces** no se estima: se piden aclaraciones.

## US-2 · Dividir una feature XL

- **Dado** una feature `XL`, **cuando** corro `/dsc-split`, **entonces** se propone una división en 2..N features, cada una con valor independiente.
- **Dado** la división confirmada, **entonces** las nuevas heredan épica, capacidad, release y usuarios; reciben IDs del registry; y la original queda `SUPERSEDED` con la decisión registrada.
- **Dado** que alguna resultante sigue siendo `XL`, **entonces** se avisa y se ofrece dividir otra vez.

## US-3 · Exportar a SDD sin pérdida

**Como** PO con una feature lista
**Quiero** entregarla al equipo de desarrollo
**Para** que arranquen sin volver a preguntar lo que ya definimos

- **Dado** una feature aprobada y estimada, **cuando** corro `/dsc-handoff F001`, **entonces** se valida antes de exportar: las 6 secciones del bloque SDD presentes, sin placeholders, `size ≠ XL`, `domain` resuelto, sin secretos.
- **Dado** que la validación falla, **entonces** no se exporta nada y se indica exactamente qué falta.
- **Dado** que pasa, **entonces** se genera `brief.md` con frontmatter (`discovery_id`, `feature_id`, `domain`, `size`, `epic`, `release`, `capability`, `decisions`) y las 6 secciones con **nombres literales**.
- **Dado** `--target <repo>`, **entonces** se valida que sea un repo SDD real (existe `sdd-refine.md`), se rechazan rutas con `..`, y nunca se sobreescribe sin confirmación.
- **Dado** que no hay `--target` accesible, **entonces** se escribe en `outputs/handoff/` con instrucciones de entrega manual. No es un error.
- **Dado** el export exitoso, **entonces** el registry pasa a `HANDED_OFF` con `feature_id`, `target_repo` y fecha; se registra la decisión; y se muestra el próximo comando literal a correr en el repo SDD.

### Mapeos deterministas

| Discovery | SDD | Regla |
|---|---|---|
| `F001-gestion-usuarios` | `001-gestion-usuarios` | quitar `F`, conservar slug |
| `BC01` / `EP001` | `domain` | vía `registry/capabilities.yaml` |
| `R1` | sprint SDD | 1 release → 1..N sprints |
| `XL` | no cruza | `/dsc-split` obligatorio |
| `DEC-nnn` | `DECISIONS.md` | referencia por ID, nunca copia |

## US-4 · Que SDD lo consuma sin preguntar

**Como** dev que recibe la feature
**Quiero** correr `/sdd-refine` y que no me interrogue
**Para** que Discovery haya servido de algo

- **Dado** `drafts/brief.md` con frontmatter `discovery_id`, **cuando** corro `/sdd-refine`, **entonces** se validan las 6 secciones y, si están completas, se genera `input.md` **sin grilling**, registrando `rondas_de_preguntas: 0`.
- **Dado** que una sección está incompleta, **entonces** se pregunta **solo** por esa. Nunca por las 6.
- **Dado** cualquier caso, **entonces** el check de seguridad de drafts se ejecuta igual. El bypass es del grilling, no de la validación.
- **Dado** que el brief trae `feature_id` y `domain`, **cuando** corro `/sdd-generate`, **entonces** se usan en vez de proponerlos, y la trazabilidad se propaga al registro de SDD.
- **Dado** un `drafts/` sin brief de Discovery, **entonces** SDD se comporta exactamente como hoy.

## Fuera de scope

- Sincronización bidireccional Discovery ↔ SDD. El flujo es unidireccional; el estado de vuelta se lee en la vista Portfolio (006).
- Creación de tickets de Jira desde Discovery. Jira arranca en SDD.
