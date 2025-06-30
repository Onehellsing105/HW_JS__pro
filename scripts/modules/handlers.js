import { comments } from './commentsData.js';
import { renderComments } from './render.js';
import { escapeHtml } from './escapeHtml.js';
import { formatDate } from './utils.js';

export function initHandlers() {
  const nameInput = document.querySelector('.add-form-name');
  const textInput = document.querySelector('.add-form-text');
  const addButton = document.querySelector('.add-form-button');

  // Делегирование обработки лайков
  document.getElementById('comments-list').addEventListener('click', (event) => {
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
  });

  addButton.addEventListener('click', addComment);
  textInput.addEventListener('keydown', handleKeyDown);
  nameInput.addEventListener('input', updateButtonState);
  textInput.addEventListener('input', updateButtonState);
  addButton.disabled = true;

  function handleLikeClick(button) {
    const commentId = parseInt(button.closest('.comment').dataset.id);
    const comment = comments.find(c => c.id === commentId);
    
    if (comment) {
      comment.isLiked = !comment.isLiked;
      comment.likes += comment.isLiked ? 1 : -1;
      button.classList.toggle('-active-like');
      button.previousElementSibling.textContent = comment.likes;
    }
  }

  function handleCommentClick(commentElement) {
    const commentId = parseInt(commentElement.dataset.id);
    const comment = comments.find(c => c.id === commentId);
    
    nameInput.value = comment.name;
    textInput.value = comment.text;
    textInput.focus();
  }

  function addComment() {
    const name = escapeHtml(nameInput.value.trim());
    const text = escapeHtml(textInput.value.trim());
    
    if (!name || !text) {
      alert('Заполните все поля');
      return;
    }
    
    comments.push({
      id: Date.now(),
      name,
      date: new Date(),
      text,
      likes: 0,
      isLiked: false
    });
    
    renderComments(comments);
    nameInput.value = '';
    textInput.value = '';
    addButton.disabled = true;
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey && nameInput.value.trim() && textInput.value.trim()) {
      e.preventDefault();
      addComment();
    }
  }

  function updateButtonState() {
    addButton.disabled = !nameInput.value.trim() || !textInput.value.trim();
  }
}