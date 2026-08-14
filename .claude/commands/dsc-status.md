---
description: Muestra en qué etapa está cada proyecto, qué lo bloquea y cuál es el próximo comando.
---

# /dsc-status

El comando al que se vuelve siempre. Tiene que responder cuatro cosas: **dónde estamos, qué falta,
quién tiene la pelota, y qué comando corro ahora.**

## Paso 1 — Leer

- `registry/proyectos.yaml` — los proyectos
- `proyectos/<slug>/metrics/workflow-status.json` — el estado de cada uno
- `config/workflow.yaml` — las etapas y su orden

Si el usuario nombró un proyecto, mostrá solo ese. Si hay uno solo, mostrá ese. Si hay varios y no
nombró ninguno, mostrá el resumen de todos y ofrecé profundizar.

**Si `workflow-status.json` no existe**, no es un error: la etapa es `iniciativa` y todo lo demás
`PENDING`. Informalo y seguí.

## Paso 2 — Detectar problemas

Antes de reportar, verificá tres cosas:

**Desincronización.** Si el campo `updated` del estado es más nuevo que la fecha de modificación
del archivo en disco, la carpeta sincronizada puede estar desactualizada:

```
La carpeta puede estar desincronizada: el estado dice que se actualizó
[fecha] pero el archivo local es más viejo. Esperá a que termine de
sincronizar antes de hacer cambios.
```

**Artefactos tomados.** Si algún artefacto tiene `claimed_by`, reportalo con nombre y desde cuándo.
Si pasaron más de 24 horas, marcalo como probablemente abandonado. **Avisa, no impide.**

**Artefactos `STALE`.** Si alguno quedó obsoleto porque cambió un antecesor, decilo con la causa:
`roadmap está STALE porque vision pasó a v2`.

## Paso 3 — Reportar

Formato, en lenguaje de negocio:

```
<Nombre del proyecto>  ·  <PRY-nnn>

  Iniciativa   ✅ aprobada          v1
  Visión       ✅ aprobada          v2
  Roadmap      ⚠️  obsoleta          la visión cambió a v2
  Release      ⬜ pendiente
  Features     ⬜ pendiente

  Progreso     2 de 7 etapas aprobadas

  Bloqueo      El roadmap quedó obsoleto y hay que regenerarlo

  Próximo paso Regenerar el roadmap sobre la visión v2
               /dsc-roadmap
```

Íconos: ✅ aprobado · 🔵 en curso o en revisión · ⏳ esperando firma · ⚠️ obsoleto o con cambios
pedidos · ❌ rechazado o fallado · ⬜ pendiente.

Cuando una etapa espera firmas, decí **qué roles faltan**, no solo que espera.

## Paso 4 — Regenerar el dashboard

```bash
node scripts/gen-dashboard.mjs
```

Cerrá con: `Dashboard actualizado: abrí dashboard/index.html con doble clic.`

Si node no está disponible, avisá que el dashboard no se pudo regenerar y que el reporte que
acabás de dar es la información al día.

## Paso 5 — El próximo comando

**Siempre terminá con el comando literal a ejecutar.** Es la regla que hace que un PM no tenga que
recordar 24 comandos. Si hay más de una opción razonable, dá la recomendada primero.

## Reglas

- No modifiques ningún artefacto ni el estado. `/dsc-status` solo lee.
- No inventes progreso: si falta información, decí que falta.
- Si un proyecto no arrancó, no lo presentes como un problema — decí cómo empezar.
