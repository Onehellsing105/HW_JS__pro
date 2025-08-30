import { registerAPI, loginAPI } from './api.js';
import { saveAuth }              from './auth.js';
import { showNotification }      from './notifications.js';

export function initRegisterForm() {
  const form      = document.getElementById('registerForm');
  const errorElem = document.getElementById('registerError');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorElem.textContent = '';

    const name     = form.name.value.trim();
    const login    = form.login.value.trim();
    const password = form.password.value;

    if (name.length < 3 || login.length < 3 || password.length < 6) {
      errorElem.textContent =
        'Имя и логин — минимум 3 символа, пароль — минимум 6';
      return;
    }

    try {
      await registerAPI({ name, login, password });
      const authData = await loginAPI(login, password);
      saveAuth(authData);
      showNotification('Регистрация и вход прошли успешно!', 'success');
      window.location.hash = '#/';
    } catch (err) {
      errorElem.textContent = err.message;
    }
  });
}
