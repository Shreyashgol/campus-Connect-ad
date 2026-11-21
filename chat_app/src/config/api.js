/**
 * API Configuration
 * 
 * WHAT IT DOES:
 * Defines the centralized configuration for all backend HTTP communications,
 * including base URL, timeouts, and default headers.
 * 
 * WHY IT EXISTS:
 * Previously, screens had hardcoded, conflicting IP addresses (e.g., 10.7.1.89 vs 10.7.1.51).
 * Centralizing the configuration enables changing the target server in a single location
 * without touching individual screen files.
 * 
 * HOW IT WORKS:
 * Exports a frozen configuration object. For local Android development,
 * Android devices and emulators connect to 'http://localhost:3000' via:
 * `adb reverse tcp:3000 tcp:3000`.
 * 
 * INPUT: None (static configuration module).
 */

export const API_CONFIG = {
  // Configured for local development via adb reverse tcp:3000 tcp:3000
  BASE_URL: 'https://campus-connect-ad.vercel.app/',
  TIMEOUT_MS: 10000,
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
};
