// Unified calculation utilities for the order management system
// All monetary calculations should use these functions to ensure consistency

/**
 * Rounds a number to specified decimal places
 * @param value - The number to round
 * @param decimals - Number of decimal places (default: 2)
 * @returns Rounded number
 */
export const roundNumber = (value: number, decimals: number = 2): number => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

/**
 * Calculates subtotal for order items
 * @param quantity - Item quantity
 * @param unitPrice - Price per unit
 * @returns Calculated subtotal
 */
export const calculateItemSubtotal = (quantity: number, unitPrice: number): number => {
  return roundNumber(quantity * unitPrice)
}

/**
 * Calculates tax amount based on subtotal and tax rate
 * @param subtotal - Subtotal amount
 * @param taxRate - Tax rate as percentage (e.g., 15 for 15%)
 * @returns Calculated tax amount
 */
export const calculateTaxAmount = (subtotal: number, taxRate: number): number => {
  return roundNumber(subtotal * (taxRate / 100))
}

/**
 * Calculates total amount (subtotal + tax)
 * @param subtotal - Subtotal amount
 * @param taxAmount - Tax amount
 * @returns Total amount
 */
export const calculateTotal = (subtotal: number, taxAmount: number): number => {
  return roundNumber(subtotal + taxAmount)
}

/**
 * Calculates order totals from order items
 * @param items - Array of order items
 * @param taxRate - Tax rate as percentage
 * @returns Object with subtotal, taxAmount, and total
 */
export const calculateOrderTotals = (
  items: Array<{ quantity: number; unit_price: number }>,
  taxRate: number = 0
) => {
  const subtotal = items.reduce((sum, item) => {
    return sum + calculateItemSubtotal(item.quantity, item.unit_price)
  }, 0)
  
  const taxAmount = calculateTaxAmount(subtotal, taxRate)
  const total = calculateTotal(subtotal, taxAmount)
  
  return {
    subtotal: roundNumber(subtotal),
    taxAmount: roundNumber(taxAmount),
    total: roundNumber(total)
  }
}

/**
 * Formats currency amount according to locale and currency settings
 * @param amount - Amount to format
 * @param currency - Currency code (default: EUR)
 * @param locale - Locale for formatting (default: en-US)
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'EUR',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Formats currency for different locales
 * @param amount - Amount to format
 * @param currency - Currency code
 * @param language - Language code (en, ar, fr, nl)
 * @returns Formatted currency string
 */
export const formatCurrencyByLanguage = (
  amount: number,
  currency: string = 'EUR',
  language: string = 'en'
): string => {
  const localeMap: Record<string, string> = {
    en: 'en-US',
    ar: 'ar-SA',
    fr: 'fr-FR',
    nl: 'nl-NL'
  }
  
  const locale = localeMap[language] || 'en-US'
  return formatCurrency(amount, currency, locale)
}

/**
 * Parses currency string to number
 * @param currencyString - Currency string to parse
 * @returns Parsed number or 0 if invalid
 */
export const parseCurrency = (currencyString: string): number => {
  // Remove currency symbols and spaces, keep only numbers and decimal point
  const cleanString = currencyString.replace(/[^\d.-]/g, '')
  const parsed = parseFloat(cleanString)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Validates if a number is a valid monetary amount
 * @param value - Value to validate
 * @returns True if valid monetary amount
 */
export const isValidMonetaryAmount = (value: number): boolean => {
  return !isNaN(value) && isFinite(value) && value >= 0
}

/**
 * Calculates percentage of a value
 * @param value - Base value
 * @param percentage - Percentage to calculate
 * @returns Calculated percentage amount
 */
export const calculatePercentage = (value: number, percentage: number): number => {
  return roundNumber(value * (percentage / 100))
}

/**
 * Calculates discount amount
 * @param originalAmount - Original amount
 * @param discountRate - Discount rate as percentage
 * @returns Discount amount
 */
export const calculateDiscount = (originalAmount: number, discountRate: number): number => {
  return calculatePercentage(originalAmount, discountRate)
}

/**
 * Applies discount to amount
 * @param originalAmount - Original amount
 * @param discountRate - Discount rate as percentage
 * @returns Amount after discount
 */
export const applyDiscount = (originalAmount: number, discountRate: number): number => {
  const discountAmount = calculateDiscount(originalAmount, discountRate)
  return roundNumber(originalAmount - discountAmount)
}

/**
 * Converts currency amounts between different currencies
 * Note: This is a placeholder for future currency conversion functionality
 * @param amount - Amount to convert
 * @param fromCurrency - Source currency
 * @param toCurrency - Target currency
 * @param exchangeRate - Exchange rate
 * @returns Converted amount
 */
export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRate: number = 1
): number => {
  if (fromCurrency === toCurrency) {
    return amount
  }
  return roundNumber(amount * exchangeRate)
}

/**
 * Validates order totals for consistency
 * @param items - Order items
 * @param subtotal - Claimed subtotal
 * @param taxRate - Tax rate
 * @param taxAmount - Claimed tax amount
 * @param total - Claimed total
 * @returns Validation result with errors if any
 */
export const validateOrderTotals = (
  items: Array<{ quantity: number; unit_price: number }>,
  subtotal: number,
  taxRate: number,
  taxAmount: number,
  total: number
) => {
  const calculated = calculateOrderTotals(items, taxRate)
  const errors: string[] = []
  
  if (Math.abs(calculated.subtotal - subtotal) > 0.01) {
    errors.push(`Subtotal mismatch: expected ${calculated.subtotal}, got ${subtotal}`)
  }
  
  if (Math.abs(calculated.taxAmount - taxAmount) > 0.01) {
    errors.push(`Tax amount mismatch: expected ${calculated.taxAmount}, got ${taxAmount}`)
  }
  
  if (Math.abs(calculated.total - total) > 0.01) {
    errors.push(`Total mismatch: expected ${calculated.total}, got ${total}`)
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    calculated
  }
}

/**
 * Formats number for display in different locales
 * @param value - Number to format
 * @param locale - Locale code
 * @param options - Intl.NumberFormat options
 * @returns Formatted number string
 */
export const formatNumber = (
  value: number,
  locale: string = 'en-US',
  options: Intl.NumberFormatOptions = {}
): string => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options
  }).format(value)
}

/**
 * Calculates profit margin
 * @param sellingPrice - Selling price
 * @param costPrice - Cost price
 * @returns Profit margin as percentage
 */
export const calculateProfitMargin = (sellingPrice: number, costPrice: number): number => {
  if (costPrice === 0) return 0
  return roundNumber(((sellingPrice - costPrice) / costPrice) * 100)
}

/**
 * Calculates markup percentage
 * @param sellingPrice - Selling price
 * @param costPrice - Cost price
 * @returns Markup percentage
 */
export const calculateMarkup = (sellingPrice: number, costPrice: number): number => {
  if (sellingPrice === 0) return 0
  return roundNumber(((sellingPrice - costPrice) / sellingPrice) * 100)
}

