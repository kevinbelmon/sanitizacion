/**
 * yaml-min — lector/escritor del subconjunto YAML del Discovery Model.
 *
 * Existe para que el modelo no tenga dependencias npm: nada de terceros se
 * ejecuta en la maquina de un PM. Ver constitution.md, seccion Seguridad.
 *
 * Soportado:
 *   - mapas anidados por indentacion de 2 espacios
 *   - listas con "-" (escalares o mapas)
 *   - escalares: string, numero, booleano, null
 *   - strings entre comillas simples o dobles
 *   - bloques plegados ">" de multiples lineas
 *   - comentarios "#"
 *
 * NO soportado, y falla ruidosamente: anclas (&), alias (*), tags (!!),
 * multi-documento (---), flow style ({} []), tabulaciones.
 * Fallar es intencional: preferimos un error claro a interpretar mal un registry.
 */

const INDENT = 2;

class YamlError extends Error {
  constructor(msg, line) {
    super(line ? `${msg} (linea ${line})` : msg);
    this.name = 'YamlError';
    this.line = line;
  }
}

/** Quita el comentario de una linea respetando lo que este entre comillas. */
function stripComment(raw) {
  let quote = null;
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = null;
    } else if (c === '"' || c === "'") {
      quote = c;
    } else if (c === '#' && (i === 0 || /\s/.test(raw[i - 1]))) {
      return raw.slice(0, i);
    }
  }
  return raw;
}

function rejectUnsupported(content, lineNo) {
  const checks = [
    [/^---\s*$/, 'multi-documento (---)'],
    [/(^|\s)&[A-Za-z_]/, 'ancla (&)'],
    [/(^|\s)\*[A-Za-z_]/, 'alias (*)'],
    [/!!/, 'tag (!!)'],
  ];
  for (const [re, what] of checks) {
    if (re.test(content)) {
      throw new YamlError(`Sintaxis no soportada por yaml-min: ${what}`, lineNo);
    }
  }
}

function toLines(text) {
  const out = [];
  const raw = text.split(/\r?\n/);
  for (let i = 0; i < raw.length; i++) {
    const lineNo = i + 1;
    const original = raw[i];
    const leading = original.match(/^[ \t]*/)[0];
    if (leading.includes('\t')) {
      throw new YamlError('Tabulacion en la indentacion: usar 2 espacios', lineNo);
    }
    const content = stripComment(original).trimEnd();
    if (!content.trim()) continue;
    rejectUnsupported(content.trim(), lineNo);
    const indent = leading.length;
    if (indent % INDENT !== 0) {
      throw new YamlError(`Indentacion de ${indent} espacios: debe ser multiplo de ${INDENT}`, lineNo);
    }
    out.push({ indent, content: content.slice(indent), lineNo });
  }
  return out;
}

