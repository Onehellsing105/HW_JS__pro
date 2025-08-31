const BASE_URL = 'https://wedev-api.sky.pro/api/v2/olennikov-ivan/comments';
const AUTH_URL = `${BASE_URL}/login`;

export async function registerAPI({ name, login, password }) {
  const body = JSON.stringify({ name, login, password });
  console.log('registerAPI →', body);

  const res = await fetch('https://wedev-api.sky.pro/api/user', {
    method: 'POST',
    body
  });

  const raw = await res.text();
  console.log('registerAPI ←', res.status, raw);

  let data;
  try { data = JSON.parse(raw); }
  catch { data = {}; }

  if (!res.ok) {
    throw new Error(data.error || data.message || raw);
  }

  return data.user;
}

export async function loginAPI(login, password) {
  const body = JSON.stringify({ login, password });
  const res = await fetch(AUTH_URL, { method: 'POST', body });

  const raw = await res.text();
  let data;
  try { data = JSON.parse(raw); }
  catch { data = {}; }

  if (!res.ok) {
    throw new Error(data.error || data.message || raw);
  }
  return data;
}

export async function getCommentsFromAPI() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error('Не удалось загрузить комментарии');
  return res.json();
}

export async function postCommentToAPI({ name, text, token, forceError = false }) {
  if (!token) throw new Error('Нет токена авторизации');
  const formData = new FormData();
  formData.append('name', name.trim());
  formData.append('text', text.trim());
  formData.append('forceError', forceError);

  const res = await fetch(BASE_URL, {
    method:  'POST',
    headers: { Authorization: `Bearer ${token}` },
    body:    formData
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || 'Ошибка при отправке комментария');
  return data;
}