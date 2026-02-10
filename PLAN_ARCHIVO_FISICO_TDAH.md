# Plan Archivo Fisico SGC (Modo Ejecutar Sin Pensar)

Version: 1.0  
Fecha: 2026-02-10  
Objetivo: dejar archivo fisico listo para visita ICA inminente usando Opcion B (Espejo Checklist ICA).

---

## 0) Reglas del plan

- No reorganizar estructura. Solo seguir este orden.
- No decidir durante ejecucion. Si dudas, usar la columna "Si no aparece".
- Todo lo que no se alcance va a una carpeta temporal llamada `PENDIENTE_REVISION`.
- Meta minima: dejar listos AZ 3A, 3B, 1 y 2 (esto cubre la parte mas auditada).

---

## 1) Calendario cerrado (tu disponibilidad real)

### Semana actual
- Hoy (dia completo): trabajo pesado 1
- Manana (dia completo): trabajo pesado 2
- Jueves, viernes, sabado: no trabajo

### Proxima semana
- Lunes completo: cierre principal
- Martes medio dia: ajuste 1
- Miercoles medio dia: ajuste 2
- Jueves medio dia: simulacro y cierre final

---

## 2) Materiales (gasto minimo)

Usar primero lo que ya tienes.

Necesario minimo:
- AZ basicos existentes
- Separadores (cartulina o plastico)
- Marcador negro
- Hojas blancas
- Carpeta temporal: `PENDIENTE_REVISION`

Si te falta algo, comprar solo esto:
1. 2 juegos de separadores
2. 1 paquete etiquetas pequenas
3. 10 fundas plasticas

---

## 3) Resultado esperado por dia

| Dia | Resultado obligatorio |
|---|---|
| Hoy | HS separadas MP/PT + paquete de impresion listo + AZ 3A y 3B armados |
| Manana | AZ 1, 2, 3C, 4, 5, 6 armados con separadores y contenido base |
| Lun prox | 22 dossiers iniciales armados (nivel base) |
| Mar prox (medio dia) | POE faltantes 3.05 y 3.14 impresos e insertados |
| Mie prox (medio dia) | POE faltantes 3.18, 3.19, 3.20 + hojas N/A |
| Jue prox (medio dia) | Simulacro Anexo I-B + lista de faltantes final |

---

## 4) HOY - Bloques exactos (dia completo)

## Bloque 1 (90 min): Clasificar HS sin pensar

Accion:
1. Crear dos pilas fisicas: `HS_MP` y `HS_PT`.
2. Regla unica:
   - Si menciona proveedor/quimico generico (DAP, MAP, Urea, CIAMSA, YARA, PQP): `HS_MP`
   - Si menciona producto comercial CALFERQUIM (CALFER..., TODERO, K2K, ZUELOCA, etc): `HS_PT`
3. Todo lo raro (jpg, documentos no HS): `PENDIENTE_REVISION`.

Meta:
- Dejar `HS_MP` separadas para AZ 1.2
- Dejar `HS_PT` separadas para dossiers

## Bloque 2 (120 min): Imprimir paquete critico ICA

Imprimir estos archivos (en este orden):

### Produccion y calidad (nucleo auditoria)
1. `202_CALFERQUIM/03 Operacion/DC-SI04 Procedimiento de mezclas.pdf`
2. `202_CALFERQUIM/03 Operacion/DC-SI05 Identificación y Control de Puntos Criticos.pdf`
3. `202_CALFERQUIM/03 Operacion/DC-SI14 Procedimiento de Granulación.pdf`
4. `202_CALFERQUIM/03 Operacion/DC-SI10 Liberación de Lotes al Mercado.pdf`
5. `202_CALFERQUIM/04 Calidad/DC-SI12 Asignación de Lotes, Muestreo y Control de Calidad.pdf`
6. `202_CALFERQUIM/05 Laboratorio/DC-SI34 Ensayos Fisicoquimicos en Laboratorio.pdf`

