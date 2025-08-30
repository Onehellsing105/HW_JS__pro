import { loginAPI }        from './api.js';
import { saveAuth }        from './auth.js';
import { showNotification } from './notifications.js';

export function initLoginForm() {
  const form       = document.getElementById('loginForm');
  const loginInput = document.getElementById('loginInput');
  const passInput  = document.getElementById('passwordInput');
  const errorElem  = document.getElementById('loginError');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    errorElem.textContent = '';
    showNotification('Авторизация…', 'info');

    const login    = loginInput.value.trim();
    const password = passInput.value.trim();

    if (!login || !password) {
      errorElem.textContent = 'Введите логин и пароль';
      return;
    }

    try {
      const { token, name } = await loginAPI(login, password);

      saveAuth({ token, name });
      window.location.hash = '';
    } catch (err) {
      errorElem.textContent = err.message;
    }
  });
}