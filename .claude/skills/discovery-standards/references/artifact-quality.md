# Calidad de artefactos

## Límites de tamaño

| Artefacto | Máximo |
|---|---|
| iniciativa | 100 líneas |
| visión | 160 |
| roadmap | 200 |
| release | 130 |
| feature | 120 |

Calibrados en DEC-006 contra el primer proyecto real, no elegidos a ojo: el artefacto más
grande observado más 25%, redondeado a la decena.

No son estéticos: un artefacto largo infla el contexto del agente en cada etapa posterior. Si no
entra, casi siempre el alcance es demasiado grande, no el texto demasiado detallado.

Excederse es `WARN`, no `ERROR`: se genera igual y se avisa qué recortarías.

## Placeholders

Prohibidos en artefactos aprobados: `TBD`, `[Completar]`, `???`, y los
marcadores de template (`Fnnn`, `<slug>`, `EPnnn`…).

Un placeholder que sobrevive a la aprobación se convierte en una suposición del desarrollador.

## Ambigüedad

Expresiones que no son verificables: "rápido", "simple", "según corresponda", "cuando sea
necesario", "amigable", "robusto".

No bloquean, pero se marcan. La prueba: **¿alguien puede decir si se cumplió o no?** Si dos
personas razonables pueden discrepar, es ambiguo.

Casos concretos:

- Un resultado sin métrica y sin meta numérica **no está CLARO**. "Mejorar la productividad" no
  permite saber si la iniciativa funcionó.
- Un criterio de aceptación que no se puede marcar ✅ o ❌ no es un criterio.

## Trazabilidad

Todo ID referenciado tiene que existir aguas arriba: una épica sin capacidad, una feature sin
épica o un usuario que no está en la visión son errores, no descuidos.

Los IDs se reservan de `registry/ids.yaml`, **nunca contando archivos**: con dos personas
trabajando en paralelo, ambas ven tres features y ambas crean `F004`. Ver `contracts/ids.md`.

## La cadena de usuarios

Es la columna vertebral:

```
iniciativa §2 → visión §3 → épica del roadmap → release → ## USUARIO de la feature
```

Si en `/dsc-features` hay que **preguntar** quién es el usuario, la cadena se rompió antes.
Eso es un bug del modelo, no una pregunta legítima: hay que reportarlo, no resolverlo preguntando.

## Secretos

Ninguno entra a un artefacto. Se referencian como variable de entorno (`API_KEY` vía `.env`),
nunca su valor. Si se detecta uno, además de sacarlo hay que **rotarlo**: los artefactos viven en
una carpeta compartida.
