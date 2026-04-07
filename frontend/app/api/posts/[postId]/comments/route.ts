import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { getAccessiblePostForUser } from '@/lib/access';
import { createCommentSchema } from '@/lib/validations';

function toFieldErrors(issues: Array<{ path: PropertyKey[]; message: string }>) {
  return issues.reduce<Record<string, string[]>>((acc, issue) => {
    const field = issue.path[0];
    if (typeof field !== 'string') return acc;
    if (!acc[field]) acc[field] = [];
    acc[field].push(issue.message);
    return acc;
  }, {});
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { postId } = await params;

  try {
    if (!(await getAccessiblePostForUser(postId, session.userId))) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const comments = await prisma.comment.findMany({
      where: { postId, parentId: null },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        _count: { select: { likes: true } },
        replies: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
            _count: { select: { likes: true } },
          },
        },
      },
    });

    const allIds = [
      ...comments.map((c) => c.id),
      ...comments.flatMap((c) => c.replies.map((r) => r.id)),
    ];

    const myLikes = await prisma.like.findMany({
      where: { userId: session.userId, commentId: { in: allIds } },
      select: { commentId: true },
    });
    const likedSet = new Set(myLikes.map((l) => l.commentId));

    const withMeta = comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      author: c.author,
      likeCount: c._count.likes,
      isLikedByMe: likedSet.has(c.id),
      replies: c.replies.map((r) => ({
        id: r.id,
        content: r.content,
        createdAt: r.createdAt.toISOString(),
        author: r.author,
        likeCount: r._count.likes,
        isLikedByMe: likedSet.has(r.id),
        replies: [],
      })),
    }));

    return NextResponse.json(withMeta);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { postId } = await params;

  try {
    if (!(await getAccessiblePostForUser(postId, session.userId))) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const body = await req.json();
    const validated = createCommentSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: toFieldErrors(validated.error.issues) }, { status: 400 });
    }

    const { content, parentId } = validated.data;

    if (parentId) {
      const parent = await prisma.comment.findFirst({
        where: { id: parentId, postId },
      });
      if (!parent) {
        return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 });
      }
    }

    const comment = await prisma.comment.create({
      data: { content, postId, authorId: session.userId, parentId: parentId || null },
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        _count: { select: { likes: true } },
      },
    });

    return NextResponse.json({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      author: comment.author,
      likeCount: 0,
      isLikedByMe: false,
      replies: [],
    }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
