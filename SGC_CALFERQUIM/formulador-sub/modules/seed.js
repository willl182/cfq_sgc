/**
 * FORMULADOR_CFQ — Seed: CargaInicial CSV con validación e IDs secuenciales
 *
 * Reglas:
 * - Carga desde mp-pt_mzr.csv solo si catalogItems está vacío en localStorage
 * - Asigna IDs: MP#### para MP, PT#### para PT, MZR#### para filas COD=R/R1/R2...
 * - internalId es la clave funcional estable
 * - externalCode y originalCode conservan COD del CSV para trazabilidad
 * - Nutrientes normalizados: N_NH4, N_NO3, etc. (sin guiones en claves internas)
 * - Valida encabezados, nutrientes, valores numéricos, filas sin nombre y códigos ambiguos
 */

import { Utils } from './utils.js';
import { CsvParser } from './csv-parser.js';

const STORAGE_KEY = 'formulador_sub_catalog_items';
const HISTORY_KEY = 'formulador_sub_catalog_history';
const NUTRIENT_CSV_MAP = {
  'C': 'C', 'N': 'N', 'N-NH4': 'N_NH4', 'N-NO3': 'N_NO3',
  'N-org': 'N_org', 'N-ur': 'N_ur', 'P': 'P', 'K': 'K',
  'CaO': 'CaO', 'MgO': 'MgO', 'S': 'S', 'B': 'B',
  'Co': 'Co', 'Cu': 'Cu', 'Fe': 'Fe', 'Mn': 'Mn',
  'Mo': 'Mo', 'SiO2': 'SiO2', 'Zn': 'Zn', 'Na': 'Na'
};

const REQUIRED_HEADERS = ['COD', 'PRODUCTO', 'CLASE', 'TIPO'];

function isMZR(row) {
  const cod = String(row.COD || '').trim();
  return /^(R\d{0,2}|R)$/.test(cod);
}

function classifyRow(row) {
  if (isMZR(row)) return 'MZR';
  const clase = String(row.CLASE || '').trim().toUpperCase();
  if (clase === 'MP') return 'MP';
  if (clase === 'PT') return 'PT';
  return 'PT';
}

function generateId(clase, sequence) {
  const prefix = clase === 'MZR' ? 'MZR' : clase;
  return `${prefix}${String(sequence).padStart(4, '0')}`;
}

