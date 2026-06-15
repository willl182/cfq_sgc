/**
 * FORMULADOR_CFQ — Cliente API para Google Sheets
 * Comunicación con el Google Apps Script Web App
 */

import { Utils } from './utils.js';

const DEFAULT_API_URL = (typeof window !== 'undefined' && (window.FORMULADOR_SUB_API_URL || window.FORMULADOR_API_URL)) || 'https://script.google.com/macros/s/AKfycbzlO8HjfoeQxClhA5Vm7jo6bwHHS_36yutp0nbjPDGRHRa5I1XC2tw3p0luB4wKtrw/exec';
const CACHE_PREFIX = 'formulador_sub_';

export const Api = {
  /** URL del Web App de Google Apps Script */
  _baseUrl: DEFAULT_API_URL,

  /** Cache local del catálogo de MP */
  _cacheMP: null,

  setUrl(url) {
    this._baseUrl = url.replace(/\/$/, '');
    localStorage.setItem(`${CACHE_PREFIX}api_url`, url);
  },

  setDefaultUrl(url) {
    if (!this._baseUrl) this._baseUrl = url.replace(/\/$/, '');
  },

  getUrl() {
    if (!this._baseUrl) {
      this._baseUrl = localStorage.getItem(`${CACHE_PREFIX}api_url`) || DEFAULT_API_URL || '';
    }
    return this._baseUrl;
  },

  isConfigured() {
    return !!this.getUrl();
  },

  async ping() {
    try {
      const resp = await this._get('ping');
      return resp && resp.status === 'ok';
    } catch {
      return false;
    }
  },

  async fetchMP(forceRefresh = false) {
    if (!forceRefresh && this._cacheMP) return this._cacheMP;

    if (!forceRefresh) {
      const cached = localStorage.getItem(`${CACHE_PREFIX}cache_mp`);
      if (cached) {
        try {
          this._cacheMP = JSON.parse(cached);
          return this._cacheMP;
        } catch {}
      }
    }

    const resp = await this._get('getMP');
    const data = Array.isArray(resp?.data) ? resp.data : [];
    this._cacheMP = data.map(row => {
      const item = { ...row };
      item.CLASE = String(item.CLASE || '').trim().toUpperCase();
      item.TIPO = String(item.TIPO || '').trim().toUpperCase();
      for (const key of Utils.NUTRIENT_KEYS) item[key] = Utils.parseNum(item[key]);
      return item;
    });
    localStorage.setItem(`${CACHE_PREFIX}cache_mp`, JSON.stringify(this._cacheMP));
    return this._cacheMP;
  },

  async fetchInsumos(forceRefresh = false) {
    const all = await this.fetchMP(forceRefresh);
    return all.filter(p => ['MP', 'PT'].includes(String(p.CLASE || '').trim().toUpperCase()));
  },

  async saveMP(productos) {
    const result = await this._post('saveMP', { data: productos });
    this._cacheMP = productos;
    localStorage.setItem(`${CACHE_PREFIX}cache_mp`, JSON.stringify(productos));
    return result;
  },

  async fetchMPOnly(forceRefresh = false) {
    const all = await this.fetchMP(forceRefresh);
    return all.filter(p => p.CLASE === 'MP');
  },

  async fetchPT(forceRefresh = false) {
    const all = await this.fetchMP(forceRefresh);
    return all.filter(p => p.CLASE === 'PT');
  },

  async findProducto(idProd) {
    const all = await this.fetchMP();
    return all.find(p => p.ID_PROD === idProd);
  },

  async findByCod(cod) {
    const all = await this.fetchMP();
    return all.find(p => p.COD === cod);
  },

  async fetchFormulas() {
    const resp = await this._get('getFormulas');
    return Array.isArray(resp?.data) ? resp.data : [];
  },

  async fetchFormula(id) {
    const resp = await this._get('getFormula', { id });
    return resp?.data || null;
  },

  async saveFormula(formula) {
    return await this._post('saveFormula', { data: formula });
  },

  async updateFormula(id, updates) {
    return await this._post('updateFormula', { id, data: updates });
  },

  async deleteFormula(id) {
    return await this._post('deleteFormula', { id });
  },

  async cloneFormula(id) {
    return await this._post('cloneFormula', { id });
  },

  async _get(action, params = {}) {
    const url = new URL(this.getUrl());
    url.searchParams.set('action', action);
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }

    const resp = await fetch(url.toString(), { method: 'GET', redirect: 'follow' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
    const data = await resp.json();
    if (data.error) throw new Error(data.error);
    return data;
  },

  async _post(action, body = {}) {
    const url = new URL(this.getUrl());
    url.searchParams.set('action', action);

    try {
      const resp = await fetch(url.toString(), {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(body)
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
      const data = await resp.json();
      if (data.error) throw new Error(data.error);
      return data;
    } catch (err) {
      await this._postViaForm(url.toString(), action, body);
      return { success: true, queued: true, action };
    }
  },

  _postViaForm(endpoint, action, body = {}) {
    return new Promise((resolve, reject) => {
      const iframeName = `formulador_sub_iframe_${Date.now()}`;
      const iframe = document.createElement('iframe');
      iframe.name = iframeName;
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = endpoint;
      form.target = iframeName;
      form.style.display = 'none';

      const actionInput = document.createElement('input');
      actionInput.type = 'hidden';
      actionInput.name = 'action';
      actionInput.value = action;
      form.appendChild(actionInput);

      const payloadInput = document.createElement('textarea');
      payloadInput.name = 'payload';
      payloadInput.value = JSON.stringify({ action, ...body });
      form.appendChild(payloadInput);

      iframe.addEventListener('load', () => {
        form.remove();
        iframe.remove();
        resolve();
      });

      document.body.appendChild(form);
      try {
        form.submit();
      } catch (submitErr) {
        form.remove();
        iframe.remove();
        reject(submitErr);
      }
    });
  }
};
