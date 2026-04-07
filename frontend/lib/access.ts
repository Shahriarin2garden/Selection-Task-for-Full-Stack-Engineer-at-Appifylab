import { prisma } from '@/lib/prisma';

type Visibility = 'PUBLIC' | 'PRIVATE';

type AccessiblePost = {
  id: string;
  authorId: string;
  visibility: Visibility;
};

type AccessibleComment = {
  id: string;
  postId: string;
  post: AccessiblePost;
};

function canAccessVisibility(visibility: Visibility, authorId: string, userId: string): boolean {
  return visibility === 'PUBLIC' || authorId === userId;
}

export async function getAccessiblePostForUser(
  postId: string,
  userId: string
): Promise<AccessiblePost | null> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true, visibility: true },
  });

  if (!post) return null;
  if (!canAccessVisibility(post.visibility, post.authorId, userId)) return null;
  return post;
}

export async function getAccessibleCommentForUser(
  commentId: string,
  userId: string
): Promise<AccessibleComment | null> {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: {
      id: true,
      postId: true,
      post: {
        select: {
          id: true,
          authorId: true,
          visibility: true,
        },
      },
    },
  });

  if (!comment) return null;
  if (!canAccessVisibility(comment.post.visibility, comment.post.authorId, userId)) return null;
  return comment;
}