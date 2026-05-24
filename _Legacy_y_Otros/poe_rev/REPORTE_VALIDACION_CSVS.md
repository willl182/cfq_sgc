# Reporte de Validación de Consistencia CSVs

**Fecha:** 2026-02-18
**Estado:** VALIDADO CON OBSERVACIONES

## Resumen

Se ha verificado la estructura de los 22 archivos CSV en `poe_rev/formatos_registros/`. La mayoría de los formatos son consistentes con los POEs normalizados. Se identificaron algunas discrepancias menores que fueron corregidas.

## Hallazgos y Correcciones

### 1. POE 3.12 - Liberación de Lotes
*   **Archivos:** `Formato_Liberacion_Lotes_V1.csv` y `Registro_Liberacion_Lotes_V1.csv`.
*   **Estado:** El `Registro` fue creado recientemente para cumplir con la brecha detectada. El `Formato` contiene campos detallados de decisión.
*   **Acción:** Se unificó la nomenclatura de campos clave como `lote` vs `numero_lote` para facilitar la trazabilidad automática.

### 2. POE 3.14 - Contramuestras
*   **Archivos:** `Formato_Control_Contramuestras_V1.csv` y `Registro_Contramuestras_V1.csv`.
*   **Estado:** Consistente. El formato de control incluye `ubicacion` (Estante-Nivel-Posición) alineado con el Anexo 2 (Plano).

### 3. POE 3.18 - Residuos
*   **Archivos:** `Formato_Control_Disposicion_Residuos_V1.csv` (operativo) y `Registro_Disposicion_Residuos_V1.csv` (histórico/trazabilidad).
*   **Estado:** Consistente. Incluye campo `destino_previsto` y `gestor_o_destino` alineado con el Anexo 1 (Clasificación).

### 4. POE 3.03, 3.06, 3.08, 3.09, 3.10 (Producción)
*   **Estado:** Todos tienen par `Formato` (control en proceso) y `Registro` (histórico de lote).
*   **Observación:** Los campos de control (tiempos, mallas, pesos) coinciden con los parámetros críticos definidos en los POEs.

### 5. POE 3.05 - Balance
*   **Estado:** El formato incluye campos para `entrada_total`, `salida_total`, `diferencia` y `% desviacion`, alineado con las fórmulas del POE.

### 6. POE 3.19 y 3.20 (Terceros)
*   **Estado:** Incluyen campos para `cliente/tercero`, `lote_mp`, `documento_salida`, alineados con la trazabilidad exigida.

## Conclusión

La estructura de datos en los CSVs es robusta y permite la captura de información requerida por la norma pv0. No se requieren cambios estructurales adicionales en esta fase.
