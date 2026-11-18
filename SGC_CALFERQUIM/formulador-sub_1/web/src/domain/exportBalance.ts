export function exportBalanceCsv(productName: string, headers: string[], rows: string[][], stamp: string) {
  const name = productName.trim() || 'Sin producto'
  const slug = name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'sin_producto'
  const csv = [['Producto', name], headers, ...rows].map((row) => row.map((cell) => {
    const text = cell === null || cell === undefined ? '' : String(cell)
    return /[;"\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }).join(';')).join('\n')
  return { csv, filename: `balance_${slug}_${stamp}.csv` }
}
