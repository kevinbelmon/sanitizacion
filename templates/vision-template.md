---
proyecto: <slug>
proyecto_id: PRY-nnn
version: 1
status: DRAFT
created: YYYY-MM-DD
---

# Visión del Proyecto — <Nombre>

Límite: 160 líneas. Es un documento de alineación, no un compendio.

Las quince secciones no son decorativas: el Roadmap consume **todas**. Si una queda
vacía, el Roadmap tiene que inventarla, y eso viola su propia regla de no crear nada
que la Visión no respalde.

---

## 1. Misión

Por qué existe este proyecto y qué valor aporta. Dos o tres líneas.

## 2. Problema

El problema de negocio que justifica la inversión y su impacto actual.

## 3. Usuarios Objetivo

Quiénes usan el proyecto. **Los IDs viajan por toda la cadena** — se referencian en
cada épica del Roadmap, en cada release y en la sección `## USUARIO` de cada feature.
Definirlos bien acá es lo que evita tener que preguntarlos de nuevo al final.

| ID | Rol | Qué necesita lograr | Frecuencia | Nivel técnico |
|---|---|---|---|---|
| U01 | | | | |
| U02 | | | | |

## 4. Estado Actual

Cómo funciona hoy: sistemas, procesos, limitaciones, tareas manuales.

## 5. Estado Deseado

Cómo debería funcionar. Qué desaparece y qué capacidades nuevas existen.

## 6. Declaración de Visión

Una sola frase con el estado futuro deseado.

## 7. Principios (Tenets)

Los criterios que van a resolver las discusiones futuras. Cinco como máximo.

- Seguridad por defecto
- Automatización antes que operación manual
- Reutilización antes que duplicación

## 8. Objetivos Estratégicos

Qué se quiere lograr, medible. **El Roadmap asocia cada épica a uno o más de estos IDs**,
así que tienen que ser pocos y claros.

| ID | Objetivo | Resultado esperado |
|---|---|---|
| OE-001 | | |
| OE-002 | | |

## 9. Beneficios Esperados

El impacto narrado: qué gana la organización, los usuarios y la operación. Distinto de
los objetivos — el objetivo es la métrica, el beneficio es el porqué importa.

## 10. Capacidades de Negocio

Qué tiene que poder hacer el negocio para alcanzar la visión. **En términos de negocio,
nunca de tecnología.** Son el origen de las épicas del Roadmap y del `domain` de SDD.

| ID | Capacidad | Descripción | Objetivos que sirve |
|---|---|---|---|
| BC01 | | | OE-001 |
| BC02 | | | |

## 11. Alcance General

**Incluye**

- 

**No incluye**

Es el contrato negativo de la iniciativa. Lo que se liste acá se propaga hasta la
sección `## OUT OF SCOPE` de las features.

- 

## 12. Restricciones

Presupuesto, plazo, normativa, sistemas obligatorios, política interna. Todo lo que
el Roadmap y el Release Plan no pueden ignorar.

## 13. Dependencias Estratégicas

Terceros, equipos, sistemas o decisiones fuera del control del proyecto.

| ID | Dependencia | Impacto si no se resuelve |
|---|---|---|
| DE-001 | | |

## 14. Riesgos Estratégicos

| ID | Riesgo | Impacto | Mitigación |
|---|---|---|---|
| RE-001 | | Alto / Medio / Bajo | |

## 15. Métricas de Éxito

Cómo se va a saber si la visión se cumplió.

| ID | Métrica | Hoy | Meta | Cuándo se mide |
|---|---|---|---|---|
| KPI-001 | | | | |

---

## Supuestos declarados

Solo gaps menores. Nada que afecte problema, usuarios, estado deseado, objetivos o
capacidades: eso se pregunta, no se supone.

- [ninguno]
