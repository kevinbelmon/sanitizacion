---
description: Explica el modelo de Discovery a alguien que llega por primera vez. Para PM, PO y BA.
---

# /dsc-explain

Le estás explicando el modelo a alguien de proyecto o negocio que nunca lo usó.
**No es desarrollador.** No expliques carpetas, scripts ni formatos de archivo salvo que pregunte.

No resumas: **conectá**. Cada pieza existe porque resuelve algo concreto, y habilita a la siguiente.

Leé antes de responder: `CLAUDE.md`, `constitution.md`, `config/workflow.yaml`, `docs/blueprint.md`.

## Estructura

### 1. El problema que resuelve

Tres o cuatro líneas. Qué pasa hoy sin esto: la idea se discute en reuniones, alguien escribe un
documento, otro escribe otro, el equipo de desarrollo recibe algo ambiguo y vuelve a preguntar todo
desde cero. Nadie puede decir por qué una feature existe ni qué objetivo de negocio persigue.

### 2. La idea central, en una frase

Algo como: *convertir una idea de negocio en features que el equipo de desarrollo pueda tomar sin
volver a preguntar nada, dejando registrado por qué se decidió cada cosa.*

### 3. La cadena

Mostrala explícita, con qué entra y qué sale:

```
ideas/  →  /dsc-refine  →  iniciativa  →  visión  →  roadmap  →  release  →  features  →  desarrollo
```

Para cada etapa: qué entra, qué sale, quién aprueba, y **por qué existe** — qué problema habría si
no estuviera. Ejemplo: sin el roadmap, las features salen sin prioridad ni dependencias y el equipo
construye en el orden equivocado.

### 4. El grilling

Es lo que más los va a sorprender, así que explicalo bien. `/dsc-refine` no genera nada hasta que
**siete categorías** estén sin ambigüedad: problema, usuarios, estado actual, estado deseado,
resultados esperados, restricciones y urgencia.

Pregunta de a una. Puede tomar varias vueltas. **Se puede cortar y retomar después** — no se pierde
lo respondido. Es incómodo a propósito: cada ambigüedad que no se resuelve acá reaparece en
desarrollo multiplicada por diez.

### 5. Qué NO puede hacer el modelo solo

Es el punto más importante:

- **No aprueba nada.** Registra firmas que dio una persona. Nunca firma por nadie.
- **No inventa información de negocio.** Si falta algo, pregunta.
- **No avanza si el paso anterior no está aprobado.**
- **No decide prioridades.** Propone; la decisión es del PO.

Y cuando una decisión se aparta de lo definido antes, queda registrada en `DECISIONS.md` con quién
la tomó y por qué. Dentro de seis meses, cuando alguien pregunte "¿por qué esto quedó afuera?",
la respuesta está escrita.

### 6. Qué pasa cuando algo cambia

Si la visión cambia después de tener 20 features, el modelo marca como **obsoleto** todo lo que
dependía de ella. No lo borra: avisa que hay que revisarlo antes de seguir. `/dsc-impact` lo muestra
**antes** de confirmar el cambio.

### 7. Cómo empezar

```
1. /dsc-new "Nombre del proyecto"
2. Poné en ideas/ todo lo que ya tengas: minutas, entrevistas, relevamientos,
   mails. Un archivo por documento. Desordenado está bien.
3. /dsc-refine
4. Cuando no sepas qué sigue: /dsc-status
```

### 8. Dos advertencias

**Sin control de versiones.** Los artefactos viven en una carpeta compartida. Cada aprobación
guarda una copia en el historial, y `/dsc-restore` la recupera. Fuera de eso no hay vuelta atrás:
si alguien edita a mano un artefacto aprobado, el modelo lo detecta pero no lo revierte solo.

**Lo que va en `ideas/` es material sensible.** Sale de mails y reuniones. Si hay contraseñas,
claves o datos personales, el modelo los detecta, avisa y **no los copia** a los artefactos.

## Cierre

Preguntá: **"¿Querés que profundice en alguna etapa, o arrancamos con tu proyecto?"**

## Reglas

- Ejemplos concretos, nada abstracto.
- Ninguna instrucción que requiera abrir una terminal.
- Si algo tiene un diseño no obvio, explicá la decisión.
- Tono directo, sin relleno.
