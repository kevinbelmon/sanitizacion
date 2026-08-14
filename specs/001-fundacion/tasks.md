# Tasks — 001 Fundación

Slicing vertical: cada tarea deja algo que se puede ejecutar y verificar de punta a punta.

| # | Tarea | US |
|---|---|---|
| T001 | Limpieza y esqueleto: eliminar archivos vacíos y `.md.txt`, crear el árbol de carpetas, `package.json` sin dependencias | — |
| T002 | `contracts/paths.md`, `contracts/state.md`, `contracts/ids.md` — los tres contratos que fijan rutas, estado e identificadores | — |
| T003 | `config/`: `workflow.yaml` con IDs resueltos, `governance.yaml` (renombrado, con los 9 umbrales), `review-policy.yaml` | — |
| T004 | `lib/yaml-min.mjs`: leer y escribir el subconjunto restringido. Falla ruidosa ante sintaxis no soportada | — |
| T005 | `.claude/settings.json` con allowlist exacta de dos comandos + hook de sesión mínimo | US-1 |
| T006 | `/dsc-setup`: detección de node, prueba real de I/O sobre ruta con acentos, advertencia de compartición, anuncio de modo degradado | US-1 |
| T007 | `CLAUDE.md` con trigger-table de los 24 comandos y reglas generales + `README.md` reescrito | US-2 |
| T008 | `/dsc-explain`: onboarding en lenguaje de negocio, incluyendo la advertencia de rollback sin git | US-2 |
| T009 | `registry/` con los cuatro YAML vacíos y su esquema documentado | US-3 |
| T010 | `/dsc-new <proyecto>`: scaffold del árbol del proyecto, asignación de `PRY-nnn`, normalización a slug, negativa a sobreescribir | US-3 |
| T011 | Emisión de eventos: helper de append a `events.jsonl` y su invocación al cierre de los cuatro comandos | US-6 |
| T012 | `dashboard/index.html`: shell con CSP `default-src 'none'`, fuentes del sistema, lectura de `window.DSC_DATA` | US-5 |
| T013 | Vendorizar Chart.js en `dashboard/vendor/` durante el setup | US-5 |
| T014 | `scripts/gen-dashboard.mjs`: serialización con escapado de `<`, `>`, U+2028, U+2029 y render por `textContent` | US-5 |
| T015 | `/dsc-status`: lectura de estado, detección de desincronización y de `claimed_by`, próximo comando literal, regeneración del dashboard | US-4, US-5 |
| T016 | Verificación de la fase: caso XSS (`</script>` en un nombre), caso sin node, caso sin estado previo, caso ruta con acentos | US-1, US-4, US-5 |

## Gate de cierre

- Los cuatro comandos corren sin error sobre una carpeta limpia.
- `dashboard/index.html` abre con doble clic, sin red, y muestra el estado.
- Un artefacto llamado `</script><script>alert(1)</script>` se ve como texto.
- Sin node, `/dsc-setup` anuncia modo degradado y el resto sigue funcionando.
- `events.jsonl` tiene una línea por comando ejecutado.
