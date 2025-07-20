import { initCommentsData }from './modules/commentsData.js';
import { renderCommentsPage, renderLoginPage, renderRegisterPage } from './modules/pages.js';

function router() {
  switch (window.location.hash) {
    case '#/login':
      renderLoginPage();
      break;
    case '#/register':
      renderRegisterPage();
      break;
    default:
      renderCommentsPage();
  }
}

window.addEventListener('hashchange', router);

window.addEventListener('DOMContentLoaded', async () => {
  await initCommentsData();
  router();                 
});