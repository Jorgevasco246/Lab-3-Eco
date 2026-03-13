export interface Post {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  userId: string;
}

export interface CreatePostDTO {
  title: string;
  description: string;
  imageUrl: string;
  userId: string;
}

export interface UpdatePostDTO {
  id: string;
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
}