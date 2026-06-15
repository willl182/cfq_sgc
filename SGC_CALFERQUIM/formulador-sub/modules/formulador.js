/**
 * FORMULADOR_CFQ — Motor de Cálculo y Vista del Formulador
 * Vista principal: seleccionar insumos, definir proporciones, calcular grado final
 * Integrado con Seed (catálogo local), ProductLists (snapshots), formulas.js y tolerancias-v2.js
 */

import { Utils } from './utils.js';
import { Api } from './api.js';
import { Seed } from './seed.js';
import { ProductLists } from './product-lists.js';
import { calcularComposicion, calcularTotalKg, NUTRIENT_KEYS, NUTRIENTES } from './formulas.js';
import { evaluarTodos, estadoGeneral, formatoEstado, formatoEstadoCorto } from './tolerancias-v2.js';

const ICONS = {
  beaker: `<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 2v4a1 1 0 01-1 1H3"/><path d="M13 2v4a1 1 0 001 1h3"/><path d="M7 7v9a2 2 0 002 2h2a2 2 0 002-2V7"/><line x1="5" y1="12" x2="15" y2="12"/></svg>`,
  trash: `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="3 6 5 6 17 6"/><path d="M8 6V4a1 1 0 011-1h2a1 1 0 011 1v2"/><path d="M5 6v11a2 2 0 002 2h6a2 2 0 002-2V6"/></svg>`,
  save: `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 17H5a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v7a2 2 0 01-2 2z"/><polyline points="12 3 12 8 7 8"/><rect x="7" y="12" width="6" height="5"/></svg>`,
  close: `<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="3" x2="13" y2="13"/><line x1="13" y1="3" x2="3" y2="13"/></svg>`,
  plus: `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><line x1="10" y1="4" x2="10" y2="16"/><line x1="4" y1="10" x2="16" y2="10"/></svg>`,
  snapshot: `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 8V4H8v4H4v4h4v4h4v-4h4V8z"/><path d="M4 16h12"/></svg>`,
};

