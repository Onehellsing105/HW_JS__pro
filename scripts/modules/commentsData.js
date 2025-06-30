import { getCommentsFromAPI } from './api.js';
import { renderComments } from './render.js';

export const testComments = [
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
];

export let comments = [];

export async function initCommentsData() {
  try {
    const data = await getCommentsFromAPI();
    comments = data.map(item => ({
      id: item.id,
      name: item.name,
      date: new Date(item.date),
      text: item.text || "",
      likes: 0,
      isLiked: false
    }));
  } catch (error) {
    console.error("Ошибка загрузки API, используем тестовые данные");
    comments = [...testComments];
  }

  renderComments(comments);
}
