---
description: Estima el tamaño de una feature con seis factores ponderados. Si da XL, no puede cruzar a desarrollo.
---

# /dsc-estimate

Determina el talle. Es un gate: una feature XL no cruza, porque es retrabajo garantizado.

## Reparto de responsabilidad

**El juicio lo ponés vos** leyendo la feature: qué talle tiene cada uno de los seis factores.
**La aritmética la hace el script**: un LLM sumando ponderaciones se equivoca, y el talle decide
si la feature puede entregarse o no.

## Paso 1 — Gate

La feature tiene que estar `APPROVED`. Si no, indicá qué falta.

## Paso 2 — Evaluar los seis factores

Leé la feature completa y asigná `XS`, `S`, `M`, `L` o `XL` a cada uno.

| Factor | Peso | Qué mirar |
|---|---|---|
| Complejidad funcional | 35% | Cantidad de capacidades, reglas de negocio y escenarios |
| Complejidad de interfaz | 15% | Pantallas nuevas, formularios, grillas, navegación |
| Impacto arquitectónico | 20% | Componentes o servicios nuevos, refactorización |
| Integraciones | 15% | APIs, sistemas externos, dependencias |
| Seguridad | 10% | Roles, permisos, datos sensibles |
| Testing | 5% | Casos funcionales, escenarios, combinaciones |

Escala, igual para todos: `XS` mínimo · `S` simple · `M` moderado · `L` alto · `XL` crítico.

**Estimá solo sobre lo que la feature declara.** No asumas requisitos que no están escritos: si
falta información para estimar, no estimes — pedí aclaraciones.

## Paso 3 — Calcular

```bash
node scripts/estimate.mjs <slug> <F001> \
  --funcional L --interfaz M --arquitectura M \
  --integraciones L --seguridad M --testing M \
  --justificacion "Qué factores dominaron y por qué"
```

La justificación es obligatoria en la práctica: un talle sin explicación no se puede discutir con
el equipo de desarrollo.

## Paso 4 — Actuar según el resultado

| Talle | Qué decir |
|---|---|
| XS, S, M | Continuar. Próximo paso: `/dsc-handoff` |
| L | Continuar, pero advertir: es grande, conviene revisar si el alcance se puede acotar |
| **XL** | **No continúa.** Explicá por qué y derivá a `/dsc-split` |

Para XL, no lo presentes como un error del PM:

```
F002 dio XL (score 7.4). Los factores que más pesaron fueron la complejidad
funcional y las integraciones.

Una feature de este tamaño llega a desarrollo y se rompe: el equipo descubre
a mitad de camino que había tres cosas adentro en vez de una.

Conviene dividirla ahora, que es barato. ¿La partimos?
/dsc-split F002
```

## Reglas

- No inventes factores que la feature no permite evaluar.
- No ajustes el resultado porque "parece mucho": el modelo de puntaje es el mismo para todas.
- El script actualiza el registro. No edites `size` a mano.
