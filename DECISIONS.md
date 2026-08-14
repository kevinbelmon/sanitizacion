# Registro de decisiones — Discovery Model

Este archivo registra cada vez que una decisión se aparta o amplía lo establecido en las specs
y en `constitution.md`. Sirve como trazabilidad entre lo que se especificó y lo que se construyó.

Lo escribe `/dsc-log`. Los IDs se reservan desde `registry/ids.yaml`.

## Índice

| ID | Título | Tipo | Estado | Fecha |
|---|---|---|---|---|
| DEC-001 | Extraer el escapado a `lib/render.mjs` en la fase 001 | Proceso | ACTIVE | 2026-08-03 |
| DEC-002 | El parser YAML solo acepta `[]` y `{}` como flow style | Técnica | ACTIVE | 2026-08-03 |
| DEC-003 | La unidad de trabajo es el proyecto, no el producto | Producto | ACTIVE | 2026-08-12 |
| DEC-004 | El límite de la iniciativa sube de 80 a 100 líneas | Proceso | ACTIVE | 2026-08-12 |
| DEC-005 | La CSP de los HTML usa `script-src 'unsafe-inline'`, no `'self'` | Técnica | ACTIVE | 2026-08-13 |
| DEC-006 | Los cinco límites de tamaño se recalibran contra artefactos reales | Proceso | ACTIVE | 2026-08-13 |
| DEC-007 | Los contadores de ID pasan de `products` a `proyectos`, con migración | Técnica | ACTIVE | 2026-08-14 |

---

## DEC-001

**Fecha:** 2026-08-03
**Tipo:** Proceso
**Estado:** ACTIVE
**Responsable:** Patricio Millán
**feature_id:** 001-fundacion
**command_origin:** implementación de la fase 001

### Título

Extraer el escapado a `lib/render.mjs` en la fase 001

### Gap o motivo

`specs/001-fundacion/plan.md` ubicaba la serialización y el escapado dentro de
`scripts/gen-dashboard.mjs`, y `specs/003-ciclo-principal/plan.md` creaba `lib/render.mjs` recién
en la fase 003 para que el roadmap HTML lo reutilizara.

### Alternativas consideradas

1. Seguir el plan al pie: escapar dentro de `gen-dashboard.mjs` y extraerlo en la fase 003.
2. Crear `lib/render.mjs` desde la fase 001.

### Por qué se descartaron

La opción 1 implica escribir la lógica de escapado dos veces y moverla después. `constitution.md`
exige que todo dato se escape antes de entrar a un HTML; tener esa lógica en dos lugares durante
dos fases es exactamente el riesgo que la regla busca evitar.

### Decisión tomada

Se crea `lib/render.mjs` en la fase 001 con `jsonSeguro`, `esc`, `moduloDatos` y la constante `CSP`.
`gen-dashboard.mjs` lo consume. La tarea T001 de la fase 003 pasa de "crear" a "extender".

### Motivo

Un solo lugar donde se escapa es más seguro y más barato de auditar que dos. El costo de
adelantarlo es nulo.

### Artefactos modificados

`specs/003-ciclo-principal/tasks.md` T001 — de "crear" a "extender".

---

## DEC-002

**Fecha:** 2026-08-03
**Tipo:** Técnica
**Estado:** ACTIVE
**Responsable:** Patricio Millán
**feature_id:** 001-fundacion
**command_origin:** implementación de la fase 001

### Título

El parser YAML solo acepta `[]` y `{}` como flow style

### Gap o motivo

`specs/005-audit/plan.md` declara el flow style (`{}` y `[]`) fuera del subconjunto soportado, con
fallo ruidoso. Al implementar el parser apareció que `depends_on: []` y `features: []` son la forma
idiomática de expresar una colección vacía, y que el propio `sdd-model` la usa en
`features.template.yaml`. Sin soportarla, `stringify` produciría algo que `parse` rechaza.

### Alternativas consideradas

1. Rechazar todo flow style y emitir las colecciones vacías como `clave:` sin valor.
2. Aceptar únicamente las formas vacías `[]` y `{}`.

### Por qué se descartaron

La opción 1 rompe el round-trip: `clave:` sin valor se lee como `null`, no como lista vacía, y el
audit no podría distinguir "sin dependencias" de "dependencias no declaradas". Además obliga a un
formato que nadie escribe a mano.

### Decisión tomada

