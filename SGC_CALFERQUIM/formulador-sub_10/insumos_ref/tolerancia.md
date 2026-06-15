El sistema calcula el margen de tolerancia permitido para cada nutriente dependiendo exclusivamente de la concentración teórica que dicho nutriente tiene en la mezcla final. 

Para que el cálculo sea fácil de entender, llamaremos **"X"** al valor teórico total del nutriente (por ejemplo, el % calculado de Nitrógeno en el fertilizante). Las fórmulas se dividen en tres grandes grupos metodológicos:

**Grupo 1: Nitrógeno Total (N) y Fósforo (P)**
Para estos dos macronutrientes, la regla utiliza límites fijos para los extremos y una ecuación matemática para los valores intermedios:
*   **Si X es 0:** La tolerancia es 0.
*   **Si X es menor a 0.04%:** Se otorga una tolerancia fija de **0.84%**.
*   **Si X es mayor a 32%:** Se otorga una tolerancia fija de **1.46%**.
*   **Si X está entre 0.04% y 32%:** Se debe aplicar la siguiente fórmula polinómica:
    `Tolerancia = -0.0005 * (X²) + 0.0413 * (X) + 0.6533`

**Grupo 2: Potasio (K)**
El potasio utiliza la misma lógica de topes que el grupo anterior, pero con cifras más restrictivas:
*   **Si X es 0:** La tolerancia es 0.
*   **Si X es menor a 0.04%:** Se otorga una tolerancia fija de **0.69%**.
*   **Si X es mayor a 32%:** Se otorga una tolerancia fija de **2.14%**.
*   **Si X está entre 0.04% y 32%:** Se aplica esta fórmula específica:
    `Tolerancia = -0.0007 * (X²) + 0.0769 * (X) + 0.3941`

**Grupo 3: Nutrientes Secundarios y Micronutrientes**
Para el resto de los elementos (Calcio, Magnesio, Azufre, y los metales), el sistema no usa la regla anterior. En su lugar, calcula **tres valores distintos** y siempre elige **el número que resulte menor** de los tres. Los tres valores a comparar son:

1.  **La mitad de la concentración del nutriente** (`X / 2`).
2.  **Un tope fijo del 1.5%** (la tolerancia para estos nutrientes nunca superará el 1.5% sin importar cuánto haya en la mezcla).
3.  **Una ecuación lineal específica** dependiendo del nutriente. 

Las ecuaciones lineales específicas para la tercera opción son las siguientes:
*   **Calcio (CaO):** `0.42 + 0.105 * X`
*   **Magnesio (MgO):** `0.5 + 0.125 * X`
*   **Azufre (S):** `0.3 + 0.075 * X`
*   **Boro (B):** `0.005 + 0.25 * X`
*   **Cobalto (Co) y Molibdeno (Mo):** `0.000125 + 0.375 * X`
*   **Cobre (Cu), Hierro (Fe), Manganeso (Mn), Zinc (Zn) y Sodio (Na):** `0.015 + 0.3 * X`

**Ejemplo práctico para el Grupo 3:**
Si tu mezcla tiene un 4% de Magnesio (MgO).
*   Opción 1 (La mitad): `4 / 2 = 2%`
*   Opción 2 (El tope fijo): `1.5%`
*   Opción 3 (La ecuación): `0.5 + (0.125 * 4) = 1%`
*   **Resultado:** El sistema evalúa `2%`, `1.5%` y `1%`. Como siempre elige **el menor**, la tolerancia asignada para el Magnesio en esa mezcla será del **1%**.
