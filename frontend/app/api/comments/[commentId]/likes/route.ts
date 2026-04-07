import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { getAccessibleCommentForUser } from '@/lib/access';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { commentId } = await params;

  try {
    if (!(await getAccessibleCommentForUser(commentId, session.userId))) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const likes = await prisma.like.findMany({
      where: { commentId },
      select: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });

    return NextResponse.json(likes.map((l) => l.user));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