`parse` acepta exactamente `[]` y `{}` como colecciones vacías. Cualquier otro flow style
(`{a: 1}`, `[x, y]`) sigue fallando ruidosamente con la línea exacta.

### Motivo

Se conserva la intención de la regla — que el parser no interprete mal en silencio una sintaxis
que no controla — sin romper el round-trip ni el formato idiomático.

### Artefactos modificados

`lib/yaml-min.mjs`, `specs/_registry/features.yaml` (se pasó `depends_on` de flow a lista en bloque).

---

## DEC-003

**Fecha:** 2026-08-12
**Tipo:** Producto
**Estado:** ACTIVE
**Responsable:** Patricio Millán
**Proyecto:** global
**command_origin:** revisión de vocabulario durante la prueba punta a punta

### Título

La unidad de trabajo es el proyecto, no el producto

### Gap o motivo

El modelo llamaba "producto" a la unidad sobre la que se hace Discovery, y nombraba los
artefactos como "Visión de Producto" y "Product Roadmap". Ese vocabulario viene de product
management y no encaja con una fábrica de software, que define el alcance de **proyectos**
para clientes. Un PM leyendo "producto" piensa en algo que se vende, no en el trabajo que
tiene entre manos.

El error se arrastró desde el blueprint sin que nadie lo cuestionara, porque los templates
del modelo anterior ya usaban esa palabra.

### Alternativas consideradas

1. Dejarlo: "producto" es el término canónico en la literatura de discovery.
2. Renombrar a "proyecto" y agregar `cliente` como dato del proyecto.
3. Dos niveles de carpetas, `clientes/<cliente>/<proyecto>/`.

### Por qué se descartaron

La 1 privilegia la literatura sobre la audiencia real: si el modelo habla distinto que el
equipo, se nota en cada pantalla y erosiona la adopción. La 3 agrega un nivel de rutas que
hoy nadie necesita — un cliente con varios proyectos en Discovery simultáneo no es el caso
habitual, y el dato `cliente` alcanza para agrupar en el tablero.

### Decisión tomada

- `products/<slug>/` → `proyectos/<slug>/`
- ID de proyecto: `INI-nnn` → `PRY-nnn`. Desaparece la ambigüedad con `iniciativa.md`,
  que sigue siendo el nombre del primer artefacto
- `registry/initiatives.yaml` → `registry/proyectos.yaml`, con `slug`, `nombre` y `cliente`
- "Visión de Producto" → "Visión del Proyecto"
- `ideas/` pasa de la raíz a `proyectos/<slug>/ideas/`, para que los borradores de un
  proyecto no se mezclen con los de otro
- Los seis borradores de ejemplo que venían con el repo se movieron a `ejemplos/`

### Motivo

El modelo lo usan PM, PO y BA de una fábrica de software. Si el vocabulario no es el de
ellos, cada comando les pide una traducción mental. Se hizo ahora porque no existe todavía
ningún proyecto real: después habría que migrar datos además de código.

### Artefactos modificados

98 archivos: los 28 comandos, los 9 agentes, los 8 contratos, los 7 templates, las 6
librerías, los 13 scripts, la configuración, los registros, el tablero, las specs y la
documentación.

### Impacto en la cadena

Ninguno: no había proyectos creados. El smoke test y el audit pasan limpios después del
cambio.

---

## DEC-004

**Fecha:** 2026-08-12
**Tipo:** Proceso
**Estado:** ACTIVE
**Responsable:** Patricio Millán
**Proyecto:** global
**command_origin:** /dsc-review sobre la primera iniciativa real

### Título

El límite de la iniciativa sube de 80 a 100 líneas

### Gap o motivo

La primera iniciativa real del modelo —plataforma de turnos, PRY-001— cerró en 83 líneas
después de dos rondas de recorte. El check 11 del audit la marcó por exceder el límite de 80.

Al medirlo se ve que el número nunca salió de una medición: el template obliga a 7 secciones
más los supuestos declarados, y entre frontmatter, títulos y líneas en blanco la estructura
sola consume unas 37 líneas. Quedan ~46 para el contenido de las siete categorías, con una
tabla de usuarios de 5 columnas adentro. Son unas 6 líneas por categoría.

Bajar de 83 a 80 exigía borrar contenido con valor: los supuestos declarados, el pendiente
de pacientes homónimos, o la dependencia de la API de WhatsApp.

### Alternativas consideradas

1. Recortar tres líneas más de contenido para cumplir el límite.
2. Dejar el aviso abierto como deuda visible y no tocar nada.
3. Subir el límite a 100 líneas.

