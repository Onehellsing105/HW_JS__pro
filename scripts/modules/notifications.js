export function showNotification(message, type = 'info', duration = 3000) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  if (duration !== 0) {
    setTimeout(() => {
      notification.remove();
    }, duration);
  }

  return notification;
}