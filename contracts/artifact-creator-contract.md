# Contrato de Creator Agent

Comportamiento común de todo agente que crea o actualiza un artefacto:
`vision-creator`, `roadmap-creator`, `release-planner`, `feature-decomposer`, `feature-estimator`.

## Entradas

El comando le pasa un contexto explícito. **El agente nunca explora el proyecto por su cuenta**:
lee lo que este contrato declara y nada más. Sin esta regla, el contexto crece sin control y el
agente termina razonando sobre artefactos obsoletos.

| Parámetro | Obligatorio | Qué es |
|---|---|---|
| `proyecto` | Sí | Slug del proyecto |
| `stage` | Sí | Etapa de `config/workflow.yaml` |
| `mode` | Sí | `CREATE` o `UPDATE` |
| `source` | Sí | Ruta del artefacto antecesor aprobado |
| `template` | Sí | Ruta del template |
| `artifact` | Solo en UPDATE | Ruta del artefacto existente |
| `feedback` | Solo en UPDATE | Ruta del `.yaml` de feedback |
| `version` | Solo en UPDATE | Versión actual |

Las rutas salen de `contracts/paths.md`. Las secciones que puede consumir de cada antecesor están
en `contracts/chain.md`.

## Modos

**CREATE** — genera un artefacto nuevo desde el antecesor y el template.

**UPDATE** — lee la versión actual y el feedback, aplica **únicamente** los cambios pedidos,
preserva todo el resto e incrementa la versión.

Que el feedback sea YAML estructurado y no prosa es lo que hace posible el modo UPDATE. Con texto
corrido, "aplicar solo lo pedido" no es verificable.

## Reglas

**Debe**

- Respetar la estructura del template.
- Respetar el límite de líneas del artefacto.
- Preservar el contenido no afectado por el feedback.
- Mantener la trazabilidad: todo ID referenciado tiene que existir aguas arriba.
- Reservar IDs desde `registry/ids.yaml`, nunca contando archivos.
- Declarar los supuestos que tomó, si tomó alguno.

**Nunca debe**

- Aprobar ni revisar artefactos.
- Registrar decisiones, calcular métricas o generar tableros.
- Modificar cualquier artefacto que no sea el suyo.
- Invocar a otro agente.
- Escribir un artefacto parcial cuando falla.
- Dejar placeholders (`TBD`, `[Completar]`, `Pendiente`, `N/A`, `???`).
- Poner un secreto en un artefacto. Se referencia como variable de entorno.

## Cuándo parar

Si falta información **crítica** —lo que `contracts/chain.md` marca como consumido por la etapa
siguiente— el agente se detiene, pregunta y no genera nada.

Si el gap es **menor** y no impide entender el artefacto, continúa y lo declara en la sección de
supuestos.

La diferencia importa: un artefacto generado sobre un supuesto crítico equivocado contamina toda
la cadena aguas abajo y nadie se entera hasta desarrollo.

## Fallo

Un artefacto a medias es peor que ninguno: el comando siguiente lo tomaría como válido y avanzaría.
Ante un fallo, no se escribe nada y se reporta la causa.

## Respuesta

```
status: SUCCESS | NEEDS_INPUT | FAILED
artifact: <ruta>
version: <n>
assumptions: [...]
open_questions: [...]
message: <causa, si FAILED>
```

## Integración

El comando orquesta; el agente genera. El agente nunca llama a otro agente.

```
/dsc-<etapa>  →  creator agent  →  /dsc-review  →  /dsc-approve
                                                        ↓
                                    decision-logger → metrics → dashboard
```
