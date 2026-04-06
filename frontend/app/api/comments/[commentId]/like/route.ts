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
    const [liked, likeCount] = await prisma.$transaction(async (tx) => {
      const existing = await tx.like.findUnique({
        where: { userId_commentId: { userId: session.userId, commentId } },
      });

      if (existing) {
        await tx.like.delete({ where: { id: existing.id } });
        const count = await tx.like.count({ where: { commentId } });
        return [false, count] as const;
      } else {
        await tx.like.create({ data: { userId: session.userId, commentId } });
        const count = await tx.like.count({ where: { commentId } });
        return [true, count] as const;
      }
    });

    return NextResponse.json({ liked, likeCount });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
