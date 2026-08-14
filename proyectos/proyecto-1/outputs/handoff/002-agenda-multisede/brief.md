---
contract_version: 1
discovery_id: F002
feature_id: 002-agenda-multisede
domain: agenda
size: M
epic: EP002
release: R1
capability: BC01
users: U01, U02
proyecto_id: null
vision_ref: proyectos/proyecto-1/outputs/vision/vision.md
decisions: null
source_model: discovery-model
generated: 2026-08-13
---

## PROBLEMA

Hoy las 3 sedes comparten una planilla de Drive que administración mantiene a mano. No hay
disponibilidad en tiempo real: para saber si un profesional tiene un hueco hay que abrir el
archivo y leerlo. Cuando dos personas editan a la vez, se pisan.

Es la base de todo el release: sin una agenda única no hay qué notificar ni qué reservar.

## USUARIO

| ID | Rol | Qué necesita lograr con esta feature |
|---|---|---|
| U01 | Administración | Ver y gestionar la agenda de las 3 sedes desde un solo lugar, con alta, cambio y cancelación de turnos |
| U02 | Profesional | Ver su agenda del día sin tener que pedirla ni abrir una planilla |

## DONE CRITERIA

- [ ] Administración da de alta un turno indicando paciente, profesional, especialidad, sede,
      fecha y hora
- [ ] Administración mueve un turno de día u hora sin volver a cargar los datos del paciente
- [ ] Administración cancela un turno
- [ ] El profesional ve solo sus turnos, con paciente, hora, motivo y si es primera consulta
      o control
- [ ] La disponibilidad refleja los turnos ya tomados en el momento
- [ ] Un profesional puede tener turnos en dos sedes el mismo día si las franjas no se
      superponen

## OUT OF SCOPE

- Bloqueo de franjas por el profesional: es F003
- Duración variable de consulta: es F004
- Reserva por el paciente: es R2
- Tiempo de traslado entre sedes: no se valida en R1

## RESTRICCIONES TÉCNICAS

- **Integraciones** · Ninguna. No hay sistema previo del que importar: la migración desde la
  planilla de Drive es manual y queda fuera del alcance de esta feature
- **Seguridad** · El profesional solo ve y modifica lo propio. Administración ve todo
- **Normativa** · Almacena nombre de paciente y motivo de consulta: son datos de salud, y la
  normativa que el cliente conoce condiciona dónde pueden vivir
- **Plataforma** · Web, usable desde tablet. Debe soportar el volumen de la campaña

## UI / FLUJO

- **Pantallas involucradas** · Una vista de agenda con filtro por sede y por profesional, y un
  formulario de alta y edición de turno
- **Flujo principal** · Administración abre la agenda, filtra por sede, ve las franjas libres y
  ocupadas del día, y da de alta un turno sobre una franja libre. Para mover un turno lo
  arrastra o edita fecha y hora sin recargar el resto
- **Estado vacío** · Un día sin turnos muestra la grilla de franjas libres, no una pantalla en
  blanco
- **Estado de error** · Si se intenta agendar sobre una franja ya ocupada, se avisa antes de
  guardar y se ofrecen los huecos más cercanos
- **Diseño de referencia** · ninguno. **Derivado de las entrevistas, requiere validación con
  administración antes de construir**
