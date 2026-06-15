/**
 * FORMULADOR_CFQ — Vista de Histórico de Snapshots
 * Snapshots inmutables, versionados, congelados al momento del guardado
 */

import { Utils } from './utils.js';
import { ProductLists } from './product-lists.js';
import { Seed } from './seed.js';
import { NUTRIENTES, NUTRIENT_KEYS } from './formulas.js';
import { formatoEstado, formatoEstadoCorto } from './tolerancias-v2.js';

export const Historico = {
  _container: null,
  _filter: { productId: null, estado: '' },

  async init(container) {
    this._container = container;
    this._render();
  },

  _render() {
    const snapshots = this._getFiltered();
    const productos = [...new Set(ProductLists.snapshots.map(s => s.targetProductId).filter(Boolean))];

    this._container.innerHTML = `
      <div class="view-header">
        <div class="view-header-left">
          <h2 class="view-title">Histórico</h2>
          <span class="badge" id="hist-count">${snapshots.length} snapshots</span>
        </div>
        <div class="view-header-right">
          <button class="btn btn-secondary" id="btn-hist-refresh">Actualizar</button>
        </div>
      </div>

      <div class="filters-bar">
        <select class="form-select" id="hist-filter-product">
          <option value="">Todos los productos</option>
          ${productos.map(p => `<option value="${Utils.escapeHtml(p)}" ${this._filter.productId === p ? 'selected' : ''}>${Utils.escapeHtml(p)}</option>`).join('')}
        </select>
        <select class="form-select" id="hist-filter-estado">
          <option value="">Todos los estados</option>
          <option value="CUMPLE" ${this._filter.estado === 'CUMPLE' ? 'selected' : ''}>✓ Conforme</option>
          <option value="CUMPLE_S" ${this._filter.estado === 'CUMPLE_S' ? 'selected' : ''}>⚠ Supera</option>
          <option value="NO_CUMPLE" ${this._filter.estado === 'NO_CUMPLE' ? 'selected' : ''}>✕ No cumple</option>
          <option value="SIN_OBJETIVO" ${this._filter.estado === 'SIN_OBJETIVO' ? 'selected' : ''}>— Sin objetivo</option>
        </select>
      </div>

      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Versión</th>
              <th>Nombre</th>
              <th>Producto</th>
              <th class="num-col">Total kg</th>
              <th class="num-col">N</th>
              <th class="num-col">P</th>
              <th class="num-col">K</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="hist-tbody"></tbody>
        </table>
      </div>

      <div class="empty-state" id="hist-empty" style="display:none">
        <div class="empty-icon">📋</div>
        <h3>Sin snapshots</h3>
        <p>Guarde una fórmula para crear el primer snapshot</p>
      </div>
    `;

    this._renderRows(snapshots);
    this._bind();
  },

  _getFiltered() {
    let snaps = ProductLists.getActiveSnapshots().slice().sort((a, b) => b.creadoEn - a.creadoEn);
    if (this._filter.productId) snaps = snaps.filter(s => s.targetProductId === this._filter.productId);
    if (this._filter.estado) snaps = snaps.filter(s => s.estadoTolerancia === this._filter.estado);
    return snaps;
  },

  _renderRows(snapshots) {
    const tbody = this._container.querySelector('#hist-tbody');
    const empty = this._container.querySelector('#hist-empty');
    const count = this._container.querySelector('#hist-count');

    count.textContent = `${snapshots.length} snapshots`;
    empty.style.display = snapshots.length ? 'none' : 'flex';

    if (!snapshots.length) { tbody.innerHTML = ''; return; }

    tbody.innerHTML = snapshots.map(s => {
      const estadoClass = `status-${(s.estadoTolerancia || '').toLowerCase().replace('_', '')}`;
      return `
        <tr data-id="${Utils.escapeHtml(s.id)}">
          <td><span style="font-family:var(--font-mono);color:var(--green-400)">${Utils.escapeHtml(s.version || '—')}</span></td>
          <td class="product-name">${Utils.escapeHtml(s.nombre || '—')}</td>
          <td>${Utils.escapeHtml(s.targetProductId || 'Sin objetivo')}</td>
          <td class="num-col">${s.totalKg ? s.totalKg.toFixed(2) : '—'}</td>
          <td class="num-col">${Utils.fmtGrade(s.composicionCalculada?.N || 0)}</td>
          <td class="num-col">${Utils.fmtGrade(s.composicionCalculada?.P || 0)}</td>
          <td class="num-col">${Utils.fmtGrade(s.composicionCalculada?.K || 0)}</td>
          <td><span class="status-badge ${estadoClass}">${formatoEstadoCorto(s.estadoTolerancia)}</span></td>
          <td>${s.creadoEn ? new Date(s.creadoEn).toLocaleString('es-CO') : '—'}</td>
          <td>
            <div class="row-actions">
              <button class="btn-icon" data-action="detail" data-id="${Utils.escapeHtml(s.id)}" title="Ver detalle">👁</button>
              <button class="btn-icon" data-action="clone" data-id="${Utils.escapeHtml(s.id)}" title="Clonar a lista">📋</button>
              <button class="btn-icon" data-action="archive" data-id="${Utils.escapeHtml(s.id)}" title="Archivar">📁</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  _bind() {
    this._container.querySelector('#hist-filter-product').addEventListener('change', e => {
      this._filter.productId = e.target.value || null;
      this._renderRows(this._getFiltered());
    });
    this._container.querySelector('#hist-filter-estado').addEventListener('change', e => {
      this._filter.estado = e.target.value;
      this._renderRows(this._getFiltered());
    });
    this._container.querySelector('#btn-hist-refresh').addEventListener('click', () => this._render());
    this._container.querySelector('#hist-tbody').addEventListener('click', e => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      if (action === 'detail') this._showDetail(id);
      else if (action === 'clone') this._cloneToList(id);
      else if (action === 'archive') this._archiveSnapshot(id);
    });
  },

  _showDetail(snapId) {
    const snap = ProductLists.snapshots.find(s => s.id === snapId);
    if (!snap) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-content modal-detail">
        <div class="modal-header">
          <h3>Snapshot ${Utils.escapeHtml(snap.version)} — ${Utils.escapeHtml(snap.nombre)}</h3>
          <button class="btn-icon modal-close" title="Cerrar">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-meta">
            <div class="detail-item"><span class="detail-label">Producto</span> ${Utils.escapeHtml(snap.targetProductId || 'Sin objetivo')}</div>
            <div class="detail-item"><span class="detail-label">Total kg</span> ${snap.totalKg?.toFixed(2) || '—'}</div>
            <div class="detail-item"><span class="detail-label">Estado</span> ${formatoEstado(snap.estadoTolerancia)}</div>
            <div class="detail-item"><span class="detail-label">Fecha</span> ${snap.creadoEn ? new Date(snap.creadoEn).toLocaleString('es-CO') : '—'}</div>
            ${snap.notas ? `<div class="detail-item"><span class="detail-label">Notas</span> ${Utils.escapeHtml(snap.notas)}</div>` : ''}
            ${snap.alertas?.length ? `<div class="detail-item"><span class="detail-label">Alertas</span> ${snap.alertas.map(a => Utils.escapeHtml(a)).join(', ')}</div>` : ''}
          </div>
          <h4 class="section-title">Componentes</h4>
          <div class="table-wrapper">
            <table class="data-table">
              <thead><tr><th>Insumo</th><th class="num-col">kg</th></tr></thead>
              <tbody>
                ${(snap.componentesSnapshot || []).map(c => `
                  <tr><td>${Utils.escapeHtml(c.nombre || c.cod)}</td><td class="num-col">${c.cantidadKg?.toFixed(2) || '—'}</td></tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <h4 class="section-title">Composición Calculada</h4>
          <div class="nutrient-grid">
            ${NUTRIENTES.map(n => {
              const calc = snap.composicionCalculada?.[n.key] || 0;
              const decl = snap.targetSnapshot?.[n.key];
              const tol = snap.detalleTolerancia?.[n.key];
              const statusClass = tol ? `status-${(tol.status || '').toLowerCase()}` : '';
              return `
                <div class="nutrient-item ${calc > 0 ? 'has-value' : ''}">
                  <span class="nutrient-label">${n.label}</span>
                  <span class="nutrient-value">${calc > 0 ? Utils.fmtGrade(calc) : '—'}</span>
                  ${decl > 0 ? `<span class="nutrient-target">/${Utils.fmtGrade(decl)}</span>` : ''}
                  ${tol ? `<span class="status-badge ${statusClass}">${tol.status}</span>` : ''}
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

  _cloneToList(snapId) {
    const newList = ProductLists.cloneSnapshotToList(snapId, Seed.search(''));
    if (newList) {
      Utils.toast(`Lista clonada: ${newList.alias || newList.displayCode}`, 'success');
    } else {
      Utils.toast('No se pudo clonar el snapshot', 'error');
    }
  },

  async _archiveSnapshot(snapId) {
    const ok = await Utils.confirm('¿Archivar este snapshot? Se ocultará de las vistas pero no se elimina.');
    if (!ok) return;
    ProductLists.archiveSnapshot(snapId, 'Archivado por usuario');
    this._render();
    Utils.toast('Snapshot archivado', 'info');
  }
};