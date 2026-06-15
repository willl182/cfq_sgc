/**
 * FORMULADOR_CFQ — Motor de Cálculo y Vista del Formulador
 * Vista principal: seleccionar MPs, definir proporciones, calcular grado final
 */

import { Utils } from './utils.js';
import { Api } from './api.js';
import { Tolerancias } from './tolerancias.js';

/* ── SVG Icons ────────────────────────────────────────────── */
const ICONS = {
  beaker: `<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
    <path d="M7 2v4a1 1 0 01-1 1H3"/><path d="M13 2v4a1 1 0 001 1h3"/>
    <path d="M7 7v9a2 2 0 002 2h2a2 2 0 002-2V7"/><line x1="5" y1="12" x2="15" y2="12"/>
  </svg>`,
  trash: `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8">
    <polyline points="3 6 5 6 17 6"/><path d="M8 6V4a1 1 0 011-1h2a1 1 0 011 1v2"/>
    <path d="M5 6v11a2 2 0 002 2h6a2 2 0 002-2V6"/>
  </svg>`,
  save: `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8">
    <path d="M15 17H5a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v7a2 2 0 01-2 2z"/>
    <polyline points="12 3 12 8 7 8"/><rect x="7" y="12" width="6" height="5"/>
  </svg>`,
  close: `<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
    <line x1="3" y1="3" x2="13" y2="13"/><line x1="13" y1="3" x2="3" y2="13"/>
  </svg>`,
  plus: `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
    <line x1="10" y1="4" x2="10" y2="16"/><line x1="4" y1="10" x2="16" y2="10"/>
  </svg>`,
};

