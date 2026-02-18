# ANEXO 2 - POE 3.14: PLANO DE UBICACIÓN DE LA MUESTROTECA

| CÓDIGO | POE ASOCIADO | VERSIÓN |
|:---:|:---:|:---:|
| **CGC-POE-3.14-ANX-02** | **CGC-POE-3.14** | **01** |

---

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
