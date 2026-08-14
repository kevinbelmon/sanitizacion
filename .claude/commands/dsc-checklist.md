---
description: Genera la lista de criterios que requieren validación humana con stakeholders, antes de cerrar una etapa.
---

# /dsc-checklist

Lo que ninguna verificación automática puede cubrir: si la solución es viable operativamente, si
los usuarios la van a aceptar, si alguien de legales tiene que mirarla.

`/dsc-audit` verifica consistencia. Este comando arma lo que hay que **conversar con personas**.

## Paso 1 — Qué se está por cerrar

Preguntá el artefacto si no lo dijeron. Lo típico: antes de aprobar un release, o antes de
entregar features a desarrollo.

## Paso 2 — Generar los ítems

Recorré el artefacto buscando afirmaciones que un script no puede validar. Categorías, e incluí
solo las que apliquen:

**Viabilidad operativa** — ¿el proceso nuevo se puede ejecutar con la gente y los turnos que hay?
¿alguien tiene que cambiar su forma de trabajar y lo sabe?

**Aceptación de usuarios** — ¿los usuarios declarados validaron que esto resuelve su problema?
¿se les preguntó, o se asumió?

**Restricciones organizacionales** — ¿hay una política interna, un convenio o una decisión de
dirección que esto toque?

**Regulatorio y legal** — ¿hay datos personales, retención obligatoria, trazabilidad exigida por
un ente? ¿alguien de compliance lo miró?

**Dependencias de terceros** — ¿el proveedor o el equipo del que dependemos sabe que dependemos
de él y en qué plazo?

**Presupuesto** — ¿el alcance entra en lo aprobado? ¿quién confirma?

Formato:

```
- [ ] CHK001 Confirmar con el jefe de depósito que los operarios pueden
             registrar el ingreso en el momento, sin frenar la descarga
```

## Reglas de un buen ítem

- **Accionable**: alguien tiene que poder marcarlo ✅ o ❌ después de una conversación concreta.
- **Con destinatario**: si no está claro con quién hay que hablar, el ítem no sirve.
- **No duplica el audit**: si un check ya lo verifica, no va acá.
- **No es una tarea de desarrollo**: eso va en las features.

Mal: `- [ ] CHK001 Verificar que la solución sea viable`
Bien: `- [ ] CHK001 Confirmar con Compras que el umbral de reposición lo define un rol y no está fijo por proyecto`

## Paso 3 — Guardar

`proyectos/<slug>/outputs/checklist-<artefacto>.md`. Mostralo antes y pedí confirmación.

Lo completa una persona, no el modelo. Cerrá diciendo:

```
7 ítems para validar antes de aprobar R1. Cuatro son con el jefe de depósito
y tres con Compras.

Marcalos a medida que los confirmes. Si alguno da ❌, registralo con /dsc-log
antes de seguir.
```

## Reglas

- No marques ítems como cumplidos: eso lo hace quien tuvo la conversación.
- Si no encontrás nada que requiera juicio humano, decilo — es una señal buena, no un fracaso
  del comando.
