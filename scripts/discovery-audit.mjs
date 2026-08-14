#!/usr/bin/env node
/**
 * discovery-audit — verificacion determinista del modelo.
 *
 * Regla de oro: lo que este script verifica, ningun comando lo recalcula con
 * criterio del LLM. Se lee su salida desde metrics/audit-result.json.
 *
 * Cada check es una funcion pura (modelo) -> hallazgos[]. El modelo se carga
 * una sola vez: agregar un check es agregar una funcion, y el orden no importa.
 *
 * Uso:  node scripts/discovery-audit.mjs [<slug>]
 */

import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { ROOT, metricsDir, writeJson, sha256 } from '../lib/store.mjs';
import { cargarModelo, extraerIds, LIMITES, PLACEHOLDERS } from '../lib/registry.mjs';
import { ordenEtapas, rolesRequeridos, estadoDerivado } from '../lib/cascade.mjs';

const ERROR = 'ERROR';
const WARN = 'WARN';

/** Un hallazgo siempre lleva `hint`: sin que hacer al respecto, no es accionable. */
const h = (check, sev, entity, message, hint) => ({ check, sev, entity, message, hint });

// ── 1 · Registro contra archivos, en ambas direcciones ──────────────────────
function c01(m) {
  const out = [];
  for (const p of m.proyectos) {
    const enDisco = new Set(p.artefactos.filter((a) => a.tipo === 'feature').map((a) => a.id));
    const enRegistro = m.features.filter((f) => f.proyecto === p.slug);

    for (const f of enRegistro) {
      if (!enDisco.has(f.id)) {
        out.push(h(1, ERROR, `${p.slug}/${f.id}`,
          'Esta en registry/features.yaml pero no existe el archivo.',
          'Regenerar con /dsc-features, o quitar la entrada del registro.'));
      }
    }
    const ids = new Set(enRegistro.map((f) => f.id));
    for (const id of enDisco) {
      if (!ids.has(id)) {
        out.push(h(1, ERROR, `${p.slug}/${id}`,
          'Existe el archivo pero no esta en registry/features.yaml.',
          'Registrarla con /dsc-features, o borrar el archivo si quedo de una corrida vieja.'));
      }
    }
  }
  return out;
}

// ── 2 · IDs huerfanos ───────────────────────────────────────────────────────
function c02(m) {
  const out = [];
  for (const f of m.features) {
    const e = `${f.proyecto}/${f.id}`;
    if (!f.epic)    out.push(h(2, ERROR, e, 'No declara epica.', 'Completar `epic` en el frontmatter y en el registro.'));
    if (!f.release) out.push(h(2, ERROR, e, 'No declara release.', 'Completar `release`: sin eso no se sabe cuando se construye.'));
    if (!f.capability) out.push(h(2, ERROR, e, 'No declara capacidad de negocio.', 'Completar `capability`: es el origen del dominio en SDD.'));
    if (f.capability && m.capacidades.length) {
      const bc = m.capacidades.find((c) => c.id === f.capability && c.proyecto === f.proyecto);
      if (!bc) out.push(h(2, ERROR, e, `La capacidad ${f.capability} no existe en registry/capabilities.yaml.`,
        'Registrar la capacidad o corregir la referencia.'));
    }
  }
  for (const c of m.capacidades) {
    if (!c.epics?.length) {
      out.push(h(2, WARN, `${c.proyecto}/${c.id}`, 'Capacidad sin ninguna epica asociada.',
        'Si la capacidad esta en la vision pero no se planifico, es un gap del roadmap.'));
    }
  }
  return out;
}

