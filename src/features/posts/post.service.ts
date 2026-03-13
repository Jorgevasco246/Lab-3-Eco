import { CreatePostDTO, Post, UpdatePostDTO } from './post.types';
import Boom from '@hapi/boom';
import { pool } from '../../config/database';

export const getPostsService = async (): Promise<Post[]> => {
  const dbRequest = await pool.query(
    'SELECT id, title, description, imageUrl, userid as "userId" FROM posts'
  );
  return dbRequest.rows;
};

export const getPostByIdService = async (postId: string): Promise<Post> => {
  const dbRequest = await pool.query(
    'SELECT id, title, description, imageUrl, userid as "userId" FROM posts WHERE id = $1',
    [postId]
  );

  if (dbRequest.rowCount === 0) {
    throw Boom.notFound('Post not found');
  }

  return dbRequest.rows[0];
};

export const createPostService = async (post: CreatePostDTO): Promise<Post> => {
  const dbRequest = await pool.query(
    'INSERT INTO posts (title, description, imageUrl, userId) VALUES ($1, $2, $3, $4) RETURNING *',
    [post.title, post.description, post.imageUrl, post.userId]
  );

  return dbRequest.rows[0];
};

export const updatePostService = async (post: UpdatePostDTO): Promise<Post> => {
  const postFound = await getPostByIdService(post.id);

  const title = post.title === undefined ? postFound.title : post.title;
  const description =
    post.description === undefined ? postFound.description : post.description;
  const imageUrl =
    post.imageUrl === undefined ? postFound.imageUrl : post.imageUrl;

  const dbRequest = await pool.query(
    'UPDATE posts SET title = $1, description = $2, imageUrl = $3 WHERE id = $4 RETURNING *',
    [title, description, imageUrl, post.id]
  );

  return dbRequest.rows[0];
};

export const deletePostService = async (postId: string): Promise<void> => {
  const postFound = await getPostByIdService(postId);
  await pool.query('DELETE FROM posts WHERE id = $1', [postFound.id]);
};