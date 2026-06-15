import { Utils } from './utils.js';
import { Api } from './api.js';

function distanciaEuclidiana(a, b) {
  const dn = (a.N || 0) - (b.N || 0);
  const dp = (a.P || 0) - (b.P || 0);
  const dk = (a.K || 0) - (b.K || 0);
  return Math.sqrt(dn * dn + dp * dp + dk * dk);
}

function toNpk(item) {
  return { N: item.N || 0, P: item.P || 0, K: item.K || 0 };
}

function sugerirCantidad(base, candidata, prioridad, cantidadBaseKg) {
  const campo = prioridad;
  const vBase = base[campo] || 0;
  const vCand = candidata[campo] || 0;
  if (vCand <= 0) return 0;
  return Math.round(((cantidadBaseKg * vBase) / vCand) * 10) / 10;
}

function crearRecetaClonada(base, sustituto, prioridad, kgBase, kgSugerido) {
  const fecha = Utils.todayISO();
  return {
    ID: `SUB-${fecha.replace(/-/g, '')}-${Utils.generateId()}`,
    FECHA: fecha,
    TIPO: 'RECETA_CLONADA_LOCAL',
    ORIGEN: 'formulador-sub',
    BASE_COD: base?.COD || '',
    BASE_PRODUCTO: base?.PRODUCTO || '',
    BASE_N: base?.N || 0,
    BASE_P: base?.P || 0,
    BASE_K: base?.K || 0,
    SUSTITUTO_COD: sustituto?.COD || '',
    SUSTITUTO_PRODUCTO: sustituto?.PRODUCTO || '',
    PRIORIDAD: prioridad,
    KG_BASE: kgBase,
    KG_SUGERIDO: kgSugerido,
    DISTANCIA: sustituto?._dist || 0,
    TRAZABILIDAD: [
      `Base: ${base?.COD || ''} - ${base?.PRODUCTO || ''}`,
      `Sustituto: ${sustituto?.COD || ''} - ${sustituto?.PRODUCTO || ''}`,
      `Prioridad: ${prioridad}`,
      `Kg base: ${kgBase}`,
      `Kg sugeridos: ${kgSugerido}`
    ]
  };
}

