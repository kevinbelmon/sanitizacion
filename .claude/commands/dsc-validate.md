---
description: Verifica que todo lo pedido en la iniciativa esté cubierto por los artefactos. Reporta y no modifica nada.
---

# /dsc-validate

Cobertura punto por punto: ¿todo lo que se pidió en la iniciativa vive en algún artefacto?

Es el equivalente de `/sdd-validate`: **reporta y para**. No modifica nada. El humano decide cómo
resolver los gaps.

## Qué leer

`iniciativa.md` y todos los artefactos aprobados de la cadena. Si alguno está `STALE`, avisalo
antes: validar contra un artefacto obsoleto da un resultado que no significa nada.

## Qué verificar

Por cada punto de las siete categorías de la iniciativa:

1. ¿Hay algo en la **visión** que lo recoja?
2. ¿Hay una **capacidad** o una **épica** que lo aborde?
3. ¿Está en algún **release**?
4. ¿Hay al menos una **feature** que lo implemente?
5. Si es una restricción, ¿aparece en `## RESTRICCIONES TÉCNICAS` de las features afectadas?
6. Si es un usuario, ¿aparece en `## USUARIO` de alguna feature?

El punto 6 es el que más suele fallar y el que más caro sale: un usuario declarado en la
iniciativa que no aparece en ninguna feature significa que se le prometió algo a alguien que
nadie va a construir.

## Reporte

```
## Cobertura de la iniciativa

### ✅ Cubierto
- Registro trazable de movimientos → EP001 → R1 → F001, F002

### ⚠️ Cobertura parcial
- Alertas de stock mínimo → EP002 → R1, pero ninguna feature define el umbral
  Dónde ajustar: proyectos/stock/outputs/features/F004-alertas.md

### ❌ Sin cobertura
- U03 (Responsable de compras) no aparece en ninguna feature
  La iniciativa dice que consulta niveles y genera reposición. No hay nada.

### Recomendación
Antes de seguir a desarrollo: definir el umbral en F004 y decidir si U03
entra en R1 o queda para R2. Si queda afuera a propósito, registralo con
/dsc-log para que no aparezca como un olvido.
```

## Cierre

- Sin gaps: `Iniciativa cubierta al 100%.` y el próximo comando.
- Con gaps: mostrá el reporte, indicá **qué archivo editar** para cada uno, y esperá.

## Reglas

- **No modifiques ningún artefacto.** Ni para arreglar un gap obvio.
- No decidas si un gap es aceptable: eso es del PO.
- Si el usuario acepta un gap sin resolverlo, recordale `/dsc-log`.
