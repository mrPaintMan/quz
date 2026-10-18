const STORAGE_KEY = "quz.hostPassphrase";

// localStorage can throw (private windows, blocked storage); the hosts then simply log in again.
export function readStoredPassphrase(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storePassphrase(passphrase: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, passphrase);
  } catch {
    // Not remembered; the session still works until the page is reloaded.
  }
}

export function clearStoredPassphrase(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing stored to clear.
  }
}
