/**
 * FORMULADOR_CFQ — Catálogo Unificado (Reemplaza catalogo.js + inventario-editor.js)
 *
 * Catálogo unificado: MP, PT, MZR en una sola vista
 * Edición inline de nutrientes (solo MP para usuario normal; PT/MZR solo para admin)
 * Historial de cambios por item y tabla global
 * Importación CSV con validación y IDs secuenciales
 * Autosave con debounce y estados de guardado
 */

import { Utils } from './utils.js';
import { Seed } from './seed.js';
import { NUTRIENTES, NUTRIENT_KEYS } from './formulas.js';

const AUTOSAVE_DELAY = 800;
const DISPLAY_NUTRIENTS = ['N', 'P', 'K', 'CaO', 'MgO', 'S', 'B', 'Zn', 'SiO2'];
const ALL_EDITABLE_KEYS = NUTRIENT_KEYS;

let _debounceTimers = {};

export const CatalogoUnificado = {
  _container: null,
  _searchTerm: '',
  _filterClase: '',
  _filterTipo: '',
  _expandedRow: null,
  _sortField: 'PRODUCTO',
  _sortAsc: true,
  _saveStates: {},

  async init(container) {
    this._container = container;

    if (!Seed.isLoaded()) {
      try {
        Utils.setLoading(true, 'Cargando catálogo...');
        const base = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
        const mpCsvUrl = base + 'insumos_ref/mp-pt_mzr.csv';
        const result = await Seed.loadFromText(await (await fetch(mpCsvUrl, { cache: 'no-store' })).text());
        if (!result.loaded) {
          const fallbackUrl = base + 'FORMULADOR%20-%20PROD.csv';
          const fallbackText = await (await fetch(fallbackUrl, { cache: 'no-store' })).text();
          const fallback = await Seed.loadFromText(fallbackText);
          if (!fallback.loaded) {
            Utils.toast('No se pudo cargar el catálogo: ' + (fallback.reason || result.reason), 'error', 8000);
          } else {
            Utils.toast(`Catálogo cargado: ${fallback.total} insumos`, 'success');
          }
        } else {
          Utils.toast(`Catálogo cargado: ${result.total} insumos`, 'success');
        }
        Utils.setLoading(false);
      } catch (err) {
        Utils.setLoading(false);
        Utils.toast('Error cargando catálogo: ' + err.message, 'error');
      }
    }

    this._render();
  },

  _render() {
    const isAdmin = Seed.isAdmin();
    const data = this._getFilteredData();

    this._container.innerHTML = `
      <div class="view-header">
        <div class="view-header-left">
          <h2 class="view-title">Catálogo Unificado</h2>
          <span class="badge" id="cat-uni-count">${data.length} insumos</span>
        </div>
        <div class="view-header-right">
          <label class="btn btn-secondary" for="cat-uni-csv" style="cursor:pointer">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M14 2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
              <polyline points="10 7 10 13"/><polyline points="7 10 10 7 13 10"/>
            </svg>
            Importar CSV
          </label>
          <input type="file" id="cat-uni-csv" accept=".csv,text/csv" style="display:none">
          <button class="btn btn-secondary" id="btn-cat-uni-history">Historial</button>
          <button class="btn btn-secondary" id="btn-cat-uni-admin">
            ${isAdmin ? '🔓 Admin' : '🔒 Admin'}
          </button>
          <button class="btn btn-secondary" id="btn-cat-uni-refresh">Actualizar</button>
        </div>
      </div>

      <div class="filters-bar">
        <div class="search-wrapper">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" style="opacity:0.5">
            <circle cx="9" cy="9" r="6"/><line x1="13.5" y1="13.5" x2="18" y2="18"/>
          </svg>
          <input type="text" class="form-input search-input" id="cat-uni-search"
                 placeholder="Buscar por código, nombre o proveedor..." value="${Utils.escapeHtml(this._searchTerm)}">
        </div>
        <select class="form-select" id="cat-uni-filter-clase">
          <option value="">Todas las clases</option>
          <option value="MP" ${this._filterClase === 'MP' ? 'selected' : ''}>MP — Materia Prima</option>
          <option value="PT" ${this._filterClase === 'PT' ? 'selected' : ''}>PT — Producto Terminado</option>
          <option value="MZR" ${this._filterClase === 'MZR' ? 'selected' : ''}>MZR — Mezcla para Retiro</option>
        </select>
        <select class="form-select" id="cat-uni-filter-tipo">
          <option value="">Todos los tipos</option>
          <option value="G" ${this._filterTipo === 'G' ? 'selected' : ''}>G — Granulado</option>
          <option value="P" ${this._filterTipo === 'P' ? 'selected' : ''}>P — Polvo</option>
          <option value="L" ${this._filterTipo === 'L' ? 'selected' : ''}>L — Líquido</option>
          <option value="C" ${this._filterTipo === 'C' ? 'selected' : ''}>C — Cristalino</option>
        </select>
      </div>

      <div class="table-wrapper">
        <table class="data-table" id="cat-uni-table">
          <thead>
            <tr>
              <th class="sortable" data-sort="internalId">ID</th>
              <th class="sortable" data-sort="PRODUCTO">Producto</th>
              <th>Proveedor</th>
              <th>Clase</th>
              <th>Tipo</th>
              ${DISPLAY_NUTRIENTS.map(n => {
                const info = NUTRIENTES.find(ni => ni.key === n);
                return `<th class="num-col">${info?.label || n}</th>`;
              }).join('')}
              <th></th>
            </tr>
          </thead>
          <tbody id="cat-uni-tbody"></tbody>
        </table>
      </div>

      <div class="empty-state" id="cat-uni-empty" style="display:none">
        <div class="empty-icon">📋</div>
        <h3>Sin insumos</h3>
        <p>Importe el archivo CSV para comenzar</p>
      </div>
    `;

    this._renderRows(data);
    this._bind();
  },

  _getFilteredData() {
    let data = Seed.search(this._searchTerm, this._filterClase ? [this._filterClase] : null);
    if (this._filterTipo) data = data.filter(i => i.tipo === this._filterTipo);

    data.sort((a, b) => {
      const va = a[this._sortField] || '';
      const vb = b[this._sortField] || '';
      const cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb));
      return this._sortAsc ? cmp : -cmp;
    });
    return data;
  },

  _renderRows(data) {
    const tbody = this._container.querySelector('#cat-uni-tbody');
    const empty = this._container.querySelector('#cat-uni-empty');
    const count = this._container.querySelector('#cat-uni-count');
    const isAdmin = Seed.isAdmin();

    if (!data) data = this._getFilteredData();
    count.textContent = `${data.length} insumos`;
    empty.style.display = data.length ? 'none' : 'flex';

    tbody.innerHTML = data.map(item => {
      const expanded = this._expandedRow === item.internalId;
      const canEdit = item.clase === 'MP' || isAdmin;
      const claseBadge = item.clase === 'MP' ? 'mp' : item.clase === 'MZR' ? 'mzr' : 'pt';

      return `
        <tr data-id="${Utils.escapeHtml(item.internalId)}" class="${expanded ? 'expanded' : ''}">
          <td><span class="code-cell">${Utils.escapeHtml(item.internalId)}</span></td>
          <td class="product-name">${Utils.escapeHtml(item.PRODUCTO)}</td>
          <td>${Utils.escapeHtml(item.PROVEEDOR || '—')}</td>
          <td><span class="badge badge-${claseBadge}">${Utils.escapeHtml(item.clase)}</span></td>
          <td>${Utils.escapeHtml(item.tipo || '—')}</td>
          ${DISPLAY_NUTRIENTS.map(n =>
            `<td class="num-col ${item[n] > 0 ? 'has-value' : ''}">${item[n] > 0 ? Utils.fmtGrade(item[n]) : '—'}</td>`
          ).join('')}
          <td><button class="btn-icon" data-action="expand" data-id="${Utils.escapeHtml(item.internalId)}" title="Detalle">▼</button></td>
        </tr>
        ${expanded ? this._renderExpandedRow(item, canEdit, isAdmin) : ''}
      `;
    }).join('');
  },

  _renderExpandedRow(item, canEdit, isAdmin) {
    return `
      <tr class="expanded-row" data-expand="${Utils.escapeHtml(item.internalId)}">
        <td colspan="${6 + DISPLAY_NUTRIENTS.length}">
          <div class="detail-panel">
            <div class="detail-meta">
              <div class="detail-item"><span class="detail-label">ID Interno</span> ${Utils.escapeHtml(item.internalId)}</div>
              <div class="detail-item"><span class="detail-label">Código Original</span> ${Utils.escapeHtml(item.externalCode)}</div>
              <div class="detail-item"><span class="detail-label">Clase</span> ${Utils.escapeHtml(item.clase)}</div>
              <div class="detail-item"><span class="detail-label">Tipo</span> ${Utils.escapeHtml(item.tipo)}</div>
              <div class="detail-item"><span class="detail-label">Proveedor</span> ${Utils.escapeHtml(item.PROVEEDOR || '—')}</div>
              <div class="detail-item"><span class="detail-label">Actualizado</span> ${item.updatedAt ? new Date(item.updatedAt).toLocaleString('es-CO') : '—'}</div>
            </div>
            ${canEdit ? `
              <div class="detail-actions">
                <button class="btn btn-secondary btn-sm" data-action="edit" data-id="${Utils.escapeHtml(item.internalId)}">✏️ Editar</button>
                ${isAdmin ? `<button class="btn btn-secondary btn-sm" data-action="archive" data-id="${Utils.escapeHtml(item.internalId)}">📁 Archivar</button>` : ''}
              </div>
            ` : `
              <div class="detail-note">Solo admin puede editar ${item.clase}</div>
            `}
            <h4 class="section-title">Composición Completa</h4>
            <div class="nutrient-grid">
              ${NUTRIENTES.map(n => {
                const val = item[n.key] || 0;
                const cls = canEdit && n.key !== 'C' ? 'editable' : '';
                return `
                  <div class="nutrient-item ${val > 0 ? 'has-value' : ''}">
                    <span class="nutrient-label">${n.label}</span>
                    ${canEdit ? `
                      <input class="nutrient-input ${cls}" data-id="${Utils.escapeHtml(item.internalId)}" data-field="${n.key}"
                             value="${val || ''}" inputmode="decimal" placeholder="0">
                    ` : `
                      <span class="nutrient-value">${val > 0 ? Utils.fmtGrade(val) : '—'}</span>
                    `}
                    ${val > 0 ? `<div class="nutrient-bar"><div class="nutrient-bar-fill" style="width:${Math.min(val * 2, 100)}%"></div></div>` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </td>
      </tr>
    `;
  },

  _bind() {
    const c = this._container;

    c.querySelector('#cat-uni-search').addEventListener('input', Utils.debounce(e => {
      this._searchTerm = e.target.value;
      this._renderRows();
    }, 200));

    c.querySelector('#cat-uni-filter-clase').addEventListener('change', e => {
      this._filterClase = e.target.value;
      this._renderRows();
    });

    c.querySelector('#cat-uni-filter-tipo').addEventListener('change', e => {
      this._filterTipo = e.target.value;
      this._renderRows();
    });

    c.querySelector('#btn-cat-uni-admin').addEventListener('click', () => {
      const current = Seed.isAdmin();
      Seed.setAdmin(!current);
      this._render();
      Utils.toast(!current ? 'Modo admin activado' : 'Modo admin desactivado', 'info');
    });

    c.querySelector('#btn-cat-uni-refresh').addEventListener('click', () => this._render());
    c.querySelector('#btn-cat-uni-history').addEventListener('click', () => this._showHistory());

    c.querySelector('#cat-uni-csv').addEventListener('change', e => {
      this._importCSV(e.target.files[0]);
      e.target.value = '';
    });

    c.querySelector('#cat-uni-table').addEventListener('click', e => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      if (action === 'expand') this._toggleExpand(id);
      else if (action === 'edit') this._openEditModal(id);
      else if (action === 'archive') this._archiveItem(id);
    });

    c.querySelectorAll('th.sortable').forEach(th => {
      th.addEventListener('click', () => {
        const field = th.dataset.sort;
        if (this._sortField === field) this._sortAsc = !this._sortAsc;
        else { this._sortField = field; this._sortAsc = true; }
        this._renderRows();
      });
    });

    c.addEventListener('input', e => {
      const input = e.target.closest('.nutrient-input');
      if (!input) return;
      const id = input.dataset.id;
      const field = input.dataset.field;
      this._autosave(id, field, input.value);
    });
  },

  _toggleExpand(id) {
    this._expandedRow = this._expandedRow === id ? null : id;
    this._renderRows();
  },

  _autosave(internalId, field, rawValue) {
    const key = `${internalId}-${field}`;
    if (_debounceTimers[key]) clearTimeout(_debounceTimers[key]);
    _debounceTimers[key] = setTimeout(() => {
      const value = Utils.parseNum(rawValue);
      Seed.updateItem(internalId, { [field]: value }, 'local', `Edición inline: ${field}`);
      this._showSaveState(internalId, 'Guardado');
      setTimeout(() => this._showSaveState(internalId, ''), 2000);
    }, AUTOSAVE_DELAY);
  },

  _showSaveState(internalId, state) {
    const input = this._container.querySelector(`.nutrient-input[data-id="${internalId}"][data-field]`);
    if (input) {
      input.classList.toggle('saving', state === 'Guardando...');
      input.classList.toggle('saved', state === 'Guardado');
    }
  },

  _openEditModal(id) {
    const item = Seed.getById(id);
    if (!item) return;
    const isAdmin = Seed.isAdmin();
    const canEdit = item.clase === 'MP' || isAdmin;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-content modal-detail">
        <div class="modal-header">
          <h3>${Utils.escapeHtml(item.PRODUCTO)} <span class="badge badge-${item.clase === 'MP' ? 'mp' : item.clase === 'MZR' ? 'mzr' : 'pt'}">${item.clase}</span></h3>
          <button class="btn-icon modal-close" title="Cerrar">×</button>
        </div>
        <div class="modal-body">
          ${canEdit ? NUTRIENTES.map(n => `
            <div class="form-row" style="margin-bottom:var(--sp-2)">
              <label class="form-label" style="min-width:100px">${n.label}</label>
              <input class="form-input edit-input" data-field="${n.key}" value="${item[n.key] || ''}" inputmode="decimal" ${!canEdit ? 'readonly' : ''}>
            </div>
          `).join('') : '<p class="compare-note">No tiene permiso para editar este insumo</p>'}
        </div>
        ${canEdit ? `
          <div class="modal-actions">
            <button class="btn btn-secondary modal-close">Cancelar</button>
            <button class="btn btn-primary" id="modal-save">Guardar</button>
          </div>
        ` : ''}
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

    const saveBtn = overlay.querySelector('#modal-save');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const changes = {};
        overlay.querySelectorAll('.edit-input').forEach(input => {
          changes[input.dataset.field] = Utils.parseNum(input.value);
        });
        Seed.updateItem(id, changes, 'local', 'Edición modal');
        this._renderRows();
        overlay.classList.remove('visible');
        setTimeout(() => overlay.remove(), 300);
        Utils.toast('Insumo actualizado', 'success');
      });
    }
  },

  _archiveItem(id) {
    const item = Seed.getById(id);
    if (!item) return;
    Utils.confirm(`¿Archivar "${item.PRODUCTO}"? Aparecerá en listas existentes pero no en nuevas búsquedas.`).then(ok => {
      if (!ok) return;
      Seed.archiveItem(id, 'Archivado por admin');
      this._render();
      Utils.toast('Insumo archivado', 'info');
    });
  },

  _showHistory() {
    const history = Seed.getHistory(null, 50);
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Historial de Cambios</h3>
          <button class="btn-icon modal-close" title="Cerrar">×</button>
        </div>
        <div class="modal-body">
          ${history.length === 0 ? '<p class="compare-note">Sin cambios registrados</p>' : `
            <table class="data-table">
              <thead><tr><th>Fecha</th><th>Insumo</th><th>Campos</th><th>Actor</th></tr></thead>
              <tbody>
                ${history.slice().reverse().map(h => `
                  <tr>
                    <td>${new Date(h.changedAt).toLocaleString('es-CO')}</td>
                    <td>${Utils.escapeHtml(h.internalId)}</td>
                    <td>${h.fields.join(', ')}</td>
                    <td>${Utils.escapeHtml(h.actor)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
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

  async _importCSV(file) {
    if (!file) return;
    try {
      Utils.setLoading(true, 'Importando CSV...');
      const text = await file.text();
      const result = Seed.loadFromCSV(text);
      Utils.setLoading(false);

      if (result.loaded) {
        let msg = `Cargados ${result.total} insumos (MP: ${result.counters.MP}, PT: ${result.counters.PT}, MZR: ${result.counters.MZR})`;
        if (result.errors.length) msg += `. Advertencias: ${result.errors.slice(0, 3).join('; ')}`;
        Utils.toast(msg, result.errors.length ? 'warning' : 'success', 6000);
        this._render();
      } else {
        Utils.toast(result.reason, 'error', 6000);
      }
    } catch (err) {
      Utils.setLoading(false);
      Utils.toast('Error importando: ' + err.message, 'error');
    }
  },

  getData() {
    return Seed.search('');
  }
};