# Plan — 001 Fundación

## Stack

Markdown + YAML + JavaScript (ESM) sobre builtins de node. Sin gestor de paquetes, sin dependencias, sin build.
`package.json` existe solo para declarar `"type": "module"` y los dos scripts.

## Estructura a crear

```
CLAUDE.md · README.md · DECISIONS.md · constitution.md · package.json
.claude/
  commands/{dsc-setup, dsc-explain, dsc-new, dsc-status}.md
  settings.json                  ← allowlist exacta, sin comodines
config/{workflow, governance, review-policy}.yaml
contracts/{paths, state, ids}.md
lib/yaml-min.mjs                 ← parser propio, subconjunto restringido
scripts/gen-dashboard.mjs
dashboard/{index.html, vendor/chart.umd.js}
registry/{proyectos, capabilities, features, ids}.yaml
proyectos/.gitkeep
ideas/
```

## Componentes

| Componente | Responsabilidad |
|---|---|
| `lib/yaml-min.mjs` | Leer y escribir el subconjunto YAML del modelo: mapas, listas, escalares, comentarios. Sin anclas, tags ni multi-documento. Falla ruidosamente ante sintaxis no soportada |
| `scripts/gen-dashboard.mjs` | Leer estado + registry → escribir `dashboard/data.js`. Único punto de escapado |
| `dashboard/index.html` | Shell estático con CSP. Lee `window.DSC_DATA`. Nunca lee archivos |
| `/dsc-setup` | Detección de entorno, allowlist, advertencia de compartición, prueba real de I/O |
| `/dsc-explain` | Onboarding en lenguaje de negocio |
| `/dsc-new` | Scaffold de proyecto + asignación de `PRY-nnn` |
| `/dsc-status` | Lectura de estado → reporte + regeneración del dashboard |

## Contratos que se fijan acá

- **`contracts/paths.md`** — `proyectos/<slug>/outputs/{vision,roadmap,releases,features,estimations,reviews,approvals,handoff,history}/`. Raíz única, sin excepciones.
- **`contracts/state.md`** — schema de `workflow-status.json`, estados por etapa, escritor único, regla de relectura previa a escritura.
- **`contracts/ids.md`** — formatos (`PRY-nnn`, `BC nn`, `EP nnn`, `R n`, `F nnn`, `U nn`, `DEC-nnn`), asignación desde `registry/ids.yaml`, prohibición de inferir contando archivos.

## Decisiones de diseño

- **`data.js`, no `data.json`** — `file://` bloquea `fetch()` por CORS; un `<script src>` carga sin problema.
- **Escapado en un solo lugar** — solo `gen-dashboard.mjs` serializa. Ningún comando escribe HTML a mano.
- **Chart.js vendorizado** — se descarga una vez durante `/dsc-setup` y queda en el repo. Sin CDN en runtime.
- **Parser propio en vez de `yaml`** — elimina la única superficie de supply chain en máquinas del negocio.
- **El dashboard mínimo se entrega en esta fase** — para que crezca con el modelo en vez de aparecer al final.
