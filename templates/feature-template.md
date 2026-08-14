---
discovery_id: Fnnn
proyecto: <slug>
slug: <nombre-corto>
proyecto_id: PRY-nnn
capability: BCnn
epic: EPnnn
release: Rn
users: [Unn]
priority: Alta          # Crítica | Alta | Media | Baja
depends_on: []
size: null              # lo completa /dsc-estimate
version: 1
status: DRAFT
created: YYYY-MM-DD
---

# F<nnn> — <Nombre de la feature>

Límite: 120 líneas.

Dos bloques con reglas distintas.

**El bloque SDD se exporta tal cual.** Los seis títulos de sección son **literales**: son
exactamente los que `/sdd-refine` busca en el repo de desarrollo. Cambiar una palabra, una
tilde o el orden hace que el grilling se dispare igual y el Discovery no haya servido de nada.

**El bloque Discovery se queda acá.** Es lo que el negocio necesita y desarrollo no consume.

---
---

# BLOQUE SDD — se exporta a `brief.md`

## PROBLEMA

Qué duele hoy que esta feature resuelve. Concreto, con el impacto de no tenerla.
No repetir el problema de la iniciativa entera: el de **esta** feature.

## USUARIO

Quién la usa y qué necesita lograr con ella.

**No se pregunta: se deriva.** Sale de los usuarios de la épica (`users` en el frontmatter),
que a su vez vienen de la sección 3 de la Visión. Si acá hay que preguntar algo, es que la
cadena se rompió antes.

| ID | Rol | Qué necesita lograr con esta feature |
|---|---|---|
| U01 | | |

## DONE CRITERIA

Qué tiene que ser verdad para considerarla terminada. Verificable: alguien tiene que poder
marcarlo ✅ o ❌ sin discutir.

- [ ] 
- [ ] 

## OUT OF SCOPE

Qué queda explícitamente afuera de esta versión, y por qué. Es el contrato negativo:
en SDD se convierte en una sección obligatoria de `spec.md`.

- 

## RESTRICCIONES TÉCNICAS

Todo lo que condiciona la implementación y no es negociable: sistemas obligatorios,
integraciones, normativa, requisitos de seguridad, límites de la plataforma.

**Ningún secreto va acá.** Si hay una credencial de por medio, se referencia como variable
de entorno (`API_KEY` vía `.env`), nunca su valor.

- **Integraciones** · 
- **Seguridad** · 
- **Normativa / política** · 
- **Plataforma** · 

## UI / FLUJO

Cómo se ve o cómo funciona, aunque sea en palabras.

Es la única sección que Discovery no puede derivar de nada anterior, así que `/dsc-features`
la pregunta — una vez, con la visión y el roadmap en contexto.

- **Pantallas involucradas** · 
- **Flujo principal** · paso a paso, desde dónde arranca el usuario hasta dónde termina
- **Estado vacío** · qué ve cuando todavía no hay datos
- **Estado de error** · qué ve cuando algo falla, y qué puede hacer al respecto
- **Diseño de referencia** · ninguno | `assets/<archivo>.html`

Si hay un `.html` de referencia, va en `assets/` del paquete de handoff: `/sdd-refine` sabe
resolver su cascada CSS y extraer los valores efectivos.

---
---

# BLOQUE DISCOVERY — no se exporta

## Valor para el negocio

Beneficio esperado, impacto organizacional e impacto operativo. Por qué esta feature vale
lo que cuesta.

## Reglas de negocio

Las reglas del dominio que la feature tiene que respetar.

- 

## Dependencias

Qué tiene que existir antes. Otras features, sistemas, equipos o decisiones pendientes.

| Depende de | Tipo | Estado |
|---|---|---|
| F002 | Feature | Aprobada |

## Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| | Alto / Medio / Bajo | |

## Trazabilidad

| Origen | ID |
|---|---|
| Iniciativa | PRY-nnn |
| Capacidad | BCnn |
| Épica | EPnnn |
| Release | Rn |
| Objetivo estratégico | OE-nnn |
| Decisiones relacionadas | — |
