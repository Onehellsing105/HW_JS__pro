import { getCommentsFromAPI } from './api.js';
import { renderComments } from './render.js';

export const testComments = Object.freeze([
  {
    id: 1,
    name: 'Глеб Фокин',
    date: new Date('2022-02-12T12:18:00'),
    text: 'Это будет первый комментарий на этой странице',
    likes: 3,
    isLiked: false
  },
  {
    id: 2,
    name: 'Варвара Н.',
    date: new Date('2022-02-13T19:22:00'),
    text: 'Мне нравится как оформлена эта страница! ❤',
    likes: 75,
    isLiked: true
  }
]);

export let comments = [];

function isValidDate(value) {
  const date = new Date(value);
  return date instanceof Date && !isNaN(date.getTime());
}


let isLoading = false;

export async function initCommentsData() {
  if (isLoading) return;
  isLoading = true;
  
  try {
    const data = await getCommentsFromAPI();
    
    comments = (Array.isArray(data) ? data : []).map(item => {
  try {
    return {
      id: Number(item.id) || Date.now(),
      name: String(item.name || 'Аноним').trim(),
      date: isValidDate(item.date) ? new Date(item.date) : new Date(),
      text: String(item.text || '').trim(),
      likes: Math.max(0, Number(item.likes)) || 0,
      isLiked: item.isLiked === true
    };
  } catch (e) {
    console.warn('Ошибка преобразования комментария:', item);
    return null;
  }
}).filter(Boolean);
    
  } catch (error) {
    console.error("Ошибка загрузки API:", error.message);
    comments = [...testComments];
  } finally {
    isLoading = false;
    renderComments(comments);
  }
}

export function updateComments() {
  renderComments(comments);
}