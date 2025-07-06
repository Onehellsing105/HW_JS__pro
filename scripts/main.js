import { getCommentsFromAPI } from './modules/api.js';
import { renderComments } from './modules/render.js';
import { showNotification } from './modules/notifications.js'; 
import { comments } from './modules/commentsData.js';

export async function loadComments() {
  const loadingNotification = showNotification(
    'Загружаем комментарии... Пожалуйста, подождите',
    'warning',
    0
  );

const delayBeforeNotice = setTimeout(() => {
    loadingNotification = showNotification(
      'Загружаем комментарии... Пожалуйста, подождите',
      'warning',
      0
    );
  }, 1500); // показываем только если прошло больше 1.5 секунды

  const slowNetworkTimer = setTimeout(() => {
    showNotification('Интернет медленный… Ожидаем загрузку', 'warning');
  }, 3000);

  try {
    const response = await Promise.race([
      getCommentsFromAPI(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Загрузка занимает больше времени, чем обычно')), 7000)
      )
    ]);

    clearTimeout(delayBeforeNotice);
    clearTimeout(slowNetworkTimer);

    if (loadingNotification) {
      loadingNotification.classList.remove('warning');
      loadingNotification.classList.add('visible');
    }

    showNotification('Комментарии успешно загружены!', 'success');
    comments.splice(0, comments.length, ...response);
    renderComments(comments);
    
  } catch (error) {
    clearTimeout(delayBeforeNotice);
    clearTimeout(slowNetworkTimer);

    showNotification(
      error.message || 'Проблемы с интернетом. Комментарии могут быть неактуальны',
      'error'
    );

  } finally {
    if (loadingNotification) {
      loadingNotification.classList.remove('visible');
      setTimeout(() => loadingNotification.remove(), 300);
    }
  }
}

import { initHandlers } from './modules/handlers.js';

await loadComments();     
initHandlers();           