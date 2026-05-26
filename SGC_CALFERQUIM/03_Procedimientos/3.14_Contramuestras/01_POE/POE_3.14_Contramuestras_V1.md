# PROCEDIMIENTO OPERATIVO ESTANDARIZADO: GESTIÓN Y ALMACENAMIENTO DE CONTRAMUESTRAS

| CÓDIGO | VERSIÓN | VIGENCIA | PRÓXIMA REVISIÓN |
|
|
|
|
|
| **CGC-POE-3.14** | **01** | **2026-02-17** | **12 meses o ante cambio regulatorio** |

---

## 1. OBJETIVO

Garantizar la disponibilidad de una muestra de retención (contramuestra) representativa de cada lote comercializado, debidamente identificada y almacenada bajo condiciones controladas, para permitir la repetición de análisis en caso de reclamos, investigaciones técnicas o requerimientos de la autoridad competente (ICA).

## 2. ALCANCE

Este procedimiento aplica al 100% de los lotes de Producto Terminado liberados por **CALFERQUIM S.A.S.**, así como a las materias primas críticas que requieran custodia.

## 3. DEFINICIONES

*   **Contramuestra (Muestra de Retención):** Cantidad de material reservado del mismo lote del producto distribuido, tomado de tal manera que sea estadísticamente representativo.
*   **Custodia:** Control estricto de acceso y manipulación para asegurar que la muestra no ha sido alterada desde su toma.
*   **Vida Útil:** Periodo durante el cual el producto mantiene sus especificaciones de calidad bajo condiciones de almacenamiento recomendadas.

## 4. DOCUMENTOS DE REFERENCIA

*   **Resolución ICA pv0 (Propuesta):** Anexo I-B, Pilar 6 "Almacenamiento de Contramuestras".
*   **Resolución 150 de 2003:** Artículo 14 (Control de Calidad).

## 4.1. CONSIDERACIONES GMP (BUENAS PRÁCTICAS DE MANUFACTURA)

El área de contramuestras es una zona restringida. **Se prohíbe** el ingreso de personal no autorizado o la extracción de muestras sin la firma del Jefe de Calidad. Las condiciones de almacenamiento (Temperatura y Humedad) **deben** monitorearse y registrarse diariamente para demostrar que las muestras no se han degradado por causas ambientales.

## 5. RESPONSABILIDADES Y POLÍTICAS (Estilo Opus)

### 5.1. Jefe de Control de Calidad
*   **Debe** asegurar que la contramuestra se tome del *producto final envasado* para incluir el efecto del proceso de envase.
*   **Es responsable** de la custodia física de la llave del archivo de muestras (Muestroteca).
*   **Tiene la autoridad** para desechar las muestras una vez cumplido su tiempo de retención legal, previa acta de destrucción.

### 5.2. Analista de Laboratorio
*   **Debe** verificar que el envase de la contramuestra sea hermético e inerte (vidrio ámbar o polietileno de alta densidad) para evitar alteraciones.

## 6. PROCEDIMIENTO (Estilo GLM-4.7)

### 6.1. Toma de Muestra

1.  **ANALISTA:** **Tomar** aleatoriamente unidades del principio, medio y fin del proceso de envasado (POE 3.10).
2.  **ANALISTA:** **Componer** una muestra final de mínimo **500 gramos** (o cantidad suficiente para 3 análisis completos).
3.  **ANALISTA:** **Envasar** la muestra en recipiente definitivo y **cerrar** con precinto de seguridad.

### 6.2. Identificación y Registro

4.  **ANALISTA:** **Diligenciar** el rótulo de identificación (Anexo 1) con:
    *   Nombre del Producto.
    *   Número de Lote.
    *   Fecha de Fabricación y Vencimiento.
    *   Firma del responsable de toma.
5.  **ANALISTA:** **Registrar** el ingreso en el `Formato_Control_Contramuestras_V1.csv`.

### 6.3. Almacenamiento y Custodia

6.  **CALIDAD:** **Ubicar** la muestra en el estante correspondiente de la Muestroteca.
    *   *Condiciones:* Temperatura < 30°C, Humedad Relativa < 70%, Protegido de luz directa.
7.  **CALIDAD:** **Actualizar** el inventario físico (Matriz de Ubicación - Anexo 2).

### 6.4. Retención y Disposición Final