// ── 3 · Integridad de la cadena ─────────────────────────────────────────────
function c03(m) {
  const out = [];
  for (const p of m.proyectos) {
    const art = (t) => p.artefactos.find((a) => a.tipo === t);
    const vision = art('vision');
    const roadmap = art('roadmap');
    if (!vision || !roadmap) continue;

    const idsVision = extraerIds(vision.contenido);
    const idsRoadmap = extraerIds(roadmap.contenido);

    for (const bc of idsRoadmap.BC) {
      if (!idsVision.BC.includes(bc)) {
        out.push(h(3, ERROR, `${p.slug}/roadmap`, `Referencia la capacidad ${bc}, que no esta en la vision.`,
          'El roadmap no puede inventar capacidades. Agregarla a la vision o quitarla del roadmap.'));
      }
    }
    for (const u of idsRoadmap.U) {
      if (!idsVision.U.includes(u)) {
        out.push(h(3, ERROR, `${p.slug}/roadmap`, `Referencia el usuario ${u}, que no esta en la vision.`,
          'Los usuarios se definen en la seccion 3 de la vision y se propagan desde ahi.'));
      }
    }
    for (const oe of idsRoadmap.OE) {
      if (!idsVision.OE.includes(oe)) {
        out.push(h(3, ERROR, `${p.slug}/roadmap`, `Referencia el objetivo ${oe}, que no esta en la vision.`,
          'Toda epica se ata a un objetivo estrategico existente.'));
      }
    }

    const epicasRoadmap = idsRoadmap.EP;
    for (const rel of p.artefactos.filter((a) => a.tipo === 'release')) {
      for (const ep of extraerIds(rel.contenido).EP) {
        if (!epicasRoadmap.includes(ep)) {
          out.push(h(3, ERROR, `${p.slug}/${rel.id}`, `Incluye la epica ${ep}, que no esta en el roadmap.`,
            'El release selecciona del roadmap: no crea epicas.'));
        }
      }
    }

    for (const f of m.features.filter((x) => x.proyecto === p.slug)) {
      if (f.epic && !epicasRoadmap.includes(f.epic)) {
        out.push(h(3, ERROR, `${p.slug}/${f.id}`, `Pertenece a la epica ${f.epic}, que no esta en el roadmap.`,
          'Regenerar el roadmap o corregir la epica de la feature.'));
      }
      if (f.release && !p.artefactos.some((a) => a.tipo === 'release' && a.id === f.release)) {
        out.push(h(3, ERROR, `${p.slug}/${f.id}`, `Pertenece al release ${f.release}, que no existe.`,
          'Generar el release con /dsc-release o corregir la referencia.'));
      }
    }
  }
  return out;
}

// ── 4 · Dependencias: ciclos, referencias rotas, orden ──────────────────────
function c04(m) {
  const out = [];
  for (const p of m.proyectos) {
    const features = m.features.filter((f) => f.proyecto === p.slug);
    const ids = new Set(features.map((f) => f.id));
    const grafo = new Map(features.map((f) => [f.id, (f.depends_on ?? []).filter(Boolean)]));

    for (const [id, deps] of grafo) {
      for (const d of deps) {
        if (!ids.has(d)) {
          out.push(h(4, ERROR, `${p.slug}/${id}`, `Depende de ${d}, que no existe.`,
            'Corregir la dependencia o generar la feature faltante.'));
        }
      }
    }

    // Ciclos por DFS con marcas: un ciclo hace imposible cualquier orden de trabajo.
    const estado = new Map();
    const camino = [];
    const visitar = (n) => {
      if (estado.get(n) === 'listo') return;
      if (estado.get(n) === 'visitando') {
        const ciclo = [...camino.slice(camino.indexOf(n)), n].join(' -> ');
        out.push(h(4, ERROR, `${p.slug}/${n}`, `Ciclo de dependencias: ${ciclo}.`,
          'Romper el ciclo: alguna de las features tiene que poder construirse primero.'));
        return;
      }
      estado.set(n, 'visitando');
      camino.push(n);
      for (const d of grafo.get(n) ?? []) if (ids.has(d)) visitar(d);
      camino.pop();
      estado.set(n, 'listo');
    };
    for (const id of grafo.keys()) visitar(id);

    // Orden: una feature no puede planificarse en un release anterior al de su dependencia.
    const num = (r) => Number(String(r ?? '').replace(/\D/g, '')) || 0;
    for (const f of features) {
      for (const d of f.depends_on ?? []) {
        const dep = features.find((x) => x.id === d);
        if (dep && num(f.release) < num(dep.release)) {
          out.push(h(4, ERROR, `${p.slug}/${f.id}`,
            `Esta en ${f.release} pero depende de ${d}, que esta en ${dep.release}.`,
            'Mover la feature a un release posterior, o adelantar su dependencia.'));
        }
      }
    }
  }
  return out;
}

