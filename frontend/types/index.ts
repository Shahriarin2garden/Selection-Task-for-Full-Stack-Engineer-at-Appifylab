export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null;
};

export type PostAuthor = Pick<AuthUser, 'id' | 'firstName' | 'lastName' | 'avatar'>;

export type CommentWithMeta = {
  id: string;
  content: string;
  createdAt: string;
  author: PostAuthor;
  likeCount: number;
  isLikedByMe: boolean;
  replies: CommentWithMeta[];
};

export type PostWithMeta = {
  id: string;
  content: string;
  imageUrl: string | null;
  visibility: 'PUBLIC' | 'PRIVATE';
  createdAt: string;
  author: PostAuthor;
  likeCount: number;
  commentCount: number;
  isLikedByMe: boolean;
};

export type ApiError = {
  error: string;
  field?: string;
};

export type PaginatedPosts = {
  posts: PostWithMeta[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type SessionPayload = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null;
  expiresAt: Date;
};
