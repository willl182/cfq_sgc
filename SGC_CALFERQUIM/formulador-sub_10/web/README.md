# Formulador CFQ v2

Sistema de formulación de fertilizantes para CALFERQUIM S.A.S.

## Stack Tecnológico

- **Backend**: Convex (base de datos en tiempo real)
- **Frontend**: React 18 + TypeScript
- **Estilos**: Tailwind CSS v4
- **Build**: Vite
- **Routing**: React Router v7

## Estructura del Proyecto

```
web/
├── convex/                 # Backend (Convex)
│   ├── schema.ts          # Schema de base de datos (4 tablas)
│   ├── catalog.ts         # Queries y mutations del catálogo
│   ├── lists.ts           # Queries y mutations de listas vivas
│   ├── snapshots.ts       # Queries y mutations de snapshots
│   ├── seed.ts            # Carga inicial desde CSV
│   └── lib/
│       ├── formulas.ts    # Motor de cálculo puro
│       └── tolerances.ts  # Motor de tolerancia ICA
├── src/                   # Frontend (React)
│   ├── components/        # Componentes reutilizables
│   ├── pages/            # Páginas principales
│   └── lib/              # Utilidades frontend
└── insumos_ref/          # CSV de referencia
    └── mp-pt_mzr.csv     # Datos iniciales del catálogo
```

## Modelo de Datos

El sistema usa 4 tablas Convex:

1. **catalogItems**: Fuente viva única para MP, PT y MZR
2. **catalogChangeHistory**: Auditoría de cambios del catálogo
3. **productLists**: Listas/recetas vivas recalculables
4. **productListSnapshots**: Histórico congelado e inmutable

## Instalación

### 1. Instalar dependencias

```bash
cd web
pnpm install
```

### 2. Configurar Convex

```bash
# Inicializar proyecto Convex (primera vez)
pnpm dlx convex dev

# Esto te pedirá:
# - Crear una cuenta en Convex (si no tienes)
# - Crear un nuevo proyecto
# - Generará la URL de deployment automáticamente
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la carpeta `web/`:

```bash
VITE_CONVEX_URL=https://tu-deployment.convex.cloud
```

La URL la obtienes del paso anterior cuando corres `convex dev`.

### 4. Cargar datos iniciales

1. Inicia la aplicación:
```bash
pnpm dev
```

2. Ve a la página de **Admin** (`/admin`)
3. Carga el archivo `insumos_ref/mp-pt_mzr.csv`
4. El sistema parseará el CSV y creará todos los items del catálogo

## Uso

### Dashboard (`/`)
- Vista general del sistema
- Estadísticas de items, listas y snapshots
- Acciones rápidas

### Catálogo (`/catalog`)
- Explorar materias primas (MP), productos terminados (PT) y mezclas (MZR)
- Buscar por nombre, código o tipo
- Editar composición nutricional de cada item
- Archivar items

### Formulador (`/formulador`)
- Crear nuevas fórmulas
- Seleccionar producto objetivo (opcional)
- Agregar componentes dinámicos (sin límite de 11)
- Ver cálculo en tiempo real
- Evaluar tolerancia ICA automáticamente
- Guardar crea lista viva + snapshot v1

### Histórico (`/history`)
- Ver todos los snapshots guardados
- Filtrar por código o nombre
- Ver detalle completo de cada snapshot
- Clonar snapshot a nueva lista
- Archivar snapshots

### Admin (`/admin`)
- Carga inicial de datos desde CSV
- Solo funciona si el catálogo está vacío

## Reglas de Dominio

### Cálculo de Composición

```
aporte = cantidadKg * concentración / 1000
composición_final = suma de aportes
```

### Evaluación de Tolerancia ICA

**Grupo 1 (N, P)**:
- Fórmula polinómica: `-0.0005 * X² + 0.0413 * X + 0.6533`

**Grupo 2 (K)**:
- Fórmula polinómica: `-0.0007 * X² + 0.0769 * X + 0.3941`

**Grupo 3 (Secundarios y Micros)**:
- Tolerancia = min(X/2, 1.5, ecuación_lineal)

### Estados

- **CUMPLE**: Todos los nutrientes evaluados están dentro de tolerancia
- **NO_CUMPLE**: Al menos un nutriente está por debajo de tolerancia (NC)
- **CUMPLE_S**: Al menos un nutriente supera tolerancia (SUP), sin NC
- **SIN_OBJETIVO**: No hay producto objetivo definido

### Snapshots

- Cada guardado crea un snapshot versionado (v1, v2, v3...)
- Los snapshots son **inmutables** y **congelados**
- Conservan la composición del catálogo en el momento del guardado
- No se recalculan nunca

## Desarrollo

```bash
# Desarrollo frontend
pnpm dev

# Desarrollo backend (Convex)
pnpm dlx convex dev

# Build para producción
pnpm build

# Preview del build
pnpm preview
```

## IDs Internos

El sistema usa IDs con formato:
- **MP**: `MP0001`, `MP0002`, ... (Materias Primas)
- **PT**: `PT0001`, `PT0002`, ... (Productos Terminados)
- **MZR**: `MZR0001`, `MZR0002`, ... (Mezclas)

Los IDs se asignan secuencialmente durante la carga inicial del CSV.

## Clasificación MZR

Los productos con `COD = "R"`, `"R1"`, `"R2"`, etc. en el CSV se clasifican automáticamente como **MZR** (Mezclas).

## Nutrientes (20)

El sistema maneja 20 nutrientes normalizados:
- **Macronutrientes**: C, N, N_NH4, N_NO3, N_org, N_ur, P, K
- **Secundarios**: CaO, MgO, S
- **Micronutrientes**: B, Co, Cu, Fe, Mn, Mo, SiO2, Zn, Na

## Licencia

Propiedad de CALFERQUIM S.A.S.