// ── 5 · Estimacion ──────────────────────────────────────────────────────────
function c05(m) {
  const out = [];
  for (const f of m.features) {
    const e = `${f.proyecto}/${f.id}`;
    if (f.status === 'APPROVED' && !f.size) {
      out.push(h(5, ERROR, e, 'Aprobada pero sin estimar.', 'Correr /dsc-estimate antes de entregarla.'));
    }
    if (f.size === 'XL') {
      out.push(h(5, ERROR, e, 'Talle XL: no puede cruzar a desarrollo.',
        'Dividirla con /dsc-split. Una feature XL es retrabajo garantizado.'));
    }
  }
  return out;
}

// ── 6 · Aprobaciones completas ──────────────────────────────────────────────
function c06(m) {
  const out = [];
  for (const p of m.proyectos) {
    for (const [etapa, s] of Object.entries(p.estado?.stages ?? {})) {
      const { required } = rolesRequeridos(etapa);
      if (!required.length) continue;

      const revisar = (entrada, ref) => {
        if (entrada.status !== 'APPROVED') return;
        const firmas = entrada.approvals ?? {};
        const faltan = required.filter((r) => firmas[r]?.verdict !== 'approved');
        if (faltan.length) {
          out.push(h(6, ERROR, `${p.slug}/${ref}`,
            `Marcado APPROVED sin la firma de: ${faltan.join(', ')}.`,
            'El estado se edito a mano. Revertir a AWAITING_APPROVAL y firmar con /dsc-approve.'));
        }
      };

      if (s.items) for (const [id, item] of Object.entries(s.items)) revisar(item, `${etapa}/${id}`);
      else revisar(s, etapa);
    }
  }
  return out;
}

// ── 7 · Handoff consistente ─────────────────────────────────────────────────
function c07(m) {
  const out = [];
  for (const f of m.features.filter((x) => x.status === 'HANDED_OFF')) {
    const e = `${f.proyecto}/${f.id}`;
    const falta = [];
    if (!f.feature_id) falta.push('feature_id');
    if (!f.handed_off) falta.push('handed_off');
    if (falta.length) {
      out.push(h(7, ERROR, e, `Marcada HANDED_OFF sin: ${falta.join(', ')}.`,
        'Sin esos campos se pierde el hilo con el repo de desarrollo. Rehacer el handoff.'));
    }

    // Sin target_repo la entrega fue local: el paquete existe pero todavia no
    // llego al repo de desarrollo. Es un camino valido —el repo puede estar en
    // otra maquina— pero queda una accion humana pendiente, no una inconsistencia.
    if (!f.target_repo) {
      out.push(h(7, WARN, e,
        'Entregada localmente: el paquete existe pero no se escribio en ningun repo de desarrollo.',
        'Copiar outputs/handoff/<feature_id>/brief.md a la carpeta drafts/ del repo, o rehacer el handoff con --target.'));
    }
    const bc = m.capacidades.find((c) => c.id === f.capability && c.proyecto === f.proyecto);
    if (!bc?.sdd_domain) {
      out.push(h(7, ERROR, e, `Entregada sin dominio SDD resuelto (capacidad ${f.capability}).`,
        'Completar `sdd_domain` en registry/capabilities.yaml.'));
    }
  }
  return out;
}

