import { formatDate } from './utils.js';

export function renderComments(comments) {
  const commentsList = document.getElementById('comments-list');

  commentsList.innerHTML = comments.map(comment => `
    <li class="comment" data-id="${comment.id}">
      <div class="comment-header">
        <div>${comment.name}</div>
        <div>${formatDate(comment.date)}</div>
      </div>
      <div class="comment-body">
        <div class="comment-text">${comment.text.replace(/\n/g, '<br>')}</div>
      </div>
      <div class="comment-footer">
        <div class="likes">
          <span class="likes-counter">${comment.likes}</span>
          <button class="like-button ${comment.isLiked ? '-active-like' : ''}"></button>
        </div>
      </div>
    </li>
  `).join('');
}
