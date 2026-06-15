import { Formulador } from './formulador.js';

export const Comparador = {
  async init(container, options = {}) {
    await Formulador.init(container, {
      modo: 'comparar',
      formulaOriginal: options.formulaOriginal || null,
      onAbrirSustitucion: options.onAbrirSustitucion || null
    });
  }
};
