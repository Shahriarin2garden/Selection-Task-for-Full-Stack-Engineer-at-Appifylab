'use client';

import { useState, useCallback } from 'react';
import useSWRInfinite from 'swr/infinite';
import { PostWithMeta, PaginatedPosts, SessionPayload } from '@/types';
import PostCard from './PostCard';
import CreatePost from './CreatePost';

interface FeedClientProps {
  initialData: PaginatedPosts;
  currentUser: SessionPayload;
}

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error('Failed to load posts');
    return r.json();
  });

const getKey = (pageIndex: number, previousPageData: PaginatedPosts | null) => {
  if (previousPageData && !previousPageData.hasMore) return null;
  if (pageIndex === 0) return '/api/posts?limit=10';
  return `/api/posts?limit=10&cursor=${previousPageData?.nextCursor}`;
};

export default function FeedClient({ initialData, currentUser }: FeedClientProps) {
  const [prependedPosts, setPrependedPosts] = useState<PostWithMeta[]>([]);

  const { data, size, setSize, isLoading, error, mutate } = useSWRInfinite<PaginatedPosts>(
    getKey,
    fetcher,
    {
      fallbackData: [initialData],
      revalidateOnFocus: false,
      revalidateFirstPage: false,
    }
  );

  const allPages = data ?? [initialData];
  const allPosts = allPages.flatMap((p) => p.posts);
  const lastPage = allPages[allPages.length - 1];
  const hasMore = lastPage?.hasMore ?? false;

  // Filter out prepended posts that are now in the main feed (deduplication)
  const prependedFiltered = prependedPosts.filter(
    (pp) => !allPosts.find((p) => p.id === pp.id)
  );

  const feedPosts = [...prependedFiltered, ...allPosts];

  const handlePostCreated = useCallback((post: PostWithMeta) => {
    setPrependedPosts((prev) => [post, ...prev]);
  }, []);

  const handlePostDeleted = useCallback((id: string) => {
    setPrependedPosts((prev) => prev.filter((p) => p.id !== id));
    mutate();
  }, [mutate]);

  if (error) {
    return (
      <div className="_layout_middle_wrap">
        <div className="_layout_middle_inner">
          <CreatePost user={currentUser} onPostCreated={handlePostCreated} />
          <div className="_feed_inner_area _b_radious6" style={{ padding: '32px', textAlign: 'center' }}>
            <p style={{ color: '#dc3545', marginBottom: '12px' }}>Failed to load posts.</p>
            <button
              onClick={() => mutate()}
              style={{
                background: '#1890FF', color: '#fff', border: 'none',
                borderRadius: '6px', padding: '8px 20px', cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="_layout_middle_wrap">
      <div className="_layout_middle_inner">
        <CreatePost user={currentUser} onPostCreated={handlePostCreated} />

        {feedPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            user={currentUser}
            onDelete={handlePostDeleted}
          />
        ))}

        {isLoading && (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text2)' }}>
            <span className="spinner" style={{ borderTopColor: '#1890FF', border: '2px solid var(--border1)' }} />
            {' '}Loading...
          </div>
        )}

        {!isLoading && hasMore && (
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <button
              onClick={() => setSize(size + 1)}
              style={{
                background: '#1890FF', color: '#fff', border: 'none', borderRadius: '6px',
                padding: '10px 24px', cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
              }}
            >
              Load more
            </button>
          </div>
        )}

        {!isLoading && !hasMore && feedPosts.length > 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text2)', padding: '20px', fontSize: '14px' }}>
            You&apos;re all caught up! 🎉
          </p>
        )}

        {!isLoading && feedPosts.length === 0 && (
          <div className="_feed_inner_area _b_radious6" style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text2)', fontSize: '16px' }}>No posts yet. Be the first to post!</p>
          </div>
        )}
      </div>
    </div>
  );
}
