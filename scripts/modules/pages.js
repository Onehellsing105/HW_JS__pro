import { initRegisterForm } from './registerComponents.js';
import { initLoginForm } from './loginComponents.js';
import { renderComments }      from './render.js';
import { initHandlers }        from './handlers.js';
import { comments }            from './commentsData.js';
import { loadAuth, saveAuth, clearAuth } from './auth.js';
import { showNotification }    from './notifications.js';
import { getCommentsFromAPI, loginAPI } from './api.js';

export function renderRegisterPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="auth-container">
      <h2 class="auth-title">Регистрация</h2>
      <form id="registerForm" class="auth-form">
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
        <button type="submit" class="auth-button">
          Зарегистрироваться
        </button>
        <div id="registerError" class="error"></div>
      </form>
      <p class="auth-register-link">
        Уже есть аккаунт? <a href="#/login">Войти</a>
      </p>
    </div>
  `;

  initRegisterForm();
}



export async function renderCommentsPage() {
  const app  = document.getElementById('app');
  const auth = loadAuth();

  app.innerHTML = `
    <h2>Лента комментариев</h2>
    <ul id="comments-list"></ul>
    ${
      !auth
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
             <button type="submit" class="add-form-button">
               Написать
             </button>
           </form>
           <button id="logoutBtn">Выйти</button>`
    }
  `;

  try {
    const data = await getCommentsFromAPI();
    comments.splice(
      0,
      comments.length,
      ...data.map(item => ({
        id:      item.id,
        name:    item.name,
        date:    new Date(item.date),
        text:    item.text,
        likes:   item.likes || 0,
        isLiked: item.isLiked || false
      }))
    );
  } catch (err) {
    showNotification(err.message, 'error');
  }

  renderComments(comments);

  if (auth) {
    initHandlers();
    document.getElementById('logoutBtn').addEventListener('click', () => {
      clearAuth();
      window.location.hash = '';
    });
  }
}

export function renderLoginPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="auth-container">
      <h2 class="auth-title">Авторизация</h2>
      <form id="loginForm" class="auth-form">
        <input
          type="text"
          name="login"
          class="auth-input"
          placeholder="Логин"
          required
        />
        <input
          type="password"
          name="password"
          class="auth-input"
          placeholder="Пароль"
          required
        />
        <button type="submit" class="auth-button">Войти</button>
        <p class="auth-register-link">
          Нет аккаунта? <a href="#/register">Зарегистрироваться</a>
        </p>
      </form>
      <div id="loginError" style="color:red"></div>
    </div>
  `;

  const form      = document.getElementById('loginForm');
  const errorElem = document.getElementById('loginError');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    errorElem.textContent = '';
    showNotification('Идёт авторизация...', 'info');

    const login    = e.target.login.value.trim();
    const password = e.target.password.value.trim();

    try {
      const { token, name } = await loginAPI(login, password);
      saveAuth({ name, token });
      window.location.hash = '';
    } catch (err) {
      errorElem.textContent = err.message;
    }
  });
}

