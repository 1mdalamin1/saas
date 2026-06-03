/** Format numeric IDs for display (e.g. 1 → "0001"). */
export function formatDisplayId(id: number | null | undefined, minDigits = 4): string {
  if (id == null || Number.isNaN(id)) return '—';
  return String(id).padStart(minDigits, '0');
}
