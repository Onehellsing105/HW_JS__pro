const API_URL = "https://686279e496f0cc4e34b9dcf6.mockapi.io/comments-app/comments";

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

function updateButtonState() {
  addButton.disabled = isSubmitting ||
    nameInput.value.trim().length === 0 ||
    textInput.value.trim().length === 0;
}

function resetForm() {
  if (nameInput) nameInput.value = '';
  if (textInput) textInput.value = '';
  formState = { name: '', text: '' };
}

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

  const name = escapeHtml(nameInput.value.trim());
  const text = escapeHtml(textInput.value.trim());

  if (!name || !text) {
    showNotification('Заполните все поля', 'error');
    return;
  }

  const formElement = document.querySelector('.add-form');
  if (!formElement) return;

  const pendingNotice = showNotification('Комментарий добавляется...', 'info');
  formElement.classList.add('hidden');
  isSubmitting = true;

  const slowNetworkTimer = setTimeout(() => {
    showNotification('Интернет медленный… Ожидаем публикации', 'warning');
  }, 3000);

  try {
    if (Math.random() < 0.5) {
    throw new Error("Ошибка сервера. Попробуйте позже");
  }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        text,
        date: new Date().toISOString(),
        likes: 0,
        isLiked: false,
        forceError: Math.random() > 0.5
      })
    });

    if (!response.ok) {
      const errorData = await response.json();

      if (response.status === 400) {
        throw new Error("Имя и текст должны быть не короче 3 символов");
      }

      if (response.status >= 500) {
        throw new Error("Ошибка сервера. Попробуйте позже");}

      throw new Error(errorData.message || "Не удалось отправить комментарий");

    }

    const newComment = await response.json();
    const updatedComments = await getCommentsFromAPI();

    comments.length = 0;
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

    showNotification('Комментарий успешно опубликован!', 'success');
    renderComments(comments);
    resetForm();

  } catch (error) {
    console.error('Ошибка при добавлении комментария:', error);
    alert(error.message || 'Ошибка при отправке комментария', 'error');

    nameInput.value = name;
    textInput.value = text;

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
    if (!name || !text) {
      showNotification('Заполните все поля', 'error');
      return false;
    }
    return true;
  }

  function handleTextInputKeyDown(e) {
      if (e.key === 'Enter' && !e.shiftKey &&
        nameInput.value.trim() &&
        textInput.value.trim()) {
      e.preventDefault();
      handleAddComment();
    }
  }
  
  setupEventListeners();
  updateButtonState();
}
