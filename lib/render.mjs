/**
 * render — serializacion segura de datos hacia HTML.
 *
 * Unico lugar del modelo donde un dato de artefacto se convierte en algo que
 * un navegador ejecuta. Ver constitution.md, seccion Seguridad.
 *
 * El contenido de los artefactos es NO CONFIABLE: sale de minutas, mails y
 * relevamientos de terceros. Un nombre de feature puede contener "</script>".
 */

const SEPARADORES_DE_LINEA = /[\u2028\u2029]/g;

/**
 * JSON.stringify NO escapa "</script>": una cadena que lo contenga cierra la
 * etiqueta y ejecuta lo que siga. Es la falla clasica de inyectar JSON en HTML.
 *
 * U+2028 y U+2029 son validos dentro de un JSON pero son terminadores de linea
 * para el parser de JavaScript: sin escaparlos, el modulo generado no compila.
 */
export function jsonSeguro(valor) {
  return JSON.stringify(valor)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(SEPARADORES_DE_LINEA, (c) =>
      c === '\u2028' ? '\\u2028' : '\\u2029'
    );
}

/** Escapa texto para insertar en HTML. En el cliente, preferir textContent. */
export function esc(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Escribe el modulo de datos que consume el shell HTML.
 *
 * Es un .js y no un .json a proposito: un HTML abierto con file:// no puede
 * hacer fetch() de un JSON vecino, el navegador lo bloquea por CORS y la
 * pagina queda en blanco. Un <script src> si carga.
 */
export function moduloDatos(datos, variable = 'DSC_DATA') {
  return (
    `// Generado por el Discovery Model. No editar a mano: se sobreescribe.\n` +
    `window.${variable} = ${jsonSeguro(datos)};\n`
  );
}

/**
 * Cabecera comun de todo HTML generado por el modelo.
 *
 * default-src 'none' implica connect-src 'none': aun con una inyeccion exitosa
 * no hay canal de exfiltracion. Eso es lo que esta CSP tiene que garantizar, y
 * lo garantiza. El dashboard no necesita red.
 *
 * script-src 'unsafe-inline' y NO 'self', a proposito. Ver DEC-005.
 *
 * Estas paginas se abren con doble clic, o sea file://. Un documento file://
 * tiene origen opaco: 'self' no matchea nada y el navegador bloquea todos los
 * scripts, incluidos los inline. La pagina queda en blanco. 'self' es una regla
 * escrita para https:// en una pagina que por diseno nunca se sirve por HTTP.
 *
 * 'unsafe-inline' no debilita lo que importa. Todo HTML del modelo es
 * autocontenido: el unico script que puede correr es el que el generador ya
 * escribio en el archivo. Quien pueda inyectar un <script> ahi ya controla el
 * archivo. El control real contra inyeccion es jsonSeguro() mas textContent en
 * el cliente; la CSP cubre la exfiltracion, y eso sigue intacto.
 */
export const CSP =
  "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:;";

export const FUENTES_SISTEMA =
  `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;

/**
 * Shell HTML comun de todo documento generado por el modelo.
 *
 * Un solo lugar donde se define la cabecera de seguridad y la tipografia:
 * si el escapado y la CSP estan bien aca, estan bien en el dashboard y en el
 * roadmap. `cuerpo` y `estilos` son markup literal del template, nunca datos
 * de artefactos — esos entran por textContent o por moduloDatos().
 */
export function shellHtml({ titulo, estilos = '', cuerpo = '', scripts = '' }) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<title>${esc(titulo)}</title>
<style>
  :root {
    --bg: #f6f7f9; --surface: #ffffff; --line: #e3e6ea;
    --text: #14181f; --muted: #5c6673;
    --ok: #1a7f4b; --warn: #a86500; --bad: #b3261e; --accent: #2d5bd7;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #14171c; --surface: #1c2128; --line: #2c333d;
      --text: #e6eaef; --muted: #9aa4b1;
      --ok: #4ec98a; --warn: #e0a33a; --bad: #f08076; --accent: #7aa2f7;
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 28px 22px; background: var(--bg); color: var(--text);
    font: 14px/1.55 ${FUENTES_SISTEMA};
  }
${estilos}
</style>
</head>
<body>
${cuerpo}
${scripts}
</body>
</html>
`;
}
