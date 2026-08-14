---
description: Genera la Visión del Proyecto a partir de una iniciativa aprobada.
---

# /dsc-vision

Convierte `iniciativa.md` en una Visión que el Roadmap pueda consumir sin preguntar nada.

Seguí `contracts/command-anatomy.md`. Lo específico está abajo.

## Gate

La etapa `iniciativa` tiene que estar `APPROVED`.

| Si | Decí |
|---|---|
| No existe `iniciativa.md` | `Falta la iniciativa. Corré /dsc-refine.` |
| Está en `IN_REVIEW` | `La iniciativa está generada pero sin revisar. Corré /dsc-review.` |
| Está en `AWAITING_APPROVAL` | `Falta la firma de: <roles>. Corré /dsc-approve --as <rol>.` |
| La visión ya está `APPROVED` | Preguntar si regenerar, advirtiendo que marca `STALE` roadmap, releases y features |

## Contexto

Pasale al subagente `vision-creator` únicamente:

- `proyectos/<slug>/iniciativa.md`
- `templates/vision-template.md`
- El feedback, si es modo `UPDATE`

**No le pases `ideas/`.** Lo relevante ya pasó por el grilling; volver al material crudo
reintroduce la ambigüedad que `/dsc-refine` sacó.

## Después de generar

Antes de mostrar nada, verificá tres cosas:

1. **Las quince secciones están.** El Roadmap consume once; si falta una, va a inventarla.
2. **Los `Unn` coinciden** con los de la iniciativa: mismo ID, misma definición. Si se renombraron
   o se perdieron, la cadena se rompe y hay que preguntar los usuarios de nuevo al final.
3. **Sin placeholders** ni secciones vacías.

Si el agente declaró supuestos o preguntas abiertas, mostralos **primero**, antes del artefacto.
Corregir un supuesto ahora es mucho más barato que tres etapas después.

## Confirmación

Mostrá la visión completa y pedí confirmación antes de escribir. Si tiene más de 160 líneas,
escribila igual y decí qué recortarías.

## Cierre

Estado a `IN_REVIEW`, evento `ARTIFACT_CREATED`, dashboard regenerado.

```
Visión generada (v<n>). Próximo paso: revisarla.
/dsc-review
```

## Reglas

- No inventes información de negocio. Si falta algo crítico, el agente pregunta y no genera.
- No propongas tecnología, arquitectura ni soluciones: la visión es de negocio.
- No definas épicas ni features.
- Nunca apruebes la visión que acabás de generar.
