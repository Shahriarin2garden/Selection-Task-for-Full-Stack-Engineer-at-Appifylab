import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { createPostSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get('cursor') || undefined;
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);

  try {
    const posts = await prisma.post.findMany({
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      where: {
        OR: [
          { visibility: 'PUBLIC' },
          { authorId: session.userId },
        ],
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        content: true,
        imageUrl: true,
        visibility: true,
        createdAt: true,
        author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    const hasMore = posts.length > limit;
    const sliced = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore ? sliced[sliced.length - 1].id : null;

    const likedPostIds = sliced.length > 0
      ? await prisma.like.findMany({
          where: {
            userId: session.userId,
            postId: { in: sliced.map((p) => p.id) },
          },
          select: { postId: true },
        }).then((likes) => new Set(likes.map((l) => l.postId)))
      : new Set<string>();

    const postsWithMeta = sliced.map((p) => ({
      id: p.id,
      content: p.content,
      imageUrl: p.imageUrl,
      visibility: p.visibility,
      createdAt: p.createdAt.toISOString(),
      author: p.author,
      likeCount: p._count.likes,
      commentCount: p._count.comments,
      isLikedByMe: likedPostIds.has(p.id),
    }));

    return NextResponse.json({ posts: postsWithMeta, nextCursor, hasMore });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const validated = createPostSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error.flatten().fieldErrors }, { status: 400 });
    }

    const { content, imageUrl, visibility } = validated.data;
    const post = await prisma.post.create({
      data: {
        content,
        imageUrl: imageUrl || null,
        visibility: visibility || 'PUBLIC',
        authorId: session.userId,
      },
      select: {
        id: true,
        content: true,
        imageUrl: true,
        visibility: true,
        createdAt: true,
        author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    return NextResponse.json({
      id: post.id,
      content: post.content,
      imageUrl: post.imageUrl,
      visibility: post.visibility,
      createdAt: post.createdAt.toISOString(),
      author: post.author,
      likeCount: 0,
      commentCount: 0,
      isLikedByMe: false,
    }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
