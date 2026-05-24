# PROCEDIMIENTO OPERATIVO ESTÁNDAR

## TRAZABILIDAD DE PRODUCTOS

---

**Código:** POE 3.13  
**Versión:** 1.0  
**Fecha de emisión:** 2026-05-19  
**Aprobado por:** [Nombre del Gerente/Director Técnico]  
**Área:** Producción, Calidad, Almacén, Ventas

---

## 1. OBJETIVO

Establecer el procedimiento para garantizar la trazabilidad de los productos fabricados por CALFERQUIM S.A.S., permitiendo seguir el recorrido de un lote específico desde la recepción de materias primas hasta la entrega al cliente final.

## 2. ALCANCE

Este procedimiento aplica a:
- Todas las materias primas recibidas
- Todos los productos en proceso de fabricación
- Todos los productos terminados
- Todos los lotes liberados para venta
- Todos los registros de despacho a clientes

## 3. DEFINICIONES

**Trazabilidad:** Capacidad para seguir el historial, la aplicación o la ubicación de un producto mediante registros identificados.

**Lote:** Cantidad definida de producto fabricado en un proceso de producción continuo o discontinuo, identificado con un código único.

**Codificación de lote:** Sistema alfanumérico que identifica: Producto-Fecha-Secuencia (ej: 25-4-24-250519-A).

**Cadena de trazabilidad:** Secuencia completa desde proveedor → MP → Producción → PT → Cliente.

## 4. RESPONSABILIDADES

| Rol | Responsabilidad |
|-----|-----------------|
| **Jefe de Producción** | Asegurar el registro de lotes en producción, mantener registros de mezclas |
| **Jefe de Calidad** | Verificar la trazabilidad en liberación de lotes, mantener registros de análisis vinculados a lotes |
| **Jefe de Almacén** | Registrar entrada/salida de MP y PT con números de lote, ubicación física |
| **Vendedor/Despachos** | Registrar cliente, cantidad y lote entregado en cada factura/remisión |
| **Regencia/Calidad** | Mantener el sistema de trazabilidad, auditar cumplimiento, investigar desviaciones |

## 5. DESARROLLO DEL PROCEDIMIENTO

### 5.1 TRAZABILIDAD DE MATERIAS PRIMAS (HACIA ATRÁS)

#### 5.1.1 Recepción de Materias Primas
1. Al recibir MP, solicitar al proveedor:
   - Nombre del producto
   - Número de lote del proveedor
   - Fecha de fabricación
   - Fecha de vencimiento
   - Certificado de análisis (cuando aplique)

2. Registrar en **RC-SI50 Recepción Materias Primas**:
   - Fecha de recepción
   - Proveedor
   - Nombre de MP
   - Lote del proveedor
   - Cantidad recibida
   - Número de lote interno asignado (código CALFERQUIM)

3. Etiquetar todo bulto/contenedor con:
   - Código de lote interno (ej: AC-250519-01)
   - Nombre de MP
   - Fecha de recepción
   - Estado: Cuarentena / Aprobado / Rechazado

#### 5.1.2 Almacenamiento de MP
1. Ubicar MP en zona designada según estado
2. Registrar en **RC-SI55 Kardex de Almacén** la ubicación física
3. Mantener separación por lotes (no mezclar lotes de diferentes proveedores o fechas)

#### 5.1.3 Liberación de MP
1. El laboratorio analiza según plan de muestreo
2. En **RC-SI56 Control de Calidad MP**, registrar:
   - Lote interno de MP
   - Resultados de análisis
   - Decisión: Aprobado / Rechazado / Acondicionar
3. Solo usar MP con estado "Aprobado" en producción

### 5.2 TRAZABILIDAD EN PRODUCCIÓN

#### 5.2.1 Preparación de Mezclas
1. Para cada orden de producción, registrar en **RC-SI04 Registro de Mezclas**:
   - Número de orden de producción
   - Producto a fabricar
   - Cantidad a producir
   - Fecha y hora de inicio

2. Para cada MP adicionada, registrar:
   - Nombre de MP
   - Lote interno de MP utilizado
   - Cantidad utilizada
   - Firma del operario

3. Ejemplo de registro:
   ```
   Producto: 25-4-24
   Orden: OP-250519-15
   
   MP utilizadas:
   - Urea: Lote U-250510-03, 450 kg
   - DAP: Lote D-250515-02, 320 kg
   - KCl: Lote K-250512-01, 280 kg
   - Roca Fosfórica: Lote RF-250508-04, 150 kg
   ```

#### 5.2.2 Proceso de Fabricación
1. Mantener identificación del lote en proceso en cada etapa:
   - Mezclado: Identificar contenedor/tolva
   - Granulación: Registrar parámetros vinculados al lote
   - Secado: Registrar temperaturas y tiempos
   - Enfriamiento: Registrar temperatura final
   - Clasificación: Registrar granulometría obtenida

2. En caso de reproceso o ajuste, registrar:
   - Motivo del ajuste
   - MP adicionada (con su lote)
   - Cantidad
   - Nueva identificación si aplica

