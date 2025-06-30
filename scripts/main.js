import { initCommentsData, comments } from './modules/commentsData.js';
import { initHandlers } from './modules/handlers.js';
import { renderComments } from './modules/render.js';

async function initApp() {
  await initCommentsData();
  renderComments(comments);
  initHandlers();
}

initApp();