// ── 8 · Placeholders en artefactos aprobados ────────────────────────────────
function c08(m) {
  const out = [];
  for (const p of m.proyectos) {
    for (const a of p.artefactos) {
      const st = estadoDe(p, a);
      if (st !== 'APPROVED') continue;
      const cuerpo = a.contenido.replace(/^---\n[\s\S]*?\n---/, '');
      for (const re of PLACEHOLDERS) {
        const m2 = cuerpo.match(re);
        if (m2) {
          out.push(h(8, ERROR, `${p.slug}/${a.tipo}/${a.id}`,
            `Aprobado con un placeholder sin completar: "${m2[0]}".`,
            'Completar el contenido y volver a aprobar.'));
          break;
        }
      }
    }
  }
  return out;
}

// ── 9 · Cascada: aprobado antes que su antecesor ────────────────────────────
function c09(m) {
  const orden = ordenEtapas();
  const out = [];
  for (const p of m.proyectos) {
    const stages = p.estado?.stages ?? {};
    const fecha = (etapa) => {
      const s = stages[etapa];
      if (!s) return null;
      if (!s.items) return s.approved_at ?? null;
      const fs = Object.values(s.items).map((i) => i.approved_at).filter(Boolean);
      return fs.length ? fs.sort().at(-1) : null;
    };
    for (let i = 1; i < orden.length; i++) {
      const etapa = orden[i];
      const s = stages[etapa];
      const status = s?.items ? estadoDerivado(s) : s?.status;
      if (status !== 'APPROVED') continue;
      const propia = fecha(etapa);
      for (const previa of orden.slice(0, i)) {
        const anterior = fecha(previa);
        if (propia && anterior && anterior > propia) {
          out.push(h(9, ERROR, `${p.slug}/${etapa}`,
            `Aprobado el ${propia.slice(0, 10)}, pero ${previa} se aprobo despues (${anterior.slice(0, 10)}) y no quedo STALE.`,
            'El estado se edito a mano. Regenerar esta etapa sobre la version nueva del antecesor.'));
          break;
        }
      }
    }
  }
  return out;
}

// ── 10 · Unicidad y continuidad de IDs ──────────────────────────────────────
function c10(m) {
  const out = [];
  const porProyecto = new Map();
  for (const f of m.features) {
    if (!porProyecto.has(f.proyecto)) porProyecto.set(f.proyecto, []);
    porProyecto.get(f.proyecto).push(f.id);
  }
  for (const [slug, ids] of porProyecto) {
    const vistos = new Set();
    for (const id of ids) {
      if (vistos.has(id)) {
        out.push(h(10, ERROR, `${slug}/${id}`, 'ID de feature duplicado.',
          'Los IDs se reservan de registry/ids.yaml, nunca contando archivos. Ver contracts/ids.md.'));
      }
      vistos.add(id);
    }
    const contador = m.contadores.proyectos?.[slug]?.F ?? 0;
    const maximo = Math.max(0, ...ids.map((i) => Number(i.slice(1))));
    if (maximo > contador) {
      out.push(h(10, ERROR, `${slug}`, `Existe F${String(maximo).padStart(3, '0')} pero el contador dice ${contador}.`,
        'Alguien creo features sin reservar el ID. Ajustar registry/ids.yaml al maximo real.'));
    }
  }
  return out;
}

// ── 11 · Tamano de artefactos ───────────────────────────────────────────────
function c11(m) {
  const out = [];
  for (const p of m.proyectos) {
    for (const a of p.artefactos) {
      const limite = LIMITES[a.tipo];
      if (limite && a.lineas > limite) {
        out.push(h(11, WARN, `${p.slug}/${a.tipo}/${a.id}`,
          `${a.lineas} lineas, el limite es ${limite}.`,
          'Un artefacto largo infla el contexto del agente. Recortar o dividir.'));
      }
    }
  }
  return out;
}

