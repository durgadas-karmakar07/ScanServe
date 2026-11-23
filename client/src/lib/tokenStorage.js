const STORAGE_KEY = 'scanserve.ownerToken';

// localStorage can throw (private mode, blocked site data). Then the owner simply stays logged in
// only until the tab closes.
export function readToken() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveToken(token) {
  try {
    localStorage.setItem(STORAGE_KEY, token);
  } catch {
    // Not saved: the session lasts for this tab only.
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing stored, nothing to clear.
  }
}
