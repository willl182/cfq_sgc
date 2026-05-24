# Evaluacion de POE en `poe_rev/` (GPT-5.2)

Fecha: 2026-02-18

## Alcance revisado

Archivos en `poe_rev/`:

- `poe_rev/POE_3.03_Molienda_Primaria_V1.md`
- `poe_rev/POE_3.05_Balance_Materias_Primas_V1.md`
- `poe_rev/POE_3.06_Mezcla_Homogenizacion_V1.md`
- `poe_rev/POE_3.08_Presentacion_Fisica_Granulacion_V1.md`
- `poe_rev/POE_3.09_Molienda_Secundaria_V1.md`
- `poe_rev/POE_3.10_Envase_V1.md`
- `poe_rev/POE_3.14_Contramuestras_V1.md`
- `poe_rev/POE_3.18_Disposicion_Barreduras_V1.md`
- `poe_rev/POE_3.19_Formulaciones_Terceros_V1.md`
- `poe_rev/POE_3.20_Entrega_MP_Importacion_Terceros_V1.md`
- `poe_rev/ACTA_NA_3.04_Tratamiento_Termico_Pirolisis_V1.md`
- `poe_rev/ACTA_NA_3.07_Reacciones_Quimicas_Bioquimicas_V1.md`

Formatos y registros (CSV) en `poe_rev/formatos_registros/`.

## Hallazgos generales

- La estructura base es consistente (objetivo/alcance/definiciones/responsabilidades/procedimiento/controles/registros/anexos/cambios) y coherente con BPM/GMP; es un buen punto de partida.
- El nivel de detalle aun es "macro": varios criterios quedan como "segun especificacion interna" sin indicar donde esta, como se mide, con que metodo/equipo, cuantas muestras, limites numericos, ni acciones exactas ante desvios. En auditoria suele quedar como "procedimiento no demostrable".
- Control documental incompleto en los POE: falta bloque formal de Elaboro/Reviso/Aprobo, firmas, proxima revision, estado (vigente/obsoleto), y/o codificacion/control de formatos asociados.
- Faltan elementos GMP transversales: EPP/seguridad, control de contaminacion cruzada, verificacion de limpieza, calibracion/verificacion de instrumentos (balanzas, tamices, basculas de envase), trazabilidad de equipos, criterios de paro, segregacion, y retencion/archivo de registros (tiempo, responsable, ubicacion).
- Se mencionan "Anexos" pero no existen como documentos en `poe_rev/` (por ahora quedan como compromisos sin evidencia).

## Brecha puntual detectada

- Existe `poe_rev/formatos_registros/3.12_Liberacion_Lotes/Formato_Liberacion_Lotes_V1.csv` (y tambien `poe_rev/formatos_registros/Formato_Liberacion_Lotes_V1.csv`), pero no existe `POE_3.12_Liberacion_Lotes_V1.md` en `poe_rev/`. "Liberacion de lotes" es pilar critico; esto queda como hueco documental.

## Evaluacion por documento

### `poe_rev/POE_3.03_Molienda_Primaria_V1.md` y `poe_rev/POE_3.09_Molienda_Secundaria_V1.md`

- Bien: flujo y responsabilidades claras; existen formato/registro asociados.
- Falta: metodo de granulometria (tamiz(es), malla, tiempo, criterio de retenido %), parametros por equipo (RPM/carga/tiempo), plan de muestreo (numero de submuestras), criterios numericos por familia/producto, limpieza/verificacion y manejo de reproceso.

### `poe_rev/POE_3.05_Balance_Materias_Primas_V1.md`

- Bien: formula, tolerancias y escalamiento (+/-2%, +/-3%) definidos; esto es mas "auditable".
- Falta: como tratar reprocesos/retornos, que incluye "salida" (mermas, barreduras, producto no conforme, retenciones) con definiciones operativas, evidencia minima exigida, y vinculo explicito con liberacion de lote.

### `poe_rev/POE_3.06_Mezcla_Homogenizacion_V1.md`