function parseScalar(token, lineNo) {
  const t = token.trim();
  if (t === '' || t === '~' || t === 'null') return null;
  if (t === 'true') return true;
  if (t === 'false') return false;
  if (t === '[]') return [];
  if (t === '{}') return {};
  if (t[0] === '{' || t[0] === '[') {
    throw new YamlError('Flow style ({} o []) no soportado por yaml-min, salvo [] y {} vacios', lineNo);
  }
  if (t[0] === '"' || t[0] === "'") {
    const q = t[0];
    if (t.length < 2 || t[t.length - 1] !== q) {
      throw new YamlError('Comilla sin cerrar', lineNo);
    }
    const body = t.slice(1, -1);
    return q === '"' ? body.replace(/\\"/g, '"').replace(/\\\\/g, '\\') : body.replace(/''/g, "'");
  }
  if (/^-?\d+$/.test(t)) return Number(t);
  if (/^-?\d*\.\d+$/.test(t)) return Number(t);
  return t;
}

/** Divide "clave: valor" respetando comillas. Devuelve null si no es un par. */
function splitKey(content) {
  let quote = null;
  for (let i = 0; i < content.length; i++) {
    const c = content[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = null;
    } else if (c === '"' || c === "'") {
      quote = c;
    } else if (c === ':' && (i + 1 === content.length || /\s/.test(content[i + 1]))) {
      return [content.slice(0, i).trim(), content.slice(i + 1).trim()];
    }
  }
  return null;
}

/** Junta las lineas mas indentadas de un bloque ">" en un solo string. */
function readFolded(lines, i, parentIndent) {
  const parts = [];
  while (i < lines.length && lines[i].indent > parentIndent) {
    parts.push(lines[i].content.trim());
    i++;
  }
  return [parts.join(' '), i];
}

function parseBlock(lines, i, indent) {
  if (i >= lines.length) return [null, i];

  if (lines[i].content.startsWith('- ') || lines[i].content === '-') {
    const arr = [];
    while (i < lines.length && lines[i].indent === indent && (lines[i].content.startsWith('- ') || lines[i].content === '-')) {
      const { content, lineNo } = lines[i];
      const rest = content === '-' ? '' : content.slice(2).trim();
      const pair = rest ? splitKey(rest) : null;

      if (pair) {
        // Item de lista que abre un mapa en la misma linea: "- id: F001"
        const virtual = [{ indent: indent + INDENT, content: rest, lineNo }];
        let j = i + 1;
        while (j < lines.length && lines[j].indent >= indent + INDENT) {
          virtual.push(lines[j]);
          j++;
        }
        const [value] = parseBlock(virtual, 0, indent + INDENT);
        arr.push(value);
        i = j;
      } else if (rest) {
        arr.push(parseScalar(rest, lineNo));
        i++;
      } else {
        i++;
        const [value, next] = parseBlock(lines, i, indent + INDENT);
        arr.push(value);
        i = next;
      }
    }
    return [arr, i];
  }

  const obj = {};
  while (i < lines.length && lines[i].indent === indent) {
    const { content, lineNo } = lines[i];
    const pair = splitKey(content);
    if (!pair) throw new YamlError(`No se pudo interpretar: "${content}"`, lineNo);
    const [key, rawValue] = pair;

    if (rawValue === '>' || rawValue === '>-') {
      const [folded, next] = readFolded(lines, i + 1, indent);
      obj[key] = folded;
      i = next;
    } else if (rawValue === '') {
      const childIndent = i + 1 < lines.length ? lines[i + 1].indent : indent;
      if (i + 1 < lines.length && childIndent > indent) {
        const [value, next] = parseBlock(lines, i + 1, childIndent);
        obj[key] = value;
        i = next;
      } else {
        obj[key] = null;
        i++;
      }
    } else {
      obj[key] = parseScalar(rawValue, lineNo);
      i++;
    }
  }
  return [obj, i];
}

export function parse(text) {
  const lines = toLines(text);
  if (!lines.length) return {};
  const [value] = parseBlock(lines, 0, lines[0].indent);
  return value;
}

const NEEDS_QUOTE = /^(\s|$)|[:#]\s|\s$|^[-?&*!|>%@`{[]|^(true|false|null|~)$|^-?\d+(\.\d+)?$/;

function emitScalar(v) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'boolean' || typeof v === 'number') return String(v);
  const s = String(v);
  if (s === '' || NEEDS_QUOTE.test(s) || s.includes('\n')) {
    return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ')}"`;
  }
  return s;
}

function emit(value, depth, out) {
  const pad = ' '.repeat(depth * INDENT);

  if (Array.isArray(value)) {
    if (!value.length) return;
    for (const item of value) {
      if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
        const keys = Object.keys(item);
        if (!keys.length) { out.push(`${pad}- {}`); continue; }
        const [first, ...rest] = keys;
        const fv = item[first];
        if (fv !== null && typeof fv === 'object') {
          out.push(`${pad}-`);
          emit(item, depth + 1, out);
        } else {
          out.push(`${pad}- ${first}: ${emitScalar(fv)}`);
          const tail = {};
          for (const k of rest) tail[k] = item[k];
          emit(tail, depth + 1, out);
        }
      } else {
        out.push(`${pad}- ${emitScalar(item)}`);
      }
    }
    return;
  }

  for (const [k, v] of Object.entries(value)) {
    if (Array.isArray(v)) {
      if (!v.length) { out.push(`${pad}${k}: []`); continue; }
      out.push(`${pad}${k}:`);
      emit(v, depth + 1, out);
    } else if (v !== null && typeof v === 'object') {
      // Un mapa vacio se emite como {}: sin esto vuelve del disco como null
      // y se pierde la diferencia entre "vacio" y "no declarado".
      if (!Object.keys(v).length) { out.push(`${pad}${k}: {}`); continue; }
      out.push(`${pad}${k}:`);
      emit(v, depth + 1, out);
    } else {
      out.push(`${pad}${k}: ${emitScalar(v)}`);
    }
  }
}

export function stringify(value) {
  const out = [];
  emit(value, 0, out);
  return out.join('\n') + '\n';
}

export { YamlError };
