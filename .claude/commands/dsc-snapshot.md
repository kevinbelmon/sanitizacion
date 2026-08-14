---
description: Resume el estado para retomar en otra sesión o pasárselo a otra persona.
---

# /dsc-snapshot

Para cuando cerrás la sesión a mitad de algo, o cuando otra persona sigue tu trabajo.

## Qué leer

`registry/proyectos.yaml`, el `workflow-status.json` del proyecto, las últimas entradas de
`DECISIONS.md` y los últimos eventos de `events.jsonl`.

Si hay un `iniciativa.draft.md`, leelo: es lo más importante del snapshot, porque es trabajo a
medio terminar que se pierde si nadie sabe que está ahí.

## Formato

```
## Snapshot — Gestión de Stock — 10/08/2026 18:40

### Dónde estamos
Roadmap aprobado (v2, firmado por Ana Gómez el 08/08).
El release R1 está en revisión: falta la firma del Product Owner.

### Trabajo a medio terminar
⚠️  Hay un grilling de /dsc-refine sin cerrar para "Portal de Clientes".
    Quedan abiertas 3 de las 7 categorías: estado deseado, restricciones
    y urgencia. Se retoma con /dsc-refine y sigue donde quedó.

### Decisiones recientes
DEC-007 (08/08) — se adelantó EP005 a Q2 para desbloquear EP003.
                  Decidido por Ana Gómez.

### Qué está frenando
· R1 espera firma del Product Owner
· F003 tiene 2 observaciones mayores sin resolver

### Contexto que no está en los archivos
[Si en esta sesión se discutió algo que todavía no quedó registrado en ningún
artefacto ni decisión, ponelo acá y recomendá registrarlo con /dsc-log antes
de cerrar. Es lo único que se pierde de verdad al cortar la sesión.]

### Para retomar
/dsc-status
```

## La sección que importa

**"Contexto que no está en los archivos"** es la razón de ser del comando. Todo lo demás se puede
reconstruir leyendo el estado; lo que se dijo en la conversación y no quedó escrito, no.

Si detectás algo así, ofrecé registrarlo antes de cerrar:

```
En esta sesión decidiste dejar la lectura de código de barras para R2 porque
todavía no está definido el hardware. Eso no quedó en ningún lado.

¿Lo registro con /dsc-log antes de que cierres?
```

## Reglas

- No modifiques nada: es una foto.
- Escribilo para alguien que **no participó** de esta conversación.
- Si hay un grilling a medias, decilo primero: es lo más fácil de perder.
- Guardalo solo si te lo piden; por defecto va en la conversación.
