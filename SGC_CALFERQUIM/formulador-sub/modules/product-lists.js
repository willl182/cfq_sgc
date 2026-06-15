/**
 * FORMULADOR_CFQ — Product Lists & Snapshots
 * Listas vivas recalculables + snapshots inmutables versionados
 *
 * Reglas del plan_v1:
 * - Lista viva guarda estructura y cantidades, NO composición final como fuente de verdad
 * - Todo guardado persistente crea/actualiza lista viva Y crea snapshot en la misma operación
 * - Snapshots versionados: v1, v2, v3...
 * - Snapshot congela: objetivo, componentes, composiciones, cantidades, resultado, estado, usuario, fecha
 * - Snapshots jamás se recalculan
 * - Lista viva puede tener PT objetivo opcional o SIN_OBJETIVO
 * - Código visible: PT0008-L001, PT0008-L002; borradores con consecutivo propio
 * - Componentes dinámicos sin límite de 11
 * - Total distinto de 1000 se guarda con alerta
 * - Admin local por localStorage
 */

import { calcularComposicion, calcularTotalKg, congelarComponentes, NUTRIENT_KEYS } from './formulas.js';
import { evaluarTodos, estadoGeneral } from './tolerancias-v2.js';

const LISTS_KEY = 'formulador_sub_product_lists';
const SNAPSHOTS_KEY = 'formulador_sub_snapshots';

let _listCounter = 0;

function generateListCode(productInternalId, existingLists) {
  const prefix = productInternalId || 'BORRADOR';
  const matching = existingLists.filter(l => l.targetProductId === productInternalId);
  const maxNum = matching.reduce((max, l) => {
    const m = l.displayCode?.match(/L(\d+)$/);
    return m ? Math.max(max, parseInt(m[1])) : max;
  }, 0);
  return `${prefix}-L${String(maxNum + 1).padStart(3, '0')}`;
}

function generateSnapshotVersion(productId, listId, snapshots) {
  const matching = snapshots.filter(s => s.productListId === listId);
  return `v${matching.length + 1}`;
}

