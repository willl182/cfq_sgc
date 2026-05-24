# Evaluación de POE en `poe_rev/`

**Fecha**: 2026-02-17  
**Evaluador**: Agente SGC  
**Alcance**: Procedimientos Operativos Estandarizados (POE) y formatos asociados

---

## Resumen General

| Tipo | Cantidad |
|------|----------|
| POE operativos | 10 |
| Actas N/A | 2 |
| Formatos/Registros | 31 archivos (11 carpetas + 20 CSV) |

---

## Alineación con 18 Pilares (pv0 - Anexo I-B)

| # | Pilar ICA | Estado en poe_rev/ |
|---|-----------|-------------------|
| 1 | Control Proveedores | **FALTA** |
| 2 | Balance Materias Primas | ✅ POE 3.05 |
| 3 | Codificación Lotes | **FALTA** (solo se menciona en POEs) |
| 4 | Muestreo | **FALTA** |
| 5 | Liberación Lotes | ⚠️ Formato existe, **POE FALTA** |
| 6 | Contramuestras | ✅ POE 3.14 |
| 7 | Mantenimiento Equipos | **FALTA** |
| 8 | Calibración | **FALTA** |
| 9 | Limpieza/Desinfección | **FALTA** |
| 10 | Manejo Barreduras | ✅ POE 3.18 |
| 11 | Capacitación | **FALTA** |
| 12 | Control Documental | **FALTA** |
| 13 | Retiro/Recall | **FALTA** |
| 14 | Servicio Cliente (PQR) | **FALTA** |
| 15 | Auditorías | **FALTA** |
| 16 | Laboratorio | **FALTA** |
| 17 | Controles Producción | ✅ POEs 3.03, 3.06, 3.08, 3.09, 3.10 |
| 18 | Instalaciones/Higiene | **FALTA** |

**Cobertura: 6/18 pilares (33%)**

---

## Calidad de Contenido

| Aspecto | Evaluación |
|---------|------------|
| Estructura | ✅ Consistente (9-10 secciones estándar) |
| Objetivo | ✅ Claro y medible |
| Alcance | ✅ Bien delimitado |
| Responsabilidades | ✅ Definidas por rol |
| Procedimiento | ⚠️ Pasos generales, falta detalle operativo |
| Criterios control | ✅ Incluidos con tolerancias |
| Registros asociados | ✅ Referenciados |
| Anexos | ⚠️ Declarados pero **no existen físicamente** |
| Control cambios | ⚠️ Solo V1 inicial |

---

## Brechas Críticas

1. **POE 3.05 Balance**: No desglosa "salida_total_kg" (PT + mermas + residuos + retenciones) en el formato CSV
2. **POE 3.14 Contramuestras**: Tiempo retención dice "12 meses o según requisito legal" - pv0 exige **mínimo 12 meses**, debería ser explícito
3. **Formato Liberación Lotes**: Existe pero **no hay POE 3.12** que lo soporte
4. **Anexos faltantes**: Todos los POE declaran anexos (rangos, listas, flujos) que no existen en `formatos_registros/`
5. **Codificación de lotes**: Se asume pero no hay procedimiento formal

---

## Inconsistencias entre POE y Formatos

| POE | Formato referenciado | Existe | Observación |
|-----|---------------------|--------|-------------|
| 3.03 | Formato_Control_Molienda_Primaria_V1.csv | ✅ | OK |
| 3.05 | Formato_Balance_Materias_Primas_V1.csv | ✅ | Falta desglose salidas |
| 3.06 | Formato_Control_Mezcla_Homogenizacion_V1.csv | ✅ | OK |
| 3.10 | Formato_Control_Envase_V1.csv | ✅ | OK |
| 3.14 | Formato_Control_Contramuestras_V1.csv | ✅ | Falta campo "fecha_vencimiento_retencion" |
| N/A | Formato_Liberacion_Lotes_V1.csv | ✅ | Sin POE asociado |

---

## Recomendaciones Prioritarias

| Prioridad | Acción |
|-----------|--------|
| **ALTA** | Crear POE 3.12 Liberación de Lotes (formato existe) |
| **ALTA** | Crear POE Codificación de Lotes (incluir en 3.01 o crear 3.11) |
| **ALTA** | Crear los 12 POE faltantes de los pilares ICA |
| **MEDIA** | Agregar anexos declarados (rangos, listas de chequeo, flujos) |
| **MEDIA** | Completar formato Balance con campos de desglose |
| **MEDIA** | Agregar campo fecha_vencimiento a formato contramuestras |

---

## POE Existentes - Detalle

### POE 3.03 - Molienda Primaria
- **Estado**: Completo estructuralmente
- **Brecha**: Anexos no existen físicamente

### POE 3.05 - Balance de Materias Primas
- **Estado**: Completo estructuralmente
- **Fortaleza**: Define tolerancias claras (±2.0% conforme, ±3.0% no conforme)
- **Brecha**: Formato no desglosa componentes de salida

### POE 3.06 - Mezcla y Homogenización
- **Estado**: Completo estructuralmente
- **Brecha**: "Criterios de uniformidad por producto" no existe

### POE 3.08 - Presentación Física (Granulación)
- **Estado**: Completo estructuralmente
- **Brecha**: "Rangos de tamaño por producto" no existe

### POE 3.09 - Molienda Secundaria
- **Estado**: Completo estructuralmente
- **Brecha**: Similar a 3.03

### POE 3.10 - Envase
- **Estado**: Completo estructuralmente
- **Brecha**: "Frecuencia de muestreo por presentación" no existe

### POE 3.14 - Gestión de Contramuestras
- **Estado**: Completo estructuralmente
- **Fortaleza**: Define cantidad mínima (500g), envase, rótulo
- **Brecha**: Formato falta campo fecha_vencimiento_retencion

### POE 3.18 - Disposición de Barreduras
- **Estado**: Completo estructuralmente
- **Fortaleza**: Regla crítica clara - prohibición de reincorporación
- **Brecha**: Lista de gestores autorizados no existe

### POE 3.19 - Formulaciones para Terceros
- **Estado**: Completo estructuralmente
- **Fortaleza**: Define flujo de aprobación y control de cambios

### POE 3.20 - Entrega MP Importación Terceros
- **Estado**: Completo estructuralmente
- **Fortaleza**: Define conciliación de saldos semanal/mensual

---

## Actas N/A

### ACTA_NA_3.04 - Tratamiento Térmico (Pirolisis)
- **Justificación**: No existe equipo de pirólisis ni proceso asociado
- **Criterio reactivación**: Si se incorpora, crear POE 3.04 antes de operar

### ACTA_NA_3.07 - Reacciones Químicas o Bioquímicas
- **Justificación**: Proceso es físico (dosificación, mezcla), sin reactor
- **Criterio reactivación**: Si se implementa, crear POE 3.07 antes de operar

---

## Conclusión

Los POE existentes tienen **buena estructura formal** y están alineados conceptualmente con pv0. Sin embargo:

1. **Cobertura insuficiente**: Solo 33% de los pilares ICA tienen POE
2. **Profundidad limitada**: Falta detalle operativo y anexos técnicos
3. **Formatos incompletos**: Algunos campos clave están ausentes
4. **POE huérfanos**: Formato de liberación sin procedimiento

**Acción inmediata recomendada**: Crear POE 3.12 Liberación de Lotes para dar soporte al formato existente.
