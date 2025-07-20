const API_URL = "https://686279e496f0cc4e34b9dcf6.mockapi.io/comments-app/comments";

export async function getCommentsFromAPI() {
  try {
    console.log("Начинаем загрузку комментариев...");
    const response = await fetch(API_URL);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Ошибка сервера ${response.status}:`, errorText);
      throw new Error("Не удалось загрузить комментарии");
    }

    const data = await response.json();
    console.log("Успешно загружено комментариев:", data.length);
    return data;

  } catch (error) {
    console.error("Ошибка при загрузке:", error.message);
    throw new Error("Проверьте подключение и попробуйте снова");
  }
}

export async function postCommentToAPI({ name, text, token, forceError = false }) {
  try {
    console.log("Отправляем новый комментарий...");

    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: name.trim(),
        text: text.trim(),
        date: new Date().toISOString(),
        likes: 0,
        isLiked: false,
        forceError
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        response.status === 400
          ? "Имя и текст должны быть не короче 3 символов"
          : errorData.message || "Ошибка сервера"
      );
    }

    const newComment = await response.json();
    console.log("Комментарий успешно добавлен:", newComment);
    return newComment;

  } catch (error) {
    console.error("Ошибка при отправке:", error.message);
    throw new Error("Попробуйте отправить позже");
  }
}