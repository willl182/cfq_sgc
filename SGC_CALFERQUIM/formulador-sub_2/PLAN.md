# Plan: Formulador Mezclas CFQ

## 1. Propósito

Aplicación web para **sustituir materias primas por mezclas físicas (MF) sin salida comercial** dentro de fórmulas de fertilizantes, manteniendo el grado NPK dentro de las tolerancias ICA. El objetivo es dar de baja gradualmente inventario de MFs sin mercado, incorporándolas como insumos en otras mezclas.

---

## 2. Decisiones de Diseño

| # | Decisión | Detalle |
|---|----------|---------|
| D1 | **Nombre** | Formulador Mezclas CFQ |
| D2 | **Ubicación** | `SGC_CALFERQUIM/formulador-sub/` (hermano del Formulador actual) |
| D3 | **Base de código** | Clon del Formulador CFQ actual, adaptado |
| D4 | **Unidad de formulación** | 1 tonelada = 1000 kg. Los insumos se ingresan en kg directos |
| D5 | **Total siempre 1000 kg** | La sustitución es 1:1 — quitar X kg = agregar X kg |
| D6 | **Sustitución explícita** | Botón "Sustituir" en slot de MP, seleccionas MF candidata |
| D7 | **Priorización de nutriente** | Operador elige N, P, o K como nutriente priorizado al sustituir |
| D8 | **Sugerencias por cercanía** | Distancia euclidiana, ordenada primero por cercanía en el nutriente priorizado |
| D9 | **Comportamiento por defecto** | Misma cantidad de kg (quita 50 kg de Urea, pone 50 kg de MF) |
| D10 | **Sugerencia ajustada** | Calcula automáticamente la cantidad de MF necesaria para mantener el aporte del nutriente priorizado |
| D11 | **Recetas originales intocables** | Se clona la receta original, se modifica la copia, se guarda como nueva |
| D12 | **Trazabilidad** | Receta nueva guarda: (1) referencia a la original, (2) modificaciones realizadas, (3) resultado calculado |
| D13 | **Tolerancias ICA** | Igual que Formulador actual: Grupo 1 (N, P), Grupo 2 (K), Grupo 3 (secundarios y micros) |
| D14 | **Almacenamiento** | Google Sheets (tabla nueva) + export JSON |
| D15 | **Responsive/mobile** | Debe funcionar en navegador móvil |
| D16 | **Flujo de trabajo** | Cargar receta → clonar → sustituir/ajustar → evaluar tolerancias → guardar como nueva |

---

## 3. Fuentes de Datos

| Archivo | Contenido | Registros | Estado |
|---------|-----------|-----------|--------|
| `mp_g.csv` | Materias primas granuladas (catálogo de insumos) | 42 | ✅ Disponible |
| `mf.csv` | Mezclas físicas completas (referencia general) | 264 | ✅ Disponible |
| `mf_gastar.csv` | MFs disponibles para sustitución (sin salida comercial) | TBD | ⏳ Pendiente |
| Google Sheets existente | Recetas de producción actuales | ~48 cols | ✅ Disponible |
| Google Sheets nuevo | Recetas nuevas (sustituidas) | — | 🔜 Crear |

---

## 4. Estructura de Archivos

```
formulador-sub/
├── index.html                  # SPA shell (clon adaptado)
├── app.js                      # Router y boot
├── index.css                   # Estilos responsive (adaptado)
├── data/
│   ├── mp_g.csv               # 42 MPs granuladas
│   ├── mf.csv                 # 264 MFs completas
│   └── mf_gastar.csv          # MFs a gastar (pendiente)
├── modules/
│   ├── utils.js                # Utilidades (parseNum, formateo, etc.)
│   ├── tolerancias.js          # Motor ICA (Grupos 1, 2, 3)
│   ├── csv-parser.js           # Parser CSV locales
│   ├── catalogo.js             # Catálogo de MPs y MFs
│   ├── formulador.js           # Motor de cálculo + UI del formulador
│   ├── sustitucion.js          # Módulo nuevo: sugerencias de sustitución
│   ├── recetas.js              # Carga/clon/guardado de recetas
│   ├── api.js                  # Comunicación con Google Sheets
│   └── formulas-guardadas.js  # Historial de recetas nuevas
└── PLAN.md                     # Este documento
```

---

## 5. Flujo de Usuario

