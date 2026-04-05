'use client';

import { useEffect, useState } from 'react';
import { CommentWithMeta, SessionPayload } from '@/types';
import CommentItem from './CommentItem';

interface CommentSectionProps {
  postId: string;
  user: SessionPayload;
  isOpen: boolean;
}

export default function CommentSection({ postId, user, isOpen }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentWithMeta[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const avatarUrl = user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.userId}`;

  useEffect(() => {
    if (!isOpen || loaded) return;
    fetch(`/api/posts/${postId}/comments`)
      .then((r) => r.json())
      .then((data) => {
        setComments(Array.isArray(data) ? data : []);
        setLoaded(true);
      });
  }, [isOpen, postId, loaded]);

  const handleSubmit = async () => {
    if (!newComment.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      if (res.ok) {
        const comment: CommentWithMeta = await res.json();
        setComments((prev) => [...prev, comment]);
        setNewComment('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="_feed_inner_timeline_comment_area _padd_r24 _padd_l24" style={{ borderTop: '1px solid var(--border1)', paddingTop: '16px' }}>
      {!loaded ? (
        <p style={{ color: 'var(--text2)', fontSize: '14px' }}>Loading comments...</p>
      ) : (
        <>
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              postId={postId}
              currentUserId={user.userId}
            />
          ))}
          {comments.length === 0 && (
            <p style={{ color: 'var(--text2)', fontSize: '14px', marginBottom: '12px' }}>No comments yet. Be the first!</p>
          )}
        </>
      )}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '8px' }}>
        <img src={avatarUrl} alt="You" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          style={{
            flex: 1, border: '1px solid var(--border1)', borderRadius: '20px',
            padding: '8px 16px', background: 'var(--bg2)', color: 'var(--text1)', fontSize: '14px',
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !newComment.trim()}
          style={{
            background: '#1890FF', color: '#fff', border: 'none', borderRadius: '6px',
            padding: '8px 16px', cursor: 'pointer', fontSize: '14px',
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
