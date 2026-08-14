---
description: Registra una decisión en DECISIONS.md, con alternativas, motivo y quién la tomó.
---

# /dsc-log

Deja constancia de por qué se decidió algo. Dentro de seis meses, cuando alguien pregunte
"¿por qué esto quedó afuera?", la respuesta tiene que estar escrita.

## Cuándo se usa

- Se aprueba algo con condiciones o con un desvío
- Cambia una prioridad del roadmap
- Se acepta un gap de `/dsc-validate` sin resolverlo
- Se salta un gate
- Se divide una feature o se restaura una versión
- El usuario lo pide

## Las seis preguntas

Una por vez, esperando la respuesta. **No las agrupes.**

1. **¿Qué cambió?** El desvío concreto respecto de lo definido antes.
2. **¿Qué alternativas consideraste?** Al menos una. Si no había, "ninguna evaluada" y por qué.
3. **¿Por qué descartaste cada una?** Una razón por alternativa.
4. **¿Por qué tomaste esta decisión?** El contexto de negocio o la restricción.
5. **¿Qué artefactos modificaste?**
6. **¿Quién tomó la decisión?** Nombre o rol. **Nunca lo asumas ni lo infieras.**

Las preguntas 2 y 3 son las que más cuesta responder y las que más valor tienen: una decisión sin
alternativas registradas no se puede revisar después, solo se puede acatar o revertir a ciegas.

## Escribir

1. Reservá el `DEC-nnn` de `registry/ids.yaml` — nunca cuentes entradas del archivo
2. Agregá la entrada al final de `DECISIONS.md` con el formato de `templates/decision-template.md`
3. Agregá la fila al índice del encabezado
4. Si la decisión reemplaza a otra, editá **solo** el campo `Estado` de la vieja a
   `SUPERSEDED por DEC-nnn`. Nunca borres ni reescribas una entrada

Delegá en el subagente `decision-logger`.

## Impacto en la cadena

Si la decisión dejó artefactos obsoletos, registralo en el campo correspondiente. Si no lo sabés,
corré `/dsc-impact` antes.

## Reglas

- Nunca inventes quién tomó la decisión.
- Nunca registres una decisión que no fue confirmada por una persona.
- Las entradas no se borran: el valor del registro está en poder leer la historia completa,
  incluidas las decisiones que resultaron equivocadas.
- Confirmá al usuario que quedó registrada, con su ID.