### Por qué se descartaron

La 1 sacrifica información que va a hacer falta aguas abajo para satisfacer un número que no
se derivó de ninguna medición. La 2 deja un aviso permanente en todos los proyectos, y un
aviso que siempre está encendido deja de leerse.

### Decisión tomada

El límite de `iniciativa.md` pasa de 80 a **100 líneas**. Actualizado en `constitution.md`,
`lib/registry.mjs`, `templates/iniciativa-template.md`, `/dsc-refine`, la referencia
`artifact-quality.md` del skill y `docs/blueprint.md`.

Los otros límites no se tocan: no hay evidencia todavía. **El de release (80) tiene la misma
estructura de 7 secciones y probablemente el mismo problema** — se revisa cuando exista el
primer release real, no antes.

### Motivo

El número original se fijó en el blueprint sin haber escrito nunca un artefacto completo. La
primera corrida real es la primera medición disponible, y muestra que 80 no alcanza para lo
que el propio template exige.

El límite sigue existiendo por la razón por la que se puso: un artefacto largo infla el
contexto del agente en cada etapa posterior. 100 sigue siendo un techo, no una licencia.

### Artefactos modificados

6 archivos del modelo. Ninguno de proyecto.

### Impacto en la cadena

Ninguno. `proyectos/proyecto-1/iniciativa.md` pasa a cumplir el límite sin cambios: el audit
devuelve 0 errores y 0 avisos.

---

## DEC-005

**Fecha:** 2026-08-13
**Tipo:** Técnica
**Estado:** ACTIVE
**Responsable:** Patricio Millán
**Proyecto:** global
**command_origin:** el tablero se abría en blanco

### Título

La CSP de los HTML generados usa `script-src 'unsafe-inline'` y no `'self'`

### Gap o motivo

`dashboard/index.html` se abría completamente en blanco. El archivo tenía 17 KB de HTML y los
datos estaban bien generados: no faltaba nada.

La cabecera de seguridad decía `script-src 'self'`. Estos archivos se abren con doble clic, o
sea `file://`, y un documento `file://` tiene origen opaco: `'self'` no coincide con nada. El
navegador bloqueaba el `<script src="./data.js">` **y** el script inline que dibuja el tablero.
Como todo el contenido se dibuja por JavaScript, no quedaba nada visible salvo el título.

Peor: el bloqueo es silencioso. No hay mensaje de error en la página. El síntoma es una
pantalla en blanco, que se confunde con "no hay datos".

`'self'` es una regla escrita para `https://` puesta en una página que por decisión de
arquitectura nunca se sirve por HTTP. El mismo error estaba en `roadmap.html`.

### Alternativas consideradas

1. Servir el tablero por HTTP desde un servidor local.
2. Firmar los scripts inline con hashes `sha256-` en la CSP.
3. `script-src 'unsafe-inline'` y hacer que todo HTML generado sea autocontenido.

### Por qué se descartaron

La 1 contradice el principio de cero servidores de `constitution.md`: nada del modelo abre un
puerto en la máquina de un PM.

La 2 es la opción técnicamente más estricta y era la primera candidata. Se descartó por algo
concreto: no hay navegador en este entorno para verificarla. Un hash mal calculado por un byte
vuelve a dar exactamente la misma pantalla en blanco, y no había forma de comprobar el arreglo
antes de entregarlo. Entregar un control que falla en silencio hacia el mismo síntoma que se
está corrigiendo no es aceptable.

### Decisión tomada

La CSP pasa a `default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline';
img-src data:;` en `lib/render.mjs` y en `dashboard/shell.html`.

El tablero pasa a ser autocontenido. `dashboard/index.html` deja de editarse a mano y pasa a
generarse: `gen-dashboard.mjs` lee `dashboard/shell.html`, le inyecta los datos inline y
escribe el `index.html`. `data.js` se sigue escribiendo, con los mismos datos de la misma
corrida, para que otros comandos lo lean.

### Motivo

`'unsafe-inline'` no debilita lo que esta CSP tiene que garantizar. La amenaza registrada es
S11 del blueprint: que un dato de artefacto inyecte código y ese código llame a internet. Lo
que lo impide es `default-src 'none'`, que implica `connect-src 'none'`, y eso queda intacto.
Aun con una inyección exitosa no hay canal de salida.

El control contra la inyección en sí nunca fue la CSP: es `jsonSeguro()` escapando `<`, `>`,
U+2028 y U+2029, más `textContent` en el cliente. Los dos siguen en su lugar.

