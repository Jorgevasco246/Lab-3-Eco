import { useEffect, useState } from "react";
import type { Post } from "../types/Post";

function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);

  const fetchPosts = async () => {
    try {
      const response = await fetch("https://lab-2-eco-backend.vercel.app/api/posts");
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const deletePost = async (id: string) => {
    try {
      await fetch(`https://lab-2-eco-backend.vercel.app/api/posts/${id}`, {
        method: "DELETE",
      });
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  useEffect(() => {
  const loadPosts = async () => {
    await fetchPosts();
  };

  loadPosts();
  }, []);

  useEffect(() => {
    window.addEventListener("postCreated", fetchPosts);
    return () => {
      window.removeEventListener("postCreated", fetchPosts);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 ">
      <div className="max-w-5xl">
        

        <h2 className="text-4xl font-bold mb-8 text-gray-800 text-center ">
          El mejor Feed del mundo
        </h2>

        {/* Posts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl border border-gray-100"
            >
              {/* Imagen denrto*/}
              {post.imageUrl ? (
                <div className="h-48 w-full overflow-hidden bg-gray-100">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="h-48 w-full bg-linear-to-br bg-amber-50 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Sin imagen</span>
                </div>
              )}

              {/* Contenido */}
              <div className="p-6 flex flex-col grow">
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-6 grow line-clamp-3">
                  {post.description}
                </p>

                {/* bBorrar */}
                <button
                  onClick={() => deletePost(post.id)}
                  className="w-full mt-auto bg-red-50 text-red-600 font-medium px-4 py-2.5 rounded-xl hover:bg-red-500 hover:text-white "
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Posts;