export const ProductLists = {
  _lists: null,
  _snapshots: null,

  get lists() {
    if (!this._lists) {
      try { this._lists = JSON.parse(localStorage.getItem(LISTS_KEY) || '[]'); }
      catch { this._lists = []; }
    }
    return this._lists;
  },

  get snapshots() {
    if (!this._snapshots) {
      try { this._snapshots = JSON.parse(localStorage.getItem(SNAPSHOTS_KEY) || '[]'); }
      catch { this._snapshots = []; }
    }
    return this._snapshots;
  },

  save() {
    localStorage.setItem(LISTS_KEY, JSON.stringify(this._lists));
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(this._snapshots));
  },

  /**
   * Crear nueva lista viva
   */
  create({ targetProductId = null, targetProductName = '', alias = '', componentes = [], catalogo = [] }) {
    const displayCode = generateListCode(targetProductId, this.lists);
    const lista = {
      id: `list-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      targetProductId,
      targetProductName: targetProductName || 'Sin objetivo',
      displayCode,
      alias: alias || displayCode,
      componentes: componentes.map(c => ({
        insumoId: c.insumoId || c.internalId || '',
        cod: c.cod || c.externalCode || '',
        nombre: c.nombre || c.PRODUCTO || '',
        cantidadKg: c.cantidadKg || 0,
        lotes: c.lotes || ''
      })),
      totalKg: calcularTotalKg(componentes),
      composicionCalculada: {},
      estadoTolerancia: 'SIN_OBJETIVO',
      detalleTolerancia: {},
      alertas: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      archivedAt: null
    };

    if (targetProductId && catalogo.length) {
      const target = catalogo.find(i => i.internalId === targetProductId);
      if (target) {
        const declarados = {};
        for (const key of NUTRIENT_KEYS) declarados[key] = target[key] || 0;
        const comps = lista.componentes.map(c => {
          const ins = catalogo.find(i => i.internalId === c.insumoId);
          return { cantidadKg: c.cantidadKg, insumo: ins || {} };
        });
        lista.composicionCalculada = calcularComposicion(comps);
        lista.totalKg = calcularTotalKg(comps);
        const evaluaciones = evaluarTodos(lista.composicionCalculada, declarados);
        lista.estadoTolerancia = estadoGeneral(evaluaciones, true);
        lista.detalleTolerancia = evaluaciones;
        lista.alertas = this._checkAlerts(lista);
      }
    }

    this._lists.push(lista);
    this.save();
    return lista;
  },

  /**
   * Actualizar lista viva Y crear snapshot
   */
  saveWithSnapshot(listId, updates, catalogo = []) {
    const idx = this.lists.findIndex(l => l.id === listId);
    if (idx === -1) return null;

    const lista = this.lists[idx];

    if (updates.componentes) {
      lista.componentes = updates.componentes.map(c => ({
        insumoId: c.insumoId || c.internalId || '',
        cod: c.cod || c.externalCode || '',
        nombre: c.nombre || c.PRODUCTO || '',
        cantidadKg: c.cantidadKg || 0,
        lotes: c.lotes || ''
      }));
    }

    if (updates.alias !== undefined) lista.alias = updates.alias;
    if (updates.targetProductId !== undefined) lista.targetProductId = updates.targetProductId;
    if (updates.targetProductName !== undefined) lista.targetProductName = updates.targetProductName;

    const comps = lista.componentes.map(c => {
      const ins = catalogo.find(i => i.internalId === c.insumoId) || { [NUTRIENT_KEYS.reduce((_, k) => ({ ..._, [k]: 0 }), {})] };
      return { cantidadKg: c.cantidadKg, insumo: ins };
    });

    lista.composicionCalculada = calcularComposicion(comps);
    lista.totalKg = calcularTotalKg(comps);

    if (lista.targetProductId) {
      const target = catalogo.find(i => i.internalId === lista.targetProductId);
      if (target) {
        const declarados = {};
        for (const key of NUTRIENT_KEYS) declarados[key] = target[key] || 0;
        const evaluaciones = evaluarTodos(lista.composicionCalculada, declarados);
        lista.estadoTolerancia = estadoGeneral(evaluaciones, true);
        lista.detalleTolerancia = evaluaciones;
      }
    } else {
      lista.estadoTolerancia = 'SIN_OBJETIVO';
      lista.detalleTolerancia = {};
    }

    lista.alertas = this._checkAlerts(lista);
    lista.updatedAt = Date.now();

    const snapshot = this._createSnapshot(lista, catalogo);
    this.save();

    return { lista, snapshot };
  },

  /**
   * Crear snapshot inmutable de una lista
   */
  _createSnapshot(lista, catalogo) {
    const version = generateSnapshotVersion(lista.targetProductId, lista.id, this.snapshots);

    const targetSnapshot = {};
    if (lista.targetProductId) {
      const target = catalogo.find(i => i.internalId === lista.targetProductId);
      if (target) {
        for (const key of NUTRIENT_KEYS) targetSnapshot[key] = target[key] || 0;
      }
    }

    const componentesSnapshot = lista.componentes.map(c => {
      const ins = catalogo.find(i => i.internalId === c.insumoId) || {};
      const composicion = {};
      for (const key of NUTRIENT_KEYS) composicion[key] = ins[key] || 0;
      return {
        insumoId: c.insumoId,
        cod: c.cod || ins.externalCode || '',
        nombre: c.nombre || ins.PRODUCTO || '',
        cantidadKg: c.cantidadKg,
        composicionSnapshot: composicion
      };
    });

    const snapshot = {
      id: `snap-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      productListId: lista.id,
      targetProductId: lista.targetProductId,
      nombre: lista.alias || lista.displayCode,
      targetSnapshot,
      componentesSnapshot,
      composicionCalculada: { ...lista.composicionCalculada },
      estadoTolerancia: lista.estadoTolerancia,
      detalleTolerancia: { ...lista.detalleTolerancia },
      totalKg: lista.totalKg,
      alertas: [...(lista.alertas || [])],
      version,
      creadoEn: Date.now(),
      notas: ''
    };

    this._snapshots.push(snapshot);
    return snapshot;
  },

  _checkAlerts(lista) {
    const alerts = [];
    if (lista.totalKg > 0 && Math.abs(lista.totalKg - 1000) > 0.01) {
      alerts.push(`Total kg: ${lista.totalKg.toFixed(2)} (esperado 1000)`);
    }
    if (!lista.targetProductId) {
      alerts.push('Sin producto objetivo: tolerancias no evaluadas');
    }
    return alerts;
  },

  /**
   * Obtener lista por ID
   */
  getById(listId) {
    return this.lists.find(l => l.id === listId);
  },

  /**
   * Obtener listas por producto objetivo
   */
  getByProduct(productId) {
    return this.lists.filter(l => l.targetProductId === productId && !l.archivedAt);
  },

  /**
   * Obtener todas las listas activas
   */
  getActive() {
    return this.lists.filter(l => !l.archivedAt);
  },

  /**
   * Archivar lista
   */
  archive(listId, reason = '') {
    const lista = this.getById(listId);
    if (!lista) return null;
    lista.archivedAt = Date.now();
    lista.archiveReason = reason;
    lista.updatedAt = Date.now();
    this.save();
    return lista;
  },

  /**
   * Obtener snapshots de una lista
   */
  getSnapshotsForList(listId) {
    return this.snapshots.filter(s => s.productListId === listId);
  },

  /**
   * Obtener todos los snapshots activos
   */
  getActiveSnapshots() {
    return this.snapshots.filter(s => !s.archivedAt);
  },

  /**
   * Obtener snapshots por producto
   */
  getSnapshotsByProduct(productId) {
    return this.snapshots.filter(s => s.targetProductId === productId && !s.archivedAt);
  },

  /**
   * Archivar snapshot
   */
  archiveSnapshot(snapId, reason = '') {
    const snap = this.snapshots.find(s => s.id === snapId);
    if (!snap) return null;
    snap.archivedAt = Date.now();
    snap.archiveReason = reason;
    this.save();
    return snap;
  },

  /**
   * Clonar snapshot a nueva lista
   */
  cloneSnapshotToList(snapId, catalogo = []) {
    const snap = this.snapshots.find(s => s.id === snapId);
    if (!snap) return null;

    return this.create({
      targetProductId: snap.targetProductId,
      targetProductName: snap.nombre || '',
      alias: `${snap.nombre || snap.version} (clon)`,
      componentes: snap.componentesSnapshot.map(c => ({
        internalId: c.insumoId,
        cantidadKg: c.cantidadKg,
        PRODUCTO: c.nombre,
        externalCode: c.cod
      })),
      catalogo
    });
  },

  /**
   * Recalcular listas afectadas por cambio en insumo
   */
  recalcularListasAfectadas(insumoId, catalogo) {
    const afectadas = this.lists.filter(l =>
      !l.archivedAt && l.componentes.some(c => c.insumoId === insumoId)
    );

    for (const lista of afectadas) {
      const comps = lista.componentes.map(c => {
        const ins = catalogo.find(i => i.internalId === c.insumoId) || {};
        return { cantidadKg: c.cantidadKg, insumo: ins };
      });

      lista.composicionCalculada = calcularComposicion(comps);
      lista.totalKg = calcularTotalKg(comps);

      if (lista.targetProductId) {
        const target = catalogo.find(i => i.internalId === lista.targetProductId);
        if (target) {
          const declarados = {};
          for (const key of NUTRIENT_KEYS) declarados[key] = target[key] || 0;
          const evaluaciones = evaluarTodos(lista.composicionCalculada, declarados);
          lista.estadoTolerancia = estadoGeneral(evaluaciones, true);
          lista.detalleTolerancia = evaluaciones;
        }
      }

      lista.alertas = this._checkAlerts(lista);
      lista.updatedAt = Date.now();
    }

    this.save();
    return afectadas.length;
  }
};