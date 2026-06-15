El sistema "FORMULADOR_cfq" automatiza el cálculo del grado final de un fertilizante sumando proporcionalmente los nutrientes que aporta cada componente de la mezcla. Para que cualquier persona pueda entender qué hacer y cómo funciona, el proceso se divide en los siguientes pasos:

**1. Registro de las Materias Primas:**
El primer paso es asegurar que cada materia prima o producto base esté registrado en el sistema con su **composición química individual**. El sistema permite almacenar el porcentaje de diversos nutrientes para cada material, tales como Nitrógeno (N, N-NH4, N-NO3, N-org), Fósforo (P), Potasio (K), Calcio (CaO), Magnesio (MgO), Azufre (S), y micronutrientes como Cobre, Hierro, Zinc, entre otros.

**2. Definición de la Fórmula:**
Para fabricar el fertilizante, el usuario debe acceder a las plantillas de fórmulas y armar la composición. Allí **selecciona las materias primas a utilizar** (el sistema permite usar hasta 11 materias primas distintas por mezcla) y **asigna la cantidad específica** que se agregará de cada una. 

**3. Cálculo del Aporte Individual por Materia Prima:**
Al momento de procesar la formulación, el sistema toma la cantidad indicada de cada materia prima y la ajusta matemáticamente (dividiéndola entre 1000). Para saber cuánto aporta un ingrediente específico a la mezcla, el sistema **multiplica esta cantidad ajustada por la concentración del nutriente que posee esa materia prima** en particular.

**4. Suma Total para Obtener el Grado Final:**
El grado final del fertilizante es el resultado de **sumar todos los aportes individuales de las materias primas**. Por ejemplo, para calcular el Nitrógeno Total final (`T_N`), el formulador suma matemáticamente el Nitrógeno aportado por la materia prima 1, más el de la materia prima 2, y así sucesivamente con todos los ingredientes incluidos. Este mismo proceso de suma se realiza simultáneamente para calcular el nivel final de Fósforo (`T_P`), Potasio (`T_K`), Magnesio (`T_MgO`) y el resto de los elementos.

**5. Evaluación contra Tolerancias Permitidas:**
Una vez obtenido el grado teórico final, el sistema aplica fórmulas estadísticas para establecer un **margen de tolerancia permitido** para cada nutriente según su volumen en la mezcla. Finalmente, el formulador compara el resultado calculado de la fórmula con los parámetros objetivo y arroja una etiqueta de control de calidad: indicará "C" si el fertilizante cumple con la tolerancia esperada, "NC" si es no conforme (está por debajo), o "SUP" si supera el margen límite establecido.