export const Sustitucion = {
  _container: null,
  _catalogo: [],
  _bases: [],
  _base: null,
  _formulaBase: null,
  _slotsBase: [],
  _insumoBase: null,
  _cantidadBaseKg: 50,
  _prioridad: 'N',
  _seleccionado: null,
  _sustituciones: [],
  _recetasClonadas: [],

  async init(container, options = {}) {
    this._container = container;
    this._formulaBase = options.formulaBase || null;
    this._render();
    await this._load();
  },

  async _load() {
    try {
      Utils.setLoading(true, 'Cargando sustituciones...');
      const all = await Api.fetchMP();
      this._bases = all.filter(item => String(item.CLASE || '').trim().toUpperCase() === 'MP');
      this._catalogo = all.filter(item => String(item.CLASE || '').trim().toUpperCase() === 'MP');
      this._sustituciones = JSON.parse(localStorage.getItem('formulador_sub_sustituciones') || '[]');
      this._recetasClonadas = JSON.parse(localStorage.getItem('formulador_sub_recetas_clonadas') || '[]');
      if (this._formulaBase) {
        this._base = this._bases.find(item => item.COD === this._formulaBase.COD_PROD_DESTINO) || this._base || null;
        this._slotsBase = this._extraerSlotsFormula(this._formulaBase);
        if (this._base) this._insumoBase = { ...toNpk(this._base) };
      }
      if (!this._base && this._bases.length) {
        this._base = this._bases[0];
        this._insumoBase = { ...toNpk(this._base) };
      }
      Utils.setLoading(false);
      this._renderLista();
    } catch (err) {
      Utils.setLoading(false);
      Utils.toast('Error cargando sustituciones: ' + err.message, 'error');
    }
  },

  _render() {
    this._container.innerHTML = `
      <div class="view-header">
        <div class="view-header-left">
          <h2 class="view-title">Sustitución</h2>
          <span class="badge" id="sub-count">0 MPs</span>
        </div>
        <div class="view-header-right">
          <button class="btn btn-secondary" id="btn-sub-export-recetas">Exportar recetas</button>
          <button class="btn btn-secondary" id="btn-sub-export">Exportar JSON</button>
          <button class="btn btn-secondary" id="btn-sub-refresh">Actualizar</button>
        </div>
      </div>
      <div class="card" style="margin-bottom: var(--sp-6);">
        <div class="card-title">Base de trabajo temporal</div>
        ${this._formulaBase ? `
          <div class="compare-note" style="margin-bottom: var(--sp-3);">
            Receta base cargada: <strong>${Utils.escapeHtml(this._formulaBase.NOMBRE_DESTINO || this._formulaBase.COD_PROD_DESTINO || '')}</strong>
          </div>
          <div class="table-wrapper" style="margin-bottom: var(--sp-3);">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Slot</th>
                  <th>MP</th>
                  <th class="num-col">Kg</th>
                  <th></th>
                </tr>
              </thead>
              <tbody id="sub-base-slots"></tbody>
            </table>
          </div>
        ` : ''}
        <div class="form-row">
          <div class="form-group flex-2">
            <label class="form-label">MP base</label>
            <input class="form-input" id="sub-base-search" placeholder="Buscar MP base..." autocomplete="off" />
            <div class="search-dropdown" id="sub-base-dropdown"></div>
          </div>
          <div class="form-group">
            <label class="form-label">Kg a sustituir</label>
            <input type="number" class="form-input" id="sub-kg" min="1" step="0.1" value="${this._cantidadBaseKg}">
          </div>
        </div>
        <div id="sub-base-card" class="pt-selected" style="display:${this._base ? 'flex' : 'none'}"></div>
      </div>
      <div class="card" style="margin-bottom: var(--sp-6);">
        <div class="card-title">Priorizar nutriente</div>
        <div class="segmented-control" id="sub-priority">
          <button class="btn btn-secondary ${this._prioridad === 'N' ? 'btn-primary' : ''}" data-priority="N">N</button>
          <button class="btn btn-secondary ${this._prioridad === 'P' ? 'btn-primary' : ''}" data-priority="P">P</button>
          <button class="btn btn-secondary ${this._prioridad === 'K' ? 'btn-primary' : ''}" data-priority="K">K</button>
        </div>
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>MP</th>
              <th class="num-col">N</th>
              <th class="num-col">P</th>
              <th class="num-col">K</th>
              <th class="num-col">Distancia</th>
              <th class="num-col">Sugerido</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="sub-tbody"></tbody>
        </table>
      </div>
    `;
    this._bind();
    if (this._formulaBase) {
      this._renderSlotsBase();
    }
  },

  _extraerSlotsFormula(formula) {
    const slots = [];
    for (let i = 1; i <= 11; i++) {
      const cod = formula[`MP${i}_COD`] || '';
      if (!cod) continue;
      slots.push({
        index: i,
        cod,
        nombre: formula[`MP${i}_NOMBRE`] || '',
        cantidad: Utils.parseNum(formula[`MP${i}_CANTIDAD`]),
        lotes: formula[`MP${i}_LOTES`] || ''
      });
    }
    return slots;
  },

  _renderSlotsBase() {
    const tbody = this._container.querySelector('#sub-base-slots');
    if (!tbody) return;
    tbody.innerHTML = this._slotsBase.map(slot => `
      <tr>
        <td>${slot.index}</td>
        <td>${Utils.escapeHtml(slot.nombre || slot.cod)}</td>
        <td class="num-col">${Utils.fmtGrade(slot.cantidad)}</td>
        <td>
          <button class="btn btn-secondary" data-base-slot="${slot.index}">Sustituir</button>
        </td>
      </tr>
    `).join('');
    tbody.querySelectorAll('button[data-base-slot]').forEach(btn => {
      btn.addEventListener('click', () => {
        const slot = this._slotsBase.find(s => String(s.index) === String(btn.dataset.baseSlot));
        if (!slot) return;
        this._cantidadBaseKg = slot.cantidad;
        this._base = this._base || this._bases[0] || null;
        this._insumoBase = this._base ? { ...toNpk(this._base) } : null;
        this._renderLista();
      });
    });
  },

  _bind() {
    this._container.querySelector('#btn-sub-refresh').addEventListener('click', () => this._load());
    this._container.querySelector('#btn-sub-export-recetas').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(this._recetasClonadas, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'formulador-sub-recetas-clonadas.json';
      a.click();
      URL.revokeObjectURL(url);
    });
    this._container.querySelector('#btn-sub-export').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(this._sustituciones, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'formulador-sub-sustituciones.json';
      a.click();
      URL.revokeObjectURL(url);
    });
    this._container.querySelector('#sub-priority').addEventListener('click', e => {
      const btn = e.target.closest('[data-priority]');
      if (!btn) return;
      this._prioridad = btn.dataset.priority;
      this._render();
      this._renderLista();
    });
    const kg = this._container.querySelector('#sub-kg');
    kg?.addEventListener('input', e => {
      this._cantidadBaseKg = parseFloat(e.target.value) || 0;
      this._renderLista();
    });
    const baseSearch = this._container.querySelector('#sub-base-search');
    const baseDropdown = this._container.querySelector('#sub-base-dropdown');
    baseSearch?.addEventListener('input', Utils.debounce(e => {
      this._showBaseDropdown(baseDropdown, e.target.value);
    }, 150));
    document.addEventListener('click', e => {
      if (!e.target.closest('#sub-base-search') && !e.target.closest('#sub-base-dropdown')) {
        baseDropdown?.classList.remove('visible');
      }
    });
  },

  _showBaseDropdown(dropdown, term) {
    const filtered = (term ? this._bases.filter(p => `${p.COD} ${p.PRODUCTO}`.toLowerCase().includes(term.toLowerCase())) : this._bases).slice(0, 10);
    dropdown.innerHTML = filtered.map(p => `
      <div class="dropdown-item" data-id="${Utils.escapeHtml(p.ID_PROD)}">
        <span class="dropdown-cod">${Utils.escapeHtml(p.COD)}</span>
        <span class="dropdown-name">${Utils.escapeHtml(p.PRODUCTO)}</span>
      </div>
    `).join('');
    dropdown.classList.add('visible');
    dropdown.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('pointerdown', e => {
        e.preventDefault();
        const prod = this._bases.find(x => String(x.ID_PROD) === String(item.dataset.id));
        if (!prod) return;
        this._base = prod;
        this._insumoBase = { ...toNpk(prod) };
        this._container.querySelector('#sub-base-search').value = `${prod.COD} - ${prod.PRODUCTO}`;
        this._render();
        this._renderLista();
      });
    });
  },

  _renderLista() {
    const tbody = this._container.querySelector('#sub-tbody');
    const count = this._container.querySelector('#sub-count');
    if (!tbody || !count) return;
    const baseLabel = this._container.querySelector('#sub-base-card');
    if (baseLabel) {
      baseLabel.style.display = this._base ? 'flex' : 'none';
      baseLabel.innerHTML = this._base ? `
        <span class="pt-name">${Utils.escapeHtml(this._base.PRODUCTO)}</span>
        <span class="pt-grade">N:${Utils.fmtGrade(this._base.N)} P:${Utils.fmtGrade(this._base.P)} K:${Utils.fmtGrade(this._base.K)}</span>
      ` : '';
    }
    if (!this._base) {
      tbody.innerHTML = '';
      count.textContent = `${this._catalogo.length} MFs`;
      return;
    }

    const objetivo = this._insumoBase || { N: 0, P: 0, K: 0 };
    const ordenadas = [...this._catalogo].map(item => ({
      ...item,
      _dist: distanciaEuclidiana(item, objetivo),
      _prioridad: Math.abs((item[this._prioridad] || 0) - objetivo[this._prioridad])
    })).sort((a, b) => a._prioridad - b._prioridad || a._dist - b._dist);

    count.textContent = `${ordenadas.length} MPs`;
    tbody.innerHTML = ordenadas.slice(0, 30).map(item => `
      <tr>
        <td>${Utils.escapeHtml(item.PRODUCTO || item.COD || '')}</td>
        <td class="num-col">${Utils.fmtGrade(item.N)}</td>
        <td class="num-col">${Utils.fmtGrade(item.P)}</td>
        <td class="num-col">${Utils.fmtGrade(item.K)}</td>
        <td class="num-col">${Utils.fmtGrade(item._dist)}</td>
        <td class="num-col">${Utils.fmtGrade(sugerirCantidad(objetivo, item, this._prioridad, this._cantidadBaseKg))}</td>
        <td>
          <button class="btn btn-secondary" data-id="${Utils.escapeHtml(item.ID_PROD)}">Seleccionar</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('button[data-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = ordenadas.find(x => String(x.ID_PROD) === String(btn.dataset.id));
        if (!item) return;
        const sugerida = sugerirCantidad(objetivo, item, this._prioridad, this._cantidadBaseKg);
        this._seleccionado = item;
        this._sustituciones.unshift({
          fecha: Utils.todayISO(),
          base: this._base?.PRODUCTO || '',
          base_cod: this._base?.COD || '',
          sustituido: this._base?.PRODUCTO || '',
          mf: item.PRODUCTO || '',
          mf_cod: item.COD || '',
          prioridad: this._prioridad,
          kg_base: this._cantidadBaseKg,
          kg_sugerido: sugerida,
          distancia: item._dist
        });
        this._recetasClonadas.unshift(crearRecetaClonada(this._base, item, this._prioridad, this._cantidadBaseKg, sugerida));
        localStorage.setItem('formulador_sub_sustituciones', JSON.stringify(this._sustituciones));
        localStorage.setItem('formulador_sub_recetas_clonadas', JSON.stringify(this._recetasClonadas));
        Utils.toast(`Sugerida ${sugerida} kg de ${item.PRODUCTO}`, 'success');
      });
    });
  }
};
