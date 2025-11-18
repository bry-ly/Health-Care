/**
 * Converts 24-hour format time (HH:mm) to 12-hour format with AM/PM
 * @param time24 - Time in 24-hour format (e.g., "14:30" or "09:00")
 * @returns Time in 12-hour format with AM/PM (e.g., "2:30 PM" or "9:00 AM")
 */
export function formatTime12Hour(time24: string): string {
  if (!time24 || !time24.includes(":")) {
    return time24; // Return as-is if invalid format
  }

  const [hours, minutes] = time24.split(":").map(Number);
  
  if (isNaN(hours) || isNaN(minutes)) {
    return time24; // Return as-is if invalid numbers
  }

  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12; // Convert 0 to 12, keep 1-11, convert 12-23
  
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Converts 12-hour format time with AM/PM to 24-hour format (HH:mm)
 * @param time12 - Time in 12-hour format (e.g., "2:30 PM" or "9:00 AM")
 * @returns Time in 24-hour format (e.g., "14:30" or "09:00")
 */
export function formatTime24Hour(time12: string): string {
  if (!time12) {
    return time12;
  }

  const parts = time12.trim().split(" ");
  if (parts.length < 2) {
    // If no AM/PM, assume it's already in 24-hour format
    return time12;
  }

  const time = parts[0];
  const period = parts[1].toUpperCase();

  if (!time.includes(":")) {
    return time12; // Return as-is if invalid format
  }

  const [hours, minutes] = time.split(":").map(Number);

  if (isNaN(hours) || isNaN(minutes)) {
    return time12; // Return as-is if invalid numbers
  }

  let hours24 = hours;

  if (period === "PM" && hours !== 12) {
    hours24 = hours + 12;
  } else if (period === "AM" && hours === 12) {
    hours24 = 0;
  }

  return `${hours24.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

