import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { PaginatedPosts, PostWithMeta } from '@/types';
import Navbar from '@/components/Navbar';
import LeftSidebar from '@/components/LeftSidebar';
import RightSidebar from '@/components/RightSidebar';
import DarkModeToggle from '@/components/DarkModeToggle';
import FeedClient from '@/components/FeedClient';

async function fetchInitialPosts(userId: string): Promise<PaginatedPosts> {
  const limit = 10;
  try {
    const posts = await prisma.post.findMany({
      take: limit + 1,
      where: {
        OR: [
          { visibility: 'PUBLIC' },
          { authorId: userId },
        ],
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
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
    const nextCursor = hasMore ? (sliced.at(-1)?.id ?? null) : null;

    const likedPostIds = sliced.length > 0
      ? await prisma.like.findMany({
          where: { userId, postId: { in: sliced.map((p) => p.id) } },
          select: { postId: true },
        }).then((likes) => new Set(likes.map((l) => l.postId)))
      : new Set<string>();

    const postsWithMeta: PostWithMeta[] = sliced.map((p) => ({
      id: p.id,
      content: p.content,
      imageUrl: p.imageUrl,
      visibility: p.visibility as 'PUBLIC' | 'PRIVATE',
      createdAt: p.createdAt.toISOString(),
      author: p.author,
      likeCount: p._count.likes,
      commentCount: p._count.comments,
      isLikedByMe: likedPostIds.has(p.id),
    }));

    return { posts: postsWithMeta, nextCursor, hasMore };
  } catch {
    return { posts: [], nextCursor: null, hasMore: false };
  }
}

export default async function FeedPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const initialData = await fetchInitialPosts(session.userId);

  return (
    <div className="_layout _layout_main_wrapper">
      <DarkModeToggle />
      <div className="_main_layout">
        <Navbar user={session} />
        <div className="_layout_inner_wrap">
          <div className="container _custom_container">
            <div className="row">
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <div className="_layout_left_wrap">
                  <LeftSidebar user={session} />
                </div>
              </div>
              <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                <FeedClient initialData={initialData} currentUser={session} />
              </div>
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <div className="_layout_right_wrap">
                  <RightSidebar />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
