# PROCEDIMIENTO OPERATIVO ESTANDARIZADO: FORMULACIONES PARA TERCEROS (Toll Manufacturing)

| CÓDIGO | VERSIÓN | VIGENCIA | PRÓXIMA REVISIÓN |
|
|
|
|
|
| **CGC-POE-3.19** | **01** | **2026-02-17** | **12 meses o ante cambio regulatorio** |

---

## 1. OBJETIVO

Establecer el flujo formal para la recepción, evaluación, aprobación y control de formulaciones fabricadas por **CALFERQUIM S.A.S.** para terceros (tolling manufacturing), garantizando trazabilidad, confidencialidad y cumplimiento regulatorio.

## 2. ALCANCE

Aplica a toda formulación (producto fertilizante o acondicionador) fabricada bajo especificaciones técnicas de un cliente diferente a CALFERQUIM, donde la titularidad del registro ICA puede ser del tercero o de CALFERQUIM.

## 3. DEFINICIONES

*   **Tercero (Cliente Toll):** Persona natural o jurídica que solicita la fabricación de un producto bajo su marca o especificaciones.
*   **Formulación Controlada:** Documento técnico oficial que detalla la composición, proceso productivo, controles de calidad y empaque.
*   **Viabilidad Regulatoria:** Evaluación técnica que determina si el producto puede ser fabricado legalmente (Registro ICA, restricciones de ingredientes).

## 4. DOCUMENTOS DE REFERENCIA

*   **Resolución ICA pv0 (Propuesta):** Anexo I-B, Pilar 13 (Trazabilidad).
*   **Contrato Comercial Vigente con el Tercero.**

## 4.1. CONSIDERACIONES GMP

**SE PROHÍBE** fabricar cualquier lote para terceros sin la formulación aprobada y registrada formalmente por Dirección Técnica. La existencia de un contrato comercial **no sustituye** la aprobación técnica. Todo cambio en la formulación, incluso si lo solicita el cliente, debe pasar por el control de cambios antes de implementarse.

## 5. RESPONSABILIDADES Y POLÍTICAS (Estilo Opus)

### 5.1. Director Técnico
*   **Debe** evaluar la viabilidad regulatoria (Registro ICA del tercero, restricciones de metales pesados, composición NPK).
*   **Es responsable** de aprobar o rechazar formalmente cada formulación.
*   **Tiene la autoridad** para detener la fabricación si detecta desviaciones no autorizadas.

### 5.2. Comercial / Área Comercial
*   **Debe** recibir y documentar la solicitud técnica del tercero.
*   **No puede** prometer tiempos de fabricación sin visto bueno de Producción.

### 5.3. Producción
*   **Se prohíbe** iniciar fabricación sin tener en su poder la última versión de la formulación aprobada y firmada.

### 5.4. Control de Calidad
*   **Debe** verificar que el producto cumpla las especificaciones acordadas antes de la liberación.

## 6. PROCEDIMIENTO (Estilo GLM-4.7)

### 6.1. Recepción de Solicitud

1.  **COMERCIAL:** **Recibir** solicitud formal del tercero (Especificaciones técnicas, fórmula, empaque solicitado).
2.  **COMERCIAL:** **Entregar** la documentación a Dirección Técnica para evaluación.

### 6.2. Evaluación y Aprobación

3.  **DIRECCIÓN TÉCNICA:** **Evaluar** viabilidad:
    *   ¿El tercero tiene Registro ICA vigente (si comercializa bajo su nombre)?
    *   ¿La formulación cumple requisitos pv0 (metales pesados, NPK mínimo)?
    *   ¿Se cuenta con capacidad de producción y materia prima?
4.  **DIRECCIÓN TÉCNICA:**
    *   *SI APRUEBA:* **Asignar** código interno (ej: FT-2026-001) y crear documento de Formulación Controlada. Firmar aprobación.
    *   *SI RECHAZA:* **Notificar** a Comercial con justificación técnica.

### 6.3. Control de Versiones

5.  **DIRECCIÓN TÉCNICA:** **Registrar** la nueva formulación en `Registro_Control_Cambios_Formulacion_Tercero_V1.csv`.
6.  **PRODUCCIÓN:** **Archivar** copia de la formulación vigente en carpeta de producción.

