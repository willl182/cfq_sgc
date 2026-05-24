# Evaluación de POE en poe_rev/

**Fecha:** 2026-02-17  
**Agente:** GLM-4.7  
**Versión:** V1

---

## Resumen Ejecutivo

| Categoría | Conteo | Estado |
|-----------|--------|--------|
| POEs operativos | 10 | ✅ Estructurados |
| Actas NA | 2 | ✅ Justificadas |
| Formatos | 11 | ✅ Estructurados |
| Registros | 11 | ✅ Estructurados |

---

## Alineación con Pilares pv0 (Anexo I-A/I-B)

| Pilar | POE Asociado | Estado |
|-------|--------------|--------|
| 2. Balance de Materias Primas | **POE 3.05** | ✅ CRÍTICO - Nuevo |
| 6. Almacenamiento Contramuestras | **POE 3.14** | ✅ CRÍTICO - Nuevo |
| 10. Manejo Residuos/Barreduras | **POE 3.18** | ✅ CRÍTICO - Nuevo |
| 13. Trazabilidad/Retiro | Parcial (POE 3.19, 3.20) | ⚠ Faltan POE Recall |
| 17. Controles Proceso Producción | POE 3.03, 3.06, 3.08, 3.09, 3.10 | ✅ Consolidados |
| Pirolisis | ACTA-NA 3.04 | ✅ Justificado |
| Reacciones Químicas | ACTA-NA 3.07 | ✅ Justificado |

---

## Hallazgos por Criticidad

### 🔴 CRÍTICOS (Bloqueantes)

#### 1. POE 3.05 Balance MP - Tolerancia +/- 2.0%

**Ubicación:** Línea 47  
**Problema:** Tolerancia inicial definida pero **NO validada contra operación real**

**Riesgo:** Si la planta opera con desviación típica >2%, 100% de lotes quedarán "Observado/NC"

**Requiere:** Revisión histórica de balances reales para establecer tolerancia realista

---

#### 2. POE 3.14 Contramuestras - Tiempo Retención 12 meses

**Ubicación:** Línea 41  
**Problema:** "mínimo de 12 meses o según requisito legal vigente"

**Riesgo:** pv0 puede requerir retención diferente

**Requiere:** Confirmar requisito legal específico ICA pv0

---

#### 3. Anexos Faltantes - TODOS los POE

**Problema:** Todos los POE mencionan 2 anexos (ej: Anexo 1, Anexo 2) pero **NO existen archivos físicos** de anexos en `formatos_registros/`

**Riesgo:** Implementación incompleta sin matrices de criterios, parámetros técnicos

**Lista de anexos mencionados y faltantes:**
- POE 3.03: Anexo 1 (Lista chequeo preoperacional molino), Anexo 2 (Parámetros ref producto)
- POE 3.05: Anexo 1 (Ejemplo cálculo balance), Anexo 2 (Matriz causas desviación)
- POE 3.06: Anexo 1 (Secuencias carga), Anexo 2 (Criterios uniformidad)
- POE 3.08: Anexo 1 (Rangos tamaño), Anexo 2 (Parámetros operación)
- POE 3.09: Anexo 1 (Rango tamaño final), Anexo 2 (Causas desvío)
- POE 3.10: Anexo 1 (Frecuencia muestreo), Anexo 2 (Criterios rechazo)
- POE 3.14: Anexo 1 (Rotulo estándar), Anexo 2 (Matriz ubicación)
- POE 3.18: Anexo 1 (Clasificación residuos), Anexo 2 (Gestores autorizados)
- POE 3.19: Anexo 1 (Flujo aprobación), Anexo 2 (Formato control cambios)
- POE 3.20: Anexo 1 (Lista chequeo documental), Anexo 2 (Formato conciliación saldos)

---

### 🟡 IMPORTANTES (Alertas)

#### 4. POE 3.06 Mezcla - Criterio Uniformidad Genérico

**Ubicación:** Línea 42  
**Problema:** "uniformidad conforme a especificación interna del producto"

**Faltas:**
- Definir qué método (mezcla geométrica, ensayo NPK por submuestra)
- Especificar desviación aceptable (ej: +/- 5% NPK entre 3 submuestras)

---

#### 5. POE 3.10 Envase - Tolerancia Peso/Volumen No Definida

**Ubicación:** Línea 42  
**Problema:** "peso/volumen dentro de tolerancia interna"

**Falta:** Especificar valor numérico (ej: +/- 5% del declarado)

