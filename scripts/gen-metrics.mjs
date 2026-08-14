#!/usr/bin/env node
/**
 * gen-metrics — unico proyector de project-metrics.json.
 *
 * El dashboard lo consume; nadie mas lo escribe. Eso resuelve la contradiccion
 * del modelo anterior, donde metrics y dashboard se declaraban ambos fuente
 * de verdad y producian archivos distintos.
 *
 * Uso:  node scripts/gen-metrics.mjs [<slug>]
 */

import { join } from 'node:path';
import { writeJson, metricsDir, readYaml, ROOT } from '../lib/store.mjs';
import { calcular } from '../lib/metrics.mjs';

function main() {
  const filtro = process.argv[2] ?? null;
  const iniciativas = readYaml(join(ROOT, 'registry', 'proyectos.yaml'), { proyectos: [] }).proyectos ?? [];
  const slugs = (filtro ? iniciativas.filter((i) => i.slug === filtro) : iniciativas).map((i) => i.slug);

  if (!slugs.length) {
    console.log(filtro
      ? `El proyecto "${filtro}" no esta registrado.`
      : 'No hay proyectos. Corre /dsc-new <nombre> para crear el primero.');
    return;
  }

  for (const slug of slugs) {
    const m = calcular(slug);
    writeJson(join(metricsDir(slug), 'project-metrics.json'), m);

    const sinDato = Object.entries(m.proceso).filter(([, v]) => !v.disponible).map(([k]) => k);
    console.log(`${slug}: progreso ${m.progreso.valor}% · calidad ${m.calidad.indice}/100 · ${m.bloqueos.valor} bloqueo(s) · ${m.eventos} eventos`);
    if (sinDato.length) {
      console.log(`  sin datos suficientes todavia: ${sinDato.join(', ')}`);
    }
  }
}

main();
