# Plan — 004 Gobernanza

> **Provisional.** Se refina en su gate.

## Componentes

```
.claude/commands/
  dsc-review.md · dsc-approve.md · dsc-log.md
  dsc-validate.md · dsc-impact.md · dsc-restore.md
contracts/feedback.md
proyectos/<p>/outputs/reviews/<tipo>/<id>/v<n>-feedback.yaml
proyectos/<p>/outputs/approvals/<tipo>/<id>/v<n>-approval.md
proyectos/<p>/outputs/history/<tipo>/<id>/v<n>.md
```

## La separación review / approve

Es la decisión estructural de la fase, y viene del gap G5: en una sesión de Claude el PM está solo, y el modelo no puede firmar por UX.

```
/dsc-review    → evalúa, produce feedback estructurado, NO aprueba
                 estado: IN_REVIEW → AWAITING_APPROVAL (lista roles faltantes)
/dsc-approve   → registra UNA firma de UN rol, en la sesión de esa persona
                 cuando firman todos los required → APPROVED
```

Cada rol corre `/dsc-approve` cuando puede. El estado sobrevive entre sesiones y entre personas — que es justo lo que la carpeta sincronizada habilita.

## Contrato de feedback

YAML, no prosa. Un creator no puede "aplicar únicamente los cambios solicitados" sobre texto libre.

```yaml
artifact: proyectos/idm/outputs/roadmap/roadmap.md
version: 1
verdict: CHANGES_REQUESTED
items:
  - id: FB-001
    severity: CRITICAL        # CRITICAL | MAJOR | MINOR | QUESTION | SUGGESTION
    section: "Épicas / EP003"
    reviewer: "Ana Gómez"
    role: "Product Owner"
    comment: "EP003 depende de EP005, planificada en Q3."
    required_change: "Mover EP003 a Q3 o adelantar EP005."
    status: OPEN
```

Solo `CRITICAL` y `MAJOR` bloquean. El resto queda registrado y no frena.

## Transición de aprobación

Al completarse las firmas requeridas, en un solo paso atómico:

1. Archivar la versión actual en `history/`
2. Calcular y guardar el hash SHA-256 del contenido
3. Marcar `APPROVED` en el registry
4. Marcar `STALE` a todo el subárbol descendiente
5. Emitir el evento
6. Regenerar el dashboard

Si algún paso falla, no se marca `APPROVED`. Un estado a medias es peor que no haber aprobado.

## Decisiones de diseño

- **El modelo nunca firma.** Registra firmas que un humano dio. Es el principio más importante del modelo y se codifica acá.
- **`history/` es la única red de rollback** al no haber git. Por eso el archivado es parte de la transacción de aprobación, no un paso posterior.
- **El cursor de review persiste** en el estado, no en la conversación. Revisar 20 features puede tomar varias sesiones.
- **`/dsc-validate` no modifica nada**, igual que `/sdd-validate`. Reporta y para.
