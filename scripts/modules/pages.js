import { renderComments }      from './render.js';
import { initHandlers }        from './handlers.js';
import { comments, initCommentsData } from './commentsData.js';
import {
  loadAuth,
  saveAuth,
  clearAuth,
  loadUsers,
  saveUsers
}                             from './utils.js';
import { showNotification }    from './notifications.js';

export async function renderCommentsPage() {
  const app  = document.getElementById('app');
  const auth = loadAuth();

  app.innerHTML = `
    <h2>Лента комментариев</h2>
    <ul id="comments-list"></ul>
    ${!auth
      ? `<p>Чтобы добавить комментарий, <a href="#/login">авторизуйтесь</a></p>`
      : `<form id="commentForm" class="add-form">
           <input
             name="name"
             class="add-form-name"
             readonly
             value="${auth.name}"
           />
           <textarea
             name="text"
             class="add-form-text"
             placeholder="Введите комментарий"
             rows="4"
           ></textarea>
           <button
             type="submit"
             class="add-form-button"
           >Написать</button>
         </form>
         <button id="logoutBtn">Выйти</button>`
    }
  `;

  renderComments(comments);

  if (auth) {
    initHandlers();

    document.getElementById('logoutBtn')
      .addEventListener('click', () => {
        clearAuth();
        window.location.hash = '';
      });
  }
}

export function renderLoginPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h2>Вход</h2>
    <form id="loginForm">
      <input
        name="login"
        type="text"
        placeholder="Логин"
        required
      />
      <input
        name="password"
        type="password"
        placeholder="Пароль"
        required
      />
      <button type="submit">Войти</button>
    </form>
    <p>Нет аккаунта? <a href="#/register">Зарегистрироваться</a></p>
    <div id="loginError" style="color:red"></div>
  `;

  document.getElementById('loginForm')
    .addEventListener('submit', e => {
      e.preventDefault();
      const { login, password } = e.target;
      const users = loadUsers();
      const user  = users.find(u => u.login === login.value);

      if (!user || user.password !== password.value) {
        document.getElementById('loginError')
          .textContent = 'Неверный логин или пароль';
        return;
      }

      const token = Date.now().toString();
      saveAuth({ name: user.name, token });
      window.location.hash = '';
    });
}

export function renderRegisterPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h2>Регистрация</h2>
    <form id="registerForm">
      <input
        name="name"
        type="text"
        placeholder="Имя"
        required
        minlength="3"
      />
      <input
        name="login"
        type="text"
        placeholder="Логин"
        required
        minlength="3"
      />
      <input
        name="password"
        type="password"
        placeholder="Пароль"
        required
        minlength="6"
      />
      <button type="submit">Зарегистрироваться</button>
    </form>
    <p>Уже есть аккаунт? <a href="#/login">Войти</a></p>
    <div id="registerError" style="color:red"></div>
  `;

  document.getElementById('registerForm')
    .addEventListener('submit', e => {
      e.preventDefault();
      const { name, login, password } = e.target;
      const users = loadUsers();

      if (users.some(u => u.login === login.value.trim())) {
        document.getElementById('registerError')
          .textContent = 'Логин уже занят';
        return;
      }

      const newUser = {
        name:     name.value.trim(),
        login:    login.value.trim(),
        password: password.value
      };
      users.push(newUser);
      saveUsers(users);

      const token = Date.now().toString();
      saveAuth({ name: newUser.name, token });
      window.location.hash = '';
    });
}