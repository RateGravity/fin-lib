/**
 * Correctly formats a dollar value to a string.
 * @param value The dollar value to format
 * @param returnNegative If false will use the absolute value of all values. True by default
 * @param fractionDigits  The number of digits to include. 0 by default.
 * @returns a string formatted dollar value.
 */
export const formatCurrency = (
  value: number,
  returnNegative: boolean = true,
  fractionDigits: number = 0
): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(returnNegative ? value : Math.abs(value));
