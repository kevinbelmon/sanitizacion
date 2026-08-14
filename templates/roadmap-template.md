---
proyecto: <slug>
proyecto_id: PRY-nnn
version: 1
status: DRAFT
created: YYYY-MM-DD
horizon: 12 meses
source: outputs/vision/vision.md
source_version: 1
---

# Roadmap — <Nombre>

Límite: 200 líneas.

Todo lo que aparece acá tiene que estar respaldado por la Visión. No se inventan
objetivos, capacidades, dependencias ni riesgos: se toman de las secciones 8, 10, 13 y 14.

---

## Resumen ejecutivo

Tres o cuatro líneas: qué se va a construir en el horizonte y en qué orden.

---

## Tabla del roadmap

Vista consolidada para stakeholders. Es lo primero que se lee.

| Épica | Objetivo | Capacidad | Prioridad | Usuarios | Trimestre |
|---|---|---|---|---|---|
| EP001 | | BC01 | Must | U01, U03 | Q1 |
| EP002 | | BC02 | Must | U01 | Q1 |
| EP003 | | BC03 | Should | U02 | Q2 |

---

## Épicas

Un bloque por épica, con este formato exacto.

### EP001 — <Nombre>

**Objetivo** · qué logra en términos de negocio

**Capacidades asociadas** · BC01, BC02 *(de la sección 10 de la Visión)*

**Objetivos estratégicos** · OE-001 *(de la sección 8 — toda épica sirve al menos a uno)*

**Usuarios impactados** · U01, U03 *(de la sección 3 — se propagan al release y a las features)*

**Prioridad** · Must Have | Should Have | Could Have

**Dependencias** · ninguna | EP002

**Riesgos** · RE-001, o riesgos propios de la épica

**Valor de negocio observable** · qué cambia para el negocio cuando esta épica está lista

---

## Priorización

Criterios aplicados: valor de negocio, dependencias, riesgo, impacto para usuarios,
contribución a los objetivos estratégicos.

Orden propuesto y por qué. Si el PO eligió un orden distinto al propuesto, registrarlo
con `/dsc-log`.

---

## Distribución temporal

### Q1
**Objetivo del trimestre** ·
**Épicas** · EP001, EP002
**Resultado esperado** ·

### Q2
**Objetivo del trimestre** ·
**Épicas** · EP003
**Resultado esperado** ·

La distribución respeta prioridades y dependencias: ninguna épica se planifica antes
que aquello de lo que depende.

---

## Dependencias estratégicas

Heredadas de la sección 13 de la Visión, más las que surjan al planificar.

| ID | Dependencia | Épicas afectadas | Impacto |
|---|---|---|---|
| DE-001 | | EP001 | |

---

## Riesgos estratégicos

Heredados de la sección 14 de la Visión, más los que surjan al planificar.

| ID | Riesgo | Impacto | Mitigación |
|---|---|---|---|
| RE-001 | | Alto / Medio / Bajo | |

---

## Releases tentativos

Agrupación coherente de épicas. Es la entrada del Release Planner.

| Release | Épicas | Objetivo |
|---|---|---|
| R1 | EP001, EP002 | |
| R2 | EP003 | |

---

## Métricas de éxito

Heredadas de la sección 15 de la Visión, indicando qué épica contribuye a cada una.

| KPI | Meta | Épicas que contribuyen |
|---|---|---|
| KPI-001 | | EP001 |
