export const formatCurrency = (value: number, currency = 'MMK') => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value || 0);
};

export const formatCompactNumber = (value: number, maximumFractionDigits = 1) => {
  const safeValue = value || 0;
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits,
    minimumFractionDigits: 0
  }).format(safeValue);
};
