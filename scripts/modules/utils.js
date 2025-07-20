export function formatDate(date) {
  const day     = String(date.getDate()).padStart(2, '0');
  const month   = String(date.getMonth() + 1).padStart(2, '0');
  const year    = date.getFullYear().toString().slice(-2);
  const hours   = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

function pad(value) {
  return value.toString().padStart(2, '0');
}

const USERS_KEY = 'comments-app-users';
const AUTH_KEY  = 'comments-app-auth';

/**
 * @returns {Array<{ name: string, login: string, password: string }>}
 */
export function loadUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

/** @param {Array} users */
export function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/**
 * @returns {{ name: string, token: string } | null}
 */
export function loadAuth() {
  const raw = localStorage.getItem(AUTH_KEY);
  return raw ? JSON.parse(raw) : null;
}

/** @param {{ name: string, token: string }} authData */
export function saveAuth(authData) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}
