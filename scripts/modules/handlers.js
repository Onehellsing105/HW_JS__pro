import { registerAPI, loginAPI, getCommentsFromAPI, postCommentToAPI } from './api.js';
import { saveAuth, loadAuth }                                          from './auth.js';
import { renderComments }                                              from './render.js';
import { showNotification }                                            from './notifications.js';
import { escapeHtml }                                                  from './escapeHtml.js';

const COMMENT_DELAY_MS = 2000;
let isSubmitting = false;
let isLoading    = false;

export function initHandlers() {
  const hash = window.location.hash || '#/';
  document.querySelectorAll('section').forEach(section => {
    section.style.display = 'none';
  });

  if (hash === '#/register') {
    document.getElementById('registerSection').style.display = 'block';
    initRegisterSection();
    return;
  }

  if (hash === '#/login') {
    document.getElementById('loginSection').style.display = 'block';
    initLoginSection();
    return;
  }

  document.getElementById('homeSection').style.display = 'block';
  initCommentsSection();
}

function initRegisterSection() {
  const form    = document.getElementById('registerForm');
  const errorEl = document.getElementById('registerError');
  if (!form || !errorEl) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    errorEl.style.display = 'none';
    errorEl.textContent   = '';

    const name     = form.name.value.trim();
    const login    = form.login.value.trim();
    const password = form.password.value;

    try {
      const user     = await registerAPI({ name, login, password });
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

function initLoginSection() {
  const form    = document.getElementById('loginForm');
  const errorEl = document.getElementById('loginError');
  if (!form || !errorEl) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    errorEl.textContent = '';

    const login    = form.login.value.trim();
    const password = form.password.value;

    try {
      const auth     = await loginAPI(login, password);
      saveAuth(auth);
      const comments = await getCommentsFromAPI();
      renderComments(comments);
      showNotification('Вход выполнен успешно!', 'success');
      window.location.hash = '#/';
    } catch (err) {
      errorEl.textContent = err.message;
    }
  });
}

function initCommentsSection() {
  const form         = document.getElementById('commentForm');
  const nameInput    = form?.querySelector('.add-form-name');
  const textInput    = form?.querySelector('.add-form-text');
  const commentsList = document.getElementById('comments-list');
  if (!form || !nameInput || !textInput || !commentsList) return;

  const authData = loadAuth();
  if (authData) {
    nameInput.value    = authData.name;
    nameInput.readOnly = true;
  }

  commentsList.addEventListener('click', event => {
    const likeBtn   = event.target.closest('.like-button');
    const commentEl = event.target.closest('.comment');
    if (likeBtn)   handleLikeClick(likeBtn);
    if (commentEl) handleQuoteClick(commentEl, textInput);
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (isSubmitting) return;

    const auth    = loadAuth();
    const rawText = textInput.value.trim();
    if (!auth) {
      showNotification('Требуется авторизация', 'error');
      window.location.hash = '#/login';
      return;
    }
    if (rawText.length < 3) {
      showNotification('Комментарий должен содержать минимум 3 символа', 'error');
      return;
    }

    isSubmitting        = true;
    form.classList.add('hidden');
    const pendingNotice = showNotification('Комментарий добавляется…', 'info');
    const slowNetTimer  = setTimeout(() => {
      showNotification('Интернет медленный…', 'warning');
    }, 3000);

    try {
      await postCommentToAPI({
        name:  auth.name,
        text:  escapeHtml(rawText),
        token: auth.token
      });
      const fresh = await getCommentsFromAPI();
      renderComments(fresh);
      textInput.value = '';
      showNotification('Комментарий успешно опубликован!', 'success');
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      clearTimeout(slowNetTimer);
      pendingNotice.remove();
      setTimeout(() => {
        isSubmitting      = false;
        form.classList.remove('hidden');
      }, COMMENT_DELAY_MS);
    }
  });

  if (!isLoading) {
    isLoading = true;
    getCommentsFromAPI()
      .then(renderComments)
      .finally(() => (isLoading = false));
  }
}

function handleLikeClick(button) {
  const id = +button.closest('.comment').dataset.id;
  const counterEl = document.querySelector(`.comment[data-id="${id}"] .likes-counter`);
  const active    = button.classList.toggle('-active-like');
  counterEl.textContent = +counterEl.textContent + (active ? 1 : -1);
}

function handleQuoteClick(commentEl, textInput) {
  const name  = commentEl.querySelector('.comment-name').textContent;
  const text  = commentEl.querySelector('.comment-text').textContent;
  const quote = `> ${name} писал(а):\n> ${text}\n\n`;
  const start = textInput.selectionStart;
  const end   = textInput.selectionEnd;
  const val   = textInput.value;
  textInput.value = val.slice(0, start) + quote + val.slice(end);
  textInput.setSelectionRange(start + quote.length, start + quote.length);
  textInput.focus();
}