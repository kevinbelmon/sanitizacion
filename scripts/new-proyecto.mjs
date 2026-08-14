#!/usr/bin/env node
/**
 * new-proyecto — crea el espacio de trabajo de un proyecto.
 *
 * Es un script y no una secuencia de escrituras del agente porque la reserva
 * del ID tiene que ser atomica: releer, incrementar y escribir en el mismo
 * turno. Ver contracts/ids.md.
 *
 * Uso:
 *   node scripts/new-proyecto.mjs "Portal de Clientes" [--cliente "Acme S.A."] [--owner "Ana Gomez"]
 */

import { join } from 'node:path';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import {
  ROOT, proyectoDir, readYaml, writeYaml, writeJson,
  reservarIds, slugify, emitirEvento, ESTADO_VACIO,
} from '../lib/store.mjs';

const SUBCARPETAS = [
  'ideas',
  'outputs/vision', 'outputs/roadmap', 'outputs/releases', 'outputs/features',
  'outputs/estimations', 'outputs/reviews', 'outputs/approvals',
  'outputs/history', 'outputs/handoff', 'metrics',
];

const LEEME_IDEAS = `# Borradores de este proyecto

Poné acá todo lo que ya tengas sobre el alcance: minutas de reunión, entrevistas,
relevamientos, mails, notas sueltas. Un archivo por documento, en .md o .txt.

No importa que estén desordenados ni incompletos: de eso se encarga /dsc-refine.

Estos borradores son **material sensible y no confiable**: salen de terceros.
El modelo los escanea buscando instrucciones inyectadas y credenciales antes de
procesarlos, y nunca copia un secreto a un artefacto.

Cada proyecto tiene su propia carpeta de ideas. Así los borradores de un proyecto
no se mezclan con los de otro cuando hay varios en curso.
`;

function salir(msg, codigo = 1) {
  console.error(msg);
  process.exit(codigo);
}

function main() {
  const args = process.argv.slice(2);
  const nombre = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1]?.startsWith('--') !== true);
  const valor = (n) => { const i = args.indexOf(`--${n}`); return i === -1 ? null : args[i + 1] ?? null; };
  const owner = valor('owner');
  const cliente = valor('cliente');

  if (!nombre) {
    salir('Falta el nombre del proyecto.\nUso: node scripts/new-proyecto.mjs "Portal de Clientes" --cliente "Acme S.A."');
  }

  const slug = slugify(nombre);
  if (!slug) salir(`"${nombre}" no produce un slug valido. Usa letras y numeros.`);

  const dir = proyectoDir(slug);
  if (existsSync(dir)) {
    salir(
      `El proyecto "${slug}" ya existe en proyectos/${slug}/.\n` +
      `No se sobreescribe nada. Si querias otro proyecto, usa un nombre distinto.`
    );
  }

  // Reserva atomica del ID. A partir de aca ya se escribio en disco.
  const [id] = reservarIds('PRY', null, 1);

  for (const sub of SUBCARPETAS) {
    mkdirSync(join(dir, sub), { recursive: true });
    writeFileSync(join(dir, sub, '.gitkeep'), '', 'utf8');
  }
  writeFileSync(join(dir, 'ideas', 'LEEME.md'), LEEME_IDEAS, 'utf8');

  writeJson(join(dir, 'metrics', 'workflow-status.json'), ESTADO_VACIO(slug, id));

  const path = join(ROOT, 'registry', 'proyectos.yaml');
  const reg = readYaml(path, { proyectos: [] });
  reg.proyectos = reg.proyectos ?? [];
  reg.proyectos.push({
    id,
    slug,
    nombre,
    cliente,
    status: 'DISCOVERY',
    created: new Date().toISOString().slice(0, 10),
    owner,
  });
  writeYaml(path, reg);

  emitirEvento(slug, {
    stage: 'iniciativa',
    command: '/dsc-new',
    event: 'STAGE_STARTED',
    artifact: null,
    version: null,
    actor: owner,
  });

  console.log(`Proyecto creado.

  Nombre    ${nombre}
  Cliente   ${cliente ?? '(sin declarar)'}
  Slug      ${slug}
  ID        ${id}
  Carpeta   proyectos/${slug}/

Proximo paso: poner los borradores (minutas, entrevistas, relevamientos) en

  proyectos/${slug}/ideas/

y correr /dsc-refine.`);
}

main();