export const Formulador = {
  _container: null,
  _catalogo: [],
  _insumoList: [],
  _ptList: [],
  _mzrList: [],
  _slots: [],
  _productoDestino: null,
  _totalProd: 0,
  _fecha: '',
  _resultados: null,
  _editingListId: null,
  _modo: 'normal',
  _formulaOriginal: null,
  _resultadosOriginal: null,
  _onAbrirSustitucion: null,

  MAX_TOTAL_INSUMOS: 1000,

  async init(container, options = {}) {
    this._container = container;
    this._modo = options.modo || 'normal';
    this._formulaOriginal = options.formulaOriginal || null;
    this._onAbrirSustitucion = options.onAbrirSustitucion || null;
    this._fecha = Utils.todayISO();
    this._slots = [{ cod: '', nombre: '', cantidad: 0, lotes: '', _producto: null }];
    await this._loadCatalogo();
    if (this._formulaOriginal) {
      this._cargarFormulaEnMemoria(this._formulaOriginal);
    }
    this._render();
  },

  async _loadCatalogo() {
    try {
      if (Seed.isLoaded()) {
        this._catalogo = Seed.search('');
      } else {
        try {
          this._catalogo = await Api.fetchMP();
        } catch { this._catalogo = []; }
      }
      this._insumoList = this._catalogo.filter(p => ['MP', 'PT', 'MZR'].includes(p.clase || String(p.CLASE || '').trim().toUpperCase()));
      this._ptList = this._catalogo.filter(p => (p.clase || String(p.CLASE || '').trim().toUpperCase()) === 'PT');
      this._mzrList = this._catalogo.filter(p => (p.clase || String(p.CLASE || '').trim().toUpperCase()) === 'MZR');
    } catch (err) {
      Utils.toast('Error cargando catálogo: ' + err.message, 'error');
    }
  },

  _getActiveSlots() {
    return this._slots.filter(s => s.cod || s._producto).length;
  },

  _render() {
    const compareMode = this._modo === 'comparar';
    const original = this._resultadosOriginal || this._formulaOriginal ? {
      N: this._resultadosOriginal?.N ?? Utils.parseNum(this._formulaOriginal?.T_N),
      P: this._resultadosOriginal?.P ?? Utils.parseNum(this._formulaOriginal?.T_P),
      K: this._resultadosOriginal?.K ?? Utils.parseNum(this._formulaOriginal?.T_K)
    } : null;
    const totalKg = this._slots.reduce((sum, s) => sum + (s.cantidad || 0), 0);
    const totalWarning = totalKg > 0 && Math.abs(totalKg - 1000) > 0.01;

    this._container.innerHTML = `
      <div class="view-header">
        <div class="view-header-left">
          <h2 class="view-title">${this._editingListId ? '✏️ Editando lista' : compareMode ? '⚖️ Comparador' : '🧪 Formulador'}</h2>
          <span class="badge" id="form-status">${this._editingListId ? 'Editando' : 'Nueva fórmula'}</span>
        </div>
        <div class="view-header-right">
          ${compareMode ? `<button class="btn btn-secondary" id="btn-ir-sustitucion">Sustitución</button>` : ''}
          <button class="btn btn-secondary" id="btn-limpiar">${ICONS.trash} Limpiar</button>
          <button class="btn btn-primary" id="btn-guardar">${ICONS.save} Guardar</button>
          <button class="btn btn-secondary" id="btn-snapshot" title="Guardar y crear snapshot">${ICONS.snapshot} Guardar Final</button>
        </div>
      </div>

      ${totalWarning ? `<div class="alert alert-warning">Total: ${totalKg.toFixed(2)} kg (esperado 1000 kg)</div>` : ''}

      ${compareMode ? `
        <div class="compare-strip">
          <div class="card compare-card compare-card--original">
            <div class="card-title">Grado original</div>
            ${this._renderResumenFormula(this._formulaOriginal, this._resultadosOriginal, 'original')}
          </div>
          <div class="card compare-card compare-card--new">
            <div class="card-title">Grado nuevo</div>
            <div class="compare-note">Edita la fórmula y valida el cambio contra tolerancias ICA.</div>
            ${this._renderCompareSummary(original, this._resultados)}
          </div>
        </div>
      ` : ''}

      <div class="formulador-layout">
        <div class="form-column">
          <div class="card">
            <div class="card-title">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" class="card-title__icon"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Producto Destino
            </div>
            <div class="form-row">
              <div class="form-group flex-2">
                <label class="form-label">Producto Terminado (opcional)</label>
                <div class="search-select" id="pt-select-wrapper" style="position:relative; overflow:visible;">
                  <input type="text" class="form-input" id="pt-search" placeholder="Buscar PT objetivo..." autocomplete="off">
                  <div class="search-dropdown" id="pt-dropdown"></div>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Total producción (kg)</label>
                <input type="number" class="form-input" id="total-prod" placeholder="35000" min="0" step="1" value="${this._totalProd || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Fecha</label>
                <input type="date" class="form-input" id="fecha-prod" value="${this._fecha}">
              </div>
            </div>
            ${this._productoDestino ? `
              <div class="pt-selected">
                <span class="pt-name">${Utils.escapeHtml(this._productoDestino.PRODUCTO || this._productoDestino.nombre || '')}</span>
                <span class="pt-badge">${Utils.escapeHtml(this._productoDestino.clase || this._productoDestino.CLASE || 'PT')}</span>
                <span class="pt-grade">N:${Utils.fmtGrade(this._productoDestino.N)} P:${Utils.fmtGrade(this._productoDestino.P)} K:${Utils.fmtGrade(this._productoDestino.K)}</span>
                <button class="btn-icon" id="btn-clear-pt" title="Quitar">${ICONS.close}</button>
              </div>
            ` : ''}
          </div>

          <div class="card">
            <div class="card-title">${ICONS.beaker} Componentes de la Mezcla</div>
            <div class="progress-section">
              <div class="progress-label">
                <span>Total asignado:</span>
                <span id="total-asignado" class="progress-value">${totalKg.toFixed(2)}</span>
                <span class="progress-total">/ 1000 kg</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill ${totalKg > 1000 ? 'over' : totalKg === 1000 ? 'complete' : ''}" id="progress-fill" style="width:${Math.min((totalKg / 1000) * 100, 100)}%"></div>
              </div>
            </div>
            <div class="mp-slots" id="mp-slots">${this._renderSlots()}</div>
            <button class="btn btn-secondary btn-full" id="btn-add-slot" style="margin-top: var(--sp-3);">${ICONS.plus} Agregar insumo</button>
          </div>
        </div>

        <div class="results-column">
          <div class="card" id="results-card">
            <div class="card-title">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" class="card-title__icon"><rect x="3" y="3" width="14" height="14" rx="2"/><path d="M7 8h6M7 12h4"/></svg>
              Grado Final Calculado
            </div>
            <div id="results-content">
              <div class="empty-state small"><div class="empty-icon">${ICONS.beaker}</div><p>Seleccione insumos para ver el cálculo</p></div>
            </div>
          </div>
        </div>
      </div>
    `;
    this._bindEvents();
    this._calcular();
  },

  _renderCompareSummary(original, actual) {
    if (!original || !actual) return `<div class="empty-state small"><p>Esperando cálculo</p></div>`;
    const delta = key => (actual[key] || 0) - (original[key] || 0);
    const deltaLabel = value => `${value > 0 ? '+' : ''}${Utils.fmtGrade(value)}`;
    return `<div class="compare-summary"><div class="compare-summary__meta"><strong>Comparación</strong><span>Δ = nuevo - original</span></div>
      <div class="compare-diff-grid">
        <div class="compare-diff"><span class="compare-diff__label">N</span><span class="compare-diff__value">${Utils.fmtGrade(actual.N || 0)}</span><span class="compare-diff__delta">${deltaLabel(delta('N'))}</span></div>
        <div class="compare-diff"><span class="compare-diff__label">P</span><span class="compare-diff__value">${Utils.fmtGrade(actual.P || 0)}</span><span class="compare-diff__delta">${deltaLabel(delta('P'))}</span></div>
        <div class="compare-diff"><span class="compare-diff__label">K</span><span class="compare-diff__value">${Utils.fmtGrade(actual.K || 0)}</span><span class="compare-diff__delta">${deltaLabel(delta('K'))}</span></div>
      </div></div>`;
  },

  _renderResumenFormula(formula, resultados, modo) {
    if (!formula) return `<div class="empty-state small"><p>Sin fórmula original</p></div>`;
    const calc = resultados || { N: Utils.parseNum(formula.T_N), P: Utils.parseNum(formula.T_P), K: Utils.parseNum(formula.T_K) };
    return `<div class="compare-summary">
      <div class="compare-summary__meta"><strong>${Utils.escapeHtml(formula.NOMBRE_DESTINO || formula.COD_PROD_DESTINO || 'Receta')}</strong><span>${Utils.escapeHtml(formula.FECHA || '')}</span></div>
      <div class="npk-cards npk-cards--compact">
        <div class="npk-card" style="--accent:#34d399"><div class="npk-label">N</div><div class="npk-value">${Utils.fmtGrade(calc.N || 0)}</div></div>
        <div class="npk-card" style="--accent:#f59e0b"><div class="npk-label">P</div><div class="npk-value">${Utils.fmtGrade(calc.P || 0)}</div></div>
        <div class="npk-card" style="--accent:#3b82f6"><div class="npk-label">K</div><div class="npk-value">${Utils.fmtGrade(calc.K || 0)}</div></div>
      </div></div>`;
  },

  _renderSlots() {
    const activeCount = this._getActiveSlots();
    const slotsToShow = activeCount + 1;
    return this._slots.slice(0, slotsToShow).map((slot, i) => {
      const item = slot._producto;
      const cod = slot.cod || (item ? (item.internalId || item.COD) : '');
      const nombre = slot.nombre || (item ? `${item.COD || item.internalId}-${item.PRODUCTO || item.nombre}` : '');
      return `
      <div class="mp-slot ${cod ? 'active' : ''}" data-index="${i}">
        <div class="slot-header">
          <span class="slot-number">${i + 1}</span>
          ${cod ? `<button class="btn-icon btn-remove-slot" data-index="${i}" title="Quitar">${ICONS.close}</button>` : ''}
        </div>
        <div class="slot-body">
          <div class="form-group flex-2">
            <div class="search-select" style="position:relative; overflow:visible;">
              <input type="text" class="form-input mp-search" data-index="${i}" placeholder="Buscar insumo..." value="${Utils.escapeHtml(nombre)}" autocomplete="off">
              <div class="search-dropdown mp-dropdown" data-index="${i}"></div>
            </div>
          </div>
          <div class="form-group form-group-sm">
            <input type="number" class="form-input mp-cantidad" data-index="${i}" placeholder="kg" min="0" max="1000" step="0.01" value="${slot.cantidad || ''}">
          </div>
          <div class="form-group form-group-sm">
            <input type="text" class="form-input mp-lotes" data-index="${i}" placeholder="Lotes" value="${Utils.escapeHtml(slot.lotes || '')}">
          </div>
        </div>
        ${cod && slot.cantidad && this._totalProd ? `<div class="slot-info"><span class="slot-kg">${Utils.fmtNum(slot.cantidad * this._totalProd, 0)} kg prod</span></div>` : ''}
      </div>`;
    }).join('');
  },

  _bindEvents() {
    const c = this._container;

    const ptSearch = c.querySelector('#pt-search');
    const ptDropdown = c.querySelector('#pt-dropdown');
    ptSearch.addEventListener('input', Utils.debounce(e => {
      this._showDropdown(ptDropdown, e.target.value, [...this._ptList, ...this._mzrList], (prod) => {
        this._productoDestino = prod;
        ptSearch.value = prod.PRODUCTO || prod.nombre || '';
        ptDropdown.innerHTML = '';
        ptDropdown.classList.remove('visible');
        this._calcular();
        this._render();
      });
    }, 150));
    ptSearch.addEventListener('focus', () => { if (ptSearch.value) ptSearch.dispatchEvent(new Event('input')); });
    document.addEventListener('click', e => { if (!e.target.closest('#pt-select-wrapper')) ptDropdown.classList.remove('visible'); });

    c.querySelector('#btn-clear-pt')?.addEventListener('click', () => { this._productoDestino = null; this._calcular(); this._render(); });
    c.querySelector('#total-prod').addEventListener('input', e => { this._totalProd = parseFloat(e.target.value) || 0; this._updateProgress(); this._calcular(); });
    c.querySelector('#fecha-prod').addEventListener('change', e => { this._fecha = e.target.value; });

    c.querySelectorAll('.mp-search').forEach(input => {
      const idx = parseInt(input.dataset.index);
      const dropdown = c.querySelector(`.mp-dropdown[data-index="${idx}"]`);
      input.addEventListener('input', Utils.debounce(e => {
        this._showDropdown(dropdown, e.target.value, this._insumoList, (prod) => {
          this._slots[idx] = { cod: prod.internalId || prod.COD || '', nombre: `${prod.COD || prod.internalId}-${prod.PRODUCTO || prod.nombre}-${prod.PROVEEDOR || ''}`, cantidad: this._slots[idx]?.cantidad || 0, lotes: this._slots[idx]?.lotes || '', _producto: prod };
          input.value = this._slots[idx].nombre;
          dropdown.innerHTML = '';
          dropdown.classList.remove('visible');
          this._calcular();
          this._render();
        });
      }, 150));
      input.addEventListener('focus', () => {
        if (!input.value) this._showDropdown(dropdown, '', this._insumoList.slice(0, 20), (prod) => {
          this._slots[idx] = { cod: prod.internalId || prod.COD, nombre: `${prod.COD || prod.internalId}-${prod.PRODUCTO || prod.nombre}-${prod.PROVEEDOR || ''}`, cantidad: this._slots[idx]?.cantidad || 0, lotes: this._slots[idx]?.lotes || '', _producto: prod };
          input.value = this._slots[idx].nombre;
          dropdown.innerHTML = '';
          dropdown.classList.remove('visible');
          this._calcular();
          this._render();
        });
      });
    });

    c.querySelectorAll('.mp-cantidad').forEach(input => {
      const idx = parseInt(input.dataset.index);
      input.addEventListener('input', e => { this._slots[idx].cantidad = parseFloat(e.target.value) || 0; this._updateProgress(); this._calcular(); });
    });
    c.querySelectorAll('.mp-lotes').forEach(input => {
      const idx = parseInt(input.dataset.index);
      input.addEventListener('input', e => { this._slots[idx].lotes = e.target.value; });
    });
    c.querySelectorAll('.btn-remove-slot').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.index);
        this._slots.splice(idx, 1);
        if (this._slots.length === 0) this._slots.push({ cod: '', nombre: '', cantidad: 0, lotes: '', _producto: null });
        this._updateProgress();
        this._calcular();
        this._render();
      });
    });

    c.querySelector('#btn-add-slot')?.addEventListener('click', () => { this._slots.push({ cod: '', nombre: '', cantidad: 0, lotes: '', _producto: null }); this._render(); });
    c.querySelector('#btn-limpiar').addEventListener('click', () => this._limpiar());
    c.querySelector('#btn-guardar').addEventListener('click', () => this._guardar(false));
    c.querySelector('#btn-snapshot').addEventListener('click', () => this._guardar(true));
    c.querySelector('#btn-ir-sustitucion')?.addEventListener('click', () => this._onAbrirSustitucion?.(this._formulaOriginal));
    document.addEventListener('click', e => { if (!e.target.closest('.search-select')) c.querySelectorAll('.search-dropdown').forEach(d => d.classList.remove('visible')); });
  },

  _showDropdown(dropdown, searchTerm, list, onSelect) {
    const term = (searchTerm || '').toLowerCase();
    const filtered = term
      ? list.filter(p => `${p.COD || p.internalId || ''} ${p.PRODUCTO || p.nombre || ''} ${p.PROVEEDOR || ''}`.toLowerCase().includes(term)).slice(0, 15)
      : list.slice(0, 15);
    if (!filtered.length) { dropdown.innerHTML = '<div class="dropdown-empty">Sin resultados</div>'; dropdown.classList.add('visible'); return; }
    dropdown.innerHTML = filtered.map(p => {
      const cod = p.COD || p.internalId || '';
      const nombre = p.PRODUCTO || p.nombre || '';
      const prov = p.PROVEEDOR || '';
      const clase = p.clase || p.CLASE || '';
      const id = p.internalId || p.ID_PROD || p.COD || '';
      return `<div class="dropdown-item" data-id="${Utils.escapeHtml(id)}">
        <span class="dropdown-cod">${Utils.escapeHtml(cod)}</span>
        <span class="dropdown-name">${Utils.escapeHtml(nombre)}</span>
        <span class="badge badge-${clase === 'MZR' ? 'mzr' : clase === 'PT' ? 'pt' : 'mp'}" style="font-size:0.7em">${Utils.escapeHtml(clase)}</span>
        <span class="dropdown-prov">${Utils.escapeHtml(prov)}</span>
      </div>`;
    }).join('');
    dropdown.classList.add('visible');
    dropdown.addEventListener('pointerdown', e => e.stopPropagation(), { once: true });
    dropdown.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('pointerdown', e => {
        e.preventDefault();
        e.stopPropagation();
        const id = String(item.dataset.id || '');
        const prod = list.find(p => String(p.internalId || p.ID_PROD || p.COD) === id);
        if (prod) onSelect(prod);
      });
    });
  },

  _updateProgress() {
    const total = this._slots.reduce((sum, s) => sum + (s.cantidad || 0), 0);
    const pct = Math.min((total / 1000) * 100, 100);
    const fill = document.getElementById('progress-fill');
    const label = document.getElementById('total-asignado');
    if (fill) { fill.style.width = `${pct}%`; fill.className = `progress-fill ${total > 1000 ? 'over' : total === 1000 ? 'complete' : ''}`; }
    if (label) { label.textContent = total.toFixed(2); label.className = `progress-value ${total > 1000 ? 'over' : ''}`; }
  },

  _calcular() {
    const componentes = this._slots.filter(s => (s.cod || s._producto) && s.cantidad > 0).map(s => ({
      cantidadKg: s.cantidad,
      insumo: s._producto || this._catalogo.find(p => (p.internalId || p.COD) === s.cod) || {}
    }));
    this._resultados = calcularComposicion(componentes);
    this._renderResultados();
  },

  _renderResultados() {
    const content = document.getElementById('results-content');
    if (!content) return;
    const calc = this._resultados;
    if (!calc || Object.values(calc).every(v => v === 0)) {
      content.innerHTML = `<div class="empty-state small"><div class="empty-icon">${ICONS.beaker}</div><p>Seleccione insumos para ver el cálculo</p></div>`;
      return;
    }

    const npkCards = [
      { key: 'N', label: 'Nitrógeno (N)', color: '#34d399' },
      { key: 'P', label: 'Fósforo (P₂O₅)', color: '#f59e0b' },
      { key: 'K', label: 'Potasio (K₂O)', color: '#3b82f6' }
    ];

    let html = `<div class="npk-cards">`;
    for (const { key, label, color } of npkCards) {
      const val = calc[key];
      const decl = this._productoDestino ? (this._productoDestino[key] || 0) : null;
      let statusHtml = '';
      if (decl !== null && decl > 0) {
        const ev = evaluarTodos({ [key]: calc[key] }, { [key]: decl })[key];
        statusHtml = `<div class="status-badge status-${ev.status.toLowerCase()}" style="margin-top:var(--sp-2)">${formatoEstadoCorto(ev.status)}</div>`;
      }
      html += `<div class="npk-card" style="--accent: ${color}"><div class="npk-label">${label}</div><div class="npk-value">${Utils.fmtGrade(val)}</div>
        ${decl !== null && decl > 0 ? `<div class="npk-target">Objetivo: ${Utils.fmtGrade(decl)}</div>${statusHtml}` : ''}</div>`;
    }
    html += `</div>`;

    html += `<h4 class="section-title">Composición Completa</h4><div class="table-wrapper"><table class="data-table results-table"><thead><tr>
      <th>Nutriente</th><th class="num-col">Calculado</th>
      ${this._productoDestino ? '<th class="num-col">Declarado</th><th class="num-col">Tolerancia</th><th class="num-col">Rango</th><th>Estado</th>' : ''}
    </tr></thead><tbody>`;

    for (const n of NUTRIENTES) {
      const val = calc[n.key];
      const decl = this._productoDestino ? (this._productoDestino[n.key] || 0) : null;
      if (val === 0 && (decl === null || decl === 0)) continue;
      let tolHtml = '';
      if (decl !== null) {
        const ev = evaluarTodos({ [n.key]: val }, { [n.key]: decl })[n.key];
        tolHtml = `<td class="num-col">${Utils.fmtGrade(decl)}</td><td class="num-col">±${Utils.fmtGrade(ev.tolerancia)}</td>
          <td class="num-col">${Utils.fmtGrade(ev.min)} – ${Utils.fmtGrade(ev.max)}</td>
          <td><span class="status-badge status-${ev.status.toLowerCase()}">${formatoEstadoCorto(ev.status)}</span></td>`;
      }
      html += `<tr class="${val > 0 ? 'has-value' : ''}"><td class="nutrient-name">${n.label}</td><td class="num-col">${Utils.fmtGrade(val)}</td>${tolHtml}</tr>`;
    }
    html += `</tbody></table></div>`;

    if (this._productoDestino) {
      const declarados = {};
      for (const key of NUTRIENT_KEYS) declarados[key] = this._productoDestino[key] || 0;
      const evaluaciones = evaluarTodos(calc, declarados);
      const general = estadoGeneral(evaluaciones, true);
      const generalClass = general === 'CUMPLE' ? 'status-c' : general === 'NO_CUMPLE' ? 'status-nc' : general === 'CUMPLE_S' ? 'status-cumples' : 'status-sinobjetivo';
      html += `<div class="general-status ${generalClass}"><span class="general-label">Estado General</span><span class="general-value">${formatoEstado(general)}</span></div>`;
    } else {
      html += `<div class="general-status status-sinobjetivo"><span class="general-label">Estado General</span><span class="general-value">— SIN OBJETIVO</span></div>`;
    }

    content.innerHTML = html;
  },

  _limpiar() {
    this._slots = [{ cod: '', nombre: '', cantidad: 0, lotes: '', _producto: null }];
    this._productoDestino = null;
    this._totalProd = 0;
    this._fecha = Utils.todayISO();
    this._resultados = null;
    this._editingListId = null;
    this._formulaOriginal = null;
    this._resultadosOriginal = null;
    this._render();
  },

  async _guardar(withSnapshot = false) {
    const activeSlots = this._slots.filter(s => (s.cod || s._producto) && s.cantidad > 0);
    if (!activeSlots.length) { Utils.toast('Agregue al menos un insumo con cantidad', 'warning'); return; }

    const componentes = activeSlots.map(s => ({
      insumoId: s._producto?.internalId || s.cod || '',
      cod: s._producto?.COD || s._producto?.externalCode || s.cod || '',
      nombre: s.nombre || '',
      cantidadKg: s.cantidad,
      lotes: s.lotes || ''
    }));

    try {
      Utils.setLoading(true, withSnapshot ? 'Guardando lista y creando snapshot...' : 'Guardando lista...');

      if (this._editingListId) {
        const result = ProductLists.saveWithSnapshot(this._editingListId, {
          componentes,
          targetProductId: this._productoDestino?.internalId || null,
          targetProductName: this._productoDestino?.PRODUCTO || this._productoDestino?.nombre || '',
          alias: `${this._productoDestino?.PRODUCTO || 'Borrador'} - ${this._fecha}`
        }, Seed.search(''));

        if (withSnapshot) {
          Utils.toast(`Lista actualizada + snapshot ${result.snapshot.version} creado`, 'success');
        } else {
          Utils.toast('Lista actualizada (sin snapshot nuevo)', 'success');
        }
      } else {
        const lista = ProductLists.create({
          targetProductId: this._productoDestino?.internalId || null,
          targetProductName: this._productoDestino?.PRODUCTO || this._productoDestino?.nombre || '',
          alias: `${this._productoDestino?.PRODUCTO || 'Borrador'} - ${this._fecha}`,
          componentes,
          catalogo: Seed.search('')
        });

        if (withSnapshot) {
          const result = ProductLists.saveWithSnapshot(lista.id, {
            componentes,
            targetProductId: this._productoDestino?.internalId || null,
            targetProductName: this._productoDestino?.PRODUCTO || this._productoDestino?.nombre || '',
            alias: lista.alias
          }, Seed.search(''));
          Utils.toast(`Lista creada + snapshot ${result.snapshot.version}`, 'success');
        } else {
          Utils.toast('Lista guardada', 'success');
        }
        this._editingListId = lista.id;
      }

      // Also try to save to API (Google Sheets) as backup
      const formula = this._buildLegacyFormula();
      if (Api.isConfigured()) {
        try { await Api.saveFormula(formula); } catch {}
      }

      Utils.setLoading(false);
    } catch (err) {
      Utils.setLoading(false);
      Utils.toast('Error al guardar: ' + err.message, 'error');
    }
  },

  _buildLegacyFormula() {
    const formula = {
      FECHA: this._fecha,
      COD_PROD_DESTINO: this._productoDestino?.COD || this._productoDestino?.externalCode || '',
      NOMBRE_DESTINO: this._productoDestino?.PRODUCTO || this._productoDestino?.nombre || '',
      TOTAL_PROD: this._totalProd || 0,
      ESTADO: 'GUARDADA'
    };
    const activeSlots = this._slots.filter(s => (s.cod || s._producto) && s.cantidad > 0);
    for (let i = 0; i < 11; i++) {
      const s = activeSlots[i] || {};
      formula[`MP${i + 1}_COD`] = s._producto?.COD || s._producto?.externalCode || s.cod || '';
      formula[`MP${i + 1}_NOMBRE`] = s.nombre || '';
      formula[`MP${i + 1}_CANTIDAD`] = s.cantidad || 0;
      formula[`MP${i + 1}_LOTES`] = s.lotes || '';
    }
    if (this._resultados) {
      for (const key of NUTRIENT_KEYS) formula[`T_${key}`] = this._resultados[key] || 0;
    }
    return formula;
  },

  cargarFormula(formula, modo = 'editar') {
    this._editingId = modo === 'editar' ? formula.ID : null;
    this._editingListId = null;
    this._formulaOriginal = modo === 'comparar' ? formula : null;
    this._fecha = formula.FECHA || Utils.todayISO();
    this._totalProd = Utils.parseNum(formula.TOTAL_PROD);

    if (formula.COD_PROD_DESTINO) {
      this._productoDestino = this._catalogo.find(p => p.COD === formula.COD_PROD_DESTINO || p.internalId === formula.COD_PROD_DESTINO) || null;
    }

    this._slots = [];
    for (let i = 1; i <= 11; i++) {
      const cod = formula[`MP${i}_COD`] || '';
      if (cod) {
        const prod = this._catalogo.find(p => p.COD === cod || p.internalId === cod || p.ID_PROD === cod);
        if (prod) {
          this._slots.push({ cod: prod.internalId || prod.COD, nombre: `${prod.COD || prod.internalId}-${prod.PRODUCTO || prod.nombre}-${prod.PROVEEDOR || ''}`, cantidad: Utils.parseNum(formula[`MP${i}_CANTIDAD`]), lotes: formula[`MP${i}_LOTES`] || '', _producto: prod });
        } else {
          this._slots.push({ cod, nombre: formula[`MP${i}_NOMBRE`] || '', cantidad: Utils.parseNum(formula[`MP${i}_CANTIDAD`]), lotes: formula[`MP${i}_LOTES`] || '', _producto: null });
        }
      }
    }
    if (this._slots.length === 0) this._slots.push({ cod: '', nombre: '', cantidad: 0, lotes: '', _producto: null });

    this._render();
    Utils.toast(modo === 'editar' ? 'Fórmula cargada para edición' : 'Fórmula cargada (clon)', 'info');
  },

  cargarLista(listaId) {
    const lista = ProductLists.getById(listaId);
    if (!lista) return;

    this._editingListId = listaId;
    this._productoDestino = lista.targetProductId ? Seed.getById(lista.targetProductId) : null;
    this._totalProd = 0;
    this._fecha = new Date(lista.updatedAt).toISOString().split('T')[0];

    this._slots = lista.componentes.map(c => {
      const prod = Seed.getById(c.insumoId) || {};
      return { cod: c.insumoId, nombre: `${c.cod}-${c.nombre}`, cantidad: c.cantidadKg, lotes: c.lotes || '', _producto: prod };
    });
    if (this._slots.length === 0) this._slots.push({ cod: '', nombre: '', cantidad: 0, lotes: '', _producto: null });

    this._render();
    Utils.toast(`Lista ${lista.displayCode || lista.alias} cargada`, 'info');
  },

  _cargarFormulaEnMemoria(formula) {
    this._resultadosOriginal = { N: Utils.parseNum(formula.T_N), P: Utils.parseNum(formula.T_P), K: Utils.parseNum(formula.T_K) };
    this._fecha = formula.FECHA || Utils.todayISO();
    this._totalProd = Utils.parseNum(formula.TOTAL_PROD);

    if (formula.COD_PROD_DESTINO) {
      this._productoDestino = this._catalogo.find(p => p.COD === formula.COD_PROD_DESTINO || p.internalId === formula.COD_PROD_DESTINO) || null;
    }

    this._slots = [];
    for (let i = 1; i <= 11; i++) {
      const cod = formula[`MP${i}_COD`] || '';
      if (cod) {
        const prod = this._catalogo.find(p => p.COD === cod || p.internalId === cod);
        this._slots.push({ cod: prod?.internalId || prod?.COD || cod, nombre: formula[`MP${i}_NOMBRE`] || '', cantidad: Utils.parseNum(formula[`MP${i}_CANTIDAD`]), lotes: formula[`MP${i}_LOTES`] || '', _producto: prod });
      }
    }
    if (this._slots.length === 0) this._slots.push({ cod: '', nombre: '', cantidad: 0, lotes: '', _producto: null });
  }
};