Con un archivo autocontenido, el único script que puede correr es el que el generador ya
escribió. Quien pueda inyectar un `<script>` ahí adentro ya controla el archivo.

Beneficio lateral: un solo archivo sin dependencias se manda por mail o se sube a SharePoint y
sigue funcionando. Para la audiencia del modelo, eso importa.

### Artefactos modificados

`lib/render.mjs`, `dashboard/shell.html` (era `index.html`), `scripts/gen-dashboard.mjs`,
`scripts/check-env.mjs`, `scripts/smoke.mjs`, `contracts/paths.md`,
`.claude/commands/dsc-dashboard.md`, `.claude/agents/dashboard.md`. Se eliminó
`dashboard/vendor/`, que estaba vacío.

### Impacto en la cadena

Ninguno sobre los artefactos de proyecto. `roadmap.html` se regeneró y quedó con la CSP nueva.

El smoke suma tres verificaciones sobre el tablero generado: que los datos estén inline, que no
haya ningún `<script src>`, y que la CSP no vuelva a traer `'self'` ni pierda `default-src
'none'`. Se comprobaron rompiendo la CSP a propósito: el paso falla con el mensaje correcto.

### Pendiente

**El arreglo no se verificó en un navegador**, porque este entorno no tiene ninguno. El
diagnóstico y el arreglo se sostienen sobre el comportamiento documentado de CSP con origen
opaco. Abrir `dashboard/index.html` con doble clic es la confirmación que falta.

Vale registrar que el criterio de aceptación de `specs/001-fundacion/spec.md` decía "abro
index.html con doble clic y carga sin errores". Se dio por cumplido sin abrirlo nunca.

---

## DEC-006

**Fecha:** 2026-08-13
**Tipo:** Proceso
**Estado:** ACTIVE
**Responsable:** Patricio Millán
**Proyecto:** global
**command_origin:** recalibración al cerrar la primera cadena completa

### Título

Los cinco límites de tamaño se recalibran contra artefactos reales

### Gap o motivo

DEC-004 subió el límite de la iniciativa y dejó dicho que los otros cuatro se revisarían
cuando existiera evidencia, no antes. La cadena completa de PRY-001 ya existe: es la evidencia.

Medidos contra la primera corrida real:

| Artefacto | Límite viejo | Plantilla vacía | Real | Veredicto |
|---|---|---|---|---|
| iniciativa | 100 | 83 | 83 | correcto, ya ajustado en DEC-004 |
| visión | 120 | 130 | 129 | **el límite está por debajo de la plantilla vacía** |
| roadmap | 150 | 127 | 162 | apretado |
| release | 80 | 98 | 104 | **el límite está por debajo de la plantilla vacía** |
| feature | 100 | 135 | 98 | se cumple por 2 líneas |

El hallazgo que decide la cuestión no es que los artefactos se pasen: es que **la visión y el
release tenían un límite menor que su propia plantilla en blanco**. Ningún artefacto podía
cumplirlos jamás. Un aviso que se enciende siempre no informa nada, y termina entrenando a
quien lo lee para ignorarlo — el mismo razonamiento por el que `Pendiente` y `N/A` salieron de
la lista de placeholders.

DEC-004 anticipó exactamente esto para el release: *"tiene la misma estructura de 7 secciones
y probablemente el mismo problema"*. Lo tenía.

### Alternativas consideradas

1. Recortar los artefactos reales hasta que entren.
2. Poner límites por fórmula, en función de la cantidad de épicas, usuarios o features.
3. Recalibrar los cinco números contra lo observado, con una regla explícita.

### Por qué se descartaron

La 1 es imposible para la visión y el release: ni siquiera vacíos entran.

La 2 es la respuesta correcta en el fondo —la visión escala con usuarios y capacidades, el
roadmap con épicas— pero agrega una capa de configuración para resolver un problema que
todavía no se midió con más de un proyecto. Se puede hacer después, con datos.

### Decisión tomada

Regla de calibración: **el artefacto más grande observado más 25%, redondeado a la decena.**

| Artefacto | Antes | Ahora |
|---|---|---|
| iniciativa | 100 | 100 |
| visión | 120 | **160** |
| roadmap | 150 | **200** |
| release | 80 | **130** |
| feature | 100 | **120** |

La regla reproduce los cinco valores, incluido el 100 de la iniciativa que ya estaba fijado por
DEC-004. No son números elegidos uno por uno para que los avisos desaparezcan.

