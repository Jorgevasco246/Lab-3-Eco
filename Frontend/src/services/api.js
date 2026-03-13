const API_URL = "https://lab-2-eco-backend.vercel.app/api/posts";

export const getPosts = async () => {
  const res = await fetch(API_URL);
  return res.json();
};

export const createPost = async (post) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(post),
  });

  return res.json();
};

export const deletePost = async (id) => {
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
};