export const Seed = {
  _items: null,
  _history: null,

  get items() {
    if (!this._items) {
      try {
        this._items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      } catch { this._items = []; }
    }
    return this._items;
  },

  get history() {
    if (!this._history) {
      try {
        this._history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      } catch { this._history = []; }
    }
    return this._history;
  },

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._items));
    localStorage.setItem(HISTORY_KEY, JSON.stringify(this._history));
  },

  isLoaded() {
    return this.items.length > 0;
  },

  /**
   * Valida el CSV y retorna informe de validación sin cargar
   */
  validate(text) {
    const errors = [];
    const warnings = [];
    const raw = CsvParser.parse(text);

    if (raw.length === 0) {
      errors.push('El CSV está vacío o no se pudo parsear');
      return { valid: false, errors, warnings, rows: 0 };
    }

    const headers = Object.keys(raw[0]);
    const missing = REQUIRED_HEADERS.filter(h => !headers.includes(h));
    if (missing.length) {
      errors.push(`Faltan columnas obligatorias: ${missing.join(', ')}`);
    }

    const knownNutrients = Object.keys(NUTRIENT_CSV_MAP);
    const unknownNutrients = headers.filter(h => !REQUIRED_HEADERS.includes(h) && !knownNutrients.includes(h) && h !== 'Test' && h !== 'PROVEEDOR' && h !== 'NOMBRE' && h !== 'EXTRAS' && h !== 'Cprov' && h !== 'ID_PROD');
    if (unknownNutrients.length) {
      warnings.push(`Columnas desconocidas: ${unknownNutrients.slice(0, 5).join(', ')}${unknownNutrients.length > 5 ? ` y ${unknownNutrients.length - 5} más` : ''}`);
    }

    let nonNumericCount = 0;
    let emptyNameCount = 0;
    let ambiguousCodCount = 0;
    const codSet = new Set();

    for (let i = 0; i < raw.length; i++) {
      const row = raw[i];
      const cod = String(row.COD || '').trim();
      const producto = String(row.PRODUCTO || '').trim();

      if (!producto) {
        emptyNameCount++;
        if (emptyNameCount <= 3) warnings.push(`Fila ${i + 2}: sin nombre de producto`);
      }

      if (cod) {
        if (codSet.has(cod.toUpperCase())) {
          ambiguousCodCount++;
          if (ambiguousCodCount <= 3) warnings.push(`Fila ${i + 2}: código duplicado "${cod}"`);
        }
        codSet.add(cod.toUpperCase());
      }

      for (const [csvKey, jsKey] of Object.entries(NUTRIENT_CSV_MAP)) {
        const val = row[csvKey];
        if (val !== '' && val !== undefined && val !== null) {
          const parsed = Utils.parseNum(val);
          if (isNaN(parsed) && String(val).trim() !== '') {
            nonNumericCount++;
            if (nonNumericCount <= 5) warnings.push(`Fila ${i + 2}, ${csvKey}: valor no numérico "${val}"`);
          }
        }
      }
    }

    if (emptyNameCount > 5) warnings.push(`... y ${emptyNameCount - 3} filas más sin nombre`);
    if (nonNumericCount > 5) warnings.push(`... y ${nonNumericCount - 5} valores más no numéricos`);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      rows: raw.length,
      emptyNames: emptyNameCount,
      duplicateCodes: ambiguousCodCount,
      nonNumeric: nonNumericCount
    };
  },

  /**
   * Carga el CSV en catalogItems con IDs secuenciales
   * Solo ejecuta si catalogItems está vacío
   */
  loadFromCSV(text) {
    if (this.isLoaded()) {
      return { loaded: false, reason: 'Catálogo ya cargado. Use reset() para limpiar primero.' };
    }

    const validation = this.validate(text);
    if (!validation.valid) {
      return { loaded: false, reason: `Errores de validación: ${validation.errors.join('; ')}` };
    }

    const raw = CsvParser.parse(text);
    const counters = { MP: 0, PT: 0, MZR: 0 };
    const items = [];

    for (const row of raw) {
      const clase = classifyRow(row);
      counters[clase]++;
      const internalId = generateId(clase, counters[clase]);

      const item = {
        internalId,
        externalCode: String(row.COD || '').trim(),
        originalCode: String(row.COD || '').trim(),
        PRODUCTO: String(row.PRODUCTO || '').trim(),
        PROVEEDOR: String(row.PROVEEDOR || '').trim(),
        clase,
        tipo: String(row.TIPO || '').trim().toUpperCase() || 'G',
        nombre: String(row.NOMBRE || row.PRODUCTO || '').trim(),
        archivedAt: null,
        updatedAt: Date.now()
      };

      for (const [csvKey, jsKey] of Object.entries(NUTRIENT_CSV_MAP)) {
        item[jsKey] = Utils.parseNum(row[csvKey]);
      }

      items.push(item);
    }

    this._items = items;
    this._history = [];
    this.save();

    return {
      loaded: true,
      inserted: items.length,
      rejected: validation.emptyNames + validation.duplicateCodes,
      errors: validation.warnings,
      counters: { ...counters },
      total: items.length
    };
  },

  /**
   * Carga desde texto CSV con detección automática de separador
   * El CSV principal (mp-pt_mzr.csv) usa ';' como separador
   */
  loadFromText(text) {
    const firstLine = text.split('\n')[0] || '';
    const usesSemicolon = firstLine.includes(';');

    const normalizedText = usesSemicolon ? text.replaceAll(';', ',') : text;
    return this.loadFromCSV(normalizedText);
  },

  /**
   * Lee CSV desde archivo embebido o URL y carga
   */
  async loadFromURL(url) {
    try {
      const resp = await fetch(url, { cache: 'no-store' });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const text = await resp.text();
      return this.loadFromCSV(text);
    } catch (err) {
      return { loaded: false, reason: `Error cargando CSV: ${err.message}` };
    }
  },

  /**
   * Resetea el catálogo completo (solo admin)
   */
  reset() {
    this._items = [];
    this._history = [];
    this.save();
    return { reset: true };
  },

  /**
   * Busca items por clase
   */
  getByClase(clase) {
    return this.items.filter(i => i.clase === clase && !i.archivedAt);
  },

  /**
   * Busca item por internalId
   */
  getById(internalId) {
    return this.items.find(i => i.internalId === internalId);
  },

  /**
   * Busca item por externalCode (COD original)
   */
  getByExternalCode(code) {
    return this.items.find(i => i.externalCode === code && !i.archivedAt);
  },

  /**
   * Busca items por texto libre
   */
  search(term, clases = null) {
    const t = (term || '').toLowerCase();
    return this.items.filter(i => {
      if (i.archivedAt) return false;
      if (clases && !clases.includes(i.clase)) return false;
      if (!t) return true;
      return `${i.internalId} ${i.externalCode} ${i.PRODUCTO} ${i.PROVEEDOR} ${i.nombre}`.toLowerCase().includes(t);
    });
  },

  /**
   * Actualiza un item y guarda auditoría
   */
  updateItem(internalId, changes, actor = 'local', reason = '') {
    const idx = this.items.findIndex(i => i.internalId === internalId);
    if (idx === -1) return null;

    const item = this.items[idx];
    const before = {};
    const after = {};

    for (const [key, value] of Object.entries(changes)) {
      if (item[key] !== value) {
        before[key] = item[key];
        after[key] = value;
        item[key] = value;
      }
    }

    if (Object.keys(before).length > 0) {
      item.updatedAt = Date.now();
      this._history.push({
        catalogItemId: internalId,
        internalId,
        changedAt: Date.now(),
        actor,
        fields: Object.keys(before),
        before,
        after,
        reason
      });
      this.save();
    }

    return item;
  },

  /**
   * Archiva un item (soft delete)
   */
  archiveItem(internalId, reason = '') {
    const item = this.getById(internalId);
    if (!item) return null;

    const listWarning = '';
    item.archivedAt = Date.now();
    item.archiveReason = reason;

    this._history.push({
      catalogItemId: internalId,
      internalId,
      changedAt: Date.now(),
      actor: 'local',
      fields: ['archivedAt'],
      before: { archivedAt: null },
      after: { archivedAt: Date.now() },
      reason: reason || 'Archivado'
    });
    this.save();
    return item;
  },

  /**
   * Restaurar item archivado
   */
  unarchiveItem(internalId) {
    const item = this.items.find(i => i.internalId === internalId);
    if (!item) return null;

    item.archivedAt = null;
    item.archiveReason = '';
    item.updatedAt = Date.now();
    this.save();
    return item;
  },

  /**
   * Retorna historial de cambios
   */
  getHistory(internalId = null, limit = 50) {
    if (internalId) {
      return this.history.filter(h => h.internalId === internalId).slice(-limit);
    }
    return this.history.slice(-limit);
  },

  /**
   * Check si el usuario es admin (localStorage)
   */
  isAdmin() {
    return localStorage.getItem('formulador_sub_is_admin') === 'true';
  },

  setAdmin(isAdmin) {
    localStorage.setItem('formulador_sub_is_admin', isAdmin ? 'true' : 'false');
  }
};