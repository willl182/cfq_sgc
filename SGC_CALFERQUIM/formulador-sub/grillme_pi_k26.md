# Sesión Grill-Me — Formulador CFQ v2

**Fecha:** 2026-06-09
**Participantes:** Usuario + Pi (Agente)
**Objetivo:** Reconfigurar el aplicativo `formulador-sub` migrando de vanilla JS + Google Apps Script a React + TypeScript + Tailwind CSS + Convex.

---

## Resumen de Decisiones

### Tecnología
- **Backend:** Convex único (elimina Google Apps Script / Sheets)
- **Frontend:** React 18 + TypeScript + Tailwind CSS
- **Routing:** React Router v6 con sidebar y rutas anidadas
- **Auth:** Desarrollo sin autenticación. Producción con WorkOS (diseñar sin hardcodear auth).

### Modelo de Datos (3 tablas + 1 entidad producto)
1. **`insumos`** — Fuente de verdad viva. MPs editables por usuarios. PTs/MZRs editables solo por admin. Códigos auto-generados: MP####, PT####, MZR####.
2. **`productos`** — PTs y MZRs con `targetNutrientes`. Del CSV vienen precargados. Se pueden crear manualmente.
3. **`listas`** — Listas globales recalculables. Un producto tiene N listas globales. Recalculan síncronamente al editar una MP.
4. **`snapshots`** — Inmutables, denormalizados. Creados automáticamente al "Guardar Final". Incluyen `targetSnapshot` y `composicionSnapshot` por componente.

### Nutrientes
- Schema con **campos individuales tipados** (no record flexible) para type safety regulatoria.
- 20 nutrientes: C, N, N_NH4, N_NO3, N_org, N_ur, P, K, CaO, MgO, S, B, Co, Cu, Fe, Mn, Mo, SiO2, Zn, Na.

### Cálculos
- **Hybrid:** Preview client-side en el formulador (feedback inmediato). Persistencia server-side en Convex mutations.
- **Tolerancias ICA:** Grupo 1 (N, P), Grupo 2 (K), Grupo 3 (secundarios/micros) con ecuaciones polinómicas y lineales.
- **No se validan mínimos NPK ICA** (solo tolerancias contra target).

### Flujo de Guardado
- **"Guardar"** → crea/actualiza la lista global mutable.
- **"Guardar Final"** → actualiza lista global + crea automáticamente un snapshot inmutable.
- Lista global editable indefinidamente. Snapshot congela el estado exacto del momento.

### Códigos
- CSV original tiene códigos duplicados (`R`, `R1`, `R2`).
- **Solución:** regenerar secuenciales al seedear:
  - MP → MP0001, MP0002...
  - PT → PT0001, PT0002...
  - MZR (antiguos PT con COD=R) → MZR0001, MZR0002...
- Auto-generación por clase tanto en seed como en creaciones posteriores.

### Vistas (7)
1. `/` — Dashboard (vista por defecto)
2. `/productos` y `/productos/:id` — Productos y sus listas globales
3. `/productos/:id/nueva-lista` y `/productos/:id/listas/:listaId` — Formulador
4. `/insumos` — Catálogo editable de insumos
5. `/historico` — Snapshots inmutables
6. `/sustitucion` — Vista independiente de sugerencias MZR
7. `/comparador` — Comparador de listas

### Sustitución (Vista Independiente)
- Usuario selecciona MP a reemplazar.
- Selecciona nutriente priorizado (N / P / K).
- Sistema sugiere **MZRs** (no MPs) ordenados por cercanía euclidiana N-P-K.
- Calcula cantidad sugerida para mantener aporte del nutriente priorizado.
- Permite simular impacto y aplicar en el formulador.

### Recálculo en Cascada
- Al editar una MP (mutation `updateInsumo`), se recalculan **síncronamente** todas las listas globales que la contienen.
- Snapshots **nunca** recalculan (son inmutables).

### Snapshots
- **Totalmente denormalizados:** cada componente guarda `cod`, `nombre`, y `composicionSnapshot` completa del insumo en ese momento.
- Incluyen copia del `targetSnapshot` del producto.
- Garantizan integridad histórica aunque se borren insumos originales.

---

## Preguntas Resueltas en la Sesión

| # | Pregunta | Respuesta |
|---|----------|-----------|
| 1 | Migración tecnológica | Convex + React + TS + Tailwind |
| 2 | Modelo de datos | Opción B relacional: insumos, productos, listas, snapshots |
| 3 | Schema nutrientes | Opción A: campos individuales tipados |
| 4 | IDs y carga inicial | IDs nativos Convex; códigos secuenciales MP####/PT####/MZR#### |
| 5 | Grado objetivo vs calculado | Target explícito en producto; lista evalúa contra ese target |
| 6 | Productos y listas | Entidades separadas: producto con target + N listas globales |
| 7 | Listas globales por producto | N listas globales por producto + snapshots explícitos |
| 8 | Cálculo en mutation síncrono | Sí, recálculo síncrono inmediato; persistir global + detalle |
| 9 | Vistas exactas | 7 vistas: Dashboard, Productos, Formulador, Insumos, Histórico, Sustitución, Comparador |
| 10 | Navegación | React Router + Sidebar + rutas anidadas |
| 11 | Recálculo y denormalización | Recálculo síncrono + snapshot denormalizado con targetSnapshot |
| 12 | Validaciones mínimos NPK | No validar (solo tolerancias) |
| 13 | Ciclo de vida lista | Opción A: guardar = lista global mutable; guardar final = + snapshot |
| 14 | Sustitución sugiere MZRs | Confirmado: MZRs (mezc. reemplazo), no MPs |
| 15 | Creación de productos | Sí, manual desde UI con target definido por usuario |
| 16 | UX guardado | Editar lista existente; "Guardar como nueva lista" para alternativas |

---

## Archivos Generados

- `DESIGN.md` — Documento de arquitectura técnica completo
- `plan_pi_k26.md` — Plan de implementación con fases y checklist
- `grillme_pi_k26.md` — Esta sesión

## Próximo Paso

Continuar con **F1 — Scaffolding**: configurar Tailwind CSS, inicializar Convex, y preparar la estructura de carpetas del proyecto.