export const Formulador = {
  _container: null,
  _catalogo: [],
  _mpList: [],
  _insumoList: [],
  _ptList: [],
  _slots: Array(11).fill(null).map(() => ({ cod: '', nombre: '', cantidad: 0, lotes: '' })),
  _productoDestino: null,
  _totalProd: 0,
  _fecha: '',
  _resultados: null,
  _editingId: null,
  _modo: 'normal',
  _formulaOriginal: null,
  _resultadosOriginal: null,
  _onAbrirSustitucion: null,

  /** Número máximo de slots de MP */
  MAX_SLOTS: 11,
  /** Tope total de insumos en kg */
  MAX_TOTAL_INSUMOS: 1000,

  async init(container, options = {}) {
    this._container = container;
    this._modo = options.modo || 'normal';
    this._formulaOriginal = options.formulaOriginal || null;
    this._onAbrirSustitucion = options.onAbrirSustitucion || null;
    this._fecha = Utils.todayISO();
    await this._loadCatalogo();
    if (this._formulaOriginal) {
      this._cargarFormulaEnMemoria(this._formulaOriginal);
    }
    this._render();
  },

  async _loadCatalogo() {
    try {
      this._catalogo = await Api.fetchMP();
      this._mpList = this._catalogo.filter(p => String(p.CLASE || '').trim().toUpperCase() === 'MP');
      this._insumoList = await Api.fetchInsumos();
      this._ptList = this._catalogo.filter(p => String(p.CLASE || '').trim().toUpperCase() === 'PT');
    } catch (err) {
      Utils.toast('Error cargando catálogo: ' + err.message, 'error');
    }
  },

  _render() {
    const compareMode = this._modo === 'comparar';
    const original = this._resultadosOriginal || this._formulaOriginal ? {
      N: this._resultadosOriginal?.N ?? Utils.parseNum(this._formulaOriginal?.T_N),
      P: this._resultadosOriginal?.P ?? Utils.parseNum(this._formulaOriginal?.T_P),
      K: this._resultadosOriginal?.K ?? Utils.parseNum(this._formulaOriginal?.T_K)
    } : null;
    this._container.innerHTML = `
      <div class="view-header">
        <div class="view-header-left">
          <h2 class="view-title">${this._modo === 'comparar' ? 'Comparador de grados' : 'Formulador'}</h2>
          <span class="badge" id="form-status">${this._editingId ? '✏️ Editando' : this._modo === 'comparar' ? '⚖️ Comparando' : '🆕 Nueva fórmula'}</span>
        </div>
        <div class="view-header-right">
          ${this._modo === 'comparar' ? `<button class="btn btn-secondary" id="btn-ir-sustitucion">Sustitución</button>` : ''}
          <button class="btn btn-secondary" id="btn-limpiar">
            ${ICONS.trash} Limpiar
          </button>
          <button class="btn btn-primary" id="btn-guardar">
            ${ICONS.save} Guardar
          </button>
        </div>
      </div>

      ${this._modo === 'comparar' ? `
        <div class="compare-strip">
          <div class="card compare-card compare-card--original">
            <div class="card-title">Grado original</div>
            ${this._renderResumenFormula(this._formulaOriginal, this._resultadosOriginal, 'original')}
          </div>
          <div class="card compare-card compare-card--new">
            <div class="card-title">Grado nuevo</div>
            <div class="compare-note">Edita la fórmula a la derecha y valida el cambio contra tolerancias ICA.</div>
            ${this._renderCompareSummary(original, this._resultados)}
          </div>
        </div>
      ` : ''}

      <div class="formulador-layout">
        <!-- COLUMNA IZQUIERDA: Configuración -->
        <div class="form-column">
          <div class="card">
            <div class="card-title">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" class="card-title__icon">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Producto Destino
            </div>
            <div class="form-row">
              <div class="form-group flex-2">
                <label class="form-label">Producto Terminado</label>
                <div class="search-select" id="pt-select-wrapper" style="position:relative; overflow:visible;">
                  <input type="text" class="form-input" id="pt-search" 
                         placeholder="Buscar producto terminado..." autocomplete="off">
                  <div class="search-dropdown" id="pt-dropdown"></div>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Total (kg)</label>
                <input type="number" class="form-input" id="total-prod" 
                       placeholder="35000" min="0" step="1" value="${this._totalProd || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Fecha</label>
                <input type="date" class="form-input" id="fecha-prod" value="${this._fecha}">
              </div>
            </div>
            ${this._productoDestino ? `
              <div class="pt-selected">
                <span class="pt-name">${Utils.escapeHtml(this._productoDestino.PRODUCTO)}</span>
                <span class="pt-grade">N:${Utils.fmtGrade(this._productoDestino.N)} P:${Utils.fmtGrade(this._productoDestino.P)} K:${Utils.fmtGrade(this._productoDestino.K)}</span>
                <button class="btn-icon" id="btn-clear-pt" title="Quitar">${ICONS.close}</button>
              </div>
            ` : ''}
          </div>

          <div class="card">
            <div class="card-title">
              ${ICONS.beaker}
              Materias Primas de la Mezcla
            </div>
            <div class="progress-section">
              <div class="progress-label">
                <span>Total asignado:</span>
                <span id="total-asignado" class="progress-value">0.00</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" id="progress-fill" style="width:0%"></div>
              </div>
            </div>
            <div class="mp-slots" id="mp-slots">
              ${this._renderSlots()}
            </div>
            <button class="btn btn-secondary btn-full" id="btn-add-slot" style="display:${this._getActiveSlots() >= this.MAX_SLOTS ? 'none' : 'flex'}; margin-top: var(--sp-3);">
              ${ICONS.plus} Agregar insumo
            </button>
          </div>
        </div>

        <!-- COLUMNA DERECHA: Resultados -->
        <div class="results-column">
          <div class="card" id="results-card">
            <div class="card-title">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" class="card-title__icon">
                <rect x="3" y="3" width="14" height="14" rx="2"/>
                <path d="M7 8h6M7 12h4"/>
              </svg>
              Grado Final Calculado
            </div>
            <div id="results-content">
              <div class="empty-state small">
                <div class="empty-icon">
                  ${ICONS.beaker}
                </div>
                <p>Seleccione insumos para ver el cálculo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this._bindEvents();
    this._calcular();
  },

  _renderCompareSummary(original, actual) {
    if (!original || !actual) {
      return `<div class="empty-state small"><p>Esperando cálculo de la fórmula nueva</p></div>`;
    }

    const delta = key => (actual[key] || 0) - (original[key] || 0);
    const deltaLabel = value => `${value > 0 ? '+' : ''}${Utils.fmtGrade(value)}`;

    return `
      <div class="compare-summary">
        <div class="compare-summary__meta">
          <strong>Comparación contra original</strong>
          <span>Δ = nuevo - original</span>
        </div>
        <div class="compare-diff-grid">
          <div class="compare-diff">
            <span class="compare-diff__label">N</span>
            <span class="compare-diff__value">${Utils.fmtGrade(actual.N || 0)}</span>
            <span class="compare-diff__delta">${deltaLabel(delta('N'))}</span>
          </div>
          <div class="compare-diff">
            <span class="compare-diff__label">P</span>
            <span class="compare-diff__value">${Utils.fmtGrade(actual.P || 0)}</span>
            <span class="compare-diff__delta">${deltaLabel(delta('P'))}</span>
          </div>
          <div class="compare-diff">
            <span class="compare-diff__label">K</span>
            <span class="compare-diff__value">${Utils.fmtGrade(actual.K || 0)}</span>
            <span class="compare-diff__delta">${deltaLabel(delta('K'))}</span>
          </div>
        </div>
      </div>
    `;
  },

  _renderResumenFormula(formula, resultados, modo) {
    if (!formula) {
      return `<div class="empty-state small"><p>Sin fórmula original cargada</p></div>`;
    }

    const calc = resultados || {
      N: Utils.parseNum(formula.T_N),
      P: Utils.parseNum(formula.T_P),
      K: Utils.parseNum(formula.T_K)
    };

    return `
      <div class="compare-summary">
        <div class="compare-summary__meta">
          <strong>${Utils.escapeHtml(formula.NOMBRE_DESTINO || formula.COD_PROD_DESTINO || 'Receta')}</strong>
          <span>${Utils.escapeHtml(formula.FECHA || '')}</span>
        </div>
        <div class="npk-cards npk-cards--compact">
          <div class="npk-card" style="--accent: #34d399">
            <div class="npk-label">N</div>
            <div class="npk-value">${Utils.fmtGrade(calc.N || 0)}</div>
          </div>
          <div class="npk-card" style="--accent: #f59e0b">
            <div class="npk-label">P</div>
            <div class="npk-value">${Utils.fmtGrade(calc.P || 0)}</div>
          </div>
          <div class="npk-card" style="--accent: #3b82f6">
            <div class="npk-label">K</div>
            <div class="npk-value">${Utils.fmtGrade(calc.K || 0)}</div>
          </div>
        </div>
      </div>
    `;
  },

  _renderSlots() {
    const activeCount = this._getActiveSlots();
    const slotsToShow = Math.max(activeCount + 1, 3);

    return this._slots.slice(0, Math.min(slotsToShow, this.MAX_SLOTS)).map((slot, i) => `
      <div class="mp-slot ${slot.cod ? 'active' : ''}" data-index="${i}">
        <div class="slot-header">
          <span class="slot-number">${i + 1}</span>
          ${slot.cod ? `<button class="btn-icon btn-remove-slot" data-index="${i}" title="Quitar">${ICONS.close}</button>` : ''}
        </div>
        <div class="slot-body">
          <div class="form-group flex-2">
            <div class="search-select" style="position:relative; overflow:visible;">
              <input type="text" class="form-input mp-search" data-index="${i}"
                     placeholder="Buscar materia prima..." 
                     value="${slot.nombre ? Utils.escapeHtml(slot.nombre) : ''}" autocomplete="off">
              <div class="search-dropdown mp-dropdown" data-index="${i}"></div>
            </div>
          </div>
          <div class="form-group form-group-sm">
            <input type="number" class="form-input mp-cantidad" data-index="${i}"
                   placeholder="0.00" min="0" max="1" step="0.01" 
                   value="${slot.cantidad || ''}">
          </div>
          <div class="form-group form-group-sm">
            <input type="text" class="form-input mp-lotes" data-index="${i}"
                   placeholder="Lotes" value="${slot.lotes || ''}">
          </div>
        </div>
        ${slot.cod && slot.cantidad ? `
          <div class="slot-info">
            ${this._totalProd ? `<span class="slot-kg">${Utils.fmtNum(slot.cantidad * this._totalProd, 0)} kg</span>` : ''}
          </div>
        ` : ''}
      </div>
    `).join('');
  },

  _getActiveSlots() {
    return this._slots.filter(s => s.cod).length;
  },

  _bindEvents() {
    const c = this._container;

    // Búsqueda de PT
    const ptSearch = c.querySelector('#pt-search');
    const ptDropdown = c.querySelector('#pt-dropdown');
    ptSearch.addEventListener('input', Utils.debounce(e => {
      this._showDropdown(ptDropdown, e.target.value, this._ptList, (prod) => {
        this._productoDestino = prod;
        ptSearch.value = prod.PRODUCTO;
        ptDropdown.innerHTML = '';
        ptDropdown.classList.remove('visible');
        this._calcular();
        this._render();
      });
    }, 150));
    ptSearch.addEventListener('focus', () => {
      if (ptSearch.value) ptSearch.dispatchEvent(new Event('input'));
    });
    document.addEventListener('click', e => {
      if (!e.target.closest('#pt-select-wrapper')) {
        ptDropdown.classList.remove('visible');
      }
    });

    // Clear PT
    c.querySelector('#btn-clear-pt')?.addEventListener('click', () => {
      this._productoDestino = null;
      this._calcular();
      this._render();
    });

    // Total prod
    c.querySelector('#total-prod').addEventListener('input', e => {
      this._totalProd = parseFloat(e.target.value) || 0;
      this._updateProgress();
      this._calcular();
    });

    // Fecha
    c.querySelector('#fecha-prod').addEventListener('change', e => {
      this._fecha = e.target.value;
    });

    // MP search inputs
    c.querySelectorAll('.mp-search').forEach(input => {
      const idx = parseInt(input.dataset.index);
      const dropdown = c.querySelector(`.mp-dropdown[data-index="${idx}"]`);

      input.addEventListener('input', Utils.debounce(e => {
        this._showDropdown(dropdown, e.target.value, this._insumoList, (prod) => {
          this._slots[idx] = {
            cod: prod.COD,
            nombre: `${prod.COD}-${prod.PRODUCTO}-${prod.PROVEEDOR || ''}`,
            cantidad: this._slots[idx].cantidad || 0,
            lotes: this._slots[idx].lotes || '',
            _producto: prod
          };
          input.value = this._slots[idx].nombre;
          dropdown.innerHTML = '';
          dropdown.classList.remove('visible');
          this._calcular();
          this._updateSlots();
        });
      }, 150));

      input.addEventListener('focus', () => {
        if (!input.value) this._showDropdown(dropdown, '', this._insumoList.slice(0, 20), (prod) => {
          this._slots[idx] = {
            cod: prod.COD,
            nombre: `${prod.COD}-${prod.PRODUCTO}-${prod.PROVEEDOR || ''}`,
            cantidad: this._slots[idx].cantidad || 0,
            lotes: this._slots[idx].lotes || '',
            _producto: prod
          };
          input.value = this._slots[idx].nombre;
          dropdown.innerHTML = '';
          dropdown.classList.remove('visible');
          this._calcular();
          this._updateSlots();
        });
      });
    });

    // MP cantidad inputs
    c.querySelectorAll('.mp-cantidad').forEach(input => {
      const idx = parseInt(input.dataset.index);
      input.addEventListener('input', e => {
        this._slots[idx].cantidad = parseFloat(e.target.value) || 0;
        this._updateProgress();
        this._calcular();
      });
    });

    // MP lotes inputs
    c.querySelectorAll('.mp-lotes').forEach(input => {
      const idx = parseInt(input.dataset.index);
      input.addEventListener('input', e => {
        this._slots[idx].lotes = e.target.value;
      });
    });

    // Remove slot buttons
    c.querySelectorAll('.btn-remove-slot').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.index);
        this._slots[idx] = { cod: '', nombre: '', cantidad: 0, lotes: '' };
        this._updateProgress();
        this._calcular();
        this._render();
      });
    });

    // Add slot
    c.querySelector('#btn-add-slot')?.addEventListener('click', () => {
      this._render();
    });

    // Limpiar
    c.querySelector('#btn-limpiar').addEventListener('click', () => {
      this._limpiar();
    });

    // Guardar
    c.querySelector('#btn-guardar').addEventListener('click', () => {
      this._guardar();
    });

    c.querySelector('#btn-ir-sustitucion')?.addEventListener('click', () => {
      this._onAbrirSustitucion?.(this._formulaOriginal);
    });

    // Close all dropdowns on outside click
    document.addEventListener('click', e => {
      if (!e.target.closest('.search-select')) {
        c.querySelectorAll('.search-dropdown').forEach(d => d.classList.remove('visible'));
      }
    });
  },

  _showDropdown(dropdown, searchTerm, list, onSelect) {
    const term = searchTerm.toLowerCase();
    const filtered = term
      ? list.filter(p => `${p.COD} ${p.PRODUCTO} ${p.PROVEEDOR}`.toLowerCase().includes(term)).slice(0, 15)
      : list.slice(0, 15);

    if (filtered.length === 0) {
      dropdown.innerHTML = '<div class="dropdown-empty">Sin resultados</div>';
      dropdown.classList.add('visible');
      return;
    }

    dropdown.innerHTML = filtered.map(p => `
      <div class="dropdown-item" data-id="${Utils.escapeHtml(p.ID_PROD)}">
        <span class="dropdown-cod">${Utils.escapeHtml(p.COD)}</span>
        <span class="dropdown-name">${Utils.escapeHtml(p.PRODUCTO)}</span>
        <span class="dropdown-prov">${Utils.escapeHtml(p.PROVEEDOR || '')}</span>
      </div>
    `).join('');

    dropdown.classList.add('visible');
    dropdown.addEventListener('pointerdown', e => e.stopPropagation(), { once: true });

    dropdown.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('pointerdown', e => {
        e.preventDefault();
        e.stopPropagation();
        const itemId = String(item.dataset.id || '');
        const prod = list.find(p => String(p.ID_PROD || '') === itemId);
        if (prod) onSelect(prod);
      });
    });
  },

  _updateSlots() {
    const slotsEl = document.getElementById('mp-slots');
    if (slotsEl) slotsEl.innerHTML = this._renderSlots();
    // Re-bind events for new slot inputs
    this._bindEvents();
  },

  _updateProgress() {
    const total = this._slots.reduce((sum, s) => sum + (s.cantidad || 0), 0);
    const pct = Math.min((total / this.MAX_TOTAL_INSUMOS) * 100, 100);
    const fill = document.getElementById('progress-fill');
    const label = document.getElementById('total-asignado');

    if (fill) {
      fill.style.width = `${pct}%`;
      fill.className = `progress-fill ${total > this.MAX_TOTAL_INSUMOS ? 'over' : total === this.MAX_TOTAL_INSUMOS ? 'complete' : ''}`;
    }
    if (label) {
      label.textContent = total.toFixed(2);
      label.className = `progress-value ${total > this.MAX_TOTAL_INSUMOS ? 'over' : ''}`;
    }

    // Update slot kg displays
    this._slots.forEach((slot, i) => {
      if (slot.cod && slot.cantidad && this._totalProd) {
        const infoEl = this._container.querySelector(`.mp-slot[data-index="${i}"] .slot-kg`);
        if (infoEl) infoEl.textContent = `${Utils.fmtNum(slot.cantidad * this._totalProd, 0)} kg`;
      }
    });
  },

  /**
   * MOTOR DE CÁLCULO — Nucleo del formulador
   * T_nutriente = Σᵢ (cantidad_MPᵢ × concentración_nutriente_MPᵢ)
   */
  _calcular() {
    const calculados = {};
    for (const key of Utils.NUTRIENT_KEYS) {
      calculados[key] = 0;
    }

    // Sumar aportes de cada MP
    for (const slot of this._slots) {
      if (!slot.cod || !slot.cantidad) continue;

      // Buscar producto en catálogo
      const prod = slot._producto || this._catalogo.find(p =>
        p.ID_PROD === slot.cod || p.COD === slot.cod ||
        `${p.COD}-${p.PRODUCTO}-${p.PROVEEDOR || ''}` === slot.nombre
      );
      if (!prod) continue;

      for (const key of Utils.NUTRIENT_KEYS) {
        const concentracion = prod[key] || 0;
        calculados[key] += slot.cantidad * concentracion;
      }
    }

    // Convertir de kg a tonelada y redondear a 2 decimales
    for (const key of Utils.NUTRIENT_KEYS) {
      calculados[key] = Math.round((calculados[key] / 1000) * 100) / 100;
    }

    this._resultados = calculados;
    this._renderResultados();
  },

  _renderResultados() {
    const content = document.getElementById('results-content');
    if (!content) return;

    const calc = this._resultados;
    if (!calc || Object.values(calc).every(v => v === 0)) {
      content.innerHTML = `
        <div class="empty-state small">
          <div class="empty-icon">${ICONS.beaker}</div>
          <p>Seleccione insumos para ver el cálculo</p>
        </div>
      `;
      return;
    }

    // Tarjetas NPK principales
    const npkCards = [
      { key: 'N', label: 'Nitrógeno (N)', color: '#34d399' },
      { key: 'P', label: 'Fósforo (P₂O₅)', color: '#f59e0b' },
      { key: 'K', label: 'Potasio (K₂O)', color: '#3b82f6' }
    ];

    let html = `<div class="npk-cards">`;
    for (const { key, label, color } of npkCards) {
      const val = calc[key];
      const decl = this._productoDestino ? (this._productoDestino[key] || 0) : null;
      let statusClass = '';
      let statusText = '';
      if (decl !== null && decl > 0) {
        const ev = Tolerancias.evaluar(key, val, decl);
        statusClass = `status-${ev.status.toLowerCase()}`;
        statusText = ev.status;
      }
      html += `
        <div class="npk-card" style="--accent: ${color}">
          <div class="npk-label">${label}</div>
          <div class="npk-value">${Utils.fmtGrade(val)}</div>
          ${decl !== null && decl > 0 ? `
            <div class="npk-target">Objetivo: ${Utils.fmtGrade(decl)}</div>
            <div class="status-badge ${statusClass}" style="margin-top:var(--sp-2)">${statusText === 'C' ? '✓ C' : statusText === 'NC' ? '✕ NC' : '⚠ SUP'}</div>
          ` : ''}
        </div>
      `;
    }
    html += `</div>`;

    // Tabla completa de nutrientes
    html += `
      <h4 class="section-title">Composición Completa</h4>
      <div class="table-wrapper">
      <table class="data-table results-table">
        <thead>
          <tr>
            <th>Nutriente</th>
            <th class="num-col">Calculado</th>
            ${this._productoDestino ? `
              <th class="num-col">Declarado</th>
              <th class="num-col">Tolerancia</th>
              <th class="num-col">Rango</th>
              <th>Estado</th>
            ` : ''}
          </tr>
        </thead>
        <tbody>
    `;

    for (const n of Utils.NUTRIENTES) {
      const val = calc[n.key];
      const decl = this._productoDestino ? (this._productoDestino[n.key] || 0) : null;

      // Solo mostrar filas con valor > 0 (calculado o declarado)
      if (val === 0 && (decl === null || decl === 0)) continue;

      let tolHtml = '';
      if (decl !== null) {
        const ev = Tolerancias.evaluar(n.key, val, decl);
        tolHtml = `
          <td class="num-col">${Utils.fmtGrade(decl)}</td>
          <td class="num-col">±${Utils.fmtGrade(ev.tolerancia)}</td>
          <td class="num-col">${Utils.fmtGrade(ev.min)} – ${Utils.fmtGrade(ev.max)}</td>
          <td><span class="status-badge ${`status-${ev.status.toLowerCase()}`}">${ev.status === 'C' ? '✓ C' : ev.status === 'NC' ? '✕ NC' : '⚠ SUP'}</span></td>
        `;
      }

      html += `
        <tr class="${val > 0 ? 'has-value' : ''}">
          <td class="nutrient-name">${n.label}</td>
          <td class="num-col">${Utils.fmtGrade(val)}</td>
          ${tolHtml}
        </tr>
      `;
    }

    html += `</tbody></table></div>`;

    // Estado general
    if (this._productoDestino) {
      const declarados = {};
      for (const key of Utils.NUTRIENT_KEYS) {
        declarados[key] = this._productoDestino[key] || 0;
      }
      const evaluaciones = Tolerancias.evaluarTodos(calc, declarados);
      const general = Tolerancias.estadoGeneral(evaluaciones);
      const generalClass = general === 'C' ? 'status-c' : general === 'NC' ? 'status-nc' : 'status-sup';
      const generalLabel = general === 'C' ? '✓ CONFORME' : general === 'NC' ? '✕ NO CONFORME' : '⚠ SUPERA TOLERANCIA';

      html += `
        <div class="general-status ${generalClass}">
          <span class="general-label">Estado General</span>
          <span class="general-value">${generalLabel}</span>
        </div>
      `;
    }

    content.innerHTML = html;
  },

  _limpiar() {
    this._slots = Array(11).fill(null).map(() => ({ cod: '', nombre: '', cantidad: 0, lotes: '' }));
    this._productoDestino = null;
    this._totalProd = 0;
    this._fecha = Utils.todayISO();
    this._resultados = null;
    this._editingId = null;
    this._formulaOriginal = null;
    this._resultadosOriginal = null;
    this._render();
  },

  async _guardar() {
    // Validar que haya al menos un insumo
    const activeSlots = this._slots.filter(s => s.cod && s.cantidad > 0);
    if (activeSlots.length === 0) {
      Utils.toast('Agregue al menos un insumo con cantidad', 'warning');
      return;
    }

    // Validar suma de cantidades
    const total = this._slots.reduce((sum, s) => sum + (s.cantidad || 0), 0);
    if (total > this.MAX_TOTAL_INSUMOS) {
      Utils.toast(`La suma de cantidades no debe superar ${this.MAX_TOTAL_INSUMOS.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`, 'warning');
      return;
    }

    // Construir objeto fórmula
    const formula = {
      FECHA: this._fecha,
      COD_PROD_DESTINO: this._productoDestino?.COD || '',
      NOMBRE_DESTINO: this._productoDestino?.PRODUCTO || '',
      TOTAL_PROD: this._totalProd || 0
    };

    // Agregar slots de insumo
    for (let i = 0; i < this.MAX_SLOTS; i++) {
      const s = this._slots[i] || {};
      const prefix = `MP${i + 1}`;
      formula[`${prefix}_COD`] = s.cod || '';
      formula[`${prefix}_NOMBRE`] = s.nombre || '';
      formula[`${prefix}_CANTIDAD`] = s.cantidad || 0;
      formula[`${prefix}_LOTES`] = s.lotes || '';
    }

    // Agregar totales calculados
    if (this._resultados) {
      for (const key of Utils.NUTRIENT_KEYS) {
        formula[`T_${key}`] = this._resultados[key] || 0;
      }
    }

    formula.ESTADO = 'GUARDADA';

    try {
      Utils.setLoading(true, 'Guardando fórmula...');

      if (this._editingId) {
        await Api.updateFormula(this._editingId, formula);
        Utils.toast('Fórmula actualizada', 'success');
      } else {
        const result = await Api.saveFormula(formula);
        Utils.toast('Fórmula guardada', 'success');
      }

      Utils.setLoading(false);
    } catch (err) {
      Utils.setLoading(false);
      Utils.toast('Error al guardar: ' + err.message, 'error');
    }
  },

  /**
   * Carga una fórmula existente para editar o verificar
   * @param {Object} formula - Datos de la fórmula persistida
   */
  cargarFormula(formula, modo = 'editar') {
    this._editingId = modo === 'editar' ? formula.ID : null;
    this._formulaOriginal = modo === 'comparar' ? formula : null;
    this._fecha = formula.FECHA || Utils.todayISO();
    this._totalProd = Utils.parseNum(formula.TOTAL_PROD);

    // Buscar PT destino
    if (formula.COD_PROD_DESTINO) {
      this._productoDestino = this._catalogo.find(p => p.COD === formula.COD_PROD_DESTINO) || null;
    }

    // Cargar slots
    for (let i = 0; i < this.MAX_SLOTS; i++) {
      const prefix = `MP${i + 1}`;
      const cod = formula[`${prefix}_COD`] || '';
      if (cod) {
        const prod = this._catalogo.find(p => p.COD === cod || p.ID_PROD === cod);
        this._slots[i] = {
          cod,
          nombre: formula[`${prefix}_NOMBRE`] || '',
          cantidad: Utils.parseNum(formula[`${prefix}_CANTIDAD`]),
          lotes: formula[`${prefix}_LOTES`] || '',
          _producto: prod || null
        };
      } else {
        this._slots[i] = { cod: '', nombre: '', cantidad: 0, lotes: '' };
      }
    }

    this._render();
    Utils.toast(modo === 'editar' ? 'Fórmula cargada para edición' : 'Fórmula cargada (clon)', 'info');
  },

  _cargarFormulaEnMemoria(formula) {
    this._resultadosOriginal = {
      N: Utils.parseNum(formula.T_N),
      P: Utils.parseNum(formula.T_P),
      K: Utils.parseNum(formula.T_K)
    };
    this._fecha = formula.FECHA || Utils.todayISO();
    this._totalProd = Utils.parseNum(formula.TOTAL_PROD);

    if (formula.COD_PROD_DESTINO) {
      this._productoDestino = this._catalogo.find(p => p.COD === formula.COD_PROD_DESTINO) || null;
    }

    for (let i = 0; i < this.MAX_SLOTS; i++) {
      const prefix = `MP${i + 1}`;
      const cod = formula[`${prefix}_COD`] || '';
      if (cod) {
        const prod = this._catalogo.find(p => p.COD === cod || p.ID_PROD === cod);
        this._slots[i] = {
          cod,
          nombre: formula[`${prefix}_NOMBRE`] || '',
          cantidad: Utils.parseNum(formula[`${prefix}_CANTIDAD`]),
          lotes: formula[`${prefix}_LOTES`] || '',
          _producto: prod || null
        };
      } else {
        this._slots[i] = { cod: '', nombre: '', cantidad: 0, lotes: '' };
      }
    }
  }
};
