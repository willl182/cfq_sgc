/**
 * Parser para el CSV de materias primas y productos.
 * Formato: COD;PRODUCTO;CLASE;TIPO;Test;C;N;N-NH4;N-NO3;N-org;N-ur;P;K;...
 */

import { NUTRIENTS, type NutrientKey } from "./formulas";

export interface ParsedRow {
  codigo: string;
  producto: string;
  clase: "MP" | "PT" | "MZR";
  tipo: string;
  nutrientes: Record<string, number>;
  errores: string[];
}

export interface ParseResult {
  exitosas: ParsedRow[];
  rechazadas: { fila: number; contenido: string; errores: string[] }[];
  total: number;
}

/**
 * Parsea una línea CSV con formato ponto-y-coma.
 * Maneja comas decimales (18,00 → 18.00)
 */
function parseNum(valor: string): number {
  if (!valor || valor.trim() === "") return 0;
  return parseFloat(valor.trim().replace(",", ".")) || 0;
}

/**
 * Clasifica un item como MZR si su COD empieza con 'R'
 */
function clasificarClase(codigo: string, claseCSV: string): "MP" | "PT" | "MZR" {
  // Si el código empieza con R (R, R1, R2, etc.), es MZR
  if (/^R\d*$/i.test(codigo.trim())) {
    return "MZR";
  }
  // De lo contrario usar la clase del CSV
  if (claseCSV.toUpperCase() === "MP") return "MP";
  if (claseCSV.toUpperCase() === "PT") return "PT";
  return "MP"; // default
}

/**
 * Verifica si una fila tiene nutrientes válidos (al menos uno > 0)
 */
function tieneNutrientesValidos(nutrientes: Record<string, number>): boolean {
  return NUTRIENTS.some(n => (nutrientes[n] || 0) > 0);
}

/**
 * Valida los encabezados esperados del CSV
 */
export function validarEncabezados(headers: string[]): string[] {
  const errores: string[] = [];
  
  // Encabezados requeridos
  const requeridos = ["COD", "PRODUCTO", "CLASE", "TIPO"];
  for (const req of requeridos) {
    if (!headers.includes(req)) {
      errores.push(`Falta encabezado requerido: ${req}`);
    }
  }

  // Verificar que tenemos al menos algunos nutrientes
  const nutrientesPresentes = NUTRIENTS.filter(n => headers.includes(n));
  if (nutrientesPresentes.length === 0) {
    errores.push("No se encontraron columnas de nutrientes");
  }

  return errores;
}

/**
 * Parsea el contenido completo del CSV
 */
export function parseCSV(contenido: string): ParseResult {
  const lineas = contenido.split("\n").filter(l => l.trim());
  
  if (lineas.length < 2) {
    return {
      exitosas: [],
      rechazadas: [],
      total: 0,
    };
  }

  // Parsear encabezados
  const headers = lineas[0].split(";").map(h => h.trim());
  const erroresHeaders = validarEncabezados(headers);
  
  if (erroresHeaders.length > 0) {
    return {
      exitosas: [],
      rechazadas: [{
        fila: 0,
        contenido: lineas[0],
        errores: erroresHeaders,
      }],
      total: 0,
    };
  }

  const exitosas: ParsedRow[] = [];
  const rechazadas: { fila: number; contenido: string; errores: string[] }[] = [];

  // Parsear filas de datos (desde la 2da línea)
  for (let i = 1; i < lineas.length; i++) {
    const linea = lineas[i];
    const valores = linea.split(";").map(v => v.trim());
    
    const errores: string[] = [];
    
    // Extraer campos básicos
    const codIdx = headers.indexOf("COD");
    const prodIdx = headers.indexOf("PRODUCTO");
    const claseIdx = headers.indexOf("CLASE");
    const tipoIdx = headers.indexOf("TIPO");

    if (codIdx === -1 || prodIdx === -1) {
      errores.push("Formato de fila inválido");
      rechazadas.push({ fila: i + 1, contenido: linea, errores });
      continue;
    }

    const codigo = valores[codIdx] || "";
    const producto = valores[prodIdx] || "";
    const claseCSV = valores[claseIdx] || "MP";
    const tipo = valores[tipoIdx] || "G";

    // Validaciones
    if (!producto) {
      errores.push("Nombre de producto vacío");
    }

    // Extraer nutrientes
    const nutrientes: Record<string, number> = {};
    for (const nutrient of NUTRIENTS) {
      const idx = headers.indexOf(nutrient);
      if (idx !== -1) {
        nutrientes[nutrient] = parseNum(valores[idx] || "");
      } else {
        nutrientes[nutrient] = 0;
      }
    }

    // Verificar nutrientes válidos
    if (!tieneNutrientesValidos(nutrientes)) {
      errores.push("Fila sin nutrientes válidos (todos cero o vacíos)");
    }

    if (errores.length > 0) {
      rechazadas.push({ fila: i + 1, contenido: linea, errores });
      continue;
    }

    // Clasificar
    const clase = clasificarClase(codigo, claseCSV);

    exitosas.push({
      codigo,
      producto,
      clase,
      tipo,
      nutrientes,
      errores: [],
    });
  }

  return {
    exitosas,
    rechazadas,
    total: lineas.length - 1,
  };
}

/**
 * Genera el ID interno secuencial para una clase
 */
export function generarInternalId(clase: "MP" | "PT" | "MZR", secuencia: number): string {
  const num = String(secuencia).padStart(4, "0");
  return `${clase}${num}`;
}

/**
 * Agrupa items parseados por clase, en orden de aparición
 */
export function agruparPorClase(items: ParsedRow[]): {
  MP: ParsedRow[];
  PT: ParsedRow[];
  MZR: ParsedRow[];
} {
  const resultado = {
    MP: [] as ParsedRow[],
    PT: [] as ParsedRow[],
    MZR: [] as ParsedRow[],
  };

  for (const item of items) {
    resultado[item.clase].push(item);
  }

  return resultado;
}