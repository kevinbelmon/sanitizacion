/**
 * handoff — mapeo y validacion del borde con SDD.
 *
 * Ver contracts/handoff.md. El gate de exportacion vive aca porque es la
 * ultima barrera antes de que algo cruce a un repositorio versionado.
 */

import { join, isAbsolute, resolve, normalize } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { ROOT } from './store.mjs';
import { PLACEHOLDERS } from './registry.mjs';

export const CONTRACT_VERSION = 1;

/** Las seis secciones que /sdd-refine busca. Los titulos son literales. */
export const SECCIONES_SDD = [
  'PROBLEMA',
  'USUARIO',
  'DONE CRITERIA',
  'OUT OF SCOPE',
  'RESTRICCIONES TÉCNICAS',
  'UI / FLUJO',
];

/** F001 + gestion-usuarios -> 001-gestion-usuarios. Quitar la F, conservar el slug. */
export function featureIdSdd(discoveryId, slug) {
  const n = String(discoveryId).replace(/^F/i, '');
  return `${n}-${slug}`;
}

/** Extrae el cuerpo de una seccion `## TITULO` hasta el proximo `## `. */
export function seccion(texto, titulo) {
  const re = new RegExp(`^##\\s+${titulo.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\s*$`, 'm');
  const m = texto.match(re);
  if (!m) return null;
  const desde = m.index + m[0].length;
  const resto = texto.slice(desde);
  const fin = resto.search(/^##\s+/m);
  return (fin === -1 ? resto : resto.slice(0, fin)).trim();
}

/** Solo el bloque SDD del template de feature: lo de abajo no se exporta. */
export function bloqueSdd(texto) {
  const i = texto.indexOf('# BLOQUE DISCOVERY');
  return i === -1 ? texto : texto.slice(0, i);
}

const SECRETOS = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'clave privada'],
  [/\bAKIA[0-9A-Z]{16}\b/, 'clave de acceso AWS'],
  [/\bghp_[A-Za-z0-9]{30,}\b/, 'token de GitHub'],
  [/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/, 'token JWT'],
  [/(mongodb|postgres(ql)?|mysql|redis|amqp):\/\/[^\s/]+:[^\s@]{6,}@/i, 'cadena de conexion con credenciales'],
  [/https?:\/\/[^\s:/]+:[^\s@]{6,}@/, 'URL con credenciales'],
  [/\b(api[_-]?key|apikey|secret|token|password|passwd|contrasena)\b\s*[:=]\s*["']?[A-Za-z0-9_\-.+/]{16,}/i, 'credencial embebida'],
];
const NO_ES_SECRETO = /\$\{|process\.env|<[^>]+>|\bvia\b|\bvía\b|\.env\b|xxx+|ejemplo|example|tu-|your-/i;

/**
 * Verifica que el destino sea un repo SDD real.
 *
 * No se rechazan rutas relativas con "..": `../mi-repo-sdd` es la forma normal
 * de referir a un repo hermano, y quien tipea el comando puede poner cualquier
 * ruta absoluta igual. El control que sirve es otro: que el destino sea
 * efectivamente un repo SDD, y que solo se escriba dentro de su carpeta drafts/.
 */
export function validarDestino(ruta) {
  if (!ruta) return { ok: false, motivo: 'sin destino' };
  const base = normalize(isAbsolute(ruta) ? ruta : resolve(ROOT, ruta));
  if (!existsSync(base)) {
    return { ok: false, motivo: `la carpeta "${base}" no existe o no es accesible desde esta maquina` };
  }
  if (!existsSync(join(base, '.claude', 'commands', 'sdd-refine.md'))) {
    return { ok: false, motivo: `"${base}" no parece un repo SDD: no tiene .claude/commands/sdd-refine.md` };
  }
  return { ok: true, base };
}

/**
 * El feature_id se usa como nombre de carpeta en los dos repos. Un slug con
 * separadores o ".." escaparia del arbol: ahi si el control tiene sentido,
 * porque el valor viene del registro y no de alguien tipeando.
 */
export function validarFeatureId(fid) {
  if (!/^[0-9]{1,4}-[a-z0-9-]+$/.test(fid)) {
    return { ok: false, motivo: `"${fid}" no es un identificador valido (esperado: 001-nombre-corto)` };
  }
  return { ok: true };
}

/**
 * Gate de exportacion. Devuelve la lista de motivos por los que NO se puede
 * exportar. Vacia = se puede.
 */
export function validar({ feature, contenido, capacidad, destino, reenvio = false }) {
  const problemas = [];
  const cuerpo = bloqueSdd(contenido);

  /* Un reenvio llega en HANDED_OFF y eso es correcto: quien llama ya verifico
     que el archivo sea identico al que se firmo. Ver scripts/handoff.mjs. */
  const yaEntregadaSinCambios = reenvio && feature.status === 'HANDED_OFF';

  if (feature.status !== 'APPROVED' && !yaEntregadaSinCambios) {
    problemas.push({
      codigo: 'no-aprobada',
      detalle: `La feature esta en ${feature.status}, no APPROVED.`,
      arreglo: 'Revisarla con /dsc-review y firmarla con /dsc-approve.',
    });
  }

  for (const s of SECCIONES_SDD) {
    const c = seccion(cuerpo, s);
    if (c === null) {
      problemas.push({
        codigo: 'seccion-faltante',
        detalle: `Falta la seccion "## ${s}".`,
        arreglo: 'Regenerar la feature con /dsc-features: sin esa seccion, desarrollo va a preguntar por ella igual.',
      });
    } else if (!c.replace(/[-|\s#[\]()]/g, '')) {
      problemas.push({
        codigo: 'seccion-vacia',
        detalle: `La seccion "## ${s}" esta vacia.`,
        arreglo: 'Completarla antes de entregar.',
      });
    }
  }

  for (const re of PLACEHOLDERS) {
    const m = cuerpo.match(re);
    if (m) {
      problemas.push({
        codigo: 'placeholder',
        detalle: `Quedo un placeholder sin completar: "${m[0]}".`,
        arreglo: 'Completarlo: un placeholder que cruza se convierte en una suposicion del desarrollador.',
      });
      break;
    }
  }

  if (!feature.size) {
    problemas.push({
      codigo: 'sin-estimar',
      detalle: 'La feature no esta estimada.',
      arreglo: 'Correr /dsc-estimate.',
    });
  } else if (feature.size === 'XL') {
    problemas.push({
      codigo: 'talle-xl',
      detalle: 'Talle XL: no puede cruzar a desarrollo.',
      arreglo: 'Dividirla con /dsc-split. Una feature XL es retrabajo garantizado.',
    });
  }

  if (!capacidad?.sdd_domain) {
    problemas.push({
      codigo: 'sin-dominio',
      detalle: `La capacidad ${feature.capability ?? '(ninguna)'} no resuelve a un dominio de desarrollo.`,
      arreglo: 'Completar `sdd_domain` en registry/capabilities.yaml.',
    });
  }

  for (const [re, que] of SECRETOS) {
    const hit = cuerpo.match(re);
    if (hit && !NO_ES_SECRETO.test(hit[0])) {
      problemas.push({
        codigo: 'secreto',
        detalle: `Posible ${que} en el brief.`,
        arreglo: 'Sacarlo, referenciarlo como variable de entorno y rotar la credencial. Es la ultima barrera antes de que entre a un repositorio versionado.',
      });
      break;
    }
  }

  if (destino?.ok) {
    const fid = featureIdSdd(feature.id, feature.slug);
    if (existsSync(join(destino.base, 'specs', fid))) {
      problemas.push({
        codigo: 'colision',
        detalle: `Ya existe specs/${fid}/ en el repo destino.`,
        arreglo: 'Otra persona ya entrego esta feature, o el slug colisiona. Coordinar antes de continuar.',
      });
    }
  }

  return problemas;
}

/** Arma el brief con el frontmatter de trazabilidad y las seis secciones. */
export function construirBrief({ feature, contenido, capacidad, proyecto, hoy }) {
  const cuerpo = bloqueSdd(contenido).replace(/^---\n[\s\S]*?\n---\n/, '');
  const marcador = cuerpo.indexOf('# BLOQUE SDD');
  const secciones = marcador === -1
    ? cuerpo.trim()
    : cuerpo.slice(cuerpo.indexOf('\n', marcador) + 1).trim();

  const fm = [
    `contract_version: ${CONTRACT_VERSION}`,
    `discovery_id: ${feature.id}`,
    `feature_id: ${featureIdSdd(feature.id, feature.slug)}`,
    `domain: ${capacidad.sdd_domain}`,
    `size: ${feature.size}`,
    `epic: ${feature.epic ?? 'null'}`,
    `release: ${feature.release ?? 'null'}`,
    `capability: ${feature.capability}`,
    `users: ${(feature.users ?? []).join(', ') || 'null'}`,
    `proyecto_id: ${feature.proyecto_id ?? 'null'}`,
    `vision_ref: proyectos/${proyecto}/outputs/vision/vision.md`,
    `decisions: ${(feature.decisions ?? []).join(', ') || 'null'}`,
    `source_model: discovery-model`,
    `generated: ${hoy}`,
  ].join('\n');

  return `---\n${fm}\n---\n\n${secciones}\n`;
}

/** context.md: de donde viene la feature. Informativo, /sdd-refine no lo lee. */
export function construirContexto({ feature, capacidad, proyecto, iniciativa }) {
  return `# Contexto de ${feature.id}

Este archivo es informativo: explica de donde sale la feature. El equipo de desarrollo
consume unicamente \`brief.md\`.

| | |
|---|---|
| Proyecto | ${proyecto} |
| Iniciativa | ${iniciativa?.nombre ?? feature.proyecto_id ?? '—'} |
| Capacidad de negocio | ${feature.capability} — ${capacidad?.name ?? '—'} |
| Epica | ${feature.epic ?? '—'} |
| Release | ${feature.release ?? '—'} |
| Talle estimado | ${feature.size} |
| Usuarios impactados | ${(feature.users ?? []).join(', ') || '—'} |
| Dominio en desarrollo | ${capacidad?.sdd_domain ?? '—'} |

## Trazabilidad

La cadena completa desde el origen de negocio:

\`\`\`
${feature.proyecto_id ?? 'PRY-???'} -> ${feature.capability} -> ${feature.epic} -> ${feature.release} -> ${feature.id} -> ${featureIdSdd(feature.id, feature.slug)}
\`\`\`

## Decisiones relacionadas

${(feature.decisions ?? []).length
  ? (feature.decisions).map((d) => `- ${d} (ver DECISIONS.md en discovery-model)`).join('\n')
  : 'Ninguna registrada.'}

Las decisiones se referencian por ID, nunca se copian: dos registros sincronizados divergen.
`;
}

/** Lee el frontmatter de un brief ya escrito, para verificaciones. */
export function leerBrief(ruta) {
  if (!existsSync(ruta)) return null;
  const texto = readFileSync(ruta, 'utf8');
  const m = texto.match(/^---\n([\s\S]*?)\n---/);
  const fm = {};
  if (m) {
    for (const linea of m[1].split('\n')) {
      const i = linea.indexOf(':');
      if (i > 0) fm[linea.slice(0, i).trim()] = linea.slice(i + 1).trim();
    }
  }
  return { frontmatter: fm, contenido: texto };
}
