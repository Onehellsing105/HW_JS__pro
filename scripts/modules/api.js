const BASE_URL = 'https://wedev-api.sky.pro/api/v2/olennikov-ivan/comments';
const AUTH_URL = `${BASE_URL}/login`;

export async function registerAPI({ name, login, password }) {
  const body = JSON.stringify({ name, login, password });
  const res = await fetch('https://wedev-api.sky.pro/api/user', {
    method: 'POST',
    body
  });
  const raw = await res.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    data = {};
  }
  if (!res.ok) {
    throw new Error(data.error || data.message || raw);
  }
  return data.user;
}


export async function loginAPI(login, password) {
  const body = JSON.stringify({ login, password });

  const res = await fetch('https://wedev-api.sky.pro/api/user/login', {
    method: 'POST',
    body
  });

  const raw = await res.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data.error || data.message || raw);
  }

  return data;
}

export async function getCommentsFromAPI() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error('Не удалось загрузить комментарии');
  const json = await res.json();
  if (Array.isArray(json)) return json;
  if (Array.isArray(json.comments)) return json.comments;
  throw new Error('Непредвиденный формат данных от API');
}

export async function postCommentToAPI({ text, token, forceError = false }) {
  if (!token) throw new Error('Нет токена авторизации');
  const payload = { text: text.trim() };
  if (forceError) payload.forceError = true;
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  const textResp = await res.text();
  let data;
  try { data = JSON.parse(textResp); } catch { data = { raw: textResp }; }
  if (!res.ok) throw new Error(data.error || data.message || `Ошибка ${res.status}`);
  return data;
}