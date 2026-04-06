'use client';

import { useEffect, useState } from 'react';
import { PostAuthor } from '@/types';

interface LikesModalProps {
  postId?: string;
  commentId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function LikesModal({ postId, commentId, isOpen, onClose }: LikesModalProps) {
  const [likers, setLikers] = useState<PostAuthor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const url = commentId
      ? `/api/comments/${commentId}/likes`
      : `/api/posts/${postId}/likes`;
    setLoading(true);
    fetch(url)
      .then((r) => r.json())
      .then((data) => setLikers(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [isOpen, postId, commentId]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg1)', borderRadius: '10px', padding: '24px',
          minWidth: '320px', maxWidth: '480px', width: '90%', maxHeight: '60vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h4 style={{ margin: 0, color: 'var(--text1)', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
            People who liked this
          </h4>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text2)' }}
          >
            ×
          </button>
        </div>
        {loading ? (
          <p style={{ color: 'var(--text2)', textAlign: 'center' }}>Loading...</p>
        ) : likers.length === 0 ? (
          <p style={{ color: 'var(--text2)', textAlign: 'center' }}>No likes yet.</p>
        ) : (
          likers.map((liker) => {
            const avatar = liker.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${liker.id}`;
            return (
              <div key={liker.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid var(--border1)' }}>
                <img src={avatar} alt={liker.firstName} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                <span style={{ color: 'var(--text1)', fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
                  {liker.firstName} {liker.lastName}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
