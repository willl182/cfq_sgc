/**
 * FORMULADOR_CFQ — Vista de Catálogo de Materias Primas
 * Tabla interactiva, búsqueda, filtros, importación CSV
 */

import { Utils } from './utils.js';
import { Api } from './api.js';
import { CsvParser } from './csv-parser.js';

export const Catalogo = {
  _container: null,
  _data: [],
  _filtered: [],
  _searchTerm: '',
  _filterClase: '',
  _filterTipo: '',

  /**
   * Inicializa la vista del catálogo
   * @param {HTMLElement} container - Elemento donde renderizar
   */
  async init(container) {
    this._container = container;
    this._render();
    await this._loadData();
  },

  async _loadData() {
    try {
      Utils.setLoading(true, 'Cargando catálogo...');
      this._data = await Api.fetchMP();
      if (!this._data || this._data.length === 0) {
        await this._preloadFromBundledCsv();
        this._data = await Api.fetchMP(true);
      }
      this._applyFilters();
      Utils.setLoading(false);
    } catch (err) {
      Utils.setLoading(false);
      Utils.toast('Error al cargar catálogo: ' + err.message, 'error');
    }
  },

  _render() {
    this._container.innerHTML = `
      <div class="view-header">
        <div class="view-header-left">
          <h2 class="view-title">Catálogo de Insumos</h2>
          <span class="badge" id="cat-count">0 productos</span>
        </div>
        <div class="view-header-right">
          <button class="btn btn-secondary" id="btn-refresh-cat">
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M17.65 6.35A8 8 0 1 0 19 10"/>
              <polyline points="17.65 2 17.65 6.35 13.3 6.35"/>
            </svg>
            Actualizar
          </button>
          <label class="btn btn-primary" for="csv-file-input">
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M14 2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
              <polyline points="10 7 10 13"/>
              <polyline points="7 10 10 7 13 10"/>
            </svg>
            Importar CSV
          </label>
          <input type="file" id="csv-file-input" accept=".csv" style="display:none">
        </div>
      </div>

      <div class="filters-bar">
        <div class="search-wrapper">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" style="opacity:0.5">
            <circle cx="9" cy="9" r="6"/>
            <line x1="13.5" y1="13.5" x2="18" y2="18"/>
          </svg>
          <input type="text" class="form-input search-input" id="cat-search" 
                 placeholder="Buscar por nombre, código o proveedor...">
        </div>
        <select class="form-select" id="cat-filter-clase">
          <option value="">Todas las clases</option>
          <option value="MP">MP — Materia Prima</option>
          <option value="PT">PT — Producto Terminado</option>
        </select>
        <select class="form-select" id="cat-filter-tipo">
          <option value="">Todos los tipos</option>
          <option value="G">G — Granulado</option>
          <option value="P">P — Polvo</option>
          <option value="L">L — Líquido</option>
          <option value="C">C — Cristalino</option>
        </select>
      </div>

      <div class="table-wrapper">
        <table class="data-table" id="cat-table">
          <thead>
            <tr>
              <th>COD</th>
              <th>Producto</th>
              <th>Proveedor</th>
              <th>Clase</th>
              <th>Tipo</th>
              <th class="num-col">N</th>
              <th class="num-col">P</th>
              <th class="num-col">K</th>
              <th class="num-col">CaO</th>
              <th class="num-col">MgO</th>
              <th class="num-col">S</th>
              <th class="num-col">SiO₂</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="cat-tbody"></tbody>
        </table>
      </div>

      <div class="empty-state" id="cat-empty" style="display:none">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.4">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
        </div>
        <h3>Sin productos</h3>
        <p>Importe el archivo CSV de materias primas para comenzar</p>
      </div>
    `;

    this._bindEvents();
  },

  _bindEvents() {
    // Búsqueda
    const searchInput = document.getElementById('cat-search');
    searchInput.addEventListener('input', Utils.debounce(e => {
      this._searchTerm = e.target.value.toLowerCase();
      this._applyFilters();
    }, 200));

    // Filtros
    document.getElementById('cat-filter-clase').addEventListener('change', e => {
      this._filterClase = e.target.value;
      this._applyFilters();
    });

    document.getElementById('cat-filter-tipo').addEventListener('change', e => {
      this._filterTipo = e.target.value;
      this._applyFilters();
    });

    // Importar CSV
    document.getElementById('csv-file-input').addEventListener('change', e => {
      this._handleImport(e.target.files[0]);
      e.target.value = '';
    });

    // Actualizar
    document.getElementById('btn-refresh-cat').addEventListener('click', () => {
      this._loadData();
    });

    // Click en tabla
    document.getElementById('cat-tbody').addEventListener('click', e => {
      const row = e.target.closest('tr[data-id]');
      if (row) this._showDetail(row.dataset.id);
    });
  },

  _applyFilters() {
    this._filtered = this._data.filter(p => {
      // Filtro de clase
      if (this._filterClase && p.CLASE !== this._filterClase) return false;
      // Filtro de tipo
      if (this._filterTipo && String(p.TIPO || '').toUpperCase() !== this._filterTipo) return false;
      // Búsqueda
      if (this._searchTerm) {
        const searchable = `${p.COD} ${p.PRODUCTO} ${p.PROVEEDOR} ${p.NOMBRE}`.toLowerCase();
        if (!searchable.includes(this._searchTerm)) return false;
      }
      return true;
    });

    this._renderTable();
  },

  _renderTable() {
    const tbody = document.getElementById('cat-tbody');
    const empty = document.getElementById('cat-empty');
    const count = document.getElementById('cat-count');

    count.textContent = `${this._filtered.length} productos`;

    if (this._filtered.length === 0) {
      tbody.innerHTML = '';
      empty.style.display = 'flex';
      return;
    }

    empty.style.display = 'none';

    tbody.innerHTML = this._filtered.map(p => `
      <tr data-id="${Utils.escapeHtml(p.ID_PROD)}" class="table-row-animate">
        <td class="code-cell">${Utils.escapeHtml(p.COD)}</td>
        <td class="product-name">${Utils.escapeHtml(p.PRODUCTO)}</td>
        <td>${Utils.escapeHtml(p.PROVEEDOR)}</td>
        <td><span class="badge badge-${p.CLASE === 'PT' ? 'pt' : 'mp'}">${Utils.escapeHtml(p.CLASE)}</span></td>
        <td>${Utils.escapeHtml(p.TIPO || '—')}</td>
        <td class="num-col">${Utils.fmtGrade(p.N)}</td>
        <td class="num-col">${Utils.fmtGrade(p.P)}</td>
        <td class="num-col">${Utils.fmtGrade(p.K)}</td>
        <td class="num-col">${Utils.fmtGrade(p.CaO)}</td>
        <td class="num-col">${Utils.fmtGrade(p.MgO)}</td>
        <td class="num-col">${Utils.fmtGrade(p.S)}</td>
        <td class="num-col">${Utils.fmtGrade(p.SiO2)}</td>
        <td><button class="btn-icon" title="Ver detalle">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 10s4-6 9-6 9 6 9 6-4 6-9 6-9-6-9-6z"/>
            <circle cx="10" cy="10" r="3"/>
          </svg>
        </button></td>
      </tr>
    `).join('');
  },

  _showDetail(idProd) {
    const p = this._data.find(x => x.ID_PROD === idProd);
    if (!p) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-content modal-detail">
        <div class="modal-header">
          <h3>${Utils.escapeHtml(p.PRODUCTO)}</h3>
          <button class="btn-icon modal-close" title="Cerrar">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="4" y1="4" x2="16" y2="16"/><line x1="16" y1="4" x2="4" y2="16"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="detail-meta">
            <div class="detail-item"><span class="detail-label">Código</span> ${Utils.escapeHtml(p.COD)}</div>
            <div class="detail-item"><span class="detail-label">Proveedor</span> ${Utils.escapeHtml(p.PROVEEDOR || '—')}</div>
            <div class="detail-item"><span class="detail-label">Clase</span> <span class="badge badge-${p.CLASE === 'PT' ? 'pt' : 'mp'}">${Utils.escapeHtml(p.CLASE)}</span></div>
            <div class="detail-item"><span class="detail-label">Tipo</span> ${Utils.escapeHtml(p.TIPO || '—')}</div>
            <div class="detail-item"><span class="detail-label">ID</span> <span style="font-family:var(--font-mono);font-size:var(--fs-xs)">${Utils.escapeHtml(p.ID_PROD)}</span></div>
          </div>
          <h4>Composición Química (%)</h4>
          <div class="nutrient-grid">
            ${Utils.NUTRIENTES.map(n => {
              const val = p[n.key] || 0;
              return `
                <div class="nutrient-item ${val > 0 ? 'has-value' : ''}">
                  <span class="nutrient-label">${n.label}</span>
                  <span class="nutrient-value">${Utils.fmtGrade(val)}</span>
                  ${val > 0 ? `<div class="nutrient-bar"><div class="nutrient-bar-fill" style="width: ${Math.min(val * 2, 100)}%"></div></div>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));

    overlay.addEventListener('click', e => {
      if (e.target === overlay || e.target.closest('.modal-close')) {
        overlay.classList.remove('visible');
        setTimeout(() => overlay.remove(), 300);
      }
    });
  },

  async _handleImport(file) {
    if (!file) return;

    try {
      Utils.setLoading(true, 'Importando CSV...');
      const text = await file.text();
      const productos = CsvParser.parseProductos(text);

      if (productos.length === 0) {
        throw new Error('No se encontraron productos en el archivo');
      }

      this._data = productos;
      Api._cacheMP = productos;
      localStorage.setItem('formulador_cache_mp', JSON.stringify(productos));
      this._applyFilters();

      if (Api.isConfigured()) {
        try {
          Utils.setLoading(true, `Guardando ${productos.length} productos en Google Sheets...`);
          await Api.saveMP(productos);
          Utils.toast(`${productos.length} productos importados y guardados`, 'success');
        } catch (saveErr) {
          Utils.toast(`${productos.length} productos cargados localmente, pero no se pudieron guardar en Sheets: ${saveErr.message}`, 'warning', 6000);
        }
      } else {
        Utils.toast(`${productos.length} productos importados exitosamente`, 'success');
      }

      Utils.setLoading(false);
    } catch (err) {
      Utils.setLoading(false);
      Utils.toast('Error al importar: ' + err.message, 'error');
    }
  },

  /** Devuelve los datos actuales del catálogo */
  getData() {
    return this._data;
  },

  async _preloadFromBundledCsv() {
    const candidates = [
      new URL('../FORMULADOR%20-%20PROD.csv', window.location.href).toString(),
      new URL('../FORMULADOR - PROD.csv', window.location.href).toString(),
      new URL('/SGC_CALFERQUIM/FORMULADOR%20-%20PROD.csv', window.location.origin).toString()
    ];

    let text = '';
    for (const path of candidates) {
      try {
        const resp = await fetch(path, { cache: 'no-store' });
        if (resp.ok) {
          text = await resp.text();
          break;
        }
      } catch {}
    }

    if (!text) {
      throw new Error('No se encontró el CSV precargado del catálogo');
    }

    const productos = CsvParser.parseProductos(text);
    if (!productos.length) {
      throw new Error('El CSV precargado no contiene productos válidos');
    }

    Utils.setLoading(true, `Precargando ${productos.length} productos en Google Sheets...`);
    await Api.saveMP(productos);
    Utils.toast(`Catálogo precargado con ${productos.length} productos`, 'success');
  }
};