### SST operativo
7. `202_CALFERQUIM/06 SST/PC-SI01 PROCESO DE MOLIDO.pdf`
8. `202_CALFERQUIM/06 SST/PC-SI03 PROCESO DE MEZCLA.pdf`
9. `202_CALFERQUIM/06 SST/PC-SI04 PROCESO DE GRANULACIÓN.pdf`
10. `202_CALFERQUIM/06 SST/PC-SI06 PROCESO DE SEPARACIÓN DE FINOS.pdf`
11. `202_CALFERQUIM/06 SST/PC-SI09 PROCESO DE ENFRIAMIENTO.pdf`
12. `202_CALFERQUIM/06 SST/PC-SI10 PROCEDIMIENTO SEGURO DE DESATASCO DE MEZCLADORA.pdf`

### Base de planta
13. `202_CALFERQUIM/03 Operacion/6- PLANO PLANTA PRODUCCION.pdf`

NO imprimir:
- Archivos con prefijo `~$`
- `.zip`, `.xml`, `.tmp`
- `.xlsm` (solo si necesitas una hoja puntual como evidencia)

## Bloque 3 (120 min): Armar AZ 3A y AZ 3B

### AZ 3A - Procedimientos Produccion (3.01 a 3.10)
Separadores:
- 3.01 Recepcion y almacenamiento MP
- 3.03 Molienda primaria
- 3.04 N/A Pirolisis
- 3.05 Balance materias primas
- 3.06 Mezcla/Homogenizacion
- 3.07 N/A Reacciones quimicas
- 3.08 Presentacion fisica/Granulacion
- 3.09 Molienda secundaria
- 3.10 Envase

Insertar:
- 3.03: PC-SI01
- 3.06: DC-SI04 + DC-SI05 + PC-SI03
- 3.08: DC-SI14 + PC-SI04
- 3.09: PC-SI06 + PC-SI09 + PC-SI10
- 3.04: hoja simple "NO APLICA"
- 3.07: hoja simple "NO APLICA"
- 3.05 y 3.10: poner hoja "PENDIENTE POE"

### AZ 3B - Procedimientos Calidad (3.11 a 3.14)
Separadores:
- 3.11 Codificacion lotes
- 3.12 Liberacion lotes
- 3.13 Muestreo control calidad
- 3.14 Contramuestras

Insertar:
- 3.11: DC-SI12
- 3.12: DC-SI10
- 3.13: DC-SI12 + DC-SI34
- 3.14: hoja "PENDIENTE POE"

## Bloque 4 (30 min): Cierre de hoy

Checklist cierre:
- [ ] HS separadas MP/PT
- [ ] Paquete critico impreso
- [ ] AZ 3A armado
- [ ] AZ 3B armado
- [ ] Pila `PENDIENTE_REVISION` creada

---

## 5) MANANA - Bloques exactos (dia completo)

## Bloque 1 (90 min): Imprimir paquete legal y servicio

Imprimir:
1. `202_CALFERQUIM/04 Calidad/DC-SI07 Quejas y Reclamos.pdf`
2. `202_CALFERQUIM/04 Calidad/DC-SI11 Servicio al Cliente.pdf`
3. `202_CALFERQUIM/04 Calidad/DC-SI13 Politica Servicio al Cliente.pdf`
4. `202_CALFERQUIM/04 Calidad/DC-SI15 Politica de Quejas y Reclamos.pdf`
5. `202_CALFERQUIM/04 Calidad/DC-SI26 Compras y Gestión de Proveedores.pdf`
6. `202_CALFERQUIM/01 Documentacion Legal/CAMARA DE COMERCIO CALFERQUIM SAS.pdf`
7. `202_CALFERQUIM/01 Documentacion Legal/RUT CALFERQUIM SAS.pdf`
8. `202_CALFERQUIM/01 Documentacion Legal/CEDULA REPRESENTANTE LEGAL CALFERQUIM SAS.pdf`
9. `202_CALFERQUIM/01 Documentacion Legal/Res ICA 107688 2021 - RESOLUCION CALFERQUIM SAS.pdf`
10. `202_CALFERQUIM/01 Documentacion Legal/Res ICA 5783 2024 - RESOLUCION CALFERQUIM SAS.pdf`
11. `202_CALFERQUIM/01 Documentacion Legal/CONTRATO LABORATORIO DR CALDERON.pdf`
12. `202_CALFERQUIM/02 Gestion Ambiental/PC-SI08 RESIDUOS DE LA OPERACIÓN.pdf`
13. `202_CALFERQUIM/06 SST/DC-SI03 Politica y Objetivos V.0.pdf`
14. `202_CALFERQUIM/06 SST/DC-SI16 Entrega y Reemplazo de EPP.pdf`
15. `202_CALFERQUIM/06 SST/DC-SI22 Procedimiento de bloqueo y Etiquetado de Energias Peligrosas.pdf`
16. `202_CALFERQUIM/06 SST/DC-SI30 Protocolo de Bioseguridad.pdf`
17. `202_CALFERQUIM/06 SST/DC-SI37 Procedimiento para el Almacenamiento Seguro y Conteo de Bultos.pdf`

