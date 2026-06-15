/**
 * FORMULADOR_CFQ — Vista de Fórmulas Guardadas
 * Lista, filtra y opera sobre las fórmulas persistidas en Google Sheets.
 */

import { Utils } from './utils.js';
import { Api } from './api.js';
import { CsvParser } from './csv-parser.js';

/* ── SVG Icons ── */
const ICONS = {
  eye: `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 10s4-6 9-6 9 6 9 6-4 6-9 6-9-6-9-6z"/><circle cx="10" cy="10" r="3"/></svg>`,
  edit: `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l5 5L7 18H2v-5L12 3z"/></svg>`,
  copy: `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M4 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>`,
  compare: `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 4h3v12H6z"/><path d="M11 4h3v12h-3z"/><path d="M9 10h2"/></svg>`,
  trash: `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="3 6 5 6 17 6"/><path d="M8 6V4a1 1 0 011-1h2a1 1 0 011 1v2"/><path d="M5 6v11a2 2 0 002 2h6a2 2 0 002-2V6"/></svg>`,
  refresh: `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17.65 6.35A8 8 0 1 0 19 10"/><polyline points="17.65 2 17.65 6.35 13.3 6.35"/></svg>`,
  upload: `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 14V4"/><polyline points="6 8 10 4 14 8"/><path d="M4 16h12"/></svg>`,
  search: `<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" style="opacity:0.5"><circle cx="9" cy="9" r="6"/><line x1="13.5" y1="13.5" x2="18" y2="18"/></svg>`,
};

