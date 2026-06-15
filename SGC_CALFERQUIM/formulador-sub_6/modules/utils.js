/**
 * FORMULADOR_CFQ — Utilidades compartidas
 * Funciones auxiliares para formateo, validación y generación de IDs
 */

export const Utils = {
  /**
   * Parsea un valor numérico que puede usar coma como separador decimal
   * "18,00" → 18.00, "" → 0, null → 0
   */
  parseNum(val) {
    if (val === null || val === undefined || val === '') return 0;
    if (typeof val === 'number') return val;
    const cleaned = String(val).replace(/"/g, '').trim();
    if (cleaned === '') return 0;
    // Reemplazar coma decimal por punto
    return parseFloat(cleaned.replace(',', '.')) || 0;
  },

  /**
   * Formatea número a 2 decimales con coma como separador decimal (locale ES)
   */
  fmtNum(val, decimals = 2) {
    if (val === null || val === undefined || val === '') return '0';
    const num = typeof val === 'number' ? val : this.parseNum(val);
    if (num === 0) return '0';
    return num.toLocaleString('es-CO', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  },

  /**
   * Formatea número para display sin ceros innecesarios
   */
  fmtDisplay(val) {
    const num = typeof val === 'number' ? val : this.parseNum(val);
    if (num === 0) return '—';
    if (Number.isInteger(num)) return num.toString();
    return num.toLocaleString('es-CO', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2
    });
  },

  /**
   * Formatea grado/composición con máximo 2 decimales.
   * Se usa para mostrar nutrientes y grados sin sobreprecisión visual.
   */
  fmtGrade(val) {
    const num = typeof val === 'number' ? val : this.parseNum(val);
    if (num === 0) return '—';
    return num.toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  },

  /**
   * Genera un ID hexadecimal de 8 caracteres (como los hash del CSV: 818ad5b2)
   */
  generateId() {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Formatea fecha a DD/MM/YYYY
   */
  fmtDate(date) {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  },

  /**
   * Parsea fecha desde DD/MM/YYYY a Date
   */
  parseDate(str) {
    if (!str) return null;
    const parts = str.split('/');
    if (parts.length !== 3) return null;
    const [dd, mm, yyyy] = parts;
    return new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd));
  },

  /**
   * Fecha actual en formato DD/MM/YYYY
   */
  today() {
    return this.fmtDate(new Date());
  },

  /**
   * Fecha actual en formato ISO para inputs type=date
   */
  todayISO() {
    const d = new Date();
    return d.toISOString().split('T')[0];
  },

  /**
   * Debounce — retrasa ejecución hasta que paren de llamar
   */
  debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },

  /**
   * Escapa HTML para prevenir XSS
   */
  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * Lista de todos los nutrientes con sus claves
   */
  NUTRIENTES: [
    { key: 'C', label: 'C (Orgánico)', group: 'secondary' },
    { key: 'N', label: 'N (Total)', group: 'np' },
    { key: 'N_NH4', label: 'N-NH4', group: 'np' },
    { key: 'N_NO3', label: 'N-NO3', group: 'np' },
    { key: 'N_org', label: 'N-org', group: 'np' },
    { key: 'N_ur', label: 'N-ur', group: 'np' },
    { key: 'P', label: 'P₂O₅', group: 'np' },
    { key: 'K', label: 'K₂O', group: 'k' },
    { key: 'CaO', label: 'CaO', group: 'secondary' },
    { key: 'MgO', label: 'MgO', group: 'secondary' },
    { key: 'S', label: 'S', group: 'secondary' },
    { key: 'B', label: 'B', group: 'micro' },
    { key: 'Co', label: 'Co', group: 'micro' },
    { key: 'Cu', label: 'Cu', group: 'micro' },
    { key: 'Fe', label: 'Fe', group: 'micro' },
    { key: 'Mn', label: 'Mn', group: 'micro' },
    { key: 'Mo', label: 'Mo', group: 'micro' },
    { key: 'SiO2', label: 'SiO₂', group: 'secondary' },
    { key: 'Zn', label: 'Zn', group: 'micro' },
    { key: 'Na', label: 'Na', group: 'micro' }
  ],

  /** Claves de nutrientes para mapeo rápido */
  NUTRIENT_KEYS: ['C','N','N_NH4','N_NO3','N_org','N_ur','P','K','CaO','MgO','S','B','Co','Cu','Fe','Mn','Mo','SiO2','Zn','Na'],

  /** Claves mostradas en la tabla editable de catálogo */
  CATALOGO_EDITABLE_KEYS: ['C','N','N_NH4','N_NO3','N_org','N_ur','P','K','CaO','MgO','S','B','Co','Cu','Fe','Mn','Mo','SiO2','Zn','Na'],

  /**
   * Mapeo de claves CSV (con guiones) a claves JS (con underscore)
   * En el CSV original: N-NH4 → en JS: N_NH4
   */
  csvKeyToJsKey(csvKey) {
    return csvKey.replace(/-/g, '_');
  },

  jsKeyToCsvKey(jsKey) {
    // N_NH4 → N-NH4, N_NO3 → N-NO3, etc.
    return jsKey.replace(/_/g, '-');
  },

  /**
   * Crea un elemento HTML con clase y contenido
   */
  el(tag, className, innerHTML) {
    const elem = document.createElement(tag);
    if (className) elem.className = className;
    if (innerHTML !== undefined) elem.innerHTML = innerHTML;
    return elem;
  },

  /**
   * Toast notification
   */
  toast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container') || (() => {
      const c = document.createElement('div');
      c.id = 'toast-container';
      document.body.appendChild(c);
      return c;
    })();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
      <span class="toast-msg">${this.escapeHtml(message)}</span>
    `;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('toast-visible'));

    setTimeout(() => {
      toast.classList.remove('toast-visible');
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 400);
    }, duration);
  },

  /**
   * Muestra/oculta loading overlay
   */
  setLoading(show, message = 'Cargando...') {
    let overlay = document.getElementById('loading-overlay');
    if (show) {
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `<div class="spinner"></div><p class="loading-text">${this.escapeHtml(message)}</p>`;
        document.body.appendChild(overlay);
      } else {
        overlay.querySelector('.loading-text').textContent = message;
        overlay.style.display = 'flex';
      }
      requestAnimationFrame(() => overlay.classList.add('visible'));
    } else if (overlay) {
      overlay.classList.remove('visible');
      setTimeout(() => { overlay.style.display = 'none'; }, 300);
    }
  },

  /**
   * Confirmar acción con modal
   */
  confirm(message) {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
        <div class="modal-content modal-confirm">
          <h3>Confirmar</h3>
          <p>${this.escapeHtml(message)}</p>
          <div class="modal-actions">
            <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
            <button class="btn btn-danger" data-action="confirm">Confirmar</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      requestAnimationFrame(() => overlay.classList.add('visible'));

      overlay.addEventListener('click', e => {
        const action = e.target.dataset.action;
        if (action === 'confirm') {
          resolve(true);
        } else if (action === 'cancel' || e.target === overlay) {
          resolve(false);
        } else return;
        overlay.classList.remove('visible');
        setTimeout(() => overlay.remove(), 300);
      });
    });
  }
};
