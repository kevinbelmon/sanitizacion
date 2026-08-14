#!/usr/bin/env node
/**
 * check-env — verificacion de entorno para /dsc-setup.
 *
 * Comprueba lo que realmente puede fallar en la maquina de un PM:
 * version de node, escritura real sobre una ruta con espacios y acentos,
 * estructura del modelo, y si la carpeta esta sincronizada en la nube.
 *
 * Uso:  node scripts/check-env.mjs
 */

import { join } from 'node:path';
import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { ROOT, readYaml } from '../lib/store.mjs';

const resultados = [];
const anotar = (nivel, titulo, detalle) => resultados.push({ nivel, titulo, detalle });

// --- node -------------------------------------------------------------------
const mayor = Number(process.versions.node.split('.')[0]);
if (mayor >= 18) {
  anotar('ok', `node ${process.versions.node}`, 'Modo completo: audit determinista y dashboard generado.');
} else {
  anotar('warn', `node ${process.versions.node} es viejo`, 'Se recomienda node 18 o superior.');
}

// --- escritura real sobre la ruta del proyecto ------------------------------
// La ruta puede tener espacios y acentos (C:\Users\PatricioMillan\...). Es causa
// habitual de fallos silenciosos en Windows, asi que se prueba de verdad.
const pruebaDir = join(ROOT, '.dsc-tmp');
try {
  mkdirSync(pruebaDir, { recursive: true });
  const f = join(pruebaDir, 'prueba de escritura áéíóú.txt');
  const contenido = 'ñÁÉÍÓÚ · prueba';
  writeFileSync(f, contenido, 'utf8');
  const leido = readFileSync(f, 'utf8');
  rmSync(pruebaDir, { recursive: true, force: true });
  if (leido === contenido) {
    anotar('ok', 'Lectura y escritura', `Funciona sobre "${ROOT}".`);
  } else {
    anotar('error', 'Codificacion de archivos', 'Lo escrito no coincide con lo leido. Revisar la configuracion regional.');
  }
} catch (err) {
  anotar('error', 'No se puede escribir en la carpeta del proyecto', err.message);
}

// --- carpeta sincronizada ---------------------------------------------------
const indicios = ['OneDrive', 'SharePoint', 'Dropbox', 'Google Drive', 'Box'];
const nube = indicios.find((i) => ROOT.includes(i));
if (nube) {
  anotar('warn', `Carpeta sincronizada detectada (${nube})`,
    'Los artefactos contienen presupuestos, restricciones y analisis competitivo. ' +
    'Verifica el alcance de comparticion: usa una carpeta dedicada, nunca la raiz. ' +
    'Sin git, la unica red de rollback es outputs/history/.');
} else {
  anotar('info', 'Carpeta local', 'No se detecto sincronizacion en la nube.');
}

// --- estructura del modelo --------------------------------------------------
const requeridos = [
  'constitution.md',
  'config/workflow.yaml', 'config/governance.yaml', 'config/review-policy.yaml',
  'contracts/paths.md', 'contracts/state.md', 'contracts/ids.md',
  'contracts/chain.md', 'contracts/artifact-creator-contract.md',
  'contracts/command-anatomy.md', 'contracts/feedback.md', 'contracts/handoff.md',
  'registry/ids.yaml', 'registry/proyectos.yaml',
  'registry/capabilities.yaml', 'registry/features.yaml',
  'templates/iniciativa-template.md', 'templates/vision-template.md',
  'templates/roadmap-template.md', 'templates/release-template.md',
  'templates/feature-template.md', 'templates/decision-template.md',
  'templates/review-template.md',
  'dashboard/shell.html',
  'lib/yaml-min.mjs', 'lib/store.mjs', 'lib/render.mjs', 'lib/cascade.mjs', 'lib/registry.mjs',
  'scripts/discovery-audit.mjs', 'scripts/gen-metrics.mjs', 'scripts/gen-dashboard.mjs',
  'lib/metrics.mjs', 'lib/handoff.mjs',
  'scripts/new-proyecto.mjs', 'scripts/estimate.mjs', 'scripts/split.mjs', 'scripts/handoff.mjs', 'scripts/smoke.mjs',
  '.claude/skills/discovery-standards/SKILL.md', 'fixtures/cadena.md',
];
const faltan = requeridos.filter((r) => !existsSync(join(ROOT, r)));
if (faltan.length) {
  anotar('error', `Faltan ${faltan.length} archivos del modelo`, faltan.join(', '));
} else {
  anotar('ok', 'Estructura del modelo', `${requeridos.length} archivos requeridos presentes.`);
}