### 6.4. Fabricación y Trazabilidad

7.  **PRODUCCIÓN:** **Fabricar** el lote siguiendo la formulación vigente.
8.  **CALIDAD:** **Verificar** cumplimiento de especificaciones y registrar resultados.
9.  **CALIDAD:** **Liberar** o rechazar el lote (POE 3.12).
10. **COMERCIAL:** **Coordinar** entrega al tercero con información de trazabilidad (Lote, Cantidad, Fecha).

## 7. CRITERIOS DE CONTROL

| Control | Requisito |
|:---|:---|
| Aprobación Técnica | Obligatoria antes de fabricar. |
| Registro ICA del Tercero | Vigente si el producto se vende bajo nombre del tercero. |
| Control de Cambios | Todo cambio de fórmula requiere nueva aprobación. |
| Trazabilidad | Cada lote debe poder relacionarse con cliente, fórmula versionada y resultados. |

## 8. REGISTROS ASOCIADOS

*   `Formato_Solicitud_Formulacion_Tercero_V1.csv`
*   `Registro_Control_Cambios_Formulacion_Tercero_V1.csv`

## 9. ANEXOS

### Flujograma de Aprobación Técnica de Formulaciones a Terceros

## Flujo de Aprobación

```
INICIO: Solicitud de Tercero
    │
    ▼
[1] ¿Formulación propuesta completa y técnica?
    ├── NO → Solicitar aclaraciones o completar datos al Cliente.
    │
    ▼ SÍ
[2] ¿Cliente tiene contrato comercial vigente y NDA firmado?
    ├── NO → Detener proceso hasta formalización legal (Comercial).
    │
    ▼ SÍ
[3] ¿Formulación cumple viabilidad técnica/regulatoria? (Dirección Técnica)
    *   Ingredientes permitidos.
    *   No exceden límites metales pesados.
    *   Compatibilidad química y física.
    *   Equipo de planta disponible.
    ├── NO → Rechazar solicitud o proponer ajuste. Notificar Cliente.
    │
    ▼ SÍ
[4] ¿Prueba piloto necesaria?
    ├── SÍ → Programar y ejecutar lote piloto (Producción + Calidad).
    │   └── ¿Resultado piloto satisfactorio?
    │       ├── NO → Ajustar formulación. Repetir piloto (máx 2 veces).
    │       │   └── Si falla → Cancelar proyecto.
    │       └── SÍ → Continuar.
    │
    ▼ NO (Si es repetición o estándar conocido)
[5] ¿Registro ICA y etiqueta aprobada existen?
    ├── NO → Gestionar Registro ICA (Cliente o CALFERQUIM).
    │
    ▼ SÍ
[6] APROBACIÓN FINAL - Dirección Técnica
    *   Firma de Formulación Maestra Controlada.
    *   Asignación de Código Interno de Producto.
    *   Creación de especificaciones de calidad y proceso.
    │
    ▼
    FIN: Producto listo para programar producción.
```

## Tiempos Estimados

| ETAPA | TIEMPO ESTÁNDAR | RESPONSABLE |
|:---|:---:|:---|
| Evaluación técnica inicial | 3 días hábiles | Dirección Técnica |
| Prueba piloto (si aplica) | 5-10 días hábiles | Producción / Calidad |
| Gestión Registro ICA (si aplica) | 3-6 meses (variable ICA) | Asuntos Regulatorios |
| Aprobación final y codificación | 2 días hábiles | Dirección Técnica |

## Documentos Generados

1.  **Formulación Maestra Controlada:** Documento oficial de producción.
2.  **Especificación de Producto Terminado:** Criterios de calidad para liberación.
3.  **Hoja de Seguridad (FDS):** Si el producto es nuevo, debe generarse.
4.  **Etiqueta Aprobada:** Arte final con Registro ICA.

> **Regla:** Ningún cambio en la formulación, por mínimo que sea, puede implementarse en planta sin reiniciar este flujo desde el paso [3] (Evaluación técnica).

## 10. CONTROL DE CAMBIOS

| Versión | Fecha | Descripción |
|

