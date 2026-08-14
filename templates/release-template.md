---
proyecto: <slug>
release: Rn
version: 1
status: DRAFT
created: YYYY-MM-DD
horizon: 1-3 meses
source: outputs/roadmap/roadmap.md
source_version: 1
---

# Release R<n> — <Nombre>

Límite: 130 líneas.

No se crean épicas ni se cambian prioridades: el Release Plan **selecciona** del roadmap
y organiza. Todo lo que aparezca acá tiene que existir en el roadmap aprobado.

---

## Objetivo del release

Una frase: qué queda resuelto cuando este release esté entregado.

## Valor esperado

Qué gana el negocio y qué percibe cada usuario impactado.

---

## Épicas incluidas

### EP001 — <Nombre>
**Prioridad** · Must Have
**Usuarios impactados** · U01, U03 *(del roadmap — se propagan a cada feature)*
**Justificación de inclusión** ·
**Dependencias** · ninguna | EP002 (ya entregada en R0)

---

## Alcance

**Incluye**

- 

**Excluye**

Lo que explícitamente queda para más adelante. Se propaga a `## OUT OF SCOPE` de las features.

- 

---

## Dependencias

Ninguna épica se planifica antes que aquello de lo que depende. Si una dependencia cae
fuera del release, indicar dónde se resuelve.

| ID | Dependencia | Épica afectada | Dónde se resuelve |
|---|---|---|---|
| DEP-001 | | EP001 | R0 / externa / equipo X |

---

## Riesgos

| ID | Riesgo | Impacto | Mitigación |
|---|---|---|---|
| R-001 | | Alto / Medio / Bajo | |

---

## Criterios de finalización

Verificables. Qué tiene que ser cierto para declarar el release terminado.

- [ ] CF-001 ·
- [ ] CF-002 ·

---

## Features esperadas

Estimación de la descomposición. `/dsc-features` la produce; acá se anticipa el volumen
para dimensionar el release.

| Épica | Features estimadas | Nota |
|---|---|---|
| EP001 | 3-4 | |

---

## Métricas de éxito

| KPI | Meta para este release |
|---|---|
| KPI-001 | |
