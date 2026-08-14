#!/usr/bin/env node
/**
 * Registra el inicio de sesion en metrics/sessions.jsonl.
 *
 * Deliberadamente minimo: corre codigo al abrir cada sesion, asi que tiene que
 * ser auditable de un vistazo. Sin red, sin dependencias, y no escribe fuera
 * de metrics/. No registra contenido de prompts ni de artefactos.
 */
import { appendFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

try {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
  const dir = join(root, 'metrics');
  mkdirSync(dir, { recursive: true });
  appendFileSync(
    join(dir, 'sessions.jsonl'),
    JSON.stringify({ ts: new Date().toISOString(), cwd: process.cwd() }) + '\n',
    'utf8'
  );
} catch {
  // Nunca romper el arranque de una sesion por telemetria.
}
