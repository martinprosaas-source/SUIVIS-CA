export function formatCurrency(value, compact = false) {
  if (compact && Math.abs(value) >= 1000) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

const MONTH_NAMES = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui',
  'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc',
];
const MONTH_NAMES_FULL = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export function getMonthLabel(year, month, full = false) {
  return full ? MONTH_NAMES_FULL[month] : MONTH_NAMES[month];
}
