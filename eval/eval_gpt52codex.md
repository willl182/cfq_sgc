Evalué los POE en `poe_rev/` (3.03, 3.05, 3.06, 3.08, 3.09, 3.10, 3.14, 3.18, 3.19, 3.20). Están claros y coherentes a nivel operativo, pero aún les faltan varios elementos “auditables” y de GMP/pv0 para cerrar riesgo regulatorio.

Hallazgos transversales
- Falta estructura de control documental formal: Elaboró/Revisó/Aprobó, firmas, revisión periódica, vigencia con próxima revisión.
- Criterios de aceptación frecuentemente “cualitativos”; faltan límites numéricos y planes de muestreo (tamaño, frecuencia, método).
- No se explicita identificación de equipos (códigos), calibración aplicable, ni referencia a POE de limpieza/desinfección.
- Falta sección de seguridad/BPM (EPP, control de polvo, contaminación cruzada).
- Anexos listados pero no desarrollados en los archivos (p. ej., rangos por producto).
- Conexión con registros: existen formatos en `poe_rev/formatos_registros/`, pero no se asegura trazabilidad de campos mínimos requeridos.

Observaciones puntuales por POE
- `POE_3.03_Molienda_Primaria_V1.md`: faltan tamaños de tamiz, rangos de granulometría, límites de retención, plan de muestreo y criterios de reproceso.
- `POE_3.05_Balance_Materias_Primas_V1.md`: bien definido el cálculo y tolerancias; falta definir fuente de datos (sistema/registro), responsable de verificación de inventario y evidencia de conciliación.
- `POE_3.06_Mezcla_Homogenizacion_V1.md`: falta criterio numérico de uniformidad (p. ej., %RSD), tamaño de submuestras, método de análisis.
- `POE_3.08_Presentacion_Fisica_Granulacion_V1.md`: faltan parámetros de operación (rpm, humedad, tamaño objetivo) y destino claro para material fuera de especificación (reproceso vs residuo).
- `POE_3.09_Molienda_Secundaria_V1.md`: falta definir límites de reproceso y condiciones de parada.
- `POE_3.10_Envase_V1.md`: faltan tolerancias de peso/volumen, frecuencia exacta de muestreo, criterios de rechazo de rotulado, y enlace a etiqueta aprobada.
- `POE_3.14_Contramuestras_V1.md`: sólido; falta definir responsable de inventario, condiciones ambientales (T°, HR), y formato de cadena de custodia.
- `POE_3.18_Disposicion_Barreduras_V1.md`: claro y alineado; falta clasificar residuos por código interno y definir cuantificación obligatoria.
- `POE_3.19_Formulaciones_Terceros_V1.md`: falta incluir requisitos contractuales, control de confidencialidad, y validación regulatoria por producto.
- `POE_3.20_Entrega_MP_Importacion_Terceros_V1.md`: falta definir trazabilidad documental mínima (BL, DIAN, ICA si aplica) y control de integridad de envases.

Plan de evaluación completa (si quieres formalizar y dejar listo para auditoría)
1. Revisar cada formato en `poe_rev/formatos_registros/` y mapear campos obligatorios vs. lo que pide el POE.
2. Definir criterios numéricos y planes de muestreo por POE (con anexos por familia/producto).
3. Agregar referencias cruzadas a POE de limpieza, calibración, no conformes, trazabilidad y seguridad.
4. Completar anexos y matrices (rangos, parámetros, secuencias, causas frecuentes).
5. Cerrar control documental (firmas, roles, vigencia/revisión, control de cambios con justificación).
6. Validar alineación con los 18 pilares y pv0 (especialmente trazabilidad, contramuestras, residuos).
