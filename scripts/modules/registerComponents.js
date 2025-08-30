import { loadUsers, saveUsers } from './utils.js';
import { saveAuth }             from './auth.js';
import { showNotification }     from './notifications.js';

export function initRegisterForm() {
  const form      = document.getElementById('registerForm');
  const errorElem = document.getElementById('registerError');

  form.addEventListener('submit', e => {
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

    const users = loadUsers();
    if (users.some(u => u.login === login)) {
      errorElem.textContent = 'Логин уже занят';
      return;
    }

    const newUser = { name, login, password };
    users.push(newUser);
    saveUsers(users);

    showNotification('Регистрация прошла успешно!', 'success');

    const token = Date.now().toString();
    saveAuth({ token, name });
    window.location.hash = '';
  });
}
