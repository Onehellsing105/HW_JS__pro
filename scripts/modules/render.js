import { formatDate } from './utils.js';
import { getCommentsFromAPI, postCommentToAPI } from './api.js';
import { escapeHtml } from './escapeHtml.js';


export function renderComments(comments) {
  const list = document.getElementById('comments-list');
  if (!list) return;

  list.innerHTML = comments.map(comment => {
    const dateObj = new Date(comment.date);
    const formattedDate = formatDate(dateObj);

    return `
      <li class="comment" data-id="${comment.id}">
        <div class="comment-header">
          <span class="comment-name">${comment.name}</span>
          <span class="comment-date">${formattedDate}</span>
        </div>
        <div class="comment-body">
         <p class="comment-text">${escapeHtml(comment.text)}</p>
        </div>
        <div class="comment-footer">
          <div class="likes">
            <span class="likes-counter">${comment.likes}</span>
            <button class="like-button ${comment.isLiked ? '-active-like' : ''}" data-id="${comment.id}"></button>
          </div>
        </div>
      </li>
    `;
  }).join('');

  document.querySelectorAll('.like-button').forEach(button => {
    button.addEventListener('click', async () => {
      const commentId = button.dataset.id;
      const token = localStorage.getItem('token');

      try {
        button.classList.toggle('-active-like');
      } catch (error) {
        alert('Ошибка при лайке: ' + error.message);
      }
    });
  });
}

