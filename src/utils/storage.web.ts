/**
 * Web-specific storage implementation using localStorage
 * This file is automatically picked by Metro/Expo for web builds
 */

export async function getItemAsync(key: string): Promise<string | null> {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function setItemAsync(key: string, value: string): Promise<void> {
  try {
    localStorage.setItem(key, value);
  } catch {
    console.warn('[Storage] Failed to save to localStorage:', key);
  }
}

export async function deleteItemAsync(key: string): Promise<void> {
  try {
    localStorage.removeItem(key);
  } catch {
    console.warn('[Storage] Failed to remove from localStorage:', key);
  }
}
