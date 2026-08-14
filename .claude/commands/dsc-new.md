---
description: Inicializa el espacio de trabajo de un proyecto nuevo dentro del modelo.
---

# /dsc-new

Crea un proyecto: su carpeta, su estado inicial y su entrada en el registro de proyectos.

## Paso 1 — Los tres datos

Si el usuario no los dio, pedí los tres juntos. Son datos a completar, no decisiones, así que
agruparlos no viola la regla de una pregunta por vez:

1. **Nombre del proyecto.** De negocio, no técnico. Ejemplos: `Portal de Clientes`,
   `Gestión de Identidades`, `Liquidación de Haberes`.
2. **Cliente.** Queda como dato del proyecto y sirve para agrupar en el tablero. Si es un
   proyecto interno de la fábrica, que lo diga.
3. **Owner.** El PM o PO que lleva el discovery. Nombre o rol.

**Si el nombre no distingue nada** —"proyecto 1", "nuevo", "test"— avisá una vez antes de crear:
el slug es el nombre de carpeta de ahí en adelante, y con tres proyectos así nadie sabe cuál es
cuál. Si lo reafirma, seguí sin insistir: puede estar probando el modelo.

## Paso 2 — Crear

```bash
node scripts/new-proyecto.mjs "<nombre>" --cliente "<cliente>" --owner "<owner>"
```

El script normaliza el nombre a slug, reserva el `PRY-nnn` desde `registry/ids.yaml`,
crea el árbol de carpetas, escribe el estado inicial y registra el primer evento.

**Si el proyecto ya existe**, el script se detiene sin tocar nada. No insistas: mostrá el
mensaje y preguntá si quería otro nombre o si quería continuar con el proyecto existente
(en ese caso, `/dsc-status`).

## Paso 3 — Confirmar el slug

El slug puede diferir del nombre: `Gestión de Identidades` → `gestion-de-identidades`.
Decilo explícitamente, porque es el nombre de carpeta que va a ver de ahí en adelante.

## Paso 4 — Regenerar el dashboard

```bash
node scripts/gen-dashboard.mjs
```

## Paso 5 — Orientar

```
Proyecto creado: <nombre> (<PRY-nnn>)

Próximo paso: poné en la carpeta ideas/ todo lo que ya tengas sobre esta
iniciativa — minutas de reunión, entrevistas, relevamientos, mails, notas
sueltas. Un archivo por documento, en .md o .txt. No importa que estén
desordenados: de eso se encarga el próximo comando.

Cuando estén, corré:  /dsc-refine
```

## Reglas

- No crees carpetas ni archivos a mano: el script es el único que hace el scaffold, porque la reserva del ID tiene que ser atómica.
- No inventes el nombre del proyecto. Si no lo dieron, preguntá.
- Nunca sobreescribas un proyecto existente.
