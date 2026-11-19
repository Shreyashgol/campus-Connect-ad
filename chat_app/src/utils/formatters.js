/**
 * Formatting Utilities
 * 
 * WHAT IT DOES:
 * Helper functions for formatting dates, timestamps, names, and text previews.
 * 
 * WHY IT EXISTS:
 * Ensures consistent presentation of message times and user avatars across screens
 * without duplicating parsing logic.
 */

/**
 * Format timestamp into readable time string (e.g., "10:30 AM")
 * Safely handles missing or invalid dates.
 * 
 * @param {string|number|Date} dateInput
 * @returns {string|null}
 */
export function formatMessageTime(dateInput) {
  if (!dateInput) return null;
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return null;
  }
}

/**
 * Generates single or double letter initials from a user or conversation name.
 * 
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name) {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Truncates long text strings with an ellipsis.
 * 
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function truncateText(text, maxLength = 45) {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}
