import { getCommentsFromAPI } from './modules/api.js';
import { renderComments } from './modules/render.js';
import { showNotification } from './modules/notifications.js'; 
import { comments } from './modules/commentsData.js';
import { initHandlers } from './modules/handlers.js';

export async function loadComments() {
  let  loadingNotification = showNotification(
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
  }, 1500); 

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
      showNotification('Комментарии успешно загружены!', 'success');
      comments.splice(0, comments.length, ...response);
      renderComments(comments);
    }
    
  } catch (error) {
    clearTimeout(delayBeforeNotice);
    clearTimeout(slowNetworkTimer);

    showNotification(
      error.message || 'Проблемы с интернетом. Комментарии могут быть неактуальны',
      'error'
    );

  } finally {
    if (loadingNotification) {
      setTimeout(() => {
        loadingNotification.classList.remove('visible');
        loadingNotification.remove();
      }, 300);
    }
  }
}

(async function initApp() {
  try {
    await loadComments();
    initHandlers();
  } catch (error) {
    console.error('Ошибка инициализации приложения:', error);
    showNotification('Не удалось загрузить приложение', 'error');
  }
})();        