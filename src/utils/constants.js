export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ROLES = {
  READER: 'READER',
  AUTHOR: 'AUTHOR',
  ADMIN: 'ADMIN'
};

export const POSTS_PER_PAGE = 10;
export const COMMENTS_PER_PAGE = 20;