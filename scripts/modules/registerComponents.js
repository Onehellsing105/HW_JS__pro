import { registerAPI, getCommentsFromAPI } from './api.js';
import { saveAuth }                        from './auth.js';
import { showNotification }                from './notifications.js';
import { renderComments }                  from './render.js';

export function initRegisterForm() {
  const form    = document.getElementById('registerForm');
  const errorEl = document.getElementById('registerError');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.style.display = 'none';
    errorEl.textContent   = '';

    const name     = form.name.value.trim();
    const login    = form.login.value.trim();
    const password = form.password.value;

    try {
      const user = await registerAPI({ name, login, password });
      saveAuth({ token: user.token, name: user.name });
      const comments = await getCommentsFromAPI();
      renderComments(comments);
      showNotification('Регистрация и вход прошли успешно!', 'success');
      window.location.hash = '#/';
    } catch (err) {
      errorEl.style.display = 'block';
      errorEl.textContent   = err.message;
    }
  });
}