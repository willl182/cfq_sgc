# ANEXO 1 - POE 3.05: EJEMPLO DE CÁLCULO DE BALANCE DE MATERIAS PRIMAS

| CÓDIGO | POE ASOCIADO | VERSIÓN |
|:---:|:---:|:---:|
| **CGC-POE-3.05-ANX-01** | **CGC-POE-3.05** | **01** |

---

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
