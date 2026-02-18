# ANEXO 1 - POE 3.12: FLUJO DE DECISIÓN DE LIBERACIÓN DE LOTES

| CÓDIGO | POE ASOCIADO | VERSIÓN |
|:---:|:---:|:---:|
| **CGC-POE-3.12-ANX-01** | **CGC-POE-3.12** | **01** |

---

## Flujo de Decisión

```
INICIO: Lote Producido
    │
    ▼
[1] ¿Orden de Producción cerrada y completa?
    ├── NO → Devolver a Producción. Completar documentación.
    │
    ▼ SÍ
[2] ¿Balance de Materias Primas dentro de tolerancia (≤ 2%)?
    ├── NO → Investigar desviación (POE 3.05). Bloquear lote hasta cierre.
    │
    ▼ SÍ
[3] ¿Resultados fisicoquímicos cumplen especificación?
    ├── NO → ¿Es desviación menor?
    │         ├── SÍ → Evaluar reproceso o ajuste. Registrar.
    │         └── NO → RECHAZAR LOTE. Etiqueta ROJA.
    │
    ▼ SÍ
[4] ¿Control de peso/envase cumple tolerancias (Anexo 1 - POE 3.10)?
    ├── NO → Segregar unidades fuera de tolerancia. Re-pesar/re-envasar.
    │
    ▼ SÍ
[5] ¿Etiqueta coincide con Registro ICA aprobado?
    ├── NO → BLOQUEO TOTAL. No Conformidad Mayor. Re-etiquetar.
    │
    ▼ SÍ
[6] ¿Contramuestra tomada y registrada (POE 3.14)?
    ├── NO → Tomar contramuestra antes de liberar.
    │
    ▼ SÍ
[7] DECISIÓN FINAL - Jefe de Calidad:
    ├── APROBADO → Etiqueta VERDE. Liberar para despacho.
    ├── APROBADO CON OBSERVACIONES → Etiqueta AMARILLA. Liberar con restricciones.
    └── RECHAZADO → Etiqueta ROJA. Bloquear. Evaluar destino.
        │
        ▼
[8] Director Técnico valida decisión:
    ├── Confirma → Registrar en Formato de Liberación.
    └── Modifica → Justificar por escrito. Registrar.
        │
        ▼
    FIN: Lote con estado definido.
```

## Tiempos Máximos

| ETAPA | PLAZO MÁXIMO |
|:---|:---|
| Producción → entrega a Calidad | 24 horas tras cierre de lote |
| Calidad → emisión de resultados | 48 horas tras recepción |
| Resultados → decisión de liberación | 24 horas tras resultados |
| **Total máximo** | **4 días hábiles** |

> **Regla:** Ningún lote **puede** despacharse sin pasar por todas las etapas del flujo. El Jefe de Calidad es el único autorizado para emitir la decisión de liberación.
