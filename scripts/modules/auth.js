const STORAGE_KEY = 'authData';

export function saveAuth(auth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function loadAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getToken() {
  const auth = loadAuth();
  return auth ? auth.token : null;
}

export function getUserName() {
  const auth = loadAuth();
  return auth ? auth.name : null;
}