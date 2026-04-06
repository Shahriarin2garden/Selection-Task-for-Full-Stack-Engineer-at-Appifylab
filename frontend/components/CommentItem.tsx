'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CommentWithMeta } from '@/types';
import LikesModal from './LikesModal';

interface CommentItemProps {
  comment: CommentWithMeta;
  postId: string;
  currentUserId: string;
  onReplyAdded?: (reply: CommentWithMeta) => void;
  isReply?: boolean;
}

export default function CommentItem({ comment, postId, currentUserId, onReplyAdded, isReply = false }: CommentItemProps) {
  const [liked, setLiked] = useState(comment.isLikedByMe);
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState<CommentWithMeta[]>(comment.replies);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);

  const avatar = comment.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author.id}`;

  const handleLike = async () => {
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);

    try {
      const res = await fetch(`/api/comments/${comment.id}/like`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setLikeCount(data.likeCount);
      } else {
        setLiked(prevLiked);
        setLikeCount(prevCount);
      }
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyText.trim(), parentId: comment.id }),
      });
      if (res.ok) {
        const newReply: CommentWithMeta = await res.json();
        setReplies((prev) => [...prev, newReply]);
        setReplyText('');
        setShowReply(false);
        onReplyAdded?.(newReply);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ marginLeft: isReply ? '40px' : 0, marginBottom: '12px' }}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <img src={avatar} alt={comment.author.firstName} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{
            background: 'var(--bg2)', borderRadius: '10px', padding: '10px 14px',
            display: 'inline-block', maxWidth: '100%',
          }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '13px', color: 'var(--text1)' }}>
              {comment.author.firstName} {comment.author.lastName}
            </p>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text1)' }}>{comment.content}</p>
          </div>
          <div style={{ display: 'flex', gap: '14px', marginTop: '4px', fontSize: '12px', color: 'var(--text2)' }}>
            <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
            <button
              onClick={handleLike}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: liked ? '#1890FF' : 'var(--text2)', fontSize: '12px', fontWeight: liked ? 600 : 400, padding: 0 }}
            >
              {liked ? '❤️' : '🤍'} Like
            </button>
            {likeCount > 0 && (
              <button
                onClick={() => setShowLikesModal(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', fontSize: '12px', padding: 0, textDecoration: 'underline' }}
              >
                {likeCount} {likeCount === 1 ? 'like' : 'likes'}
              </button>
            )}
            {!isReply && (
              <button
                onClick={() => setShowReply(!showReply)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', fontSize: '12px', padding: 0 }}
              >
                Reply
              </button>
            )}
          </div>
          {showReply && !isReply && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                style={{
                  flex: 1, border: '1px solid var(--border1)', borderRadius: '20px',
                  padding: '6px 14px', background: 'var(--bg2)', color: 'var(--text1)', fontSize: '13px',
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleReply()}
              />
              <button
                onClick={handleReply}
                disabled={isSubmitting || !replyText.trim()}
                style={{
                  background: '#1890FF', color: '#fff', border: 'none', borderRadius: '6px',
                  padding: '6px 12px', cursor: 'pointer', fontSize: '13px',
                }}
              >
                Reply
              </button>
            </div>
          )}
        </div>
      </div>
      {replies.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          postId={postId}
          currentUserId={currentUserId}
          isReply
        />
      ))}
      <LikesModal
        commentId={comment.id}
        isOpen={showLikesModal}
        onClose={() => setShowLikesModal(false)}
      />
    </div>
  );
}
