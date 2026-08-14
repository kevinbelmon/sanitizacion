---
description: Divide una feature demasiado grande en partes con valor independiente.
---

# /dsc-split

Se usa cuando `/dsc-estimate` devuelve XL, o cuando al revisarla se ve que tiene más de una cosa
adentro.

## Paso 1 — Proponer la división

Leé la feature y proponé 2 o más partes. Cada una tiene que:

- Tener **valor independiente**: se puede construir y entregar sola
- Tener alcance claro y verificable
- Poder estimarse por separado

La división natural suele estar en los `## DONE CRITERIA`: si hay cinco criterios y tres son de
una cosa y dos de otra, ahí está el corte.

Presentala antes de ejecutar:

```
F002 "Gestión de usuarios y permisos" dio XL.

Mirando los criterios de aceptación, adentro hay dos cosas:

  alta-y-baja-usuarios    crear, modificar y desactivar usuarios
                          criterios 1, 2 y 3
  asignacion-de-roles     asignar roles y permisos a un usuario
                          criterios 4 y 5 — depende de la anterior

Las dos heredan la épica EP001, la capacidad BC02, el release R1 y los
usuarios U01 y U02.

¿Te parece bien ese corte, o lo partirías distinto?
```

## Paso 2 — Ejecutar

```bash
node scripts/split.mjs <slug> <F002> --into "slug-a,slug-b" --by "<nombre>"
```

Pedí el nombre de quien decide: dividir una feature es una decisión de proyecto.

El script reserva los IDs nuevos del registro, marca la original `SUPERSEDED` y crea cada parte
con una copia del contenido original.

## Paso 3 — Recortar cada parte

Las partes arrancan con una copia completa del original. **Hay que editar cada una** para que su
alcance sea solo el suyo: recortar `## DONE CRITERIA`, ajustar `## PROBLEMA` y `## OUT OF SCOPE`,
y declarar la dependencia si una necesita a la otra.

Es trabajo real, no automático. Guialo sección por sección.

## Paso 4 — Cerrar el ciclo

```
1. /dsc-review y /dsc-approve para cada parte
2. /dsc-estimate para cada una — si alguna vuelve a dar XL, se divide otra vez
3. /dsc-log para registrar la división
```

## Por qué la original no se borra

Queda `SUPERSEDED`, no eliminada. Puede estar referenciada en el roadmap, en el release, en una
decisión o en una minuta. Borrarla rompe esas referencias; dejarla marcada permite seguir el hilo
de qué pasó con ella.

Y los IDs nuevos nunca reutilizan el viejo: `F002` no vuelve a existir.

## Reglas

- No dividas en partes que no tengan valor por separado: dos mitades que solo sirven juntas son
  una sola feature mal escrita.
- No cambies épica, capacidad ni release: se heredan.
- Si el usuario propone otro corte, seguí el suyo — es una decisión de proyecto, no técnica.