export const FormulasGuardadas = {
  _container: null,
  _data: [],
  _filtered: [],
  _search: '',
  _catalogo: [],

  async init(container, actions = {}) {
    this._container = container;
    this._actions = actions;
    await this._loadCatalogo();
    this._render();
    await this._load();
  },

  async _loadCatalogo() {
    try {
      this._catalogo = await Api.fetchMP();
    } catch {
      try {
        this._catalogo = JSON.parse(localStorage.getItem('formulador_sub_cache_mp') || '[]');
      } catch {
        this._catalogo = [];
      }
    }
  },

  _resolveNombreDestino(f) {
    if (f.NOMBRE_DESTINO) return f.NOMBRE_DESTINO;
    if (f.COD_PROD_DESTINO && this._catalogo.length) {
      const prod = this._catalogo.find(p => p.COD === f.COD_PROD_DESTINO);
      if (prod) return prod.PRODUCTO || prod.NOMBRE || f.COD_PROD_DESTINO;
    }
    return f.COD_PROD_DESTINO || '—';
  },

  async _load() {
    try {
      Utils.setLoading(true, 'Cargando fórmulas...');
      try {
        this._data = await Api.fetchFormulas();
      } catch (fetchErr) {
        this._data = JSON.parse(localStorage.getItem('formulador_sub_cache_formulas') || '[]');
        if (this._data.length) {
          Utils.toast('No se pudo leer Sheets; usando fórmulas locales', 'warning', 5000);
        }
      }
      this._apply();
      Utils.setLoading(false);
    } catch (err) {
      Utils.setLoading(false);
      Utils.toast('Error al cargar fórmulas: ' + err.message, 'error');
    }
  },

  _render() {
    this._container.innerHTML = `
      <div class="view-header">
        <div class="view-header-left">
          <h2 class="view-title">Fórmulas guardadas</h2>
          <span class="badge" id="fg-count">0 fórmulas</span>
        </div>
        <div class="view-header-right">
          <button class="btn btn-secondary" id="btn-import-recetas">
            ${ICONS.upload} Importar formulas
          </button>
          <button class="btn btn-secondary" id="btn-refresh-formulas">
            ${ICONS.refresh} Actualizar
          </button>
        </div>
      </div>
      <input type="file" id="fg-import-file" accept=".csv,text/csv" hidden />
      <div class="filters-bar" style="grid-template-columns: 1fr;">
        <div class="search-wrapper">
          ${ICONS.search}
          <input type="text" class="form-input search-input" id="fg-search" placeholder="Buscar por ID, producto o fecha...">
        </div>
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Producto destino</th>
              <th class="num-col">N</th>
              <th class="num-col">P</th>
              <th class="num-col">K</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="fg-tbody"></tbody>
        </table>
      </div>
      <div class="empty-state" id="fg-empty" style="display:none">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.4">
            <path d="M4 4h12a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z"/>
            <path d="M7 8h6M7 11h4"/>
          </svg>
        </div>
        <h3>Sin fórmulas guardadas</h3>
        <p>Guarde una fórmula desde el formulador para verla aquí.</p>
      </div>
    `;
    this._bind();
  },

  _bind() {
    document.getElementById('btn-import-recetas').addEventListener('click', () => {
      document.getElementById('fg-import-file').click();
    });
    document.getElementById('fg-import-file').addEventListener('change', e => this._importFile(e));
    document.getElementById('btn-refresh-formulas').addEventListener('click', () => this._load());
    document.getElementById('fg-search').addEventListener('input', Utils.debounce(e => {
      this._search = e.target.value.toLowerCase();
      this._apply();
    }, 200));
    document.getElementById('fg-tbody').addEventListener('click', e => {
      const btn = e.target.closest('button[data-action]');
      const row = e.target.closest('tr[data-id]');
      if (btn) return this._action(btn.dataset.action, btn.dataset.id);
      if (row) this._action('ver', row.dataset.id);
    });
  },

  async _importFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      Utils.setLoading(true, 'Leyendo formulas CSV...');
      const text = await file.text();
      const recetas = CsvParser.parseRecetasVerificar(text);

      if (!recetas.length) {
        Utils.setLoading(false);
        Utils.toast('No se encontraron formulas válidas en el CSV', 'warning');
        return;
      }

      let imported = 0;
      let failed = 0;

      for (const receta of recetas) {
        try {
          await Api.saveFormula(receta);
          imported++;
        } catch {
          failed++;
        }
      }

      this._data = recetas;
      localStorage.setItem('formulador_sub_cache_formulas', JSON.stringify(recetas));
      Utils.setLoading(false);
      await this._load();
      Utils.toast(
        failed ? `Importadas ${imported} formulas, ${failed} fallaron` : `Importadas ${imported} formulas`,
        failed ? 'warning' : 'success'
      );
    } catch (err) {
      Utils.setLoading(false);
      Utils.toast('Error importando formulas: ' + err.message, 'error');
    }
  },

  _apply() {
    this._filtered = this._data.filter(f => {
      if (!this._search) return true;
      const text = `${f.ID || ''} ${f.FECHA || ''} ${f.NOMBRE_DESTINO || ''} ${f.COD_PROD_DESTINO || ''}`.toLowerCase();
      return text.includes(this._search);
    });
    this._renderTable();
  },

  _renderTable() {
    const tbody = document.getElementById('fg-tbody');
    const empty = document.getElementById('fg-empty');
    const count = document.getElementById('fg-count');
    count.textContent = `${this._filtered.length} fórmulas`;
    if (!this._filtered.length) {
      tbody.innerHTML = '';
      empty.style.display = 'flex';
      return;
    }
    empty.style.display = 'none';
    tbody.innerHTML = this._filtered.map(f => {
      const nombre = this._resolveNombreDestino(f);
      return `
      <tr data-id="${Utils.escapeHtml(f.ID)}">
        <td><span style="font-family:var(--font-mono);font-size:var(--fs-xs);color:var(--green-400)">${Utils.escapeHtml(f.ID)}</span></td>
        <td>${Utils.escapeHtml(f.FECHA || '')}</td>
        <td class="product-name">${Utils.escapeHtml(nombre)}</td>
        <td class="num-col">${Utils.fmtGrade(f.T_N)}</td>
        <td class="num-col">${Utils.fmtGrade(f.T_P)}</td>
        <td class="num-col">${Utils.fmtGrade(f.T_K)}</td>
        <td><span class="badge">${Utils.escapeHtml(f.ESTADO || '—')}</span></td>
        <td>
          <div class="row-actions">
            <button class="btn-icon" data-action="ver" data-id="${Utils.escapeHtml(f.ID)}" title="Ver">${ICONS.eye}</button>
            <button class="btn-icon" data-action="editar" data-id="${Utils.escapeHtml(f.ID)}" title="Editar">${ICONS.edit}</button>
            <button class="btn-icon" data-action="clonar" data-id="${Utils.escapeHtml(f.ID)}" title="Clonar">${ICONS.copy}</button>
            <button class="btn-icon" data-action="comparar" data-id="${Utils.escapeHtml(f.ID)}" title="Comparar">${ICONS.compare}</button>
            <button class="btn-icon" data-action="eliminar" data-id="${Utils.escapeHtml(f.ID)}" title="Eliminar">${ICONS.trash}</button>
          </div>
        </td>
      </tr>
      `;
    }).join('');
  },

  async _action(action, id) {
    const formula = this._data.find(f => String(f.ID) === String(id));
    if (!formula) return;
    if (action === 'ver' || action === 'editar' || action === 'clonar') {
      this._actions?.[action]?.(formula);
      return;
    }
    if (action === 'comparar') {
      this._actions?.comparar?.(formula);
      return;
    }
    if (action === 'eliminar') {
      const ok = await Utils.confirm(`¿Eliminar la fórmula ${id}?`);
      if (!ok) return;
      try {
        await Api.deleteFormula(id);
        Utils.toast('Fórmula eliminada', 'success');
        await this._load();
      } catch (err) {
        Utils.toast('Error al eliminar: ' + err.message, 'error');
      }
    }
  }
};