// ── 12 · Deriva de hash ─────────────────────────────────────────────────────
function c12(m) {
  const out = [];
  for (const p of m.proyectos) {
    for (const a of p.artefactos) {
      const entrada = entradaDe(p, a);
      if (entrada?.status !== 'APPROVED' || !entrada.hash) continue;
      if (sha256(a.contenido) !== entrada.hash) {
        out.push(h(12, WARN, `${p.slug}/${a.tipo}/${a.id}`,
          'Editado a mano despues de ser aprobado: el contenido ya no coincide con lo que se firmo.',
          'Volver a revisar y aprobar, o restaurar la version firmada con /dsc-restore.'));
      }
    }
  }
  return out;
}

// ── 13 · Colision de claims ─────────────────────────────────────────────────
function c13(m) {
  const out = [];
  const HORAS = 24 * 60 * 60 * 1000;
  for (const p of m.proyectos) {
    const claims = [];
    for (const [etapa, s] of Object.entries(p.estado?.stages ?? {})) {
      const recoger = (e, ref) => { if (e.claimed_by) claims.push({ ref, por: e.claimed_by, desde: e.claimed_at }); };
      if (s.items) for (const [id, item] of Object.entries(s.items)) recoger(item, `${etapa}/${id}`);
      else recoger(s, etapa);
    }
    const personas = new Set(claims.map((c) => c.por));
    if (personas.size > 1) {
      out.push(h(13, WARN, p.slug,
        `${personas.size} personas trabajando a la vez: ${[...personas].join(', ')}.`,
        'Coordinar antes de avanzar: los artefactos de la cadena estan acoplados.'));
    }
    for (const c of claims) {
      if (c.desde && Date.now() - new Date(c.desde).getTime() > HORAS) {
        out.push(h(13, WARN, `${p.slug}/${c.ref}`,
          `Tomado por ${c.por} desde hace mas de 24 horas.`,
          'Probablemente quedo abandonado. Confirmar con la persona y liberarlo.'));
      }
    }
  }
  return out;
}

// ── 14 · Releases vencidos ──────────────────────────────────────────────────
function c14(m) {
  const out = [];
  const MESES_3 = 92 * 24 * 60 * 60 * 1000;
  for (const p of m.proyectos) {
    for (const rel of p.artefactos.filter((a) => a.tipo === 'release')) {
      const creado = rel.frontmatter.created;
      if (!creado) continue;
      if (Date.now() - new Date(creado).getTime() < MESES_3) continue;
      const abiertas = m.features.filter(
        (f) => f.proyecto === p.slug && f.release === rel.id &&
               !['APPROVED', 'HANDED_OFF'].includes(f.status));
      if (abiertas.length) {
        out.push(h(14, WARN, `${p.slug}/${rel.id}`,
          `Creado el ${creado} (horizonte 1-3 meses) y todavia tiene ${abiertas.length} feature(s) sin cerrar.`,
          'Replanificar el release o mover las features pendientes al siguiente.'));
      }
    }
  }
  return out;
}