#### 5.2.3 Codificación de Lote Final
1. Asignar código de lote único siguiendo formato:
   ```
   [COD-PRODUCTO]-[AAMM]-[SECUENCIA]
   
   Ejemplos:
   - 25-4-24-2505-A (Primer lote del 25-4-24 en mayo 2025)
   - 25-4-24-2505-B (Segundo lote)
   - CALFERZINC-2505-01 (Producto con nombre comercial)
   ```

2. Registrar en **RC-SI12 Codificación de Lotes**:
   - Código de lote asignado
   - Producto
   - Fecha de fabricación
   - Cantidad producida
   - Orden de producción vinculada

### 5.3 TRAZABILIDAD DE PRODUCTO TERMINADO

#### 5.3.1 Almacenamiento de PT
1. Identificar cada palet/bulto con etiqueta que incluya:
   - Nombre del producto
   - Código de lote
   - Fecha de fabricación
   - Fecha de vencimiento (si aplica)
   - Cantidad

2. Registrar en **RC-SI53 Traslado Producto Terminado**:
   - Ubicación en almacén
   - Fecha de ingreso
   - Cantidad
   - Estado: Cuarentena / Liberado / Bloqueado

#### 5.3.2 Liberación de Lotes
1. El laboratorio analiza muestra representativa
2. En **RC-SI14 Liberación de Lotes**, registrar:
   - Código de lote
   - Resultados de análisis NPK y físico-químicos
   - Decisión de liberación
   - Fecha de liberación
   - Firma del responsable

3. Solo despachar lotes con estado "Liberado"

### 5.4 TRAZABILIDAD HACIA ADELANTE (CLIENTE)

#### 5.4.1 Registro de Despachos
1. En cada factura/remisión, registrar obligatoriamente:
   - Nombre del cliente
   - Fecha de despacho
   - Producto entregado
   - Código de lote entregado
   - Cantidad entregada
   - Número de factura/remisión

2. Ejemplo de registro completo:
   ```
   Factura: FV-15042
   Fecha: 20/05/2025
   Cliente: Agroindustrias del Valle S.A.S.
   
   Productos despachados:
   1. 25-4-24, Lote: 25-4-24-2505-A, 50 bultos
   2. 18-18-18, Lote: 18-18-18-2505-C, 30 bultos
   ```

#### 5.4.2 Archivo de Trazabilidad
1. Mantener registro consolidado en **RC-SI57 Trazabilidad de Ventas**:
   - Fecha
   - Cliente
   - Producto
   - Lote
   - Cantidad
   - Factura

2. Conservar copia de factura con lote marcado legiblemente

## 6. SISTEMA DE CONSULTA Y RECUPERACIÓN

### 6.1 Consulta de Trazabilidad Hacia Atrás
Dado un lote de PT, se debe poder determinar:
- Fecha de fabricación
- Cantidad producida
- MP utilizadas (con sus lotes)
- Proveedores de cada MP
- Análisis de calidad de MP
- Parámetros de proceso
- Resultados de análisis del PT

**Tiempo máximo de respuesta:** 4 horas

### 6.2 Consulta de Trazabilidad Hacia Adelante
Dado un lote de MP, se debe poder determinar:
- Qué lotes de PT la utilizaron
- Qué clientes recibieron esos lotes de PT
- Fechas de entrega
- Cantidades entregadas

**Tiempo máximo de respuesta:** 8 horas

### 6.3 Mecanismo de Bloqueo
Si se detecta una MP no conforme:
1. Bloquear inmediatamente el inventario de esa MP
2. Identificar todos los lotes de PT que la utilizaron
3. Bloquear esos lotes de PT (si aún en almacén)
4. Identificar clientes que recibieron esos lotes
5. Iniciar **Procedimiento de Retiro de Producto** si es necesario

## 7. REGISTROS RELACIONADOS

| Código | Nombre del Registro | Responsable |
|--------|---------------------|-------------|
| RC-SI50 | Recepción Materias Primas | Almacén |
| RC-SI55 | Kardex de Almacén | Almacén |
| RC-SI56 | Control de Calidad MP | Laboratorio |
| RC-SI04 | Registro de Mezclas | Producción |
| RC-SI12 | Codificación de Lotes | Producción/Calidad |
| RC-SI53 | Traslado Producto Terminado | Almacén |
| RC-SI14 | Liberación de Lotes | Laboratorio |
| RC-SI57 | Trazabilidad de Ventas | Ventas |

## 8. FRECUENCIA DE REVISIÓN

- **Auditoría interna:** Trimestral (verificar que se cumple el procedimiento)
- **Simulacro de trazabilidad:** Semestral (realizar ejercicio completo con un lote seleccionado aleatoriamente)
- **Revisión del procedimiento:** Anual o ante cambio normativo

## 9. REFERENCIAS NORMATIVAS

- Resolución ICA (propuesta pv0) - Anexo I-A: Trazabilidad
- ISO 9001:2015 - Control de producto no conforme
- BPM (Buenas Prácticas de Manufactura) - Trazabilidad

## 10. HISTORIAL DE CAMBIOS

| Versión | Fecha | Descripción | Aprobó |
|---------|-------|-------------|--------|
| 1.0 | 2026-05-19 | Emisión inicial | [Nombre] |

---

**FIN DEL PROCEDIMIENTO**
