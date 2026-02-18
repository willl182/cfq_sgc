# ANEXO 1 - POE 3.19: FLUJO DE APROBACIÓN DE FORMULACIONES TERCEROS

| CÓDIGO | POE ASOCIADO | VERSIÓN |
|:---:|:---:|:---:|
| **CGC-POE-3.19-ANX-01** | **CGC-POE-3.19** | **01** |

---

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
