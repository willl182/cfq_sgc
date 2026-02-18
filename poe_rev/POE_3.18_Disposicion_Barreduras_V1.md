# PROCEDIMIENTO OPERATIVO ESTANDARIZADO: DISPOSICIÓN DE BARREDURAS Y RESIDUOS

| CÓDIGO | VERSIÓN | VIGENCIA | PRÓXIMA REVISIÓN |
|
|
|
|
|
| **CGC-POE-3.18** | **01** | **2026-02-17** | **12 meses o ante cambio regulatorio** |

---

## 1. OBJETIVO

Establecer la metodología para la recolección, segregación, almacenamiento temporal y disposición final de barreduras y residuos sólidos/líquidos generados en las áreas de producción, envase y almacenamiento, garantizando su correcta clasificación y evitando la contaminación cruzada o reutilización indebida.

## 2. ALCANCE

Aplica a todas las áreas operativas de la planta: Producción, Envase, Almacén de MP, Almacén de PT y Zona de Despachos.

## 3. DEFINICIONES

*   **Barredura:** Material particulado (polvo, finos, residuos de limpieza) recolectado del piso, equipos o superficies.
*   **Residuo Sólido No Peligroso:** Material de desecho sin características de peligrosidad.
*   **Residuo Líquido:** Aguas de lavado de equipos, condensados, derrames menores contenidos.
*   **Gestor Autorizado:** Empresa terceros con licencia ambiental para transporte y disposición final.

## 4. DOCUMENTOS DE REFERENCIA

*   **Resolución ICA pv0 (Propuesta):** Anexo I-B, Pilar 10 "Manejo de Residuos/Barreduras".
*   **Decreto 1076 de 2015:** Gestión de residuos sólidos.

## 4.1. CONSIDERACIONES GMP

**SE PROHÍBE EXPRESAMENTE** la reincorporación de barreduras o residuos al proceso productivo de Fertilizantes o Acondicionadores destinados a comercialización. Esta es una regla crítica de cumplimiento. El incumplimiento constituye una No Conformidad Crítica y puede generar sanciones legales severas por fraude al consumidor.

## 5. RESPONSABILIDADES Y POLÍTICAS (Estilo Opus)

### 5.1. Jefe de Producción
*   **Debe** asegurar que los contenedores de residuos estén identificados y disponibles en cada área.
*   **Es responsable** de la cuantificación exacta (peso real, no "aproximado") de las barreduras generadas.

### 5.2. Operarios de Limpieza
*   **Deben** segregar los residuos en los contenedores correctos según la clasificación del Anexo 1.
*   **Se prohíbe** mezclar residuos de diferente origen en el mismo contenedor.

### 5.3. Responsable Ambiental
*   **Debe** coordinar la disposición final con el gestor autorizado y archivar los certificados de disposición.

### 5.4. Control de Calidad
*   **Debe** auditar mensualmente que no exista reincorporación de residuos al producto comercial.

## 6. PROCEDIMIENTO (Estilo GLM-4.7)

### 6.1. Generación y Segregación

1.  **OPERARIO:** **Recolectar** barreduras y residuos durante la limpieza rutinaria al final de cada turno.
2.  **OPERARIO:** **Segregar** en contenedores rotulados:
    *   Contenedor A: Barreduras de Área de Producción (polvo de materia prima).
    *   Contenedor B: Residuos de Envase (sacos rotos, etiquetas defectuosas).
    *   Contenedor C: Residuos de Limpieza (trapos, material absorbente).
3.  **OPERARIO:** **Pesar** el contenido de cada contenedor y **registrar** en `Registro_Disposicion_Residuos_V1.csv` (Fecha, Área, Tipo, Peso kg).

### 6.2. Almacenamiento Temporal

4.  **OPERARIO:** **Trasladar** los contenedores sellados al área de almacenamiento temporal de residuos (Zona Techada).
5.  **PRODUCCIÓN:** **No almacenar** más de **48 horas**. Acumulo prolongado genera riesgo sanitario y de contaminación.

### 6.3. Residuos Líquidos (Lavados)

6.  **OPERARIO:** **Recolectar** las aguas de lavado en trampa de sólidos antes de verter al sistema de drenaje (si aplica).
7.  **OPERARIO:** **No verter** residuos químicos al drenaje sin tratamiento previo.

### 6.4. Disposición Final

8.  **GESTIÓN AMBIENTAL:** **Coordinar** el retiro de residuos al gestor autorizado cada semana o cuando los contenedores alcancen el 80% de capacidad.
9.  **GESTIÓN AMBIENTAL:** **Exigir** y archivar el Certificado de Disposición Final (Remisión, Factura o Certificado).

## 7. CRITERIOS DE CONTROL

| Hallazgo | Severidad | Acción |
|:---|:---|:---|
| Reincorporación de barredura a producto comercial | **CRÍTICA** | Investigar, aislar producto, reportar a ICA. |
| Ausencia de evidencia de disposición | **ALTA** | Abrir NC, gestionar evidencia faltante. |
| Mezcla de residuos incompatibles | **MEDIA** | Re-clasificar y capacitar personal. |

## 8. REGISTROS ASOCIADOS

*   `Formato_Control_Disposicion_Residuos_V1.csv`
*   `Registro_Disposicion_Residuos_V1.csv`

## 9. ANEXOS

*   **Anexo 1:** Clasificación de Residuos por Origen.
*   **Anexo 2:** Lista de Gestores Autorizados.

## 10. CONTROL DE CAMBIOS

| Versión | Fecha | Descripción |
|