```
┌─────────────────────────────────────────────────────┐
│  1. INICIO                                          │
│  Seleccionar receta existente (desde Sheets)        │
│  o crear fórmula nueva desde cero                   │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  2. CLONAR RECETA (si es existente)                 │
│  Se crea copia de trabajo. Original intocable.       │
│  Se registra: "Clon de MF 25-10-18"                │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  3. FORMULACIÓN                                     │
│  Ver insumos en kg (total = 1000 kg)                │
│  Ver grado calculado y estado C/NC/SUP              │
│                                                      │
│  ┌──────────────────────────────────────┐            │
│  │ Slot 1: Urea .............. 350 kg    │            │
│  │ Slot 2: DAP ............... 250 kg    │            │
│  │ Slot 3: KCL ................ 200 kg    │            │
│  │ Slot 4: Kieserita .......... 100 kg    │            │
│  │ Slot 5: Abono Orgánico .... 100 kg    │            │
│  │                        Total: 1000 kg │            │
│  │                                        │            │
│  │  [Sustituir] ← botón por slot         │            │
│  └──────────────────────────────────────┘            │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  4. SUSTITUCIÓN                                     │
│  a) Click "Sustituir" en un insumo (ej: Urea)      │
│  b) Seleccionar nutriente priorizado: N / P / K     │
│  c) Se muestran MFs candidatas ordenadas:           │
│     - Primero por cercanía al nutriente priorizado  │
│     - Luego por distancia euclidiana NPK general    │
│                                                      │
│  ┌─────────────────────────────────────┐             │
│  │ Priorizar: [N] [P] [K]             │             │
│  │                                      │             │
│  │ MF 24-0-17    dist: 22.2  N-cerc: 24 │ ← sugerida │
│  │ MF 22-6-3     dist: 28.4  N-cerc: 22 │             │
│  │ MF 25-4-24    dist: 29.1  N-cerc: 25 │             │
│  │ MF 21-5-10    dist: 30.8  N-cerc: 21 │             │
│  │ ...                                  │             │
│  └─────────────────────────────────────┘             │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  5. AJUSTE DE CANTIDAD                              │
│  Seleccionada la MF, se define cuántos kg sustituir  │
│                                                      │
│  Comportamiento por defecto (mismo kg):              │
│  "Quitar 50 kg de Urea → Agregar 50 kg de MF 24-0-17"│
│                                                      │
│  Sugerencia ajustada (mantener nutriente priorizado):│
│  "Para mantener aporte de N: agregar 95.8 kg"       │
│                                                      │
│  El operador ingresa los kg a sustituir (1:1)       │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  6. RECALCULAR Y EVALUAR                            │
│  Motor recalcula grado con la sustitución            │
│  Tolerancias ICA: ¿Conforme?                        │
│                                                      │
│  Si NC → ajustar kg o probar otra MF                │
│  Si C → proceder a guardar                           │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  7. GUARDAR RECETA NUEVA                            │
│  - Referencia a receta original                     │
│  - Modificaciones: "-50kg Urea +50kg MF 24-0-17"   │
│  - Resultado: N:23.5 P:10 K:18.2 — CONFORME        │
│  - Guardar en Google Sheets (tabla nueva)           │
│  - Opción de exportar como JSON                     │
└─────────────────────────────────────────────────────┘
```

---

## 6. Motor de Cálculo

### 6.1 Cálculo del Grado (igual que Formulador actual)

```
Grado_Nutriente = Σ(kg_insumo_i × concentración_nutriente_i) / 1000
```

Donde `kg_insumo_i` es la cantidad en kilogramos del insumo i, y `concentración_nutriente_i` es el porcentaje del nutriente en ese insumo (ej: Urea = 46% N → 0.46).

### 6.2 Sustitución (nueva funcionalidad)

Caso por defecto (1:1 en kg):
- Se quitan `X` kg del insumo original
- Se agregan `X` kg de la MF sustituta
- Total se mantiene en 1000 kg

Caso sugerido (mantener nutriente priorizado):
- Se calcula la cantidad `Y` de MF necesaria para mantener el aporte del nutriente priorizado
- `Y = (kg_original × concentración_nut_orig) / concentración_nut_mf`
- Si `Y` excede los kg disponibles del insumo sustituido, se muestra un warning
- El operador decide si aplica Y o sigue con X

### 6.3 Distancia Euclidiana con Priorización

Para ordenar las MFs candidatas al sustituir un insumo con perfil `(N_mp, P_mp, K_mp)`:

1. Calcular distancia euclidiana a cada MF:
   ```
   d = √((N_mf - N_mp)² + (P_mf - P_mp)² + (K_mf - K_mp)²)
   ```

2. Si el operador prioriza el nutriente N:
   - Ordenar primero por `|N_mf - N_mp|` ascendente
   - Desempatar por distancia euclidiana `d` ascendente

3. Aplicar lo mismo para P o K según el nutriente priorizado

### 6.4 Evaluación de Tolerancias ICA (igual que Formulador actual)

