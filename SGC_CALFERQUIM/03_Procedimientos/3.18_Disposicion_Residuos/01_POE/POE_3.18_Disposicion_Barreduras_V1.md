# PROCEDIMIENTO OPERATIVO ESTANDARIZADO: DISPOSICION DE BARREDURAS Y RESIDUOS DE PROCESO

| CODIGO | VERSION | VIGENCIA | PROXIMA REVISION |
|---|---|---|---|
| POE-3.18 | 02 | 2026-03-04 | 12 meses o ante cambio regulatorio |

## 1. OBJETIVO

Definir el control integral de barreduras y residuos de proceso, desde su generacion hasta su disposicion final, para garantizar cumplimiento ICA, trazabilidad documental y prohibicion absoluta de reutilizacion en producto comercial.

## 2. ALCANCE

Aplica a Produccion, Envase, Almacen MP, Almacen PT, Control de Calidad y Gestion Ambiental para todo residuo solido o liquido generado en planta.

## 3. DEFINICIONES

- Barredura: material recolectado de pisos, equipos o superficies despues de operaciones de proceso.
- Residuo de proceso: material no conforme, empaque contaminado, polvo de filtros, lodos o liquidos de lavado.
- Disposicion final: tratamiento externo o interno autorizado, con evidencia verificable.
- Gestor autorizado: empresa con licencia vigente para transporte y disposicion de residuos.

## 4. DOCUMENTOS DE REFERENCIA

- Propuesta de resolucion ICA (pv0), Anexo I-B, Pilar 10.
- Decreto 1076 de 2015 y normativa ambiental aplicable.
- POE-3.14 Contramuestras.
- POE-3.05 Balance de materias primas.

## 5. POLITICA CRITICA GMP

Se prohibe de forma expresa e indelegable reincorporar barreduras, polvo de piso, residuos de limpieza, contramuestras vencidas o material degradado al producto para venta o a lotes en proceso destinados a venta. Cualquier incumplimiento se trata como no conformidad critica.

## 6. RESPONSABILIDADES

- Produccion: asegurar segregacion correcta, pesaje real y entrega al area temporal.
- Calidad: verificar clasificacion, evidencias y cierre mensual de trazabilidad.
- Gestion Ambiental: coordinar retiro con gestor autorizado y custodiar certificados.
- Direccion Tecnica: aprobar acciones ante hallazgos criticos y definir contencion.

## 7. PROCEDIMIENTO

### 7.1 Recoleccion y segregacion

1. Operario recolecta residuos al cierre de turno y despues de cambios de producto.
2. Operario clasifica segun `ANX_3.18_01_Clasificacion_Residuos.md`.
3. Operario pesa cada fraccion y registra en `Formato_Control_Disposicion_Residuos_V1.csv`.
4. Operario rotula cada contenedor con fecha, area, tipo de residuo, lote origen (si aplica) y responsable.

### 7.2 Almacenamiento temporal controlado

5. Residuos se trasladan al area de acopio temporal senalizada.
6. Tiempo maximo de permanencia: 48 horas para residuos de proceso y 30 dias para acumulacion consolidada documentada.
7. Contenedores deben permanecer cerrados, identificados y sin mezcla de categorias.

### 7.3 Disposicion final

8. Gestion Ambiental programa retiro al 80% de capacidad o antes del limite de tiempo.
9. Solo se entrega a gestores con licencia ambiental vigente aprobados por Direccion Tecnica.
10. Cada salida exige manifiesto y certificado/acta de disposicion final.
11. Gestion Ambiental registra cierre en `Registro_Disposicion_Residuos_V1.csv`.

### 7.4 Verificacion y cierre

12. Calidad realiza conciliacion mensual entre:
    - residuos generados (formato),
    - residuos entregados (registro),
    - evidencia documental (manifiestos/certificados).
13. Si hay diferencia no justificada > 2%, se abre no conformidad y plan de accion.

### 7.5 Manejo de desviaciones criticas

14. Si se detecta intento de reincorporacion de barreduras:
    - detener operacion asociada,
    - inmovilizar lote comprometido,
    - abrir no conformidad critica,
    - escalar a Direccion Tecnica para decision.

## 8. CRITERIOS DE CONTROL

| Parametro | Criterio |
|---|---|
| Segregacion | 100% de residuos clasificados y rotulados |
| Pesaje | 100% con peso registrado por evento |
| Evidencia de salida | 100% con manifiesto y certificado |
| Reutilizacion barreduras | 0 eventos permitidos |
| Conciliacion mensual | Diferencia max. 2% con causa documentada |

## 9. REGISTROS ASOCIADOS

- `Formato_Control_Disposicion_Residuos_V1.csv`
- `Registro_Disposicion_Residuos_V1.csv`

## 10. ANEXOS

### Clasificación Técnica de Residuos y Barreduras

| CODIGO | POE ASOCIADO | VERSION |
|---|---|---|
| CGC-POE-3.18-ANX-01 | POE-3.18 | 02 |

## Instrucciones

Esta tabla es de uso obligatorio para segregacion, rotulado y disposicion. No se permite mezclar categorias ni reclasificar residuos sin autorizacion de Calidad.

## Clasificacion

| CODIGO | TIPO DE RESIDUO | ORIGEN TIPICO | CONTENEDOR | DESTINO FINAL AUTORIZADO |
|---|---|---|---|---|
| R-01 | Barredura de piso y polvo de limpieza | Molienda, mezcla, envase | Azul | Disposicion externa autorizada (sin reutilizacion) |
| R-02 | Producto no conforme no recuperable | Proceso y calidad | Azul | Disposicion externa autorizada |
| R-03 | Empaques contaminados | Envase, bodega | Gris | Gestor autorizado |
| R-04 | Polvo de filtros/ciclones contaminado | Captacion de polvo | Azul | Disposicion externa autorizada |
| R-05 | Contramuestras vencidas | Muestroteca | Azul | Disposicion externa autorizada |
| R-06 | Residuos liquidos de lavado | Limpieza equipos | Rojo | Tratamiento con gestor autorizado |
| R-07 | Ordinarios no peligrosos | Oficinas y servicios | Verde | Recoleccion municipal |
| R-08 | Peligrosos (RESPEL) | Mantenimiento/lab | Rojo | Gestor RESPEL autorizado |
| R-09 | Reciclable limpio | Recepcion/bodega | Blanco | Reciclaje autorizado |

## Reglas de segregacion

| REGLA | DESCRIPCION |
|---|---|
| Prohibicion absoluta | R-01, R-02, R-04 y R-05 no se reincorporan a proceso de venta |
| Pesaje obligatorio | Todo residuo de proceso se pesa y registra por evento |
| Rotulado minimo | Fecha, area, responsable, tipo y peso |
| Trazabilidad | Toda salida requiere manifiesto y certificado de disposicion |
| Frecuencia minima | Recoleccion al cierre de cada turno y en cada cambio de producto |

## Limites de acumulacion

- Residuos de proceso (R-01 a R-05): maximo 500 kg o 30 dias, lo que ocurra primero.
- Al superar un limite, Gestion Ambiental programa retiro inmediato.

## 11. CONTROL DE CAMBIOS

| VERSION | FECHA | DESCRIPCION |
|---|---|---|
| 01 | 2026-02-17 | Emision inicial. |
| 02 | 2026-03-04 | Se fortalece prohibicion de reutilizacion, trazabilidad y control de disposicion final. |

