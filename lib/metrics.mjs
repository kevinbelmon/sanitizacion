/**
 * metrics — calculo de indicadores sobre el log de eventos.
 *
 * Regla central: si faltan los eventos necesarios para una metrica, se reporta
 * NO DISPONIBLE. Nunca se estima, nunca se infiere de fechas de archivo, nunca
 * se pone cero. Una metrica inventada es peor que una ausente: se toman
 * decisiones sobre ella.
 */

import { join } from 'node:path';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { ROOT, readYaml, readJson, leerEstado, leerEventos, metricsDir } from './store.mjs';
import { inventario, LIMITES } from './registry.mjs';
import { ordenEtapas, estadoDerivado, rolesRequeridos } from './cascade.mjs';

const DIA = 24 * 60 * 60 * 1000;

/** Valor no disponible por falta de eventos. El dashboard lo muestra como tal. */
export const SIN_DATO = { disponible: false, valor: null, color: null };
const dato = (valor, color = null) => ({ disponible: true, valor, color });

// ── Umbrales de governance.yaml ─────────────────────────────────────────────

/**
 * Evalua un valor contra una regla del tipo ">=90", "70-89", "<70", 0, 1, ">=2".
 * Los umbrales no se hardcodean: si cambia el YAML, cambia el color.
 */
export function cumple(valor, regla) {
  if (regla === null || regla === undefined || valor === null) return false;
  const r = String(regla).trim();
  let m;
  if ((m = r.match(/^>=\s*(-?[\d.]+)$/))) return valor >= Number(m[1]);
  if ((m = r.match(/^<=\s*(-?[\d.]+)$/))) return valor <= Number(m[1]);
  if ((m = r.match(/^>\s*(-?[\d.]+)$/)))  return valor > Number(m[1]);
  if ((m = r.match(/^<\s*(-?[\d.]+)$/)))  return valor < Number(m[1]);
  if ((m = r.match(/^(-?[\d.]+)\s*-\s*(-?[\d.]+)$/))) return valor >= Number(m[1]) && valor <= Number(m[2]);
  if (/^-?[\d.]+$/.test(r)) return valor === Number(r);
  return false;
}

export function color(valor, config) {
  if (valor === null || !config) return null;
  if (cumple(valor, config.green)) return 'green';
  if (cumple(valor, config.yellow)) return 'yellow';
  if (cumple(valor, config.red)) return 'red';
  return null;
}

export function leerUmbrales() {
  const g = readYaml(join(ROOT, 'config', 'governance.yaml'), {});
  return {
    progress: g.workflow?.progress, stageTime: g.workflow?.stageTime, blocked: g.workflow?.blocked,
    flowEfficiency: g.productivity?.flowEfficiency, throughput: g.productivity?.throughput,
    cycleTime: g.productivity?.cycleTime, rework: g.productivity?.rework,
    pendingReviews: g.artifacts?.pendingReviews, pendingApprovals: g.artifacts?.pendingApprovals,
    approvedRate: g.artifacts?.approvedRate,
  };
}

// ── Metricas de proceso, sobre eventos ──────────────────────────────────────

const clave = (e) => (e.item ? `${e.stage}/${e.item}` : e.stage);

/** Dias promedio desde que un artefacto se crea hasta que se aprueba. */
function cycleTime(eventos, u) {
  const creado = new Map();
  const duraciones = [];
  for (const e of eventos) {
    const k = clave(e);
    if (e.event === 'ARTIFACT_CREATED' || e.event === 'ARTIFACT_UPDATED') creado.set(k, e.ts);
    if (e.event === 'STAGE_COMPLETED' && creado.has(k)) {
      duraciones.push((new Date(e.ts) - new Date(creado.get(k))) / DIA);
      creado.delete(k);
    }
  }
  if (!duraciones.length) return SIN_DATO;
  const v = Number((duraciones.reduce((a, b) => a + b, 0) / duraciones.length).toFixed(2));
  return dato(v, color(v, u.cycleTime));
}

/** Dias promedio por etapa, de inicio a cierre. */
function stageTime(eventos, u) {
  const inicio = new Map();
  const duraciones = [];
  for (const e of eventos) {
    const k = clave(e);
    if (e.event === 'STAGE_STARTED') inicio.set(k, e.ts);
    if (e.event === 'STAGE_COMPLETED' && inicio.has(k)) {
      duraciones.push((new Date(e.ts) - new Date(inicio.get(k))) / DIA);
      inicio.delete(k);
    }
  }
  if (!duraciones.length) return SIN_DATO;
  const v = Number((duraciones.reduce((a, b) => a + b, 0) / duraciones.length).toFixed(2));
  return dato(v, color(v, u.stageTime));
}

