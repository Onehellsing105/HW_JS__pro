import { comments } from './commentsData.js';
import { renderComments } from './render.js';
import { escapeHtml } from './escapeHtml.js';
import { postCommentToAPI, getCommentsFromAPI } from './api.js';
import { showNotification } from './notifications.js';
import { loadAuth } from './utils.js';

const COMMENT_DELAY_MS = 2000;

export function initHandlers() {
  const nameInput  = document.querySelector('.add-form-name');
  const textInput  = document.querySelector('.add-form-text');
  const addButton  = document.querySelector('.add-form-button');
  const commentsList = document.getElementById('comments-list');
  let   isSubmitting = false;

  if (!nameInput || !textInput || !addButton || !commentsList) {
    console.error('Не найдены элементы формы или списка комментариев');
    return;
  }

  const auth = loadAuth();
  if (auth) {
    nameInput.value = auth.name;
    nameInput.readOnly = true;
  }

  function updateButtonState() {
    addButton.disabled = isSubmitting || textInput.value.trim().length === 0;
  }
  textInput.addEventListener('input', updateButtonState);
  updateButtonState();

  addButton.addEventListener('click', handleAddComment);

  textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && textInput.value.trim()) {
      e.preventDefault();
      handleAddComment();
    }
  });

  commentsList.addEventListener('click', (event) => {
    const likeBtn = event.target.closest('.like-button');
    if (likeBtn) {
      handleLikeClick(likeBtn);
      return;
    }
    const commentEl = event.target.closest('.comment');
    if (commentEl) {
      handleCommentClick(commentEl);
    }
  });

  function handleLikeClick(button) {
    const commentEl = button.closest('.comment');
    const id = commentEl.dataset.id;
    const c  = comments.find(x => x.id === id);
    if (!c) return;

    c.isLiked = !c.isLiked;
    c.likes   += c.isLiked ? 1 : -1;

    const counter = button.previousElementSibling;
    counter.textContent = c.likes;
    button.classList.toggle('-active-like');
  }

  function handleCommentClick(commentEl) {
    const id = commentEl.dataset.id;
    const c  = comments.find(x => x.id === id);
    if (!c) return;

    const quote = `> ${c.name} писал(а):\n> ${c.text}\n\n`;
    const start = textInput.selectionStart;
    const end   = textInput.selectionEnd;
    const val   = textInput.value;
    textInput.value = val.slice(0, start) + quote + val.slice(end);
    const newPos = start + quote.length;
    textInput.setSelectionRange(newPos, newPos);
    textInput.focus();
  }

  async function handleAddComment() {
    if (isSubmitting) return;

    const text = escapeHtml(textInput.value.trim());
    if (!text) {
      showNotification('Введите текст комментария', 'error');
      return;
    }

    const authData = loadAuth();
    if (!authData) {
      showNotification('Требуется авторизация', 'error');
      window.location.hash = '#/login';
      return;
    }

    isSubmitting = true;
    updateButtonState();

    const formElem = document.querySelector('.add-form');
    formElem.classList.add('hidden');

    const pendingNotice = showNotification('Комментарий добавляется...', 'info');
    const slowNetTimer = setTimeout(() => {
      showNotification('Интернет медленный… Ожидаем публикацию', 'warning');
    }, 3000);

    try {
      await postCommentToAPI({
        name:  authData.name,
        text,
        token: authData.token
      });

      const fresh = await getCommentsFromAPI();
      comments.splice(0, comments.length,
        ...fresh.map(item => ({
          id:      item.id,
          name:    item.name,
          date:    new Date(item.date),
          text:    item.text,
          likes:   item.likes || 0,
          isLiked: item.isLiked || false
        }))
      );
      renderComments(comments);

      showNotification('Комментарий успешно опубликован!', 'success');
      textInput.value = '';
      updateButtonState();
    } catch (err) {
      showNotification(err.message || 'Ошибка при отправке комментария', 'error');
    } finally {
      clearTimeout(slowNetTimer);
      pendingNotice.remove();
      setTimeout(() => {
        isSubmitting = false;
        updateButtonState();
        formElem.classList.remove('hidden');
      }, COMMENT_DELAY_MS);
    }
  }
}