### Motivo

El límite sigue existiendo por lo mismo de siempre: un artefacto largo infla el contexto del
agente en cada etapa posterior. El 25% es el margen para que un proyecto algo más grande no
dispare un aviso, sin dejar de marcar al que se desbordó de verdad.

La base de calibración es un solo proyecto: 3 usuarios, 5 capacidades, 6 épicas, 8 features.
Está anotada en `lib/registry.mjs`. Con un proyecto sensiblemente más grande hay que volver
sobre esto, probablemente por el camino de la alternativa 2.

### Artefactos modificados

`constitution.md`, `lib/registry.mjs`, las cuatro plantillas de visión, roadmap, release y
feature, los cuatro agentes creadores, `/dsc-vision`, `docs/blueprint.md`,
`specs/003-ciclo-principal/spec.md` y la referencia `artifact-quality.md` del skill.

En esa misma referencia se corrigió la lista de placeholders, que seguía nombrando `Pendiente`
y `N/A` después de que salieran del código.

### Impacto en la cadena

Ningún artefacto de proyecto cambia. Los 3 avisos del check 11 desaparecen.

---

## DEC-007

**Fecha:** 2026-08-14
**Tipo:** Técnica
**Estado:** ACTIVE
**Responsable:** Patricio Millán
**Proyecto:** global
**command_origin:** limpieza de la carpeta del modelo

### Título

Los contadores de ID pasan de `products` a `proyectos`, con migración

### Gap o motivo

DEC-003 fijó que la unidad de trabajo es el proyecto y renombró el vocabulario en 98 archivos.
La clave `products` de `registry/ids.yaml` quedó afuera: es donde viven los contadores de ID por
proyecto, y seguía nombrada con la palabra que esa decisión vino a eliminar.

Convivían además dos claves para lo mismo. `ids.yaml` tenía un `proyectos: {}` vacío que ningún
código lee —quedó de una edición parcial del rename— y que `writeYaml` venía arrastrando intacto
en cada round-trip, porque el parser conserva las claves que no toca.

El residuo estaba en seis lugares: `lib/store.mjs`, `lib/registry.mjs`,
`scripts/discovery-audit.mjs`, `contracts/ids.md`, `.claude/agents/dashboard.md` y el propio
`registry/ids.yaml`.

### Alternativas consideradas

1. Dejarlo: es interno, funciona, ningún PM lo ve.
2. Renombrar la clave y listo.
3. Renombrar con una función de migración que fusione la clave vieja.

### Por qué se descartaron

La 1 deja dos vocabularios para la misma cosa dentro del código, que es exactamente lo que
DEC-003 vino a resolver. El costo no lo paga el PM, lo paga el próximo que lea `store.mjs`.

La 2 es la peligrosa, y por eso no se tomó. Un `ids.yaml` que se haya quedado con el nombre
viejo —una copia del modelo en otra máquina, una carpeta sincronizada que no recibió el cambio—
se leería como "sin contadores". La próxima reserva devolvería `F001` para un proyecto que ya
tiene ocho features, y el choque de IDs se descubriría recién cuando el audit marque features
duplicadas, con artefactos ya escritos.

### Decisión tomada

La clave pasa a llamarse `proyectos`. `lib/store.mjs` exporta `normalizarContadores()`, que
fusiona `products` dentro de `proyectos` si aparece y borra la vieja, de modo que el próximo
`writeYaml` deje el archivo migrado. La usan `reservarIds()` y `leerContadores()`, los dos
únicos puntos de entrada a ese archivo.

`registry/ids.yaml` se migró corriendo esa misma función, no editándolo a mano. El contador de
`proyecto-1` quedó en `F: 8`, verificado antes y después.

### Motivo

Un rename de vocabulario no debería poder corromper datos. La función de migración cuesta seis
líneas y convierte un cambio riesgoso en uno inerte: cualquier copia del modelo se arregla sola
la primera vez que reserva un ID.

Se puede sacar cuando no queden copias con el formato viejo. Hasta entonces, se queda.

### Artefactos modificados

`lib/store.mjs`, `lib/registry.mjs`, `scripts/discovery-audit.mjs`, `contracts/ids.md`,
`.claude/agents/dashboard.md`, `registry/ids.yaml`.

### Impacto en la cadena

Ninguno. El audit devuelve los mismos 0 errores y 14 avisos que antes del cambio, y el smoke
pasa los once pasos.
