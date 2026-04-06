import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { postId } = await params;

  try {
    const [liked, likeCount] = await prisma.$transaction(async (tx) => {
      const existing = await tx.like.findUnique({
        where: { userId_postId: { userId: session.userId, postId } },
      });

      if (existing) {
        await tx.like.delete({ where: { id: existing.id } });
        const count = await tx.like.count({ where: { postId } });
        return [false, count] as const;
      } else {
        await tx.like.create({ data: { userId: session.userId, postId } });
        const count = await tx.like.count({ where: { postId } });
        return [true, count] as const;
      }
    });

    return NextResponse.json({ liked, likeCount });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
