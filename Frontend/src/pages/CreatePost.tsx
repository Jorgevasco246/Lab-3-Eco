import { useState } from "react";

function CreatePost() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newPost = { title, description, imageUrl };

    try {
      const response = await fetch("https://lab-2-eco-backend.vercel.app/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });

      const data = await response.json();
      console.log("Post creado:", data);

      // Limpiar el formulario
      setTitle("");
      setDescription("");
      setImageUrl("");

      // Avisar a Posts que refresque
      window.dispatchEvent(new Event("postCreated"));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl r border-gray-100 mb-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Crear Post</h2>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título"
            className="w-full border border-gray-200 bg-gray-50 p-3.5 rounded-xl"
            required
          />
        </div>

        <div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción"
            rows={3}
            className="w-full border border-gray-200 bg-gray-50 p-3.5 rounded-xl "
            required
          />
        </div>

        <div>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="URL de la imagen"
            className="w-full border border-gray-200 bg-gray-50 p-3.5 rounded-xl "
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-purple-500 text-white font-semibold px-4 py-3.5 rounded-xl hover:bg-purple-600 "
        >
          Publicar Post
        </button>
      </form>
    </div>
  );
}

export default CreatePost;