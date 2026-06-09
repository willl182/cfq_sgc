# Diagrama de flujo: Ordenes de compra, tracking y tablero tipo aeropuerto

```mermaid
flowchart LR
    A[Solicitud de compra] --> B{Validacion inicial}
    B -->|Completa| C[Creacion de orden de compra]
    B -->|Incompleta| B1[Devolver a comercial / compras]
    B1 --> A

    C --> D{Aprobacion}
    D -->|Aprobada| E[Enviar orden al proveedor]
    D -->|Rechazada| C1[Ajustar datos / presupuesto]
    C1 --> C

    E --> F[Confirmacion del proveedor]
    F --> G[Programacion de despacho]
    G --> H[Salida del pedido]
    H --> I[En transito]
    I --> J[Recepcion en destino]
    J --> K[Verificacion contra orden]
    K -->|Conforme| L[Cerrar orden]
    K -->|No conforme| M[Gestion de incidencia]
    M --> N[Reclamo / devolucion / ajuste]
    N --> K

    subgraph T[Tablero de control tipo aeropuerto]
        T1[Check-in: orden creada]
        T2[Gate: en aprobacion]
        T3[Boarding: enviada al proveedor]
        T4[Takeoff: despachada]
        T5[In flight: en transito]
        T6[Landed: recibida]
        T7[Arrived: cerrada]
        T8[Alertas: retraso, faltante, no conformidad]
    end

    C -.-> T1
    D -.-> T2
    E -.-> T3
    H -.-> T4
    I -.-> T5
    J -.-> T6
    L -.-> T7
    M -.-> T8

    style A fill:#E8F4FF,stroke:#1B4D89,stroke-width:1px
    style C fill:#EAF7EA,stroke:#2E7D32,stroke-width:1px
    style E fill:#FFF4E5,stroke:#C77700,stroke-width:1px
    style H fill:#FDECEC,stroke:#C62828,stroke-width:1px
    style I fill:#EDE7F6,stroke:#5E35B1,stroke-width:1px
    style J fill:#E0F2F1,stroke:#00897B,stroke-width:1px
    style L fill:#E8F5E9,stroke:#2E7D32,stroke-width:1px
    style M fill:#FFEBEE,stroke:#B71C1C,stroke-width:1px
    style T fill:#FAFAFA,stroke:#616161,stroke-width:1px,stroke-dasharray: 4 3
```

## Lectura rapida

- `Solicitud de compra`: entra la necesidad.
- `Validacion inicial`: se revisa si la informacion esta completa.
- `Orden de compra`: se crea y se manda a aprobar.
- `Proveedor`: recibe, confirma y programa despacho.
- `Tracking`: la orden pasa por estados operativos hasta recepcion.
- `Cierre`: si todo coincide, se cierra; si no, se abre incidencia.

## Estados del tablero tipo aeropuerto

- `Check-in`: orden creada.
- `Gate`: en aprobacion.
- `Boarding`: enviada al proveedor.
- `Takeoff`: despachada.
- `In flight`: en transito.
- `Landed`: recibida.
- `Arrived`: cerrada.
- `Alertas`: retrasos, faltantes, devoluciones o no conformidades.

## Siguiente paso sugerido

Si quieres, puedo convertir esto en una version mas ejecutiva para gerencia, o en una version operativa con responsables por area: Compras, Comercial, Bodega, Logistica, Calidad y Finanzas.
