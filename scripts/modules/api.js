const API_URL = "https://686279e496f0cc4e34b9dcf6.mockapi.io/comments-app/comments";

export async function getCommentsFromAPI() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      console.error("Ошибка сервера:", response.status);
      throw new Error("Сервер вернул ошибку");
    }
    const data = await response.json();
    console.log("Загруженные комментарии:", data);
    return data;
  } catch (error) {
    console.error("Ошибка в getCommentsFromAPI:", error.message);
    throw error;
  }
}

export async function postCommentToAPI({ name, text }) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      text,
      date: new Date().toISOString(),
      likes: 0,
      isLiked: false
    })
  });

  if (!response.ok) {
    throw new Error(`Ошибка отправки: ${response.status}`);
  }

  return await response.json();
}