- **Grupo 1 (N, P)**: Tolerancia = -0.0005X² + 0.0413X + 0.6533, con topes mín 0.84% y máx 1.46%
- **Grupo 2 (K)**: Tolerancia = -0.0007X² + 0.0769X + 0.3941, con topes mín 0.69% y máx 2.14%
- **Grupo 3 (secundarios y micros)**: min(X/2, 1.5, ecuación_elemento)

Resultados por nutriente: ✓ C (Conforme), ⚠ SUP (Supera), ✕ NC (No Conforme)
Estado general: Si un nutriente es NC → toda la mezcla es NO CONFORME

---

## 7. Estructura de Receta Nueva (Google Sheets)

| Campo | Ejemplo |
|-------|---------|
| ID | auto-generado |
| FECHA | 2026-06-02 |
| RECETA_ORIGINAL | "MF 25-10-18" |
| RECETA_ORIGINAL_ID | 175 (ID de la receta original en Sheets) |
| MODIFICACIONES | "-50kg Urea +50kg MF 24-0-17" |
| TOTAL_KG | 1000 |
| MP1_COD a MP11_COD | Código de cada insumo |
| MP1_KG a MP11_KG | Kilogramos de cada insumo |
| MP1_LOTES a MP11_LOTES | Lotes |
| T_N, T_P, T_K... | Grado calculado final |
| ESTADO | CONFORME / NO CONFORME |
| NUTRIENTE_PRIORIZADO | N / P / K |
| MF_SUSTITUIDA | Código de la MF usada como sustitución |
| KG_SUSTITUIDOS | Cantidad en kg sustituidos |

---

## 8. Plan de Implementación (v1)

| Fase | Descripción | Archivos | Dependencia |
|------|-------------|----------|-------------|
| **F1** | Scaffolding — clonar estructura base, adaptar nombre y layout | `index.html`, `app.js`, `index.css` | — |
| **F2** | Carga de datos CSV — parser para `mp_g.csv`, `mf.csv`, `mf_gastar.csv` | `modules/csv-parser.js`, `modules/catalogo.js` | F1 |
| **F3** | Motor de cálculo — cálculo de grado con kg directos (base 1000 kg) | `modules/formulador.js`, `modules/utils.js` | F1 |
| **F4** | Motor de tolerancias ICA — clonar sin cambios | `modules/tolerancias.js` | F1 |
| **F5** | UI formulador — slots en kg, total 1000 kg, evaluación C/NC/SUP | `modules/formulador.js`, `index.css` | F2, F3, F4 |
| **F6** | Módulo de sustitución — sugerencias por cercanía, priorización de nutriente | `modules/sustitucion.js` | F2, F5 |
| **F7** | Integración sustitución en UI — botón "Sustituir", selector de nutriente, lista de MFs | `modules/formulador.js`, `index.css` | F5, F6 |
| **F8** | Clonación de recetas — cargar de Sheets, clonar, registrar referencia original | `modules/recetas.js`, `modules/api.js` | F3 |
| **F9** | Guardado de recetas nuevas — Sheets nuevo + export JSON | `modules/formulas-guardadas.js`, `modules/api.js` | F8 |
| **F10** | Responsive/mobile — media queries, touch targets, layout adaptativo | `index.css` | F5 |
| **F11** | Testing y ajustes — verificar cálculos con mezclas reales, ajustar UX | Todos | F1-F10 |

---

## 9. Pendientes del Usuario

| # | Item | Responsable |
|---|------|-------------|
| 1 | Proveer `mf_gastar.csv` — lista de MFs sin salida comercial | Usuario |
| 2 | Proveer archivo de recetas existentes (desde Sheets actual) | Usuario |
| 3 | Crear tabla/hoja nueva en Google Sheets para recetas sustituidas | Usuario/Dev |
| 4 | Confirmar URL del script GAS para la nueva hoja | Usuario |

---

## 10. Notas Técnicas

- **Formato de números**: Los CSV usan coma decimal (18,00 → 18.00). El parser ya lo maneja (`Utils.parseNum`).
- **Codificación de MPs**: Se mantiene el formato `COD-PRODUCTO-PROVEEDOR Cprov-TIPO` del CSV actual.
- **GAS**: Se necesita un nuevo endpoint en `Codigo.gs` (o un script nuevo) para la tabla de recetas sustituidas.
- **Offline**: El CSV parser permite funcionamiento offline si los datos están embebidos o cacheados en localStorage.
- **Seguridad regulatoria**: Las tolerancias ICA son un cálculo crítico. Las fórmulas se mantienen idénticas al Formulador CFQ original sin modificaciones.