## Bloque 2 (120 min): Armar AZ 1 y AZ 2

### AZ 1 - Requisitos Generales
Separadores:
- 1.1 Croquis instalaciones
- 1.2 Materias primas listado
- 1.3 Contratos produccion
- 1.4 Diagramas flujo
- 1.5 Asesor tecnico

Insertar:
- 1.1: Plano planta
- 1.2: Todas HS_MP + listado simple de MP (hecho a mano si hace falta)
- 1.3: Contrato predio/produccion si aplica
- 1.4: hoja "PENDIENTE diagrama formal"
- 1.5: hoja "PENDIENTE contrato asesor tecnico"

### AZ 2 - Control Calidad
Separadores:
- 2.1 Laboratorio registrado
- 2.1.1 Certificados analisis

Insertar:
- 2.1: Contrato laboratorio Dr Calderon + soportes existentes
- 2.1.1: imprimir 10 certificados recientes de `12 Resultados Externos/`
  - usar primero: `39156-39159.pdf`, `todos.pdf`, `final_merged.pdf`, `hasta_3838888888_merged.pdf`, `hasta_37317-37318_merged.pdf`, `hasta_35979_merged.pdf`, `ya_26949.pdf`, `ya2_35837.pdf`, `ya2_35927.pdf`, `ya2_35979.pdf`

## Bloque 3 (120 min): Armar AZ 3C, 4, 5, 6

### AZ 3C - Procedimientos Soporte (3.15 a 3.20)
Separadores:
- 3.15 Higiene y seguridad industrial
- 3.16 Servicio cliente PQR
- 3.17 Almacenamiento PT
- 3.18 Disposicion residuos
- 3.19 Formulaciones terceros
- 3.20 Entrega MP importacion terceros

Insertar:
- 3.15: DC-SI30 + DC-SI37
- 3.16: DC-SI07 + DC-SI11 + DC-SI13 + DC-SI15
- 3.17: DC-SI37 (temporal)
- 3.18: PC-SI08 residuos + hoja "PENDIENTE POE barreduras"
- 3.19: hoja "PENDIENTE POE"
- 3.20: hoja "PENDIENTE POE"

### AZ 4 - Instalaciones
Separadores:
- 4.1 Senalizacion y demarcacion
- 4.2 Equipos y herramientas
- 4.3 Avisos seguridad
- 4.11 Manejo residuos/PNC
- 4.12 Archivo documental

Insertar:
- 4.1: hoja "PENDIENTE fotos"
- 4.2: hoja "PENDIENTE inventario equipos"
- 4.3: hoja "PENDIENTE fotos avisos"
- 4.11: PC-SI08 residuos
- 4.12: 1 hoja con indice de AZ creados

### AZ 5 - Documentacion legal
Insertar todo legal impreso.

### AZ 6 - SST
Insertar DC-SI03, DC-SI16, DC-SI22, DC-SI30, DC-SI37 + PC-SI01/03/04/05/06/09/10.

## Bloque 4 (30 min): Cierre de manana

Checklist cierre:
- [ ] AZ 1 listo
- [ ] AZ 2 listo
- [ ] AZ 3C listo
- [ ] AZ 4 listo (base)
- [ ] AZ 5 listo
- [ ] AZ 6 listo

---

## 6) Proxima semana (sin friccion)

## Lunes completo - Dossiers 22 productos (modo base)

Meta: armar 22 carpetas base (no perfectas, pero completas en estructura).

