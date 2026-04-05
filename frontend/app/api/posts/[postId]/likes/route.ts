import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { postId } = await params;

  try {
    const likes = await prisma.like.findMany({
      where: { postId },
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
