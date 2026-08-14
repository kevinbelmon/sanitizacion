---
description: Entrega una feature al equipo de desarrollo, en el formato que SDD consume sin volver a preguntar.
---

# /dsc-handoff

El borde del modelo. Si esto funciona, hacer Discovery ahorró trabajo; si no, lo duplicó.

**Criterio de éxito:** el equipo corre `/sdd-refine` en su repo y genera `input.md`
**sin hacer una sola pregunta**.

Ver `contracts/handoff.md`.

## Paso 1 — Verificar antes de prometer

No corras el script todavía. Revisá primero, para poder anticipar los problemas en lugar de que
el script los escupa:

- ¿La feature está `APPROVED`?
- ¿Está estimada y el talle no es XL?
- ¿La capacidad tiene `sdd_domain` en `registry/capabilities.yaml`?
- ¿Las 6 secciones del bloque SDD tienen contenido real?

Si algo falta, decilo con el comando que lo resuelve y no sigas.

## Paso 2 — El destino

Preguntá dónde está el repo de desarrollo si no lo dijeron:

```
¿Dónde está el repositorio del equipo de desarrollo?

Puede ser una ruta como ../mi-proyecto o C:\repos\mi-proyecto.

Si no lo tenés a mano o está en la máquina de otra persona, no importa:
genero el paquete acá y te digo cómo entregarlo.
```

**Que el repo no sea accesible no es un error.** Si el PM trabaja en una carpeta sincronizada y
el repo está en la máquina de un dev, la entrega manual es el flujo normal.

## Paso 3 — Entregar

```bash
node scripts/handoff.mjs <slug> <F001> --target <ruta> --by "<nombre>"
```

Sin `--target`, escribe solo el paquete local.

El script valida, arma `brief.md` + `context.md` + `assets/`, escribe en `<target>/drafts/`,
marca la feature `HANDED_OFF` y emite el evento.

## Paso 4 — Si el gate rechaza

El script no escribe nada y lista los problemas con su arreglo. Traducilos:

```
No puedo entregar F002 todavía. Dos cosas:

  Falta la sección UI / FLUJO
    Sin eso, desarrollo va a preguntar cómo se ve la pantalla y el
    Discovery no habrá servido.
    → /dsc-features para completarla

  Talle XL
    → /dsc-split F002
```

Si el rechazo es por **secreto detectado**, tratalo como incidente, no como un error de formato:

```
🔒 Encontré lo que parece una contraseña en las restricciones técnicas de F003.

No la exporté. Es la última barrera antes de que entre a un repositorio
versionado, donde quedaría en el historial para siempre.

Hay que sacarla de la feature, referenciarla como variable de entorno y
rotar la credencial.
```

## Paso 5 — Cerrar

Mostrá el mapeo y el próximo paso **del otro lado**:

```
Entregada: F001 → 001-registro-de-ingresos

  Talle     S
  Dominio   inventario
  Destino   ../mi-proyecto/drafts/brief.md

El equipo tiene que correr, en su repo:  /sdd-refine

Debería generar input.md sin preguntar nada. Si les pregunta algo, avisame:
significa que quedó un hueco en el Discovery y conviene arreglarlo acá.
```

Esa última frase importa: convierte cada handoff en una verificación del modelo.

Después: `/dsc-log` para registrar la entrega, y `/dsc-status`.

## Reglas

- **El gate no se saltea.** No hay `--force` para las validaciones, solo para reenviar algo ya
  entregado o pisar un `brief.md` existente en el destino.
- Nunca sobreescribas un `drafts/brief.md` del destino sin confirmación explícita: puede ser el
  trabajo de otra persona.
- Las decisiones se referencian por ID, nunca se copian.
- El bloque Discovery de la feature (valor de negocio, reglas, riesgos) **no se exporta**:
  desarrollo no lo consume y lo que no se consume envejece.