/** Artefactos aprobados por mes, sobre el periodo realmente observado. */
function throughput(eventos, u) {
  const cierres = eventos.filter((e) => e.event === 'STAGE_COMPLETED');
  if (cierres.length < 2) return SIN_DATO;
  const t0 = new Date(eventos[0].ts);
  const t1 = new Date(cierres.at(-1).ts);
  const meses = Math.max((t1 - t0) / (30 * DIA), 1 / 30);
  const v = Number((cierres.length / meses).toFixed(2));
  return dato(v, color(v, u.throughput));
}

/**
 * Retrabajo: observaciones bloqueantes sobre artefactos generados.
 * Es la senal mas util del modelo: dice cuanta ambiguedad quedo sin resolver
 * aguas arriba.
 */
function rework(eventos, u) {
  const generados = eventos.filter((e) => e.event === 'ARTIFACT_CREATED').length;
  if (!generados) return SIN_DATO;
  const bloqueantes = eventos
    .filter((e) => e.event === 'FEEDBACK_ISSUED')
    .reduce((a, e) => a + (e.blocking ?? 0), 0);
  const v = Number(((bloqueantes / generados) * 100).toFixed(1));
  return dato(v, color(v, u.rework));
}

/** Proporcion del tiempo total en que efectivamente se trabajo. */
function flowEfficiency(eventos, u) {
  const inicio = new Map();
  let activo = 0;
  for (const e of eventos) {
    const k = clave(e);
    if (e.event === 'STAGE_STARTED') inicio.set(k, e.ts);
    if (e.event === 'STAGE_COMPLETED' && inicio.has(k)) {
      activo += new Date(e.ts) - new Date(inicio.get(k));
      inicio.delete(k);
    }
  }
  if (!activo || eventos.length < 2) return SIN_DATO;
  const total = new Date(eventos.at(-1).ts) - new Date(eventos[0].ts);
  if (total <= 0) return SIN_DATO;
  const v = Number(((activo / total) * 100).toFixed(1));
  return dato(v, color(v, u.flowEfficiency));
}

// ── Conteos sobre artefactos y estado ───────────────────────────────────────

function contarRiesgos(artefactos) {
  const r = { alto: 0, medio: 0, bajo: 0 };
  for (const a of artefactos) {
    for (const linea of a.contenido.split('\n')) {
      if (!linea.trim().startsWith('|')) continue;
      if (/\|\s*Alto\s*\|/i.test(linea)) r.alto++;
      else if (/\|\s*Medio\s*\|/i.test(linea)) r.medio++;
      else if (/\|\s*Bajo\s*\|/i.test(linea)) r.bajo++;
    }
  }
  return r;
}

const listar = (d) => (existsSync(d) ? readdirSync(d) : []);
const esCarpeta = (p) => existsSync(p) && statSync(p).isDirectory();

function leerRevisiones(slug) {
  const base = join(ROOT, 'proyectos', slug, 'outputs', 'reviews');
  const sev = { CRITICAL: 0, MAJOR: 0, MINOR: 0, QUESTION: 0, SUGGESTION: 0 };
  let abiertas = 0, cerradas = 0;
  if (!existsSync(base)) return { por_severidad: sev, abiertas, cerradas };
  const recorrer = (dir) => {
    for (const n of listar(dir)) {
      const p = join(dir, n);
      if (esCarpeta(p)) { recorrer(p); continue; }
      if (!n.endsWith('-feedback.yaml')) continue;
      const y = readYaml(p, {});
      for (const item of y.items ?? []) {
        if (sev[item.severity] !== undefined) sev[item.severity]++;
        if (item.status === 'OPEN') abiertas++; else cerradas++;
      }
    }
  };
  recorrer(base);
  return { por_severidad: sev, abiertas, cerradas };
}