8.  **CALIDAD:** **Retener** la muestra por un periodo de **Vida Útil + 1 Año** (Mínimo 12 meses según normativa vigente).
9.  **CALIDAD:** **Revisar** mensualmente el inventario para identificar muestras vencidas.
10. **CALIDAD:** **Proceder a la destrucción** de las muestras vencidas según POE 3.18 (Residuos).
    *   *Registro:* Diligenciar el Acta de Disposición de Contramuestras.
11. **EN CASO DE RECLAMO:**
    *   **Retirar** la muestra bajo custodia.
    *   **Romper** el precinto en presencia de testigos.
    *   **Analizar** y comparar resultados con el certificado original.

## 7. CRITERIOS DE CONTROL Y ACEPTACIÓN

| PARAMETRO | CRITERIO |
|:---|:---|
| **Cantidad Mínima** | 500 g (Sólidos) / 250 ml (Líquidos). |
| **Envase** | Hermético, limpio, sin fugas. |
| **Identificación** | Rótulo completo, legible y adherido. |
| **Tiempo Retención** | Fecha Vencimiento + 12 Meses. |

## 8. REGISTROS ASOCIADOS

*   `Formato_Control_Contramuestras_V1.csv`: Log de ingreso y ubicación.
*   `Registro_Contramuestras_V1.csv`: Acta de destrucción/salida.

## 9. ANEXOS

### Distribución y Zonificación de la Muestroteca

## Descripción General

La Muestroteca es un área restringida destinada al almacenamiento controlado de contramuestras. Su diseño **debe** garantizar organización, trazabilidad y condiciones ambientales estables.

## Distribución Esquemática

```
┌──────────────────────────────────────────────────────────┐
│                    MUESTROTECA                           │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ESTANTE A │  │ESTANTE B │  │ESTANTE C │  │ESTANTE D│ │
│  │(NPK      │  │(Sulfatos │  │(Foliares │  │(Terceros│ │
│  │ Edáficos)│  │ y Sales) │  │ Solubles)│  │ y Otros)│ │
│  │          │  │          │  │          │  │         │ │
│  │ Nivel 4  │  │ Nivel 4  │  │ Nivel 4  │  │ Nivel 4 │ │
│  │ Nivel 3  │  │ Nivel 3  │  │ Nivel 3  │  │ Nivel 3 │ │
│  │ Nivel 2  │  │ Nivel 2  │  │ Nivel 2  │  │ Nivel 2 │ │
│  │ Nivel 1  │  │ Nivel 1  │  │ Nivel 1  │  │ Nivel 1 │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│                                                          │
│  ┌───────────────┐   ┌──────────────────────────┐       │
│  │  TERMOHIGRÓ-  │   │  MESA DE TRABAJO         │       │
│  │  METRO DIGITAL│   │  (Registro, inspección)  │       │
│  └───────────────┘   └──────────────────────────┘       │
│                                                          │
│  🔒 PUERTA CON LLAVE (Custodia: Jefe de Calidad)       │
└──────────────────────────────────────────────────────────┘
```

## Codificación de Ubicación

Cada contramuestra se ubica con el código: **Estante-Nivel-Posición**

Ejemplo: **B-3-07** = Estante B, Nivel 3, Posición 7

| ESTANTE | FAMILIA ASIGNADA | CAPACIDAD APROX. |
|:---:|:---|:---:|
| **A** | Fertilizantes NPK Edáficos | 40 muestras |
| **B** | Sulfatos, Sales Simples, Enmiendas | 40 muestras |
| **C** | Foliares Solubles, Quelatos | 40 muestras |
| **D** | Formulaciones Terceros, Otros | 40 muestras |

## Condiciones Ambientales

| PARÁMETRO | RANGO ACEPTABLE | FRECUENCIA DE REGISTRO |
|:---|:---:|:---|
| **Temperatura** | < 30°C | Diario (termohigrómetro) |
| **Humedad Relativa** | < 70% | Diario (termohigrómetro) |
| **Iluminación** | Protegida de luz solar directa | Permanente |
| **Acceso** | Solo personal autorizado con llave | Permanente |

## Control de Inventario

- **Ingreso:** Registrar ubicación en CSV al momento de almacenar.
- **Retiro:** Solo con autorización escrita del Jefe de Calidad.
- **Auditoría:** Inventario físico mensual vs. registro digital.
- **Disposición:** Muestras vencidas se retiran según POE 3.18.

> **Nota:** Este plano es esquemático. La distribución real **debe** ajustarse a la infraestructura física de la planta y documentarse con fotografías actualizadas.

## 10. CONTROL DE CAMBIOS

| VERSIÓN | FECHA | DESCRIPCIÓN DEL CAMBIO |
|

