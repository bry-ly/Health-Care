/**
 * Formats a phone number to Philippine (PH) format
 * Supports both mobile (09XX XXX XXXX) and landline (0XX XXX XXXX) formats
 * @param phone - Phone number string (can include digits, spaces, dashes, plus signs)
 * @returns Formatted phone number in PH format (09XX XXX XXXX or +63 9XX XXX XXXX)
 */
export function formatPhonePH(phone: string): string {
  if (!phone) return "";
  
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, "");
  
  // Remove + if present at the start
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.slice(1);
  }
  
  // Remove country code 63 if present
  if (cleaned.startsWith("63")) {
    cleaned = cleaned.slice(2);
  }
  
  // Remove leading 0 if present (for consistency)
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.slice(1);
  }
  
  // Only keep digits
  cleaned = cleaned.replace(/\D/g, "");
  
  // Format based on length
  if (cleaned.length === 0) return "";
  
  if (cleaned.length <= 3) {
    return `0${cleaned}`;
  } else if (cleaned.length <= 6) {
    return `0${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  } else if (cleaned.length <= 10) {
    return `0${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  } else {
    // If longer than 10 digits, truncate to 10
    const truncated = cleaned.slice(0, 10);
    return `0${truncated.slice(0, 3)} ${truncated.slice(3, 6)} ${truncated.slice(6)}`;
  }
}

/**
 * Formats phone number for international display (with country code)
 * @param phone - Phone number string
 * @returns Formatted phone number with +63 country code
 */
export function formatPhonePHInternational(phone: string): string {
  const formatted = formatPhonePH(phone);
  if (!formatted) return "";
  
  // Remove leading 0 and add +63
  const cleaned = formatted.replace(/\s/g, "").replace(/^0/, "");
  return `+63 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
}

/**
 * Cleans phone number to store in database (removes formatting)
 * @param phone - Formatted phone number
 * @returns Clean phone number with country code (639XXXXXXXXX or 0XXXXXXXXX)
 */
export function cleanPhonePH(phone: string): string {
  if (!phone) return "";
  
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, "");
  
  // If starts with 63, keep it
  if (cleaned.startsWith("63")) {
    return cleaned;
  }
  
  // If doesn't start with 0, add 0
  if (!cleaned.startsWith("0")) {
    return `0${cleaned}`;
  }
  
  return cleaned;
}

/**
 * Validates Philippine phone number format
 * @param phone - Phone number to validate
 * @returns true if valid PH phone number format
 */
export function isValidPhonePH(phone: string): boolean {
  if (!phone) return false;
  
  const cleaned = cleanPhonePH(phone);
  
  // Philippine mobile numbers: 09XX XXX XXXX (10 digits starting with 0)
  // Philippine landline: 0XX XXX XXXX (10 digits starting with 02, 03, etc.)
  // International format: +63 9XX XXX XXXX (11 digits with country code)
  
  // Remove leading 0 or 63
  const digits = cleaned.startsWith("63") ? cleaned.slice(2) : cleaned.slice(1);
  
  // Should be 9 digits after country code/leading zero
  if (digits.length !== 9 && digits.length !== 10) {
    return false;
  }
  
  // Mobile numbers typically start with 9
  // Landline numbers start with 2, 3, 4, 5, 6, 7, 8
  const firstDigit = digits[0];
  const validStarts = ["2", "3", "4", "5", "6", "7", "8", "9"];
  
  return validStarts.includes(firstDigit);
}

/**
 * Formats phone number as user types (onChange handler)
 * @param value - Current input value
 * @returns Formatted phone number
 */
export function formatPhoneInput(value: string): string {
  // Allow backspace by checking if user is deleting
  const formatted = formatPhonePH(value);
  return formatted;
}