---

#### 6. POE 3.19/3.20 - Terceros - Coordinación Operativa

**Ubicación:** Líneas 23-26 (POE 3.19)  
**Problema:** Responsabilidades dispersas entre Comercial/Dirección/Producción/Calidad

**Riesgos:**
- Falta definición de **quién aprueba** formulación de terceros (¿Dirección Técnica sola? ¿Con Validación ICA?)
- POE 3.20 no menciona si requiere **resolución ICA de laboratorio** para liberar MP importada

---

#### 7. Formatos vs Registros - Superposición

**Problema:**
- `Formato_Control_XXX_V1.csv`: Campos de control (ej: cumple, observaciones)
- `Registro_XXX_V1.csv`: Resumen por lote

**Falta claridad:** ¿Se usan ambos? ¿El registro se deriva del formato?

**Ejemplo (Balance):**
- Formato: tiene cálculos (entrada, salida, diferencia, desviación%)
- Registro: tiene estado/no conformidad, accion definida

---

### 🟢 MENORES (Sugerencias)

#### 8. Codificación Inconsistente

**Actual:**
- POEs: `POE-3.XX`
- Actas NA: `ACTA-NA-3.XX`

**Sugerencia:** Estandarizar a `POE-3.XX` y `POE-3.XX-NA` para consistencia

---

#### 9. Responsabilidad Única

**Ejemplo:** POE 3.05, Línea 6: "Jefe de Producción / Control de Calidad"

**Sugerencia:** Definir un responsable primario, otros como apoyos

---

#### 10. Criterio de Aceptación Binario

**Problema:** Muchos POE usan solo "cumple" vs "no cumple"

**Sugerencia:** Considerar escala (Conforme/Observado/No Conforme) como POE 3.05

---

## Análisis de Formatos

### Campos Adecuados

**Formato_Balance_MP:** fecha, lote, producto, entrada/salida, diferencia, desviación%, cumple ✓  
**Formato_Contramuestras:** lote, cantidad, ubicación, estado_envase, cumple_rotulo ✓  
**Formato_Envase:** peso_volumen_objetivo, obtenido, cumple ✓

### Campos Faltantes Críticos

**Balance MP:**
- Falta campo `lotes_MP_cargados[]` para trazabilidad de MP individual

**Contramuestras:**
- Falta `fecha_vencimiento` (12 meses + fechas de retiro si se usa)

**Envase:**
- Falta `numero_unidades_controladas` (ej: 1 de cada 10 unidades)

---

## Recomendaciones de Acción

### Fase 1: Validación de Tolerancias (Antes de Implementación)

1. Extraer 20-30 registros históricos de balance de masas de producción
2. Calcular desviación típica real por familia de producto
3. Ajustar tolerancia POE 3.05 a valor realista (ej: +/- 3% si operación varía más)
4. Validar contra requisitos pv0 (si pv0 establece tolerancia específica)

---

### Fase 2: Creación de Anexos

**Estructura propuesta:**

```
formatos_registros/Anexos/
├── Anexo_3.03_Parametros_Ref_Producto.csv
├── Anexo_3.03_Lista_Chequeo_Molino.csv
├── Anexo_3.05_Ejemplo_Calculo_Balance.md
├── Anexo_3.05_Matriz_Causas_Desviacion.csv
├── Anexo_3.06_Secuencias_Carga_Producto.csv
├── Anexo_3.06_Criterios_Uniformidad_Producto.csv
├── Anexo_3.08_Rangos_Tamano_Producto.csv
├── Anexo_3.08_Parametros_Operacion_Equipo.csv
├── Anexo_3.09_Rango_Tamano_Final_Producto.csv
├── Anexo_3.09_Causas_Desvio_Acciones.csv
├── Anexo_3.10_Frecuencia_Muestreo_Producto.csv
├── Anexo_3.10_Criterios_Rechazo_Empaque.md
├── Anexo_3.14_Rotulo_Contramuestra.pdf
├── Anexo_3.14_Ubicacion_Contramuestras.csv
├── Anexo_3.18_Clasificacion_Residuos.csv
├── Anexo_3.18_Gestores_Autorizados.csv
├── Anexo_3.19_Flujo_Aprobacion_Formulacion.md
├── Anexo_3.19_Formato_Control_Cambios_Tercero.csv
├── Anexo_3.20_Chequeo_Documental_MP.csv
└── Anexo_3.20_Conciliacion_Saldos_Lote.csv
```

