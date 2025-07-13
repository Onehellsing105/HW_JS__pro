import { comments } from './commentsData.js';
import { renderComments } from './render.js';
import { escapeHtml } from './escapeHtml.js';
import { postCommentToAPI, getCommentsFromAPI } from './api.js';
import { showNotification } from './notifications.js';

const COMMENT_DELAY_MS = 2000;

let formState = {
  name: '',
  text: ''
};

export function initHandlers() {
  const nameInput = document.querySelector('.add-form-name');
  const textInput = document.querySelector('.add-form-text');
  const addButton = document.querySelector('.add-form-button');
  let isSubmitting = false;

  if (!nameInput || !textInput || !addButton) {
    console.error('Не найдены необходимые элементы формы');
    return;
  }

  nameInput.addEventListener('input', (e) => {
    formState.name = e.target.value;
    updateButtonState();
  });

  textInput.addEventListener('input', (e) => {
    formState.text = e.target.value;
    updateButtonState();
  });

  nameInput.value = formState.name;
  textInput.value = formState.text;

  function setupEventListeners() {
    const commentsList = document.getElementById('comments-list');
    if (!commentsList) {
      console.error('Не найден список комментариев');
      return;
    }

    commentsList.addEventListener('click', handleListClick);
    addButton.addEventListener('click', handleAddComment);
    textInput.addEventListener('keydown', handleTextInputKeyDown);
  }

  function handleListClick(event) {
    const likeButton = event.target.closest('.like-button');
    if (likeButton) {
      event.stopPropagation();
      handleLikeClick(likeButton);
      return;
    }

    const commentElement = event.target.closest('.comment');
    if (commentElement) {
      handleCommentClick(commentElement);
    }
  }

  function handleLikeClick(button) {
    const comment = button.closest('.comment');
    if (!comment) return;

    const commentId = comment.dataset.id;
    const commentData = comments.find(c => c.id === commentId);

    if (commentData) {
      commentData.isLiked = !commentData.isLiked;
      commentData.likes += commentData.isLiked ? 1 : -1;
      updateLikeUI(button, commentData.likes);
    }
  }

  function updateLikeUI(button, likesCount) {
    const likesCounter = button.previousElementSibling;
    if (likesCounter) {
      likesCounter.textContent = likesCount;
    }
    button.classList.toggle('-active-like');
  }

  function handleCommentClick(commentElement) {
    const commentId = commentElement.dataset.id;
    const comment = comments.find(c => c.id === commentId);

    if (comment && textInput) {
      const quotedText = `> ${comment.name} писал(а):\n> ${comment.text}\n\n`;

      const currentValue = textInput.value;
      const selectionStart = textInput.selectionStart ?? 0;
      const selectionEnd = textInput.selectionEnd ?? 0;

      textInput.value = currentValue.slice(0, selectionStart) +
                        quotedText +
                        currentValue.slice(selectionEnd);

      const newCursorPos = selectionStart + quotedText.length;
      textInput.setSelectionRange(newCursorPos, newCursorPos);
      textInput.focus();
    }
  }

  async function handleAddComment() {
    if (isSubmitting) return;

    const name = escapeHtml(formState.name.trim());
    const text = escapeHtml(formState.text.trim());

    if (!validateInput(name, text)) return;

    const formElement = document.querySelector('.add-form');
    if (!formElement) return;

    const pendingNotice = showNotification('Комментарий добавляется...', 'info');

    formElement.classList.add('hidden');
    isSubmitting = true;

    const slowNetworkTimer = setTimeout(() => {
      showNotification('Интернет медленный… Ожидаем публикации', 'warning');
    }, 3000);

    try {
      await postCommentToAPI({ name, text, forceError: Math.random() > 0.5 });
      const updatedComments = await getCommentsFromAPI();

      comments.length = 0;
      if (Array.isArray(updatedComments)) {
        updatedComments.forEach(comment => {
          comments.push({
            id: comment.id,
            name: comment.name,
            date: new Date(comment.date),
            text: comment.text,
            likes: comment.likes || 0,
            isLiked: comment.isLiked || false
          });
        });
      }

      formState = { name: '', text: '' };
      nameInput.value = '';
      textInput.value = '';

      showNotification('Комментарий успешно опубликован!', 'success');
      renderComments(comments);

    } catch (error) {
      console.error('Ошибка при добавлении комментария:', error);
      showNotification(error.message || 'Ошибка при отправке комментария', 'error');

      nameInput.value = formState.name;
      textInput.value = formState.text;

    } finally {
      clearTimeout(slowNetworkTimer);
      pendingNotice?.remove();

      setTimeout(() => {
        isSubmitting = false;
        updateButtonState();
        formElement.classList.remove('hidden');
      }, COMMENT_DELAY_MS);
    }
  }

  function validateInput(name, text) {
    if (!name || !text || name.length < 3 || text.length < 3) {
      showNotification('Имя и текст должны содержать минимум 3 символа', 'error');
      return false;
    }
    return true;
  }

  function handleTextInputKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey &&
        formState.name.trim().length >= 3 &&
        formState.text.trim().length >= 3) {
      e.preventDefault();
      handleAddComment();
    }
  }

  function updateButtonState() {
    addButton.disabled = isSubmitting ||
                         formState.name.trim().length < 3 ||
                         formState.text.trim().length < 3;
  }

  setupEventListeners();
  updateButtonState();
}
