/**
 * Currency formatting utility
 */

export interface CurrencySettings {
  currencyFormat?: string
  currencySymbol?: string
}

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param settings - Currency settings (format and symbol)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, settings?: CurrencySettings): string {
  const symbol = settings?.currencySymbol || '$'
  const format = settings?.currencyFormat || 'USD'
  
  // Format number with 2 decimal places
  const formattedAmount = Math.abs(amount).toFixed(2)
  
  // Add thousand separators
  const parts = formattedAmount.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  
  // Return with symbol prefix
  return `${symbol}${parts.join('.')}`
}

/**
 * Get currency symbol based on format
 * @param format - Currency format code (USD, EUR, GBP, etc.)
 * @returns Currency symbol
 */
export function getCurrencySymbol(format: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CNY: '¥',
    INR: '₹',
    AUD: 'A$',
    CAD: 'C$',
    CHF: 'CHF',
    SEK: 'kr',
    NOK: 'kr',
    DKK: 'kr',
    PLN: 'zł',
    RUB: '₽',
    BRL: 'R$',
    MXN: '$',
    ZAR: 'R',
    SGD: 'S$',
    HKD: 'HK$',
    KRW: '₩',
    THB: '฿',
    IDR: 'Rp',
    PHP: '₱',
    MYR: 'RM',
    VND: '₫',
    TRY: '₺',
    AED: 'د.إ',
    SAR: '﷼',
    ILS: '₪',
    NZD: 'NZ$'
  }
  
  return symbols[format.toUpperCase()] || '$'
}

