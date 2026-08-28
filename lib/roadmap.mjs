/**
 * roadmap — lectura de la "Tabla del roadmap".
 *
 * Vive en lib/ y no en el generador de HTML porque hay dos consumidores: la vista
 * ejecutiva (scripts/gen-roadmap.mjs) y el audit (chequeo 16). Con el parser
 * duplicado, un cambio de formato deja a uno de los dos leyendo mal en silencio.
 *
 * Funciones puras: no leen disco, no escriben, no terminan el proceso. Quien las
 * llama decide que hacer cuando la tabla falta o esta mal formada.
 */

const ENCABEZADO = '## Tabla del roadmap';

/** Posicion de cada columna. La de dependencias es la ultima y no se reordena. */
const COL = { epica: 0, objetivo: 1, capacidad: 2, prioridad: 3, usuarios: 4, trimestre: 5, depende: 6 };

/** Cuantas columnas tiene que haber como minimo para que la fila sea utilizable. */
const MINIMO = 6;

/**
 * IDs de epicas de la columna "Depende de".
 *
 * Un roadmap de seis columnas —generado antes de que la columna existiera— no la
 * trae: la celda llega undefined y la epica queda sin dependencias declaradas.
 * Eso es deliberado. La ausencia del dato no se interpreta como ausencia de
 * dependencia, pero tampoco se puede inventar una: el chequeo 16 no opina sobre
 * un roadmap que no declara la columna.
 */
export function parseDeps(celda) {
  if (!celda) return [];
  return celda
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s && !/^(—|--?|ninguna|ninguno|n\/a|nada)$/i.test(s));
}

/**
 * Extrae las filas de la tabla del roadmap.
 *
 * Devuelve `null` si la seccion no existe — quien llama decide si eso es un error
 * ruidoso (el generador) o un caso a ignorar (el audit sobre un proyecto sin roadmap).
 *
 * `tieneColumnaDeps` distingue "no declara dependencias" de "declara que no tiene".
 */
export function leerTablaRoadmap(texto) {
  const i = texto.indexOf(ENCABEZADO);
  if (i === -1) return null;

  const filas = [];
  let tieneColumnaDeps = false;

  for (const linea of texto.slice(i).split('\n').slice(1)) {
    const t = linea.trim();
    if (t.startsWith('##')) break;
    if (!t.startsWith('|')) continue;

    const celdas = t.split('|').slice(1, -1).map((c) => c.trim());
    if (celdas.length < MINIMO) continue;
    if (/^-+$/.test(celdas[0].replace(/[: ]/g, ''))) continue;          // separador
    if (/^épica$/i.test(celdas[0]) || /^epica$/i.test(celdas[0])) {      // encabezado
      if (celdas.length > COL.depende) tieneColumnaDeps = true;
      continue;
    }
    if (!celdas[COL.epica]) continue;

    filas.push({
      epica: celdas[COL.epica],
      objetivo: celdas[COL.objetivo],
      capacidad: celdas[COL.capacidad],
      prioridad: celdas[COL.prioridad],
      usuarios: celdas[COL.usuarios].split(',').map((u) => u.trim()).filter(Boolean),
      trimestre: celdas[COL.trimestre],
      depende: parseDeps(celdas[COL.depende]),
    });
  }

  return { filas, tieneColumnaDeps };
}

/**
 * Resuelve cada dependencia contra el propio roadmap.
 *
 * Devuelve las filas con `depende` convertido de `['EP001']` a
 * `[{ id, falta, cruza }]`. Dos casos importan: que la dependencia apunte a una
 * epica inexistente (`falta`), y que caiga en otro trimestre (`cruza`), que es la
 * unica que cuesta tiempo de calendario.
 */
export function resolverDeps(filas) {
  const trimestreDe = new Map(filas.map((f) => [f.epica, f.trimestre]));
  return filas.map((f) => ({
    ...f,
    depende: f.depende.map((id) => ({
      id,
      falta: !trimestreDe.has(id),
      cruza: trimestreDe.has(id) && Boolean(f.trimestre) && trimestreDe.get(id) !== f.trimestre,
    })),
  }));
}

/**
 * Ciclos de dependencia entre epicas, por DFS con marcas.
 * Devuelve un array de rutas legibles: `['EP001 -> EP002 -> EP001']`.
 * Un ciclo hace imposible cualquier orden de trabajo, y no lo detecta el ojo.
 */
export function ciclosDeps(filas) {
  const ids = new Set(filas.map((f) => f.epica));
  const grafo = new Map(filas.map((f) => [f.epica, f.depende.map((d) => d.id ?? d)]));
  const estado = new Map();
  const camino = [];
  const ciclos = [];

  const visitar = (n) => {
    if (estado.get(n) === 'listo') return;
    if (estado.get(n) === 'visitando') {
      ciclos.push([...camino.slice(camino.indexOf(n)), n].join(' -> '));
      return;
    }
    estado.set(n, 'visitando');
    camino.push(n);
    for (const d of grafo.get(n) ?? []) if (ids.has(d)) visitar(d);
    camino.pop();
    estado.set(n, 'listo');
  };

  for (const id of grafo.keys()) visitar(id);
  return ciclos;
}

/** Numero de un trimestre `Q2` -> 2. Sin numero, 0: no ordena y no rompe. */
export function numTrimestre(q) {
  return Number(String(q ?? '').replace(/\D/g, '')) || 0;
}
