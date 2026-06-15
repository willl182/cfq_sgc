import { Utils } from './modules/utils.js';
import { Api } from './modules/api.js';
import { Catalogo } from './modules/catalogo.js';
import { CatalogoUnificado } from './modules/catalogo-unificado.js';
import { Formulador } from './modules/formulador.js';
import { Comparador } from './modules/comparador.js';
import { FormulasGuardadas } from './modules/formulas-guardadas.js';
import { Sustitucion } from './modules/sustitucion.js';
import { InventarioEditor } from './modules/inventario-editor.js';
import { Historico } from './modules/historico.js';
import { Seed } from './modules/seed.js';

const DEFAULT_API_URL = window.FORMULADOR_SUB_API_URL || window.FORMULADOR_API_URL || 'https://script.google.com/macros/s/AKfycbzlO8HjfoeQxClhA5Vm7jo6bwHHS_36yutp0nbjPDGRHRa5I1XC2tw3p0luB4wKtrw/exec';

const views = {
  catalogo: CatalogoUnificado,
  formulador: Formulador,
  comparador: Comparador,
  sustitucion: Sustitucion,
  formulas: FormulasGuardadas,
  inventario: InventarioEditor,
  historico: Historico
};

const state = {
  current: 'catalogo'
};

/* ── Tab underline ink-bar animation ─────────────────────── */
function setActiveTab(tab) {
  document.querySelectorAll('.navbar__tab').forEach(btn => {
    const isActive = btn.dataset.view === tab;
    btn.classList.toggle('navbar__tab--active', isActive);
    btn.setAttribute('aria-selected', isActive);
  });
}

/* ── Navbar scroll shadow ────────────────────────────────── */
function initNavbarScroll() {
  const navbar = document.getElementById('main-navbar');
  if (!navbar) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        navbar.classList.toggle('navbar--scrolled', window.scrollY > 8);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ── API status indicator ────────────────────────────────── */
async function checkApiStatus() {
  const statusEl = document.getElementById('api-status');
  if (!statusEl) return;

  const dot = statusEl.querySelector('.navbar__status-dot');
  const text = statusEl.querySelector('.navbar__status-text');

  try {
    const ok = await Api.ping();
    if (ok) {
      statusEl.classList.add('navbar__status--online');
      statusEl.classList.remove('navbar__status--offline');
      dot.title = 'Conectado a Google Sheets';
      text.textContent = 'Online';
    } else {
      throw new Error('ping failed');
    }
  } catch {
    statusEl.classList.remove('navbar__status--online');
    statusEl.classList.add('navbar__status--offline');
    dot.title = 'Sin conexión — usando caché local';
    text.textContent = 'Offline';
  }
}

/* ── View router ─────────────────────────────────────────── */
async function renderView(tab, options = {}) {
  state.current = tab;
  setActiveTab(tab);

  const root = document.getElementById('app-view');
  root.classList.remove('view--entering');
  // Force reflow for animation restart
  void root.offsetWidth;
  root.classList.add('view--entering');

  const view = views[tab];
  if (!view) return;

  if (tab === 'formulas') {
    await view.init(root, {
      ver: async formula => {
        await renderView('formulador');
        Formulador.cargarFormula(formula, 'ver');
      },
      editar: async formula => {
        await renderView('formulador');
        Formulador.cargarFormula(formula, 'editar');
      },
      clonar: async formula => {
        await renderView('formulador');
        Formulador.cargarFormula(formula, 'clonar');
      },
      comparar: async formula => {
        await renderView('comparador', { formulaOriginal: formula });
      },
      abrirSustitucion: async formula => {
        await renderView('sustitucion', { formulaBase: formula });
      }
    });
    return;
  }
  if (tab === 'comparador') {
    await view.init(root, {
      formulaOriginal: options.formulaOriginal || null,
      onAbrirSustitucion: async formula => renderView('sustitucion', { formulaBase: formula })
    });
    return;
  }
  if (tab === 'sustitucion') {
    await view.init(root, { formulaBase: options.formulaBase || null });
    return;
  }
  await view.init(root);
}

/* ── Boot ────────────────────────────────────────────────── */
async function boot() {
  const savedUrl = localStorage.getItem('formulador_sub_api_url') || DEFAULT_API_URL;
  if (savedUrl) Api.setUrl(savedUrl);
  document.title = 'Formulador Mezclas CFQ — CALFERQUIM';

  // Tab click handlers
  document.querySelectorAll('.navbar__tab').forEach(btn => {
    btn.addEventListener('click', () => renderView(btn.dataset.view));
  });

  // Keyboard navigation for tabs
  document.querySelectorAll('.navbar__tab').forEach(btn => {
    btn.addEventListener('keydown', e => {
      const tabs = [...document.querySelectorAll('.navbar__tab')];
      const idx = tabs.indexOf(btn);
      let target = null;

      if (e.key === 'ArrowRight') target = tabs[(idx + 1) % tabs.length];
      if (e.key === 'ArrowLeft') target = tabs[(idx - 1 + tabs.length) % tabs.length];

      if (target) {
        e.preventDefault();
        target.focus();
        target.click();
      }
    });
  });

  initNavbarScroll();
  await renderView('catalogo');

  // Check API status non-blocking
  checkApiStatus();
  // Re-check every 60s
  setInterval(checkApiStatus, 60000);
}

if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('DOMContentLoaded', boot);
}
