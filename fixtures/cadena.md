Fixtures del smoke test. Cada bloque `=== nombre ===` es un artefacto de la cadena.
No es un proyecto real: es el mínimo que hace falta para que los 15 checks pasen.

=== iniciativa ===
---
proyecto_id: PRY-001
proyecto: smoke-test-descartable
version: 1
---

# Iniciativa — Caso de prueba

## 1. Problema

El smoke test necesita un proyecto con la cadena completa para verificar que cada eslabón
del modelo sigue funcionando después de un cambio.

## 2. Usuarios

| ID | Rol | Qué necesita lograr | Frecuencia | Nivel técnico |
|---|---|---|---|---|
| U01 | Mantenedor del modelo | Saber si un cambio rompió la cadena | Cada cambio | Alto |

## 3. Estado actual

Los cambios se verifican a mano, corriendo comandos sueltos.

## 4. Estado deseado

Un comando recorre la cadena entera y reporta qué paso falló.

## 5. Resultados esperados

| Resultado | Métrica | Hoy | Meta |
|---|---|---|---|
| Detección temprana de roturas | Pasos verificados | 0 | 11 |

## 6. Restricciones

No puede dejar residuos ni tocar el registro real.

## 7. Urgencia

Sin esto, una rotura se descubre recién cuando un PM la sufre.

=== vision ===
---
proyecto: smoke-test-descartable
proyecto_id: PRY-001
version: 1
---

# Visión del Proyecto — Caso de prueba

## 3. Usuarios Objetivo

| ID | Rol | Qué necesita lograr | Frecuencia | Nivel técnico |
|---|---|---|---|---|
| U01 | Mantenedor del modelo | Verificar la cadena completa | Cada cambio | Alto |

## 8. Objetivos Estratégicos

| ID | Objetivo | Resultado esperado |
|---|---|---|
| OE-001 | Detectar roturas antes de que las sufra un usuario | Cadena verificada en cada cambio |

## 10. Capacidades de Negocio

| ID | Capacidad | Descripción | Objetivos que sirve |
|---|---|---|---|
| BC01 | Prueba de la cadena | Recorrer y verificar cada eslabón | OE-001 |

## 15. Métricas de Éxito

| ID | Métrica | Hoy | Meta | Cuándo se mide |
|---|---|---|---|---|
| KPI-001 | Pasos verificados | 0 | 11 | En cada corrida |

=== roadmap ===
---
proyecto: smoke-test-descartable
version: 1
horizon: 12 meses
---

# Roadmap — Caso de prueba

## Tabla del roadmap

| Épica | Objetivo | Capacidad | Prioridad | Usuarios | Trimestre | Depende de |
|---|---|---|---|---|---|---|
| EP001 | Verificar la cadena de punta a punta | BC01 | Must Have | U01 | Q1 | — |

## Épicas

### EP001 — Verificación de la cadena

**Objetivo** · confirmar que cada eslabón responde

**Capacidades asociadas** · BC01

**Objetivos estratégicos** · OE-001

**Usuarios impactados** · U01

**Prioridad** · Must Have

**Dependencias** · ninguna

=== release ===
---
proyecto: smoke-test-descartable
release: R1
version: 1
created: 2026-08-10
---

# Release R1 — Verificación

## Objetivo del release

Dejar la cadena verificable con un solo comando.

## Épicas incluidas

### EP001 — Verificación de la cadena
**Prioridad** · Must Have
**Usuarios impactados** · U01

## Alcance

**Incluye**

- Recorrido completo de la cadena

**Excluye**

- Verificación de contenido de negocio: eso lo hace una persona

## Criterios de finalización

- [ ] CF-001 · el comando recorre los once pasos y reporta cuál falla

=== feature ===
---
discovery_id: F001
proyecto: smoke-test-descartable
slug: caso-de-prueba
proyecto_id: PRY-001
capability: BC01
epic: EP001
release: R1
users: [U01]
priority: Alta
version: 1
---

# F001 — Caso de prueba de la cadena

# BLOQUE SDD

## PROBLEMA

Después de cambiar el modelo no hay forma rápida de saber si la cadena sigue funcionando.
Cada verificación manual toma varios minutos y se saltea pasos.

## USUARIO

| ID | Rol | Qué necesita lograr con esta feature |
|---|---|---|
| U01 | Mantenedor del modelo | Correr un comando y saber si algo se rompió |

## DONE CRITERIA

- [ ] El comando recorre la cadena de punta a punta
- [ ] Reporta cuál paso falló y por qué
- [ ] No deja residuos en el árbol de proyectos
- [ ] Restaura el registro al estado previo

## OUT OF SCOPE

- Verificar la calidad del contenido de negocio: eso requiere criterio humano
- Probar la interfaz del tablero en un navegador real

## RESTRICCIONES TÉCNICAS

- **Integraciones** · Ninguna. Corre sobre el propio modelo
- **Seguridad** · No puede escribir fuera del árbol del modelo
- **Plataforma** · Solo builtins de node, sin dependencias

## UI / FLUJO

- **Pantallas involucradas** · Ninguna. Es un comando de consola
- **Flujo principal** · El mantenedor corre el comando, ve una línea por paso y un resumen final
- **Estado vacío** · No aplica
- **Estado de error** · Si un paso falla, se muestra el paso y la causa, y se sigue con la limpieza
- **Diseño de referencia** · ninguno

# BLOQUE DISCOVERY

## Valor para el negocio

Evita que una rotura del modelo llegue a un PM.

## Reglas de negocio

- La limpieza corre siempre, incluso si la prueba falla

## Dependencias

Ninguna.

## Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| La prueba contamina el registro real | Alto | Respaldo y restauración en cada corrida |
