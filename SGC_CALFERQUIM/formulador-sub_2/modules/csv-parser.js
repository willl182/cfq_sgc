/**
 * FORMULADOR_CFQ — Parser CSV
 * Parsea el archivo FORMULADOR - PROD.csv con manejo de:
 *   - Separador decimal coma (locale español)
 *   - Campos entrecomillados con comas internas
 *   - Caracteres especiales (tildes, ñ)
 */

import { Utils } from './utils.js';

export const CsvParser = {

  /**
   * Parsea un string CSV completo a array de objetos
   * @param {string} text - Contenido del CSV
   * @returns {Array<Object>} Array de objetos con los datos parseados
   */
  parse(text) {
    const lines = this._splitLines(text);
    if (lines.length < 2) return [];

    const delimiter = this._detectDelimiter(text);
    const headers = this._parseLine(lines[0], delimiter);
    const objects = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = this._parseLine(line, delimiter);
      const obj = {};

      for (let j = 0; j < headers.length; j++) {
        const key = headers[j].trim().replace(/-/g, '_');
        obj[key] = values[j] !== undefined ? values[j].trim() : '';
      }

      if (obj.ID_PROD || obj.COD || obj.COD_PROD || obj.OP) {
        objects.push(obj);
      }
    }

    return objects;
  },

  /**
   * Parsea el CSV de PROD y convierte los nutrientes a números
   * @param {string} text - Contenido del FORMULADOR - PROD.csv
   * @returns {Array<Object>} Catálogo de materias primas
   */
  parseProductos(text) {
    const raw = this.parse(text);
    
    const nutrientKeys = ['C','N','N_NH4','N_NO3','N_org','N_ur','P','K','CaO','MgO','S','B','Co','Cu','Fe','Mn','Mo','SiO2','Zn','Na'];

    return raw.map(row => {
      const idProd = row.ID_PROD || row.id_prod || '';
      const cod = row.COD || row.cod || '';
      const producto = row.PRODUCTO || row.producto || '';
      const proveedor = row.PROVEEDOR || row.proveedor || '';
      const cprov = row.Cprov || row.cprov || row.CPROV || '';
      const clase = String(row.CLASE || row.clase || '').trim().toUpperCase();
      const tipo = String(row.TIPO || row.tipo || '').trim().toUpperCase();
      const nombre = row.NOMBRE || row.nombre || producto;
      const extras = row.EXTRAS || row.extras || row.Test || row.test || '';

      const producto2 = {
        ID_PROD: idProd || cod,
        COD: cod,
        PRODUCTO: producto,
        PROVEEDOR: proveedor,
        Cprov: cprov,
        CLASE: clase,
        TIPO: tipo,
        NOMBRE: nombre,
        EXTRAS: extras
      };

      for (const key of nutrientKeys) {
        producto2[key] = Utils.parseNum(row[key]);
      }

      return producto2;
    });
  },

  /**
   * Parsea el CSV mp_remplazo.csv y lo convierte al mismo esquema base.
   * Se usa como capa adicional de catálogos/insumos.
   */
  parseReemplazos(text) {
    const lines = this._splitLines(text);
    if (lines.length < 2) return [];

    const delimiter = this._detectDelimiter(text);
    const headers = this._parseLine(lines[0], delimiter);
    const raw = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = this._parseLine(line, delimiter);
      const obj = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j].trim()] = values[j] !== undefined ? values[j].trim() : '';
      }
      if (obj.Mezcla) raw.push(obj);
    }

    if (!raw.length) return [];

    return raw.map((row, idx) => {
      const producto = {
        ID_PROD: `REEMP-${idx + 1}`,
        COD: row.Mezcla || `REEMP-${idx + 1}`,
        PRODUCTO: row.Mezcla || '',
        PROVEEDOR: '',
        Cprov: '',
        CLASE: 'MP',
        TIPO: '',
        NOMBRE: row.Mezcla || '',
        EXTRAS: row.Estado || ''
      };

      producto.N = Utils.parseNum(row['%N']);
      producto.P = Utils.parseNum(row['%P']);
      producto.K = Utils.parseNum(row['%K']);
      producto.C = 0;
      producto.CaO = 0;
      producto.MgO = 0;
      producto.S = 0;
      producto.B = 0;
      producto.Co = 0;
      producto.Cu = 0;
      producto.Fe = 0;
      producto.Mn = 0;
      producto.Mo = 0;
      producto.SiO2 = 0;
      producto.Zn = 0;
      producto.Na = 0;
      producto.TOTAL = Utils.parseNum(row.Total);
      producto.ESTADO = row.Estado || '';
      return producto;
    });
  },

  /**
   * Parsea el CSV de verificación de fórmulas y lo convierte a objetos
   * compatibles con el formulador actual.
   * @param {string} text - Contenido de FORMULADOR - VERIFICAR.csv
   * @returns {Array<Object>} Array de fórmulas normalizadas
   */
  parseRecetasVerificar(text) {
    const raw = this.parse(text);
    const nutrientKeys = ['C', 'N', 'N_NH4', 'N_NO3', 'N_org', 'N_ur', 'P', 'K', 'CaO', 'MgO', 'S', 'B', 'Co', 'Cu', 'Fe', 'Mn', 'Mo', 'SiO2', 'Zn', 'Na'];
    const formulas = [];

    for (const row of raw) {
      const formula = {
        ID: row.OP || row.FORMULA || Utils.generateId(),
        FECHA: row.FECHA || '',
        COD_PROD_DESTINO: row.COD_PROD || '',
        NOMBRE_DESTINO: row.NOMBRE || '',
        TOTAL_PROD: Utils.parseNum(row.TOTAL_PROD),
        ESTADO: row.EVAL || 'IMPORTADA',
        _origen: 'FORMULADOR - VERIFICAR.csv'
      };

      for (let i = 1; i <= 11; i++) {
        const prefix = `${i}`;
        const cod = row[`${prefix}_COD`] || '';
        const nombre = row[`${prefix}_NOMBRE`] || '';
        const cantidad = Utils.parseNum(row[`${prefix}_CANTIDAD`]);
        const lotes = [row[`MP${i}_L1`], row[`MP${i}_L2`], row[`MP${i}_L3`], row[`MP${i}_L4`]]
          .filter(Boolean)
          .join(', ');

        formula[`MP${i}_COD`] = cod;
        formula[`MP${i}_NOMBRE`] = nombre;
        formula[`MP${i}_CANTIDAD`] = cantidad;
        formula[`MP${i}_LOTES`] = lotes;
      }

      for (const key of nutrientKeys) {
        formula[`T_${key}`] = Utils.parseNum(row[`T_${key}`]);
      }

      const hasMp = Array.from({ length: 11 }, (_, idx) => formula[`MP${idx + 1}_COD`]).some(Boolean);
      if (hasMp) formulas.push(formula);
    }

    return formulas;
  },

  _splitLines(text) {
    return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  },

  _detectDelimiter(text) {
    const firstLine = text.split(/\r?\n/)[0] || '';
    const semicolons = (firstLine.match(/;/g) || []).length;
    const commas = (firstLine.match(/,/g) || []).length;
    const tabs = (firstLine.match(/\t/g) || []).length;
    if (semicolons >= commas && semicolons >= tabs && semicolons > 0) return ';';
    if (tabs > commas && tabs > 0) return '\t';
    return ',';
  },

  _parseLine(line, delimiter = ',') {
    const fields = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];

      if (inQuotes) {
        if (char === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            current += '"';
            i += 2;
          } else {
            inQuotes = false;
            i++;
          }
        } else {
          current += char;
          i++;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
          i++;
        } else if (char === delimiter) {
          fields.push(current);
          current = '';
          i++;
        } else {
          current += char;
          i++;
        }
      }
    }

    fields.push(current);
    return fields;
  },

  /**
   * Convierte array de productos a CSV string (formato original)
   * @param {Array<Object>} productos
   * @returns {string} CSV text
   */
  exportToCSV(productos) {
    const headers = ['ID_PROD','COD','PRODUCTO','PROVEEDOR','Cprov','CLASE','TIPO','NOMBRE','EXTRAS',
      'C','N','N-NH4','N-NO3','N-org','N-ur','P','K','CaO','MgO','S','B','Co','Cu','Fe','Mn','Mo','SiO2','Zn','Na'];
    
    const nutrientKeys = ['C','N','N_NH4','N_NO3','N_org','N_ur','P','K','CaO','MgO','S','B','Co','Cu','Fe','Mn','Mo','SiO2','Zn','Na'];
    
    const lines = [headers.join(',')];

    for (const p of productos) {
      const values = [
        this._csvEscape(p.ID_PROD),
        this._csvEscape(p.COD),
        this._csvEscape(p.PRODUCTO),
        this._csvEscape(p.PROVEEDOR),
        p.Cprov || '',
        p.CLASE || '',
        p.TIPO || '',
        this._csvEscape(p.NOMBRE),
        this._csvEscape(p.EXTRAS)
      ];

      for (const key of nutrientKeys) {
        const val = p[key];
        if (val === 0 || val === null || val === undefined || val === '') {
          values.push('');
        } else {
          // Formato con coma decimal como en el original
          values.push(`"${String(val).replace('.', ',')}"`);
        }
      }

      lines.push(values.join(','));
    }

    return lines.join('\r\n');
  },

  /**
   * Escapa un campo para CSV (envuelve en comillas si contiene coma, comillas o saltos)
   */
  _csvEscape(val) {
    if (!val) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }
};
