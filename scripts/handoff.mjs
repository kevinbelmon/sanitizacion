#!/usr/bin/env node
/**
 * handoff — exporta una feature al repo de desarrollo.
 *
 * Es el borde del modelo. El gate de exportacion no se puede saltear: lo que
 * cruza entra a un repositorio versionado y queda en el historial para siempre.
 *
 * Uso:
 *   node scripts/handoff.mjs <slug> <F001> [--target <ruta>] [--by "<nombre>"] [--force]
 *
 * Sin --target escribe solo en outputs/handoff/ con instrucciones de entrega
 * manual. No es un error: si el repo de desarrollo esta en otra maquina, ese
 * es el flujo normal.
 */

import { join } from 'node:path';
import { existsSync, mkdirSync, cpSync, readFileSync, readdirSync } from 'node:fs';
import {
  ROOT, proyectoDir, readYaml, writeYaml, writeAtomic, emitirEvento,
  leerEstado, escribirEstado, sha256,
} from '../lib/store.mjs';
import {
  validarDestino, validarFeatureId, validar, construirBrief, construirContexto, featureIdSdd,
} from '../lib/handoff.mjs';

function salir(msg) { console.error(msg); process.exit(1); }
function arg(n) { const i = process.argv.indexOf(`--${n}`); return i === -1 ? null : process.argv[i + 1] ?? null; }

function rutaFeature(slug, id) {
  const dir = join(proyectoDir(slug), 'outputs', 'features');
  if (!existsSync(dir)) return null;
  const f = readdirSync(dir).find((n) => n.startsWith(`${id}-`));
  return f ? join(dir, f) : null;
}

