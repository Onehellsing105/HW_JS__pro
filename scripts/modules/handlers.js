import { comments } from './commentsData.js';
import { renderComments } from './render.js';
import { escapeHtml } from './escapeHtml.js';
import { postCommentToAPI } from './api.js';
import { showNotification } from './notifications.js';


const COMMENT_DELAY_MS = 2000;

export function initHandlers() {
  const nameInput = document.querySelector('.add-form-name');
  const textInput = document.querySelector('.add-form-text');
  const addButton = document.querySelector('.add-form-button');
  let isSubmitting = false;

  function setupEventListeners() {
    document.getElementById('comments-list').addEventListener('click', handleListClick);
    addButton.addEventListener('click', handleAddComment);
    textInput.addEventListener('keydown', handleTextInputKeyDown);
    nameInput.addEventListener('input', updateButtonState);
    textInput.addEventListener('input', updateButtonState);
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
    const commentId = button.closest('.comment').dataset.id;
    const comment = comments.find(c => c.id === commentId);
    
    if (comment) {
      comment.isLiked = !comment.isLiked;
      comment.likes += comment.isLiked ? 1 : -1;
      updateLikeUI(button, comment.likes);
    }
  }

  function updateLikeUI(button, likesCount) {
    button.classList.toggle('-active-like');
    button.previousElementSibling.textContent = likesCount;
  }

  function handleCommentClick(commentElement) {
    const commentId = commentElement.dataset.id;
    const comment = comments.find(c => c.id === commentId);

    if (comment) {
      nameInput.value = comment.name;
      textInput.value = comment.text;
      textInput.focus();
    }
  }

  async function handleAddComment() {
  if (isSubmitting) return;

  const name = escapeHtml(nameInput.value.trim());
  const text = escapeHtml(textInput.value.trim());

  if (!validateInput(name, text)) return;

  const formElement = document.querySelector('.add-form');
  const pendingNotice = showNotification('Комментарий добавляется...', 'info');

  formElement.classList.add('hidden');
  isSubmitting = true;

  const slowNetworkTimer = setTimeout(() => {
    showNotification('Интернет медленный… Ожидаем публикации', 'warning');
  }, 3000);

  try {
    const savedComment = await postCommentToAPI({ name, text });

    clearTimeout(slowNetworkTimer);
    pendingNotice.remove();
    showNotification('Комментарий успешно опубликован!', 'success');

    addNewComment(savedComment);
    resetForm();
  } catch (error) {
    clearTimeout(slowNetworkTimer);
    pendingNotice.remove();
    showNotification(error.message || 'Ошибка при отправке комментария', 'error');
  } finally {
    setTimeout(() => {
      isSubmitting = false;
      updateButtonState();
      formElement.classList.remove('hidden');
    }, COMMENT_DELAY_MS);
  }
}


  function validateInput(name, text) {
  if (!name || !text) {
    showNotification('Заполните все поля', 'error');
    return false;
  }
  return true;
}


  function addNewComment(commentData) {
    comments.push({
      id: commentData.id,
      name: commentData.name,
      date: new Date(commentData.date),
      text: commentData.text,
      likes: 0,
      isLiked: false
    });
    renderComments(comments);
  }

  function resetForm() {
    nameInput.value = '';
    textInput.value = '';
  }

  function handleCommentError(error) {
  console.error('Ошибка отправки комментария:', error);
  showNotification('Ошибка при отправке. Попробуйте позже', 'error');
}

  function showAlert(message) {
    showNotification(message, 'error');
  }

  function handleTextInputKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey && 
        nameInput.value.trim() && textInput.value.trim()) {
      e.preventDefault();
      handleAddComment();
    }
  }

  function updateButtonState() {
    addButton.disabled = isSubmitting || 
                        !nameInput.value.trim() || 
                        !textInput.value.trim();
  }

  setupEventListeners();
  addButton.disabled = true;
}