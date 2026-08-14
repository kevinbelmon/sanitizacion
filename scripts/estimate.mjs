#!/usr/bin/env node
/**
 * estimate — calcula el talle de una feature a partir de los seis factores.
 *
 * El juicio (que talle tiene cada factor) lo pone el agente leyendo la feature.
 * La aritmetica la hace el script: un LLM sumando ponderaciones se equivoca, y
 * el talle decide si la feature puede cruzar a desarrollo o no.
 *
 * Uso:
 *   node scripts/estimate.mjs <slug> <F001> \
 *     --funcional L --interfaz M --arquitectura M \
 *     --integraciones L --seguridad M --testing M \
 *     [--justificacion "<texto>"]
 */

import { join } from 'node:path';
import {
  ROOT, proyectoDir, readYaml, writeYaml, writeAtomic, emitirEvento,
} from '../lib/store.mjs';

const VALOR = { XS: 1, S: 2, M: 3, L: 5, XL: 8 };
const FACTORES = [
  ['funcional',     'Complejidad funcional',  0.35],
  ['interfaz',      'Complejidad de interfaz', 0.15],
  ['arquitectura',  'Impacto arquitectonico',  0.20],
  ['integraciones', 'Integraciones',           0.15],
  ['seguridad',     'Seguridad',               0.10],
  ['testing',       'Testing',                 0.05],
];

function salir(msg) { console.error(msg); process.exit(1); }
function arg(n) { const i = process.argv.indexOf(`--${n}`); return i === -1 ? null : process.argv[i + 1] ?? null; }

function talleDe(score) {
  if (score < 2.0) return 'XS';
  if (score < 3.0) return 'S';
  if (score < 5.0) return 'M';
  if (score < 7.0) return 'L';
  return 'XL';
}

const RECOMENDACION = {
  XS: ['CONTINUE', 'Continuar.'],
  S:  ['CONTINUE', 'Continuar.'],
  M:  ['CONTINUE', 'Continuar.'],
  L:  ['CONTINUE_WITH_WARNING', 'Continuar con advertencia: es grande, conviene revisar el alcance.'],
  XL: ['SPLIT', 'NO continuar. Dividir la feature con /dsc-split antes de entregarla.'],
};

function main() {
  const libres = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const [slug, featureId] = libres;
  if (!slug || !featureId) salir('Uso: node scripts/estimate.mjs <slug> <F001> --funcional L --interfaz M ...');

  const talles = {};
  for (const [clave, nombre] of FACTORES) {
    const v = (arg(clave) ?? '').toUpperCase();
    if (!VALOR[v]) salir(`Falta o es invalido --${clave}. Valores: XS, S, M, L, XL. (${nombre})`);
    talles[clave] = v;
  }

  const pReg = join(ROOT, 'registry', 'features.yaml');
  const reg = readYaml(pReg, { features: [] });
  const feature = (reg.features ?? []).find((f) => f.id === featureId && f.proyecto === slug);
  if (!feature) salir(`La feature ${featureId} no esta en el registro del proyecto "${slug}".`);

  const score = Number(
    FACTORES.reduce((a, [clave, , peso]) => a + VALOR[talles[clave]] * peso, 0).toFixed(2)
  );
  const talle = talleDe(score);
  const [recomendacion, texto] = RECOMENDACION[talle];

  const hoy = new Date().toISOString().slice(0, 10);
  const md = `---
feature: ${featureId}
proyecto: ${slug}
score: ${score}
size: ${talle}
recommendation: ${recomendacion}
estimated: ${hoy}
---

# Estimacion — ${featureId}

## Factores

| Factor | Peso | Talle | Valor |
|---|---|---|---|
${FACTORES.map(([c, n, p]) => `| ${n} | ${Math.round(p * 100)}% | ${talles[c]} | ${VALOR[talles[c]]} |`).join('\n')}

## Resultado

**Score ${score}** → talle **${talle}**

## Justificacion

${arg('justificacion') ?? 'No se registro justificacion.'}

## Recomendacion

${texto}
`;

  writeAtomic(join(proyectoDir(slug), 'outputs', 'estimations', `${featureId}.md`), md);

  feature.size = talle;
  writeYaml(pReg, reg);

  emitirEvento(slug, {
    stage: 'estimation', item: featureId, command: '/dsc-estimate',
    event: 'ARTIFACT_CREATED', size: talle, score,
  });

  console.log(`Estimacion de ${featureId}\n`);
  for (const [c, n] of FACTORES) console.log(`  ${n.padEnd(24)} ${talles[c]}`);
  console.log(`\n  Score  ${score}`);
  console.log(`  Talle  ${talle}\n`);
  console.log(texto);
  console.log(`\nProximo paso: ${talle === 'XL' ? `/dsc-split ${featureId}` : `/dsc-handoff ${featureId}`}`);
}

main();