function main() {
  const libres = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const [slug, featureId] = libres;
  const target = arg('target');
  const quien = arg('by');
  const forzar = process.argv.includes('--force');

  if (!slug || !featureId) salir('Uso: node scripts/handoff.mjs <slug> <F001> [--target <ruta>] [--by "<nombre>"]');

  const pReg = join(ROOT, 'registry', 'features.yaml');
  const reg = readYaml(pReg, { features: [] });
  const feature = (reg.features ?? []).find((f) => f.id === featureId && f.proyecto === slug);
  if (!feature) salir(`La feature ${featureId} no esta en el registro del proyecto "${slug}".`);

  const ruta = rutaFeature(slug, featureId);
  if (!ruta) salir(`No se encuentra el archivo de ${featureId} en outputs/features/.`);
  const contenido = readFileSync(ruta, 'utf8');

  /*
   * Reenvio de una feature ya entregada.
   *
   * Hay dos casos y no son el mismo. Si el archivo es identico al que se firmo,
   * reenviarlo es copiar lo mismo otra vez: se permite con --force, porque el
   * repo destino puede haber quedado en otra maquina o el paquete puede haberse
   * perdido.
   *
   * Si el archivo cambio despues de la entrega, --force no alcanza: lo que dice
   * el archivo ya no es lo que firmo una persona. Ahi el camino es volver a
   * revisar y volver a firmar, y no hay atajo.
   */
  let reenvio = false;
  if (feature.status === 'HANDED_OFF') {
    if (feature.hash && sha256(contenido) !== String(feature.hash)) {
      salir(
        `${featureId} ya fue entregada el ${feature.handed_off}, y el archivo cambio desde entonces.\n` +
        `Lo que dice el archivo ya no es lo que firmo una persona, asi que --force no aplica.\n\n` +
        `-> Revisala con /dsc-review y volve a firmarla con /dsc-approve. Despues sale el handoff.`
      );
    }
    if (!forzar) {
      const donde = feature.target_repo ?? 'ningun repo: quedo como entrega local';
      salir(
        `${featureId} ya fue entregada el ${feature.handed_off} a ${donde}.\n` +
        `El archivo no cambio desde la firma. Si hay que reenviarla igual, usa --force.`
      );
    }
    reenvio = true;
  }

  const capacidad = (readYaml(join(ROOT, 'registry', 'capabilities.yaml'), { capabilities: [] }).capabilities ?? [])
    .find((c) => c.id === feature.capability && c.proyecto === slug);

  // El feature_id se usa como nombre de carpeta en los dos repos, y sale del
  // registro: si trae separadores o "..", escaparia del arbol. Ahi si se aborta.
  const fidTentativo = featureIdSdd(feature.id, feature.slug);
  const fidOk = validarFeatureId(fidTentativo);
  if (!fidOk.ok) salir(`Identificador rechazado: ${fidOk.motivo}.\nNo se escribio nada.`);

  // Un repo inaccesible es normal (esta en otra maquina): se sigue en local.
  const destino = target ? validarDestino(target) : null;
  if (target && !destino.ok) {
    console.log(`No se puede escribir en el destino: ${destino.motivo}.`);
    console.log(`Sigo con la exportacion local; despues se entrega a mano.\n`);
  }

  // --- Gate de exportacion ---
  const problemas = validar({
    feature, contenido, capacidad,
    destino: destino?.ok ? destino : null,
    reenvio,
  });

  if (problemas.length) {
    console.error(`No se puede entregar ${featureId}. ${problemas.length} problema(s):\n`);
    for (const p of problemas) {
      console.error(`  ${p.detalle}`);
      console.error(`  -> ${p.arreglo}\n`);
    }
    console.error('No se escribio nada.');
    process.exit(1);
  }

  // --- Construir el paquete ---
  const iniciativa = (readYaml(join(ROOT, 'registry', 'proyectos.yaml'), { proyectos: [] }).proyectos ?? [])
    .find((i) => i.slug === slug);
  const hoy = new Date().toISOString().slice(0, 10);
  const fid = featureIdSdd(feature.id, feature.slug);

  const brief = construirBrief({ feature, contenido, capacidad, proyecto: slug, hoy });
  const contexto = construirContexto({ feature, capacidad, proyecto: slug, iniciativa });

  const paquete = join(proyectoDir(slug), 'outputs', 'handoff', fid);
  mkdirSync(join(paquete, 'assets'), { recursive: true });
  writeAtomic(join(paquete, 'brief.md'), brief);
  writeAtomic(join(paquete, 'context.md'), contexto);

  // Assets de referencia declarados en la feature (.html de diseno, wireframes)
  const assetsOrigen = join(proyectoDir(slug), 'outputs', 'features', 'assets');
  let assets = 0;
  if (existsSync(assetsOrigen)) {
    cpSync(assetsOrigen, join(paquete, 'assets'), { recursive: true });
    assets = readdirSync(join(paquete, 'assets')).length;
  }

  // --- Entrega al repo destino ---
  let entregado = null;
  if (destino?.ok) {
    const drafts = join(destino.base, 'drafts');
    mkdirSync(drafts, { recursive: true });
    const briefDestino = join(drafts, 'brief.md');
    if (existsSync(briefDestino) && !forzar) {
      console.log(`Ya hay un drafts/brief.md en el destino y no se sobreescribe sin confirmacion.`);
      console.log(`El paquete quedo en outputs/handoff/${fid}/. Para pisarlo, usa --force.\n`);
    } else {
      writeAtomic(briefDestino, brief);
      if (assets) cpSync(join(paquete, 'assets'), join(drafts, 'assets'), { recursive: true });
      entregado = destino.base;
    }
  }

  // --- Registro y estado ---
  feature.status = 'HANDED_OFF';
  feature.feature_id = fid;
  // Solo se registra el repo donde efectivamente se escribio. Anotar un destino
  // al que no se llego haria que el portfolio reporte una entrega que no ocurrio.
  feature.target_repo = entregado ? target : null;
  feature.handed_off = hoy;
  writeYaml(pReg, reg);

  const estado = leerEstado(slug);
  if (estado) {
    estado.stages ??= {};
    const s = (estado.stages.handoff ??= { status: 'IN_PROGRESS', items: {} });
    s.items ??= {};
    s.items[featureId] = { status: 'APPROVED', version: 1, approved_at: new Date().toISOString(), feature_id: fid };
    estado.next_action = `Entregar el brief al equipo de desarrollo`;
    estado.next_command = '/dsc-status';
    escribirEstado(slug, estado, estado.updated);
  }

  emitirEvento(slug, {
    stage: 'handoff', item: featureId, command: '/dsc-handoff', event: 'HANDED_OFF',
    feature_id: fid, target_repo: target ?? null, actor: quien ?? null, size: feature.size,
  });

  // --- Reporte ---
  console.log(`Entregada — ${featureId} -> ${fid}\n`);
  console.log(`  Talle     ${feature.size}`);
  console.log(`  Dominio   ${capacidad.sdd_domain}`);
  console.log(`  Paquete   proyectos/${slug}/outputs/handoff/${fid}/`);
  if (assets) console.log(`  Assets    ${assets} archivo(s) de referencia`);

  if (entregado) {
    console.log(`  Destino   ${entregado}\\drafts\\brief.md\n`);
    console.log(`El equipo de desarrollo tiene que correr, en ese repo:\n\n  /sdd-refine\n`);
    console.log(`Deberia generar input.md sin hacer una sola pregunta.`);
  } else {
    console.log(`\nEntrega manual: copiar\n`);
    console.log(`  proyectos/${slug}/outputs/handoff/${fid}/brief.md`);
    console.log(`\na la carpeta drafts/ del repo de desarrollo, y correr ahi /sdd-refine.`);
  }

  console.log(`\nRegistra la entrega con /dsc-log.`);
}

main();
