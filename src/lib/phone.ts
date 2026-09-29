const RUSSIA = /^7\d{10}$/
const BELARUS = /^375\d{9}$/

export function normalizePhone(input: string): string | null {
  let digits = input.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('8')) {
    digits = `7${digits.slice(1)}`
  }
  if (RUSSIA.test(digits) || BELARUS.test(digits)) return digits
  return null
}

export function formatPhone(digits: string): string {
  if (RUSSIA.test(digits)) {
    return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`
  }
  if (BELARUS.test(digits)) {
    return `+375 ${digits.slice(3, 5)} ${digits.slice(5, 8)}-${digits.slice(8, 10)}-${digits.slice(10)}`
  }
  return digits ? `+${digits}` : 'Неизвестный контакт'
}