---

### Fase 3: Aclaración de Formatos vs Registros

**Documentar en cada POE:**
- "Formato_Control_XXX": Se usa **DURANTE** operación (cada control individual)
- "Registro_XXX": Se crea **AL FINAL** (resumen del lote)

**Agregar sección "Flujo de Registro" en cada POE**

---

### Fase 4: Refinamiento de Criterios Técnicos

**POE 3.06:**
- Agregar definición de uniformidad (ej: "desviación ≤5% entre 3 submuestras")

**POE 3.10:**
- Agregar tolerancia numérica (ej: "+/- 5% de peso declarado")

**POE 3.14:**
- Confirmar requisito legal pv0 para tiempo retención

---

### Fase 5: Documentación Faltante

- Crear POE 3.XX - Recall/Retiro de Producto (pilar 13)
- Validar POE 3.19/3.20 con equipo legal/comercial

---

## Calidad General

| Aspecto | Calificación | Observaciones |
|---------|--------------|---------------|
| Estructura | 9/10 | Uniforme, completa |
| Lenguaje | 9/10 | Claro, técnico |
| Responsabilidades | 8/10 | Claras, algunas superposiciones |
| Registros | 7/10 | Estructurados pero requieren aclaración de uso |
| Anexos | 3/10 | Mencionados pero inexistentes |
| Alineación pv0 | 8/10 | 4 pilares críticos cubiertos, falta Recall |
| Implementabilidad | 6/10 | Riesgo en tolerancias no validadas |

**Calificación global: 7.2/10**

**Conclusión:** Base sólida pero requiere validación técnica antes de implementación.

---

## POE Evaluados

### POE Operativos (10 archivos)
1. POE_3.03_Molienda_Primaria_V1.md
2. POE_3.05_Balance_Materias_Primas_V1.md
3. POE_3.06_Mezcla_Homogenizacion_V1.md
4. POE_3.08_Presentacion_Fisica_Granulacion_V1.md
5. POE_3.09_Molienda_Secundaria_V1.md
6. POE_3.10_Envase_V1.md
7. POE_3.14_Contramuestras_V1.md
8. POE_3.18_Disposicion_Barreduras_V1.md
9. POE_3.19_Formulaciones_Terceros_V1.md
10. POE_3.20_Entrega_MP_Importacion_Terceros_V1.md

### Actas NA (2 archivos)
1. ACTA_NA_3.04_Tratamiento_Termico_Pirolisis_V1.md
2. ACTA_NA_3.07_Reacciones_Quimicas_Bioquimicas_V1.md

### Formatos y Registros (22 archivos)

**Formatos (11):**
- Formato_Balance_Materias_Primas_V1.csv
- Formato_Control_Contramuestras_V1.csv
- Formato_Control_Disposicion_Residuos_V1.csv
- Formato_Control_Entrega_MP_Terceros_V1.csv
- Formato_Control_Envase_V1.csv
- Formato_Control_Mezcla_Homogenizacion_V1.csv
- Formato_Control_Molienda_Primaria_V1.csv
- Formato_Control_Molienda_Secundaria_V1.csv
- Formato_Control_Presentacion_Fisica_V1.csv
- Formato_Liberacion_Lotes_V1.csv
- Formato_Solicitud_Formulacion_Tercero_V1.csv

**Registros (11):**
- Registro_Balance_Materias_Primas_V1.csv
- Registro_Conciliacion_MP_Terceros_V1.csv
- Registro_Contramuestras_V1.csv
- Registro_Control_Cambios_Formulacion_Tercero_V1.csv
- Registro_Disposicion_Residuos_V1.csv
- Registro_Envase_V1.csv
- Registro_Mezcla_Homogenizacion_V1.csv
- Registro_Molienda_Primaria_V1.csv
- Registro_Molienda_Secundaria_V1.csv
- Registro_Presentacion_Fisica_V1.csv
- (Faltan: Registro_Liberacion_Lotes_V1.csv mencionado en POE 3.12)

---

## Próximos Pasos

1. ✅ **Evaluación completa** - Documento generado
2. ⏳ Validar tolerancia POE 3.05 con datos históricos
3. ⏳ Crear anexos para todos los POE
4. ⏳ Refinar criterios técnicos (uniformidad, peso/volumen)
5. ⏳ Documentar flujo de registros vs formatos
6. ⏳ Crear POE Recall/Retiro (pilar 13)