function contarDecisiones(slug) {
  const p = join(ROOT, 'DECISIONS.md');
  if (!existsSync(p)) return { total: 0, activas: 0, superseded: 0, obsoletas: 0 };
  const t = readFileSync(p, 'utf8');
  const bloques = t.split(/^## DEC-/m).slice(1);
  const propias = bloques.filter((b) => !slug || b.includes(slug) || !/\*\*Proyecto:\*\*/.test(b));
  return {
    total: propias.length,
    activas: propias.filter((b) => /Estado:\*\*\s*ACTIVE/.test(b)).length,
    superseded: propias.filter((b) => /Estado:\*\*\s*SUPERSEDED/.test(b)).length,
    obsoletas: propias.filter((b) => /Estado:\*\*\s*OBSOLETE/.test(b)).length,
  };
}

/**
 * Indice de calidad 0-100. Parte de 100 y descuenta por lo que el modelo
 * ya sabe que esta mal. No es una opinion: son hallazgos contados.
 */
function calidad(artefactos, audit, revisiones) {
  let puntos = 100;
  const componentes = {};

  const errores = audit?.errores ?? 0;
  componentes.errores_audit = -Math.min(errores * 8, 40);

  const avisos = audit?.avisos ?? 0;
  componentes.avisos_audit = -Math.min(avisos * 3, 15);

  const criticas = revisiones.por_severidad.CRITICAL + revisiones.por_severidad.MAJOR;
  componentes.observaciones_abiertas = -Math.min(criticas * 5, 25);

  const excedidos = artefactos.filter((a) => LIMITES[a.tipo] && a.lineas > LIMITES[a.tipo]).length;
  componentes.artefactos_largos = -Math.min(excedidos * 4, 20);

  for (const v of Object.values(componentes)) puntos += v;
  return { indice: Math.max(0, Math.min(100, Math.round(puntos))), componentes };
}

// ── Ensamblado ──────────────────────────────────────────────────────────────

export function calcular(slug) {
  const estado = leerEstado(slug);
  const eventos = leerEventos(slug).filter((e) => e.ts);
  const artefactos = inventario(slug);
  const audit = readJson(join(metricsDir(slug), 'audit-result.json'), null);
  const u = leerUmbrales();
  const orden = ordenEtapas();
  const iniciativas = readYaml(join(ROOT, 'registry', 'proyectos.yaml'), { proyectos: [] }).proyectos ?? [];
  const ini = iniciativas.find((i) => i.slug === slug) ?? {};
  const features = (readYaml(join(ROOT, 'registry', 'features.yaml'), { features: [] }).features ?? [])
    .filter((f) => f.proyecto === slug);

  const stages = estado?.stages ?? {};
  const estadoEtapa = (id) => {
    const s = stages[id];
    if (!s) return 'PENDING';
    return s.items ? estadoDerivado(s) : s.status;
  };

  /**
   * Fechas de inicio y aprobacion de una etapa.
   *
   * En una etapa con items el span real va del primer item que arranco al ultimo
   * que se firmo: aprobar F001 no cierra la etapa `features`. Las fechas ISO
   * ordenan lexicograficamente igual que cronologicamente, asi que alcanza sort().
   *
   * Devuelve null donde no hay dato. Una etapa aprobada antes de que el modelo
   * guardara `started_at` no tiene inicio, y eso no es un error: se muestra sin
   * fecha, no con una inventada. Ver contracts/state.md.
   */
  const fechasEtapa = (s) => {
    if (!s) return { started_at: null, approved_at: null };
    if (!s.items) return { started_at: s.started_at ?? null, approved_at: s.approved_at ?? null };
    const items = Object.values(s.items);
    const fechas = (k) => items.map((i) => i[k]).filter(Boolean).sort();
    return {
      started_at: s.started_at ?? fechas('started_at')[0] ?? null,
      approved_at: fechas('approved_at').at(-1) ?? null,
    };
  };

  const diasEntre = (a, b) =>
    a && b ? Number(((new Date(b) - new Date(a)) / DIA).toFixed(2)) : null;

  const aprobadas = orden.filter((e) => estadoEtapa(e) === 'APPROVED').length;
  const pct = Math.round((aprobadas / orden.length) * 100);

  // Artefactos, con su estado y limite.
  // El tipo se resuelve por etapa: sin esto, la estimacion de F001 encuentra
  // primero el archivo de la feature F001 y reporta sus lineas, no las suyas.
  const TIPO_DE_ETAPA = {
    iniciativa: 'iniciativa', vision: 'vision', roadmap: 'roadmap',
    release: 'release', features: 'feature', estimation: 'estimation',
  };

  const detalle = orden.flatMap((id) => {
    const s = stages[id];
    const tipo = TIPO_DE_ETAPA[id] ?? null;
    const fila = (ref, e) => {
      const art = tipo
        ? artefactos.find((a) => a.tipo === tipo && a.id === (ref ?? tipo))
        : null;
      return {
        etapa: id, item: ref,
        estado: e?.status ?? 'PENDING',
        version: e?.version ?? null,
        actualizado: e?.approved_at ?? null,
        pendientes: e?.pending_roles ?? [],
        causa_stale: e?.stale_cause ?? null,
        tomado_por: e?.claimed_by ?? null,
        lineas: art?.lineas ?? null,
        limite: LIMITES[art?.tipo] ?? null,
      };
    };
    if (s?.items) return Object.entries(s.items).map(([ref, e]) => fila(ref, e));
    return [fila(null, s)];
  });

  // Bloqueos: lo que impide avanzar, con el comando que lo resuelve
  const bloqueos = [];
  for (const d of detalle) {
    const ref = d.item ? `${d.etapa}/${d.item}` : d.etapa;
    if (d.estado === 'AWAITING_APPROVAL') bloqueos.push({ tipo: 'Firma pendiente', detalle: `${ref} espera a ${d.pendientes.join(', ')}`, comando: `/dsc-approve ${ref} --as "${d.pendientes[0] ?? ''}"` });
    if (d.estado === 'CHANGES_REQUESTED') bloqueos.push({ tipo: 'Cambios pedidos', detalle: `${ref} tiene observaciones bloqueantes`, comando: `/dsc-review` });
    if (d.estado === 'STALE') bloqueos.push({ tipo: 'Obsoleto', detalle: `${ref} quedó obsoleto (${d.causa_stale})`, comando: `/dsc-status` });
    if (d.estado === 'REJECTED') bloqueos.push({ tipo: 'Rechazado', detalle: `${ref} fue rechazado`, comando: `/dsc-log` });
  }
  if (audit?.errores) bloqueos.push({ tipo: 'Consistencia', detalle: `${audit.errores} error(es) del audit`, comando: '/dsc-audit' });

  const revisiones = leerRevisiones(slug);
  const pendApprovals = detalle.filter((d) => d.estado === 'AWAITING_APPROVAL').length;
  const pendReviews = detalle.filter((d) => d.estado === 'IN_REVIEW').length;
  const conEstado = detalle.filter((d) => d.estado !== 'PENDING').length;
  const tasaAprobacion = conEstado
    ? Math.round((detalle.filter((d) => d.estado === 'APPROVED').length / conEstado) * 100)
    : null;

  const cal = calidad(artefactos, audit, revisiones);

  return {
    schema_version: 1,
    proyecto: slug,
    generated: new Date().toISOString(),
    general: {
      nombre: ini.nombre ?? slug,
      iniciativa: ini.id ?? null,
      owner: ini.owner ?? null,
      etapa_actual: estado?.current_stage ?? 'iniciativa',
      etapa_siguiente: orden[orden.indexOf(estado?.current_stage ?? 'iniciativa') + 1] ?? null,
      actualizado: estado?.updated ?? null,
      actualizado_por: estado?.updated_by ?? null,
    },
    progreso: { aprobadas, total: orden.length, ...dato(pct, color(pct, u.progress)) },
    // Una fila por etapa con su inicio, su aprobacion y lo que llevo. Es lo que
    // el tablero y /dsc-status muestran sin tener que recorrer events.jsonl.
    //
    // Se llama `cronologia` y no `etapas` a proposito: gen-dashboard.mjs agrega su
    // propio `etapas` (las definiciones del workflow con sus etiquetas) al hacer
    // `{ ...m, etapas }`, y un campo con ese nombre aca quedaria sobreescrito en
    // silencio — el tablero mostraria las etapas sin una sola fecha y nada fallaria.
    cronologia: orden.map((id) => {
      const f = fechasEtapa(stages[id]);
      return { id, status: estadoEtapa(id), ...f, dias: diasEntre(f.started_at, f.approved_at) };
    }),
    artefactos: detalle,
    features: {
      total: features.length,
      por_estado: features.reduce((a, f) => ({ ...a, [f.status]: (a[f.status] ?? 0) + 1 }), {}),
      estimadas: features.filter((f) => f.size).length,
      talles: features.reduce((a, f) => (f.size ? { ...a, [f.size]: (a[f.size] ?? 0) + 1 } : a), {}),
      entregadas: features.filter((f) => f.status === 'HANDED_OFF').length,
    },
    revisiones,
    aprobaciones: {
      pendientes: { ...dato(pendApprovals, color(pendApprovals, u.pendingApprovals)) },
      revisiones_pendientes: { ...dato(pendReviews, color(pendReviews, u.pendingReviews)) },
      tasa_aprobacion: tasaAprobacion === null ? SIN_DATO : dato(tasaAprobacion, color(tasaAprobacion, u.approvedRate)),
      proximo_aprobador: detalle.find((d) => d.estado === 'AWAITING_APPROVAL')?.pendientes[0] ?? null,
      rechazos: detalle.filter((d) => d.estado === 'REJECTED').length,
    },
    decisiones: contarDecisiones(slug),
    riesgos: contarRiesgos(artefactos),
    calidad: cal,
    proceso: {
      cycleTime: cycleTime(eventos, u),
      stageTime: stageTime(eventos, u),
      throughput: throughput(eventos, u),
      rework: rework(eventos, u),
      flowEfficiency: flowEfficiency(eventos, u),
    },
    bloqueos: { ...dato(bloqueos.length, color(bloqueos.length, u.blocked)), lista: bloqueos },
    audit: audit
      ? { errores: audit.errores, avisos: audit.avisos, determinista: audit.determinista, generado: audit.generado }
      : { errores: null, avisos: null, determinista: null, generado: null },
    eventos: eventos.length,
    next_action: estado?.next_action ?? 'Correr /dsc-refine',
    next_command: estado?.next_command ?? '/dsc-refine',
  };
}
