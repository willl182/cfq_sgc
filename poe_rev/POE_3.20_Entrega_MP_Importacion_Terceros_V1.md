# PROCEDIMIENTO OPERATIVO ESTANDARIZADO: ENTREGA DE MATERIAS PRIMAS IMPORTADAS PARA TERCEROS

| CÓDIGO | VERSIÓN | VIGENCIA | PRÓXIMA REVISIÓN |
|
|
|
|
|
| **CGC-POE-3.20** | **01** | **2026-02-17** | **12 meses o ante cambio regulatorio** |

---

## 1. OBJETIVO

Establecer el flujo formal para la recepción, almacenamiento en custodia, y entrega de materias primas importadas que son propiedad de terceros, garantizando trazabilidad documental, segregación y conciliación de saldos.

## 2. ALCANCE

Aplica a las materias primas de origen importado que terceros almacenan en las instalaciones de **CALFERQUIM S.A.S.** para su posterior uso en fabricación o entrega directa. No aplica a materia prima propia de CALFERQUIM.

## 3. DEFINICIONES

*   **MP de Terceros:** Materia prima importada cuya propiedad y gestión corresponde a un cliente externo.
*   **Custodia:** Almacenamiento segregado y controlado donde CALFERQUIM actúa como guardián del material.
*   **Conciliación de Saldos:** Comparación periódica entre los registros de ingreso, salidas y el inventario físico.
*   **COA (Certificate of Analysis):** Certificado de análisis del proveedor que garantiza la calidad de la materia prima.

## 4. DOCUMENTOS DE REFERENCIA

*   **Resolución ICA pv0 (Propuesta):** Anexo I-B, Pilar 1 (Control de Proveedores).
*   **Decreto 390 de 2016 (DIAN):** Declaración de importación.

## 4.1. CONSIDERACIONES GMP

Las materias primas de terceros **deben** mantenerse físicamente segregadas de las de CALFERQUIM en todo momento. **Se prohíbe** utilizar materia prima de terceros para producción propia sin autorización expresa y escrita del dueño de la materia prima. Cualquier mezcla accidental debe reportarse inmediatamente como No Conformidad.

## 5. RESPONSABILIDADES Y POLÍTICAS (Estilo Opus)

### 5.1. Jefe de Logística / Almacén
*   **Debe** mantener un inventario separado y específico para cada tercero.
*   **Es responsable** de la custodia y seguridad del material ajeno.

### 5.2. Control de Calidad
*   **Debe** verificar el COA (Certificate of Analysis) de la materia prima al ingreso.
*   **Tiene la autoridad** para rechazar material que no cumpla especificaciones.

### 5.3. Dirección Técnica
*   **Debe** aprobar cualquier cesión o uso del material de terceros para fines diferentes a los acordados.

## 6. PROCEDIMIENTO (Estilo GLM-4.7)

### 6.1. Recepción e Ingreso

1.  **LOGÍSTICA:** **Recibir** la remesa y verificar contra documentos de importación (Factura, Bill of Lading, Declaración DIAN).
2.  **LOGÍSTICA:** **Inspeccionar** estado de empaques (integridad, sellado, ausencia de contaminación).
3.  **CALIDAD:** **Verificar** el COA del proveedor y registrar en sistema.
4.  **LOGÍSTICA:** **Asignar** ubicación segregada en zona "MP TERCEROS - [NOMBRE DEL TERCERO]".
5.  **LOGÍSTICA:** **Registrar** ingreso en `Registro_Conciliacion_MP_Terceros_V1.csv` (Fecha, Proveedor, Tercero, Lote, Cantidad, Ubicación).

### 6.2. Custodia y Almacenamiento

6.  **ALMACÉN:** **Mantener** la MP en área limpia, seca y-rotulada.
7.  **ALMACÉN:** **No manipular** el material sin orden de trabajo del tercero o de Producción (si hay contrato de uso).

### 6.3. Entrega / Despacho a Terceros

8.  **LOGÍSTICA:** **Recibir** orden de salida del tercero (solicitud formal, contrato).
9.  **LOGÍSTICA:** **Verificar** que la solicitud coincida con el inventario disponible.
10. **LOGÍSTICA:** **Despachar** la cantidad solicitada y **registrar** la Salida en el mismo CSV.
11. **LOGÍSTICA:** **Obtener** firma de recibido del representante del tercero en el formato de entrega.

### 6.4. Conciliación de Saldos

12. **LOGÍSTICA:** **Realizar** conciliación semanal: Inventario Inicial + Ingresos - Salidas = Inventario Final.
13. **SI HAY DIFERENCIA:** **Investigar** causa (error de conteo, daño, robo) y reportar al tercero inmediatamente.

## 7. CRITERIOS DE CONTROL

| Control | Frecuencia | Acción si Falla |
|:---|:---|:---|
| Verificación de COA | Por remesa | Rechazar material si no cumple. |
| Conciliación de Saldos | Semanal + Mensual | Investigar y reportar diferencia. |
| Evidencia de Entrega | Por operación | No dar por cerrada la operación. |
| Segregación Física | Permanente | No Conformidad Crítica. |

## 8. REGISTROS ASOCIADOS

*   `Formato_Control_Entrega_MP_Terceros_V1.csv`
*   `Registro_Conciliacion_MP_Terceros_V1.csv`

## 9. ANEXOS

*   **Anexo 1:** Lista de Chequeo Documental de Ingreso.
*   **Anexo 2:** Modelo de Acta de Entrega.

## 10. CONTROL DE CAMBIOS

| Versión | Fecha | Descripción |
|