// ── 15 · Secretos ───────────────────────────────────────────────────────────
const SECRETOS = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'clave privada'],
  [/\bAKIA[0-9A-Z]{16}\b/, 'clave de acceso AWS'],
  [/\bghp_[A-Za-z0-9]{30,}\b/, 'token de GitHub'],
  [/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/, 'token JWT'],
  [/(mongodb|postgres(ql)?|mysql|redis|amqp):\/\/[^\s/]+:[^\s@]{6,}@/i, 'cadena de conexion con credenciales'],
  [/https?:\/\/[^\s:/]+:[^\s@]{6,}@/, 'URL con credenciales'],
  [/\b(api[_-]?key|apikey|secret|token|password|passwd|contrasena)\b\s*[:=]\s*["']?[A-Za-z0-9_\-.+/]{16,}/i, 'credencial embebida'],
];
// Se ignora lo que sea evidentemente una referencia y no un valor.
const NO_ES_SECRETO = /\$\{|process\.env|<[^>]+>|\bvia\b|\bvía\b|\.env\b|xxx+|ejemplo|example|tu-|your-/i;

function c15(m) {
  const out = [];
  for (const p of m.proyectos) {
    for (const a of p.artefactos) {
      for (const [re, que] of SECRETOS) {
        const hit = a.contenido.match(re);
        if (hit && !NO_ES_SECRETO.test(hit[0])) {
          out.push(h(15, ERROR, `${p.slug}/${a.tipo}/${a.id}`,
            `Posible ${que} en el artefacto.`,
            'Sacarlo, referenciarlo como variable de entorno y rotar la credencial: los artefactos viven en una carpeta compartida.'));
          break;
        }
      }
    }
  }
  return out;
}

// ── Utilidades ──────────────────────────────────────────────────────────────
function entradaDe(p, a) {
  const s = p.estado?.stages?.[a.tipo === 'feature' ? 'features' : a.tipo];
  if (!s) return null;
  return s.items ? s.items[a.id] ?? null : s;
}
const estadoDe = (p, a) => entradaDe(p, a)?.status ?? 'PENDING';

const CHECKS = [c01, c02, c03, c04, c05, c06, c07, c08, c09, c10, c11, c12, c13, c14, c15];

const NOMBRES = {
  1: 'Registro contra archivos', 2: 'IDs huerfanos', 3: 'Integridad de la cadena',
  4: 'Dependencias', 5: 'Estimacion', 6: 'Aprobaciones completas', 7: 'Handoff',
  8: 'Placeholders', 9: 'Cascada', 10: 'Unicidad de IDs', 11: 'Tamano',
  12: 'Deriva de hash', 13: 'Colision de claims', 14: 'Releases vencidos', 15: 'Secretos',
};

function main() {
  const filtro = process.argv[2] ?? null;
  const modelo = cargarModelo();
  if (filtro) modelo.proyectos = modelo.proyectos.filter((p) => p.slug === filtro);

  const hallazgos = CHECKS.flatMap((c) => {
    try { return c(modelo); }
    catch (err) { return [h(0, ERROR, 'audit', `El check fallo: ${err.message}`, 'Es un bug del audit, no del modelo.')]; }
  });

  const errores = hallazgos.filter((x) => x.sev === ERROR);
  const avisos = hallazgos.filter((x) => x.sev === WARN);

  console.log(`Audit del Discovery Model — ${modelo.proyectos.length} proyecto(s), 15 checks\n`);

  if (!hallazgos.length) {
    console.log('Sin hallazgos. El modelo es consistente.');
  } else {
    for (const grupo of [[ERROR, errores], [WARN, avisos]]) {
      const [sev, lista] = grupo;
      if (!lista.length) continue;
      console.log(`${sev === ERROR ? 'ERRORES' : 'AVISOS'} (${lista.length})\n`);
      for (const x of lista) {
        console.log(`  [${String(x.check).padStart(2)}] ${x.entity}`);
        console.log(`       ${x.message}`);
        console.log(`       -> ${x.hint}\n`);
      }
    }
  }

  const resultado = {
    generado: new Date().toISOString(),
    determinista: true,
    proyectos: modelo.proyectos.map((p) => p.slug),
    checks: Object.entries(NOMBRES).map(([n, nombre]) => ({
      n: Number(n), nombre, hallazgos: hallazgos.filter((x) => x.check === Number(n)).length,
    })),
    errores: errores.length,
    avisos: avisos.length,
    hallazgos,
  };

  for (const p of modelo.proyectos) {
    writeJson(join(metricsDir(p.slug), 'audit-result.json'), {
      ...resultado,
      proyectos: [p.slug],
      hallazgos: hallazgos.filter((x) => x.entity.startsWith(p.slug)),
    });
  }
  if (!modelo.proyectos.length) {
    writeJson(join(ROOT, 'metrics', 'audit-result.json'), resultado);
  }

  console.log(`${errores.length} error(es), ${avisos.length} aviso(s).`);
  process.exit(errores.length ? 1 : 0);
}

main();
