const BASE_URL = 'https://wedev-api.sky.pro/api/v2/olennikov-ivan/comments';
const AUTH_URL = `${BASE_URL}/login`;

export async function getCommentsFromAPI() {
  try {
    const res = await fetch(BASE_URL);
    if (!res.ok) {
      const errText = await res.text();
      console.error(`Ошибка сервера ${res.status}:`, errText);
      throw new Error('Не удалось загрузить комментарии');
    }
    return await res.json();
  } catch (err) {
    console.error('Ошибка при загрузке комментариев:', err.message);
    throw new Error('Проверьте подключение и попробуйте снова');
  }
}

export async function postCommentToAPI({ name, text, token, forceError = false }) {
  // не указываем Content-Type
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // формируем тело запроса как JSON-строку
  const body = JSON.stringify({
    name:      name.trim(),
    text:      text.trim(),
    forceError
  });

  console.log('POST /comments body →', body, 'token →', token);

  const res = await fetch(BASE_URL, {
    method:  'POST',
    headers,        // только Authorization, если есть
    body            // JSON-строка без content-type
  });

  // debug: смотрим, что вернул сервер
  const raw = await res.text();
  console.log('Response status:', res.status, 'body →', raw);

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    payload = {};
  }

  if (!res.ok) {
    throw new Error(payload.message || 'Ошибка сервера');
  }
  return payload;
}



export async function loginAPI(login, password) {
  const res = await fetch(AUTH_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ login, password })
  });
  if (!res.ok) {
    const { message } = await res.json().catch(() => ({}));
    throw new Error(message || 'Ошибка авторизации');
  }
  return res.json();
}
