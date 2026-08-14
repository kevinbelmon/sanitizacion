/**
 * registry — acceso tipado a los registros y al inventario de artefactos.
 *
 * El audit y los comandos leen el modelo desde aca, una sola vez, en vez de
 * recorrer el disco cada uno por su cuenta.
 */

import { join } from 'node:path';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { ROOT, proyectoDir, readYaml, leerEstado, normalizarContadores } from './store.mjs';

export const leerProyectos = () =>
  readYaml(join(ROOT, 'registry', 'proyectos.yaml'), { proyectos: [] }).proyectos ?? [];

export const leerCapacidades = () =>
  readYaml(join(ROOT, 'registry', 'capabilities.yaml'), { capabilities: [] }).capabilities ?? [];

export const leerFeatures = () =>
  readYaml(join(ROOT, 'registry', 'features.yaml'), { features: [] }).features ?? [];

export const leerContadores = () =>
  normalizarContadores(readYaml(join(ROOT, 'registry', 'ids.yaml'), { global: {}, proyectos: {} }));

/**
 * Limites de tamano de la constitucion, en lineas.
 *
 * Calibrados en DEC-006 contra el primer proyecto real: el artefacto mas grande
 * observado mas 25%, redondeado a la decena. Los valores originales se fijaron
 * en el blueprint sin haber escrito nunca un artefacto, y dos de ellos quedaron
 * por debajo de la plantilla vacia: avisaban siempre, o sea nunca informaban.
 *
 * Base de calibracion: 1 proyecto, 3 usuarios, 5 capacidades, 6 epicas,
 * 8 features. Visto un proyecto sensiblemente mas grande, revisar.
 */
export const LIMITES = {
  iniciativa: 100, vision: 160, roadmap: 200, release: 130, feature: 120,
};

/** Patrones de placeholder que no pueden sobrevivir a una aprobacion. */
/**
 * Patrones de placeholder que no pueden sobrevivir a una aprobacion.
 *
 * Solo entran marcadores **inequivocos**: texto que solo puede significar "esto
 * quedo sin completar".
 *
 * "Pendiente" y "N/A" quedaron afuera a proposito. En castellano son valores de
 * estado legitimos —una dependencia externa que esta pendiente, un campo que no
 * aplica— y ningun template del modelo los usa como marcador. Detectarlos
 * generaba errores sobre artefactos correctos, y un check que se equivoca deja
 * de leerse: la proxima vez que marque algo real, nadie va a mirarlo.
 *
 * Para lo que de verdad falta completar, los templates usan [Completar].
 */
export const PLACEHOLDERS = [
  /\bTBD\b/i,
  /\[Completar\]/i,
  /\?\?\?/,
  /<nombre[^>]*>/i,
  /<slug>/i,
  /Fnnn|EPnnn|BCnn|PRY-nnn|OE-nnn|Unn\b/,
];

/** Extrae los IDs del modelo que aparezcan en un texto. */
export function extraerIds(texto) {
  const cap = (re) => [...new Set([...texto.matchAll(re)].map((m) => m[0]))];
  return {
    U:   cap(/\bU\d{2}\b/g),
    BC:  cap(/\bBC\d{2}\b/g),
    OE:  cap(/\bOE-\d{3}\b/g),
    EP:  cap(/\bEP\d{3}\b/g),
    R:   cap(/\bR\d\b/g),
    F:   cap(/\bF\d{3}\b/g),
    DEC: cap(/\bDEC-\d{3}\b/g),
  };
}

export function leerFrontmatter(texto) {
  const m = texto.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const out = {};
  for (const linea of m[1].split('\n')) {
    const i = linea.indexOf(':');
    if (i > 0) {
      const v = linea.slice(i + 1).trim();
      out[linea.slice(0, i).trim()] = v === '' ? null : v;
    }
  }
  return out;
}

function archivo(ruta, tipo, id) {
  if (!existsSync(ruta)) return null;
  const contenido = readFileSync(ruta, 'utf8');
  return {
    tipo, id, ruta,
    rel: ruta.replace(ROOT, '').replace(/^[\\/]/, '').replace(/\\/g, '/'),
    contenido,
    lineas: contenido.split('\n').length,
    frontmatter: leerFrontmatter(contenido),
    mtime: statSync(ruta).mtime.toISOString(),
  };
}

/** Inventario de los artefactos de un proyecto que existen en disco. */
export function inventario(slug) {
  const base = proyectoDir(slug);
  const out = [];

  const uno = (ruta, tipo, id) => { const a = archivo(ruta, tipo, id); if (a) out.push(a); };
  uno(join(base, 'iniciativa.md'), 'iniciativa', 'iniciativa');
  uno(join(base, 'outputs', 'vision', 'vision.md'), 'vision', 'vision');
  uno(join(base, 'outputs', 'roadmap', 'roadmap.md'), 'roadmap', 'roadmap');

  const varios = (sub, tipo, re) => {
    const dir = join(base, 'outputs', sub);
    if (!existsSync(dir)) return;
    for (const n of readdirSync(dir)) {
      const m = n.match(re);
      if (m) uno(join(dir, n), tipo, m[1]);
    }
  };
  varios('releases', 'release', /^(R\d+)\.md$/);
  varios('features', 'feature', /^(F\d{3})-.*\.md$/);
  varios('estimations', 'estimation', /^(F\d{3})\.md$/);

  return out;
}

/** Todo lo que el audit necesita, cargado una sola vez. */
export function cargarModelo() {
  const iniciativas = leerProyectos();
  const proyectos = iniciativas.map((i) => ({
    slug: i.slug,
    iniciativa: i,
    estado: leerEstado(i.slug),
    artefactos: inventario(i.slug),
  }));

  return {
    iniciativas,
    capacidades: leerCapacidades(),
    features: leerFeatures(),
    contadores: leerContadores(),
    workflow: readYaml(join(ROOT, 'config', 'workflow.yaml'), { workflow: [] }),
    politica: readYaml(join(ROOT, 'config', 'review-policy.yaml'), {}),
    proyectos,
  };
}
