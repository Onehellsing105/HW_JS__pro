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

export async function postCommentToAPI({ name, text }) {
  try {
    console.log("Отправляем новый комментарий...");
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        name: name.trim(),
        text: text.trim(),
        date: new Date().toISOString(),
        likes: 0,
        isLiked: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Ошибка сервера:", errorData);
      throw new Error("Не удалось отправить комментарий");
    }

    const newComment = await response.json();
    console.log("Комментарий успешно добавлен:", newComment);
    return newComment;

  } catch (error) {
    console.error("Ошибка при отправке:", error.message);
    throw new Error("Попробуйте отправить позже");
  }
}