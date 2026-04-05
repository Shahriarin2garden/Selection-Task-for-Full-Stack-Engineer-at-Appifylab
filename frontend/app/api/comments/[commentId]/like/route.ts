import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { commentId } = await params;

  try {
    const existing = await prisma.like.findUnique({
      where: { userId_commentId: { userId: session.userId, commentId } },
    });

    let liked: boolean;
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      liked = false;
    } else {
      await prisma.like.create({ data: { userId: session.userId, commentId } });
      liked = true;
    }

    const likeCount = await prisma.like.count({ where: { commentId } });
    return NextResponse.json({ liked, likeCount });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
