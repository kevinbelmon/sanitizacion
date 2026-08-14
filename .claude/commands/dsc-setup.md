---
description: Verifica que el entorno pueda correr el Discovery Model y explica qué hacer primero.
---

# /dsc-setup

Sos quien recibe a alguien de negocio — PM, PO, BA — que abre este modelo por primera vez.
No asumas que sabe qué es una terminal, node o un repositorio. **Nunca le pidas que ejecute nada por su cuenta.**

## Paso 1 — Verificación

Corré:

```bash
node scripts/check-env.mjs
```

El script verifica versión de node, escritura real sobre la ruta del proyecto (que puede tener
espacios y acentos), estructura del modelo, legibilidad de la configuración, ausencia de
dependencias npm, y si la carpeta está sincronizada en la nube.

## Paso 2 — Interpretar el resultado

Traducí la salida a lenguaje de negocio. No pegues el output crudo.

### Si node NO está disponible

El comando falla con "node no se reconoce" o similar. Informá esto, textualmente:

```
Tu máquina no tiene Node instalado. El modelo funciona igual, pero en MODO DEGRADADO:

  Sí funciona    Todos los comandos, los artefactos, el grilling, las aprobaciones
  No funciona    La verificación automática de consistencia (/dsc-audit)
                 El dashboard generado (/dsc-dashboard)

En modo degradado esas dos cosas las hago yo con criterio, no con un script.
Es más lento, más caro y menos confiable — y te lo voy a avisar cada vez que pase.

Para pasar a modo completo, alguien de sistemas tiene que instalar Node LTS
desde nodejs.org. Es una instalación estándar, no requiere configuración.
```

Preguntá si quiere continuar en modo degradado o esperar a tener node.
**Nunca reportes como verificado algo que corriste en modo degradado.**

### Si hay errores `[X]`

Explicá cada uno en una línea y qué hay que hacer. No continúes hasta resolverlos.

### Si detecta carpeta sincronizada `[!]`

Es importante y hay que decirlo, aunque no bloquee:

```
Detecté que el modelo vive en una carpeta sincronizada.

Dos cosas a tener en cuenta:

1. COMPARTICIÓN — Los artefactos van a contener presupuestos, restricciones
   organizacionales y análisis competitivo. Si esta carpeta está compartida con
   toda la organización, esa información se comparte también. Conviene una
   carpeta dedicada con acceso restringido al equipo de proyecto.

2. SIN HISTORIAL — Sin control de versiones, si alguien pisa un artefacto
   aprobado la única forma de recuperarlo es outputs/history/, que el modelo
   escribe en cada aprobación. Fuera de eso no hay vuelta atrás.
```

## Paso 3 — Confirmar la allowlist

Verificá que `.claude/settings.json` tenga exactamente estos cuatro permisos, con la ruta
completa de cada script:

```
Bash(node --version)
Bash(node scripts/check-env.mjs)
Bash(node scripts/gen-dashboard.mjs)
Bash(node scripts/new-proyecto.mjs:*)
```

Si encontrás un comodín sobre la ruta del script (por ejemplo `Bash(node *)`), es un problema
de seguridad: habilita ejecutar cualquier archivo del disco. Reportalo y proponé corregirlo.
Los comodines sobre **argumentos** están bien; sobre la **ruta del script**, no.

## Paso 4 — Orientar

Cerrá con esto, adaptado a lo que encontraste:

```
Entorno listo.

Si nunca usaste el modelo:     /dsc-explain
Para arrancar un proyecto:     /dsc-new "Nombre del proyecto"
Para ver dónde estás:          /dsc-status
```

## Reglas

- Lenguaje de negocio. Nada de "exit code", "stderr" ni "parser".
- Un problema por vez, con qué hacer al respecto.
- El modo degradado se anuncia siempre, nunca se oculta.
- No modifiques `settings.json` sin confirmación explícita.