// --- configuracion legible --------------------------------------------------
try {
  const wf = readYaml(join(ROOT, 'config', 'workflow.yaml'));
  const pol = readYaml(join(ROOT, 'config', 'review-policy.yaml'));
  readYaml(join(ROOT, 'config', 'governance.yaml'));
  anotar('ok', 'Configuracion',
    `${wf.workflow.length} etapas y ${Object.keys(pol).length} politicas de aprobacion.`);
} catch (err) {
  anotar('error', 'Configuracion ilegible', err.message);
}

// --- dependencias -----------------------------------------------------------
const pkg = existsSync(join(ROOT, 'package.json'))
  ? JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) : {};
if (pkg.dependencies && Object.keys(pkg.dependencies).length) {
  anotar('error', 'El modelo declara dependencias npm',
    'La constitucion las prohibe: nada de terceros se ejecuta en maquinas del negocio.');
} else {
  anotar('ok', 'Sin dependencias npm', 'No hay superficie de cadena de suministro.');
}

// --- agentes ----------------------------------------------------------------
// El name del frontmatter tiene que coincidir con el nombre de archivo y con el
// ID en workflow.yaml. En el modelo anterior no coincidia ninguno de los ocho.
try {
  const wf = readYaml(join(ROOT, 'config', 'workflow.yaml'));
  const referenciados = [
    ...wf.workflow.map((e) => e.agent).filter(Boolean),
    ...(wf.postApproval ?? []),
  ];
  const rotos = [];
  for (const nombre of referenciados) {
    const path = join(ROOT, '.claude', 'agents', `${nombre}.md`);
    if (!existsSync(path)) { rotos.push(`${nombre} (sin archivo)`); continue; }
    const declarado = readFileSync(path, 'utf8').match(/^name:\s*(.+)$/m)?.[1]?.trim();
    if (declarado !== nombre) rotos.push(`${nombre} (declara "${declarado}")`);
  }
  if (rotos.length) anotar('error', `${rotos.length} agente(s) no resuelven`, rotos.join(', '));
  else anotar('ok', 'Agentes', `${referenciados.length} referencias resueltas contra .claude/agents/.`);
} catch (err) {
  anotar('error', 'No se pudieron verificar los agentes', err.message);
}

// --- proyectos --------------------------------------------------------------
const reg = readYaml(join(ROOT, 'registry', 'proyectos.yaml'), { proyectos: [] });
const n = (reg.proyectos ?? []).length;
anotar('info', `${n} proyecto${n === 1 ? '' : 's'} registrado${n === 1 ? '' : 's'}`,
  n === 0 ? 'Corre /dsc-new <nombre> para crear el primero.' : (reg.proyectos.map((i) => i.slug).join(', ')));

// --- salida -----------------------------------------------------------------
const ICONO = { ok: '[ok]', warn: '[!]', error: '[X]', info: '[i]' };
console.log('Verificacion de entorno — Discovery Model\n');
for (const r of resultados) {
  console.log(`${ICONO[r.nivel]} ${r.titulo}`);
  if (r.detalle) console.log(`     ${r.detalle}`);
}

const errores = resultados.filter((r) => r.nivel === 'error').length;
console.log(errores
  ? `\n${errores} problema(s) que impiden trabajar. Resolverlos antes de continuar.`
  : `\nEntorno listo. Modo completo.`);
process.exit(errores ? 1 : 0);
