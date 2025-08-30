import { comments }              from './commentsData.js';
import { escapeHtml }            from './escapeHtml.js';
import { postCommentToAPI,
         getCommentsFromAPI }    from './api.js';
import { renderComments }        from './render.js';
import { loadAuth }              from './auth.js';
import { showNotification }      from './notifications.js';

const COMMENT_DELAY_MS = 2000;

export function initHandlers() {
  const form         = document.getElementById('commentForm');
  const nameInput    = form.querySelector('.add-form-name');
  const textInput    = form.querySelector('.add-form-text');
  const addButton    = form.querySelector('.add-form-button');
  const commentsList = document.getElementById('comments-list');
  let   isSubmitting = false;

  const initialAuth = loadAuth();
  if (initialAuth) {
    nameInput.value    = initialAuth.name;
    nameInput.readOnly = true;
  }

  function updateButtonState() {
    addButton.disabled = isSubmitting || textInput.value.trim() === '';
  }
  textInput.addEventListener('input', updateButtonState);
  updateButtonState();

  commentsList.addEventListener('click', event => {
    const likeBtn   = event.target.closest('.like-button');
    const commentEl = event.target.closest('.comment');

    if (likeBtn) {
      handleLikeClick(likeBtn);
      return;
    }
    if (commentEl) {
      handleCommentClick(commentEl);
    }
  });

  function handleLikeClick(button) {
    const commentEl = button.closest('.comment');
    const id        = Number(commentEl.dataset.id);
    const c         = comments.find(x => x.id === id);
    if (!c) return;

    c.isLiked = !c.isLiked;
    c.likes   += c.isLiked ? 1 : -1;
    button.previousElementSibling.textContent = c.likes;
    button.classList.toggle('-active-like');
  }

  function handleCommentClick(commentEl) {
    const id    = Number(commentEl.dataset.id);
    const c     = comments.find(x => x.id === id);
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

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (isSubmitting) return;

    const authData = loadAuth();
    console.log('authData из localStorage →', authData);

    if (!authData) {
      showNotification('Требуется авторизация', 'error');
      window.location.hash = '#/login';
      return;
    }

    const rawText = textInput.value.trim();
    if (rawText.length < 3) {
      showNotification('Комментарий должен содержать минимум 3 символа', 'error');
      return;
    }

    isSubmitting = true;
    updateButtonState();
    form.classList.add('hidden');
    const pendingNotice = showNotification('Комментарий добавляется…', 'info');
    const slowNetTimer  = setTimeout(() => {
      showNotification('Интернет медленный… Ожидаем публикацию', 'warning');
    }, 3000);

    try {
      await postCommentToAPI({
        name:  authData.name,
        text:  escapeHtml(rawText),
        token: authData.token
      });

      const fresh = await getCommentsFromAPI();
      comments.splice(0, comments.length, ...fresh.map(item => ({
        id:      item.id,
        name:    item.name,
        date:    new Date(item.date),
        text:    item.text,
        likes:   item.likes || 0,
        isLiked: item.isLiked || false
      })));
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
        form.classList.remove('hidden');
        updateButtonState();
      }, COMMENT_DELAY_MS);
    }
  });
} 
