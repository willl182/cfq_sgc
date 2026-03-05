# Session State: SGC CALFERQUIM

**Last Updated**: 2026-03-05 05:51

## Session Objective

Ajuste de 8 POEs y creacion de descripcion narrativa del flujo de proceso (requisito 1.4) para reflejar la operacion real de la planta — eliminando supuestos BPM genericos que no se aplican.

## Current State

- [x] POE 3.01 — Recepcion MP: cuarentena en vehiculo, ingreso solo con autorizacion Calidad, devolucion a cargo comercial/Gerencia, eliminados colores de etiqueta.
- [x] POE 3.02 — Limpieza: barrido con escoba diferenciado por area (planta / bodega MP-PT / bodega empaques aislada). Eliminados desinfeccion, hisopado, ATP, verificacion Calidad. Autoriza Jefe Produccion.
- [x] POE 3.05 — Verificacion de formulacion: formula (conc MP x cant MP) / 1000 = aporte nutriente. Objetivo: confirmar grado calculado vs grado ICA declarado. Eliminados entradas/salidas/barreduras/mermas/tolerancias zonales.
- [x] POE 3.06 — Mezcla: Tipo A = mezcla fisica manual (vaciado intercalado + paleado → POE 3.10). Tipo B = tolva mecanica 4 min cronometrados → POE 3.08.
- [x] POE 3.08 — Granulacion: Tolva → Olla (agua/miel) → Tubo secador → Sep. finos (recircula) → Sep. gruesos (muele y reprocesa) → Tubo enfriador → Recoleccion. Parametros en rangos definidos por Jefe Produccion.
- [x] POE 3.10 — Envase: solo sacos y bigbag. Doble pesaje ±1% (produccion + alistamiento). Sin liquidos ni otros envases.
- [x] POE 3.11 — Codificacion lotes: Bodega asigna codigo al generar OP y verifica no duplicidad. Bodega marca. Alistamiento confirma. Sin rol de Calidad.
- [x] POE 3.12 — Liberacion lotes: traslado a bodega → En Revision. Verificaciones: DT (OP + etiquetas bultos), Calidad (certificado interno), Jefe Prod (datos proceso), Jefe Bodega (marcado lote). Dictamen: Aprobado / Rechazado / En Revision. Sin colores ni cuarentena fisica.
- [x] DFP 1.4 — Descripcion narrativa del flujo de proceso creada: SGC_CALFERQUIM/01_Requisitos_Generales/1.4_Diagrama_Flujo_Proceso/DFP_1.4_Descripcion_Flujo_Proceso_V1.md

## Patrones Operacionales Confirmados

- Limpieza = barrido con escoba. Sin desinfeccion. Sin Calidad en verificacion de limpieza.
- Mezcla fisica = vaciado intercalado + paleado manual. Sin mezclador mecanico.
- Granulacion usa olla con aglomerante agua/miel. Sin compactadora, zarandas ni Ro-Tap.
- Finos recirculan a olla. Gruesos se muelen y reprocean internamente.
- Balance de MP = verificacion de formulacion vs grado ICA (no balance de masas entrada/salida).
- Empaque: solo sacos y bigbag. Sin productos liquidos.
- Codificacion de lotes: responsabilidad de Bodega, no de Calidad.
- Liberacion: estados Aprobado / Rechazado / En Revision. Sin etiquetas de color fisico.
- DT verifica OP y etiquetas de bultos como parte del proceso de liberacion.

## Critical Technical Context

- POE 3.05 renombrado conceptualmente: ya no es "Balance de Materias Primas" sino "Verificacion de Formulacion y Grado". El archivo mantiene el codigo CGC-POE-3.05.
- El ANX_3.12_02_Etiquetas_Estatus.md sigue existiendo en disco pero ya no esta referenciado en POE 3.12 — candidato a archivar.
- DFP 1.4 es descripcion narrativa; el diagrama grafico queda pendiente.

## Next Steps

1. Elaborar diagrama grafico del flujo de proceso (pendiente — actualmente solo descripcion narrativa DFP-1.4).
2. Definir si ANX_3.12_02_Etiquetas_Estatus.md se archiva o elimina.
3. Sincronizar carpeta poe_rev/ con las versiones actualizadas si se requiere.
4. Definir y documentar estructura oficial del codigo de lote (Anexo 1 de POE 3.11).
