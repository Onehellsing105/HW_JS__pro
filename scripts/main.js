import { renderComments } from './modules/render.js';
import { initHandlers } from './modules/handlers.js';
import { comments } from './modules/commentsData.js';

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
  renderComments(comments);
  initHandlers();
});