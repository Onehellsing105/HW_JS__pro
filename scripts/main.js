import { initCommentsData } from './modules/commentsData.js';
import {
  renderCommentsPage,
  renderLoginPage,
  renderRegisterPage
} from './modules/pages.js';

function router() {
  const hash = window.location.hash;

  if (hash === '#/login') {
    renderLoginPage();
  } else if (hash === '#/register') {
    renderRegisterPage();
  } else {
    renderCommentsPage();
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  await initCommentsData();
  router();
});

window.addEventListener('hashchange', router);