Para cada producto (1 a 22):
1. Crear carpeta manila `[PRODUCTO]`.
2. Crear 5 separadores internos:
   - 01 Registro venta
   - 02 Ficha tecnica
   - 03 Etiqueta aprobada
   - 04 Hoja seguridad
   - 05 Soportes ensayo
3. Insertar lo que exista hoy.
4. Si falta algo, poner hoja `PENDIENTE` en esa seccion.

Prioridad de fuente para FT:
- Usar `202_CALFERQUIM/09 Fichas Tecnicas/FICHAS_TECNICAS_V2/` (preferir archivos con prefijo de fecha mayor: 251111 > 251030 > 250809 > 250718).

## Martes medio dia - Crear y meter POE 3.05 y 3.14

Entregables:
- POE Balance materias primas (3.05)
- POE Contramuestras (3.14)

Estructura minima del POE (obligatoria ICA):
1. Objetivo
2. Alcance
3. Responsable
4. Ubicacion
5. Tiempos/frecuencia
6. Mediciones/criterios
7. Formatos y registros asociados
8. Control de cambios

Imprimir y poner en:
- AZ 3A / 3.05
- AZ 3B / 3.14

## Miercoles medio dia - Crear y meter POE 3.18, 3.19, 3.20 + N/A firmadas

Entregables:
- POE Disposicion residuos/barreduras (3.18)
- POE Formulaciones terceros (3.19)
- POE Entrega MP importacion terceros (3.20)
- Hoja N/A 3.04 firmada
- Hoja N/A 3.07 firmada

## Jueves medio dia - Simulacro ICA y cierre

Accion:
- Recorrer `ica_checklist.md` punto por punto y tocar fisicamente el AZ/separador correspondiente.

Formato de verificacion (hacer en papel):
- Cumple: SI/NO
- Evidencia encontrada: (nombre documento)
- Falta: (accion concreta)

Meta final:
- 0 carpetas vacias sin hoja de control
- Todo vacio debe tener hoja `PENDIENTE` con responsable y fecha

---

## 7) Plantillas rapidas para no bloquearte

## Plantilla "PENDIENTE"

Titulo: PENDIENTE DOCUMENTAL  
Punto ICA: [ej. 3.14]  
Documento faltante: [nombre]  
Responsable: [nombre]  
Fecha objetivo: [aaaa-mm-dd]  
Estado: En elaboracion

## Plantilla "NO APLICA"

Titulo: JUSTIFICACION NO APLICA  
Punto ICA: [3.04 o 3.07]  
Justificacion tecnica: [texto corto]  
Responsable tecnico: [nombre]  
Firma: __________  Fecha: __________

---

## 8) Regla de oro anti-TDAH (obligatoria)

Si te atoras mas de 5 minutos en una decision:
1. No decidir.
2. Meter documento en `PENDIENTE_REVISION`.
3. Seguir con el siguiente paso del checklist.

Tu objetivo no es perfeccion. Tu objetivo es cobertura completa visible para auditoria.

---

## 9) Checklist maestro (imprimible)

### Hoy
- [ ] HS separadas MP/PT
- [ ] Paquete critico impreso
- [ ] AZ 3A armado
- [ ] AZ 3B armado
- [ ] Carpeta `PENDIENTE_REVISION` activa

### Manana
- [ ] Paquete legal/servicio impreso
- [ ] AZ 1 armado
- [ ] AZ 2 armado
- [ ] AZ 3C armado
- [ ] AZ 4 armado base
- [ ] AZ 5 armado
- [ ] AZ 6 armado

### Lunes prox
- [ ] 22 dossiers base armados

### Martes prox (medio dia)
- [ ] POE 3.05 listo e impreso
- [ ] POE 3.14 listo e impreso

### Miercoles prox (medio dia)
- [ ] POE 3.18 listo e impreso
- [ ] POE 3.19 listo e impreso
- [ ] POE 3.20 listo e impreso
- [ ] N/A 3.04 y 3.07 firmados

### Jueves prox (medio dia)
- [ ] Simulacro Anexo I-B completo
- [ ] Lista final de faltantes con fecha y responsable
- [ ] Archivo fisico listo para visita

