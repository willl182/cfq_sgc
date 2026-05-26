# PROCEDIMIENTO OPERATIVO ESTANDARIZADO: VERIFICACION DE FORMULACION Y GRADO DEL PRODUCTO

| CODIGO | VERSION | VIGENCIA | PROXIMA REVISION |
|---|---|---|---|
| CGC-POE-3.05 | 01 | 2026-02-17 | 12 meses o ante cambio regulatorio |

---

## 1. OBJETIVO

Verificar que las cantidades de materias primas indicadas en la Orden de Produccion, combinadas con la composicion conocida de cada materia prima, producen el grado declarado del producto en el Registro ICA.

## 2. ALCANCE

Aplica a todos los lotes de fertilizantes y acondicionadores de suelo fabricados en CALFERQUIM S.A.S. Es requisito previo a la liberacion del lote.

## 3. DEFINICIONES

- Orden de Produccion: Documento que especifica las materias primas y sus cantidades para fabricar una tonelada (o el lote definido) de un producto.
- Grado del producto: Concentracion de cada nutriente declarada en el Registro ICA del producto (ej. 10-20-20 expresado en % de N, P2O5, K2O).
- Concentracion MP: Contenido del nutriente en la materia prima, expresado en porcentaje (%).
- Aporte por nutriente: Concentracion que aporta cada materia prima al producto final, calculada segun la formula de verificacion.

## 4. DOCUMENTOS DE REFERENCIA

- Resolucion ICA pv0 (Propuesta): Anexo I-B, Pilar 2.
- Registro ICA del producto (grado declarado).
- Fichas tecnicas de las materias primas (composicion garantizada).

## 5. RESPONSABILIDADES Y POLITICAS

### 5.1. Jefe de Produccion
- Emite la Orden de Produccion con las cantidades de cada materia prima para el lote.
- Garantiza que las cantidades pesadas en planta correspondan exactamente a las indicadas en la Orden.

### 5.2. Control de Calidad
- Ejecuta el calculo de verificacion del grado usando la formula establecida.
- Confirma que el grado calculado coincide con el grado declarado en el Registro ICA antes de autorizar la fabricacion del lote.
- Tiene la autoridad para detener la produccion si la verificacion no cuadra con el grado declarado.

## 6. PROCEDIMIENTO

### 6.1. Revision de la Orden de Produccion

1. CALIDAD: Recibir la Orden de Produccion del Jefe de Produccion.
2. CALIDAD: Verificar que todas las materias primas listadas tienen ficha tecnica vigente con composicion garantizada.

### 6.2. Calculo de Verificacion del Grado

3. CALIDAD: Para cada nutriente declarado en el producto, aplicar la formula por cada materia prima que lo aporte:

   **Formula:**
   ```
   Aporte nutriente (%) = (Concentracion MP (%) × Cantidad MP (kg)) / 1000
   ```
   *(Si el lote es de 1 tonelada = 1000 kg. Ajustar denominador al tamano del lote en kg.)*

4. CALIDAD: Sumar los aportes de todas las materias primas para cada nutriente:

   ```
   Grado calculado nutriente (%) = Σ Aportes de todas las MPs que lo contienen
   ```

5. CALIDAD: Repetir para cada nutriente declarado en el Registro ICA del producto.

### 6.3. Verificacion del Resultado

6. CALIDAD: Comparar el grado calculado con el grado declarado en el Registro ICA para cada nutriente.
7. SI COINCIDE: Aprobar la formulacion y registrar la conformidad. Autorizar inicio de fabricacion del lote.
8. SI NO COINCIDE: Detener el proceso. Revisar las cantidades de la Orden de Produccion y la composicion de las materias primas. Identificar el error y corregir la formulacion antes de continuar.

## 7. CRITERIOS DE CONTROL Y ACEPTACION

| PARAMETRO | CRITERIO | ACCION SI FALLA |
|:---|:---|:---|
| Grado calculado vs declarado ICA | Coincidencia para cada nutriente declarado | Detener. Revisar formulacion y composicion de MPs. |
| Composicion de MPs | Ficha tecnica vigente disponible para cada MP | No fabricar hasta tener la composicion garantizada. |
| Cantidades pesadas en planta | Corresponden exactamente a la Orden de Produccion | Corregir pesaje antes de mezclar. |

## 8. REGISTROS ASOCIADOS

- `Formato_Verificacion_Formulacion_V1.csv`: Tabla de calculo del grado por lote.

## 9. ANEXOS

### Ejemplo Práctico de Cálculo de Balance y Merma

## Caso Ejemplo: Producción de SULFAK 50 (Lote L-2026-0142)

### Datos de Entrada

| MATERIA PRIMA | CANTIDAD FORMULADA (kg) | CANTIDAD REAL DESPACHADA (kg) | DIFERENCIA (kg) |
|:---|:---:|:---:|:---:|
| Sulfato de Potasio | 500.0 | 501.2 | +1.2 |
| Cloruro de Potasio | 300.0 | 299.5 | -0.5 |
| Excipiente (Calcita) | 200.0 | 200.8 | +0.8 |
| **TOTAL ENTRADA** | **1,000.0** | **1,001.5** | **+1.5** |

### Datos de Salida

| SALIDA | CANTIDAD (kg) |
|:---|:---:|
| Producto Terminado envasado | 978.0 |
| Barreduras recolectadas (POE 3.18) | 8.5 |
| Contramuestras retenidas (POE 3.14) | 1.5 |
| Material retenido en equipos (estimado) | 3.0 |
| **TOTAL SALIDA** | **991.0** |

### Cálculo del Balance

```
Merma = Total Entrada Real - Total Salida
Merma = 1,001.5 - 991.0 = 10.5 kg

% Merma = (Merma / Total Entrada Real) × 100
% Merma = (10.5 / 1,001.5) × 100 = 1.05%
```

### Evaluación

| PARÁMETRO | VALOR | CRITERIO | RESULTADO |
|:---|:---:|:---:|:---:|
| **% Merma** | 1.05% | ≤ 2.0% | **CONFORME** |
| **Desviación de fórmula** | +0.15% | ≤ ±1.0% | **CONFORME** |

### Conclusión

El balance del Lote L-2026-0142 se encuentra dentro de los límites de tolerancia establecidos. **No requiere** investigación de desviación.

---

## Caso de Alerta: Merma > 2%

Si el resultado hubiera sido:

```
% Merma = 3.2%  →  EXCEDE TOLERANCIA
```

**Acciones obligatorias:**
1. **Detener** la línea y notificar al Jefe de Producción.
2. **Verificar** posibles fugas, derrames o errores de pesaje.
3. **Registrar** la desviación en el formato de No Conformidad.
4. **Escalar** a Dirección Técnica si la merma supera el 5%.

## 10. CONTROL DE CAMBIOS

| VERSION | FECHA | DESCRIPCION DEL CAMBIO |
|---|---|---|
