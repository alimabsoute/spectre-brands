export function checked(asOf, window = '90d', today = new Date().toISOString().slice(0, 10)) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf || '') || !/^\d+d$/.test(window)) throw new Error(`Invalid recheck date/window: ${asOf} / ${window}`);
  const date = new Date(`${asOf}T00:00:00Z`);
  if (!Number.isFinite(+date) || date.toISOString().slice(0, 10) !== asOf) throw new Error(`Invalid asOf: ${asOf}`);
  const due = new Date(+date + parseInt(window, 10) * 864e5).toISOString().slice(0, 10);
  return { asOf, window, due, overdue: due < today, label: `checked ${date.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })}` };
}
