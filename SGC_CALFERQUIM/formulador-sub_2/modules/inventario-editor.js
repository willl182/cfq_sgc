import { Utils } from './utils.js';
import { Api } from './api.js';

const EXTRA_KEYS = ['EXTRAS'];

export const InventarioEditor = {
  _container: null,
  _data: [],
  _dirty: false,

  async init(container) {
    this._container = container;
    await this._load();
    this._render();
  },

  async _load() {
    try {
      Utils.setLoading(true, 'Cargando edición...');
      this._data = await Api.fetchMP(true);
    } catch {
      this._data = JSON.parse(localStorage.getItem('formulador_sub_cache_mp') || '[]');
    } finally {
      Utils.setLoading(false);
    }

    if (!Array.isArray(this._data)) this._data = [];
    this._data = this._data.map(row => this._normalizeRow(row));
  },

  _normalizeRow(row = {}) {
    const item = { ...row };
    item.ID_PROD = String(item.ID_PROD || item.COD || `MP-${Utils.generateId()}`);
    item.COD = String(item.COD || item.ID_PROD || '').trim();
    item.PRODUCTO = String(item.PRODUCTO || item.NOMBRE || '').trim();
    item.NOMBRE = String(item.NOMBRE || item.PRODUCTO || '').trim();
    item.CLASE = String(item.CLASE || 'MP').trim().toUpperCase();
    item.TIPO = String(item.TIPO || '').trim().toUpperCase();
    item.EXTRAS = String(item.EXTRAS || '').trim();
    for (const key of Utils.CATALOGO_EDITABLE_KEYS) item[key] = Utils.parseNum(item[key]);
    return item;
  },

  _newRow() {
    return this._normalizeRow({
      ID_PROD: `MP-${Utils.generateId()}`,
      COD: '',
      PRODUCTO: '',
      NOMBRE: '',
      CLASE: 'MP',
      TIPO: '',
      EXTRAS: ''
    });
  },

  _render() {
    const headers = Utils.CATALOGO_EDITABLE_KEYS;
    this._container.innerHTML = `
      <div class="view-header">
        <div class="view-header-left">
          <h2 class="view-title">Edición de materias primas e insumos</h2>
          <span class="badge" id="inv-count">${this._data.length} registros</span>
        </div>
        <div class="view-header-right">
          <button class="btn btn-secondary" id="inv-add-row">Agregar fila</button>
          <button class="btn btn-secondary" id="inv-reload">Recargar</button>
          <button class="btn btn-primary" id="inv-save">Guardar cambios</button>
        </div>
      </div>
      <div class="card" style="margin-bottom:var(--sp-4)">
        <p class="compare-note">Edición tipo tabla. COD, NOMBRE, CLASE, TIPO, composición y EXTRAS son editables. ID_PROD se conserva como clave técnica.</p>
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID_PROD</th>
              <th>COD</th>
              <th>NOMBRE</th>
              <th>CLASE</th>
              <th>TIPO</th>
              ${headers.map(h => `<th class="num-col">${Utils.escapeHtml(h)}</th>`).join('')}
              <th>EXTRAS</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="inv-tbody"></tbody>
        </table>
      </div>
    `;

    this._renderRows();
    this._bind();
  },

  _renderRows() {
    const tbody = document.getElementById('inv-tbody');
    tbody.innerHTML = this._data.map((row, idx) => `
      <tr data-idx="${idx}">
        <td><input class="form-input inv-input" data-field="ID_PROD" value="${Utils.escapeHtml(row.ID_PROD || '')}" readonly></td>
        <td><input class="form-input inv-input" data-field="COD" value="${Utils.escapeHtml(row.COD || '')}" placeholder="Auto"></td>
        <td><input class="form-input inv-input" data-field="NOMBRE" value="${Utils.escapeHtml(row.NOMBRE || '')}" placeholder="Nombre"></td>
        <td>
          <select class="form-select inv-input" data-field="CLASE">
            <option value="MP" ${row.CLASE === 'MP' ? 'selected' : ''}>MP</option>
            <option value="PT" ${row.CLASE === 'PT' ? 'selected' : ''}>PT</option>
          </select>
        </td>
        <td><input class="form-input inv-input" data-field="TIPO" value="${Utils.escapeHtml(row.TIPO || '')}" placeholder="G/P/L/C"></td>
        ${headers.map(h => `<td><input class="form-input inv-input inv-num" data-field="${h}" value="${row[h] || ''}" inputmode="decimal"></td>`).join('')}
        <td><input class="form-input inv-input" data-field="EXTRAS" value="${Utils.escapeHtml(row.EXTRAS || '')}" placeholder="Notas"></td>
        <td><button class="btn-icon" data-action="delete" title="Eliminar">×</button></td>
      </tr>
    `).join('');
    document.getElementById('inv-count').textContent = `${this._data.length} registros`;
  },

  _bind() {
    document.getElementById('inv-add-row').addEventListener('click', () => {
      this._data.unshift(this._newRow());
      this._dirty = true;
      this._renderRows();
      this._bindRowEvents();
    });
    document.getElementById('inv-reload').addEventListener('click', async () => {
      await this._load();
      this._renderRows();
      this._bindRowEvents();
    });
    document.getElementById('inv-save').addEventListener('click', () => this._save());
    this._bindRowEvents();
  },

  _bindRowEvents() {
    document.querySelectorAll('#inv-tbody .inv-input').forEach(input => {
      input.addEventListener('input', e => {
        const row = e.target.closest('tr[data-idx]');
        const idx = Number(row.dataset.idx);
        const field = e.target.dataset.field;
        const value = e.target.value;
        if (!this._data[idx]) return;
        this._data[idx][field] = ['CLASE'].includes(field) ? String(value).toUpperCase() : value;
        this._dirty = true;
      });
    });
    document.querySelectorAll('#inv-tbody [data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', e => {
        const row = e.target.closest('tr[data-idx]');
        const idx = Number(row.dataset.idx);
        this._data.splice(idx, 1);
        this._dirty = true;
        this._renderRows();
        this._bindRowEvents();
      });
    });
  },

  _preparePayload() {
    return this._data.map(row => {
      const item = { ...row };
      if (!item.COD) item.COD = item.ID_PROD || `MP-${Utils.generateId()}`;
      if (!item.ID_PROD) item.ID_PROD = item.COD;
      if (!item.NOMBRE) item.NOMBRE = item.PRODUCTO || item.COD;
      if (!item.PRODUCTO) item.PRODUCTO = item.NOMBRE;
      item.CLASE = String(item.CLASE || 'MP').toUpperCase();
      item.TIPO = String(item.TIPO || '').toUpperCase();
      item.EXTRAS = String(item.EXTRAS || '');
      for (const key of Utils.CATALOGO_EDITABLE_KEYS) item[key] = Utils.parseNum(item[key]);
      return item;
    });
  },

  async _save() {
    try {
      Utils.setLoading(true, 'Guardando catálogo...');
      const payload = this._preparePayload();
      await Api.saveMP(payload);
      localStorage.setItem('formulador_sub_cache_mp', JSON.stringify(payload));
      this._dirty = false;
      Utils.setLoading(false);
      Utils.toast('Catálogo guardado', 'success');
    } catch (err) {
      Utils.setLoading(false);
      Utils.toast('Error guardando catálogo: ' + err.message, 'error');
    }
  }
};
