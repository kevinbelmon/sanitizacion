# Spec — 001 Fundación

Que el harness arranque, tenga estado real y muestre algo desde el primer día.

## US-1 · Verificar el entorno

**Como** PM que abre el modelo por primera vez
**Quiero** saber si mi máquina puede correrlo
**Para** no descubrir a mitad del proceso que algo falta

- **Dado** que corro `/dsc-setup`, **cuando** node está disponible, **entonces** el sistema reporta modo completo y confirma la allowlist de dos comandos exactos.
- **Dado** que corro `/dsc-setup`, **cuando** node NO está disponible, **entonces** el sistema reporta **modo degradado** de forma explícita, indica qué se pierde (audit determinista y dashboard generado) y ofrece continuar.
- **Dado** que el proyecto está en una carpeta sincronizada, **cuando** corre el setup, **entonces** advierte sobre el alcance de compartición y recomienda carpeta dedicada.
- **Dado** que la ruta contiene espacios o acentos, **cuando** corre el setup, **entonces** verifica escritura y lectura reales antes de declarar el entorno listo.

## US-2 · Entender el modelo

**Como** PO que nunca usó esto
**Quiero** una explicación que conecte las partes
**Para** saber qué comando corro y por qué

- **Dado** que corro `/dsc-explain`, **entonces** obtengo: el problema que resuelve, la cadena de artefactos, qué comando ejecuta cada etapa, qué NO puede hacer el modelo solo, y dónde vive el registro de decisiones.
- **Dado** que no hay git, **entonces** la explicación advierte que `history/` es la única red de rollback.
- **Dado** que soy no técnico, **entonces** ningún paso me pide abrir una terminal.

## US-3 · Inicializar un proyecto

**Como** PM que arranca una iniciativa nueva
**Quiero** crear el espacio de trabajo de ese proyecto
**Para** que no se mezcle con otros

- **Dado** que corro `/dsc-new <proyecto>`, **entonces** se crea `proyectos/<slug>/` con su árbol de `outputs/`, su `metrics/` y su entrada en `registry/proyectos.yaml` con un `PRY-nnn` asignado desde `registry/ids.yaml`.
- **Dado** que el proyecto ya existe, **entonces** el comando se detiene y no sobreescribe nada.
- **Dado** que el nombre tiene mayúsculas, espacios o acentos, **entonces** se normaliza a slug y se informa el slug resultante.

## US-4 · Saber dónde estoy

**Como** PM que retoma después de una semana
**Quiero** ver el estado y el próximo paso
**Para** continuar sin releer todo

- **Dado** que corro `/dsc-status`, **entonces** obtengo etapa actual, estado de cada artefacto, bloqueos, quién tiene la pelota y **el próximo comando literal**.
- **Dado** que no existe `workflow-status.json`, **entonces** el sistema asume etapa `iniciativa` y lo informa, sin fallar.
- **Dado** que el `updated` del registry es más nuevo que el mtime local, **entonces** advierte posible desincronización de la carpeta.
- **Dado** que otro usuario tiene un artefacto en `claimed_by`, **entonces** lo reporta con nombre y timestamp, sin impedir el trabajo.

## US-5 · Ver el dashboard desde el día uno

**Como** sponsor
**Quiero** abrir un archivo y ver el estado
**Para** no depender de que alguien me lo cuente

- **Dado** que existe estado, **cuando** corro `/dsc-status`, **entonces** se regenera `dashboard/data.js` y `dashboard/index.html` muestra progreso y tabla de artefactos.
- **Dado** que abro `index.html` con doble clic desde `file://`, **entonces** carga sin errores y sin pedir red.
- **Dado** que un nombre de artefacto contiene `</script>` o `<img onerror=...>`, **entonces** se muestra como texto plano y no se ejecuta nada.
- **Dado** que no hay internet, **entonces** el dashboard se ve igual: Chart.js está vendorizado y las fuentes son del sistema.

## US-6 · Registrar lo que pasa

**Como** modelo
**Quiero** dejar rastro de cada ejecución
**Para** que las métricas del futuro sean reales y no declarativas

- **Dado** que cualquier comando termina, **entonces** se agrega una línea a `proyectos/<p>/metrics/events.jsonl` con `ts`, `command`, `event`, `artifact`, `version`, `actor`.
- **Dado** que el archivo no existe, **entonces** se crea. Nunca se reescribe ni se trunca.
- **Dado** que un comando falla, **entonces** se registra `ERROR` con la causa y el estado queda reanudable.

## Fuera de scope (v1 de esta fase)

- Generación de artefactos de negocio — es 003.
- Aprobaciones y feedback — es 004.
- Audit determinista — es 005.
- Métricas calculadas (cycleTime, throughput, rework) — es 006. Acá solo se **capturan** los eventos.
- Vistas Operativo y Portfolio del dashboard — es 006. Acá solo la vista Ejecutivo mínima.

## Measurable Process Outcomes (DX)

- **DX-001** — La fase se completa con menos de 3 ciclos de autocorrección.
- **DX-002** — Densidad de ambigüedad 0: ninguna consulta de aclaración durante la implementación.
