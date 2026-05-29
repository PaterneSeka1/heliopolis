type CellValue = string | number | undefined | null;

const SEP = ';';

function cell(v: CellValue): string {
  const s = v == null ? '' : String(v);
  return s.includes(SEP) || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

/**
 * Télécharge un fichier CSV (séparateur `;`, BOM UTF-8 pour Excel France).
 */
export function downloadCsv(filename: string, headers: string[], rows: CellValue[][]) {
  const bom = '﻿';
  const lines = [
    headers.map(cell).join(SEP),
    ...rows.map(row => row.map(cell).join(SEP)),
  ];
  const blob = new Blob([bom + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