- Falta critica: definicion cuantitativa de "uniformidad" (p.ej. CV%, criterio por parametro), numero de muestras y ubicacion, metodo analitico/rapido (si aplica), limites y tabla por producto (anexo real).

### `poe_rev/POE_3.08_Presentacion_Fisica_Granulacion_V1.md`

- Falta: parametros de granulador/tamiz, tratamiento de fraccion fuera de especificacion (reproceso permitido/no permitido y como se registra), y criterios fisicos (apelmazamiento, humedad, fluidez) si aplican.

### `poe_rev/POE_3.10_Envase_V1.md`

- Falta: tolerancias de peso/volumen (numericas por presentacion), control de balanza (calibracion/verificacion), control de rotulado (campos obligatorios y criterios de legibilidad), segregacion de no conformes y disposicion.

### `poe_rev/POE_3.14_Contramuestras_V1.md`

- Bien: cubre contramuestras con custodia, control de acceso y retencion (12 meses).
- Falta: condiciones ambientales/ubicacion controlada (humedad/plagas), cantidad por tipo de producto/presentacion, trazabilidad de salidas (parcial/total) con formato controlado y retencion documental.

### `poe_rev/POE_3.18_Disposicion_Barreduras_V1.md`

- Muy bien: "regla critica" explicita (no reincorporar) y evidencia minima de disposicion.
- Falta: clasificacion operativa (barredura vs producto no conforme vs residuo aprovechable/no), EPP, contenedores codificados, y amarre a gestor autorizado (lista y control de vigencia).

### `poe_rev/POE_3.19_Formulaciones_Terceros_V1.md`

- Falta: criterios de entrada (documentos minimos del tercero), control de confidencialidad/contrato, definicion de "viabilidad regulatoria" (que se revisa), y trazabilidad completa (cliente-formulacion-version-lote-resultados-retencion de muestras).

### `poe_rev/POE_3.20_Entrega_MP_Importacion_Terceros_V1.md`

- Bien: segregacion y conciliacion semanal/mensual.
- Falta: estado de liberacion/cuarentena de MP, inspeccion/recepcion (condicion de empaque, rotulado, COA), y lista exacta de documentos de importacion/ingreso exigidos por el SGC.

### `poe_rev/ACTA_NA_3.04_Tratamiento_Termico_Pirolisis_V1.md` y `poe_rev/ACTA_NA_3.07_Reacciones_Quimicas_Bioquimicas_V1.md`

- Bien: justifican N/A, evidencias y criterio de reactivacion; incluyen Elaboro/Reviso/Aprobo (esto deberia replicarse en los POE).
- Falta menor: periodicidad de revision (p.ej. anual o cuando cambie proceso/equipos) y referencia explicita al requisito ICA/pv0 (numeral exacto) que se esta cubriendo.

## Observaciones sobre formatos (`poe_rev/formatos_registros/*.csv`)

- Bien: campos minimos para trazabilidad y verificacion existen.
- Riesgo: como CSV vacios con solo encabezado, falta control documental tipico (codigo del formato, version, responsable, firma/visto bueno, y reglas de diligenciamiento). Si se usan en Excel, ojo con separador "," vs ";" segun configuracion regional.

## Recomendaciones prioritarias (para mejorar auditabilidad)

1. Para cada POE, agregar una matriz de control (variable-metodo-limite-frecuencia-responsable-registro).
2. Volver numericos los criterios clave (granulometria, uniformidad, tolerancias de envase) y ubicarlos en anexos reales por producto/equipo.
3. Normalizar control documental: Elaboro/Reviso/Aprobo + proxima revision + lista de registros con retencion/ubicacion.
4. Crear `POE_3.12_Liberacion_Lotes_V1.md` para respaldar el formato ya existente.

## Pregunta para cerrar alcance

Estos POE son borradores tipo "plantilla" (por eso dicen "segun especificacion") o ya deben quedar listos para auditoria ICA/pv0? Recomendacion: asumir "listos para auditoria" y cerrar criterios numericos + matriz de control.
