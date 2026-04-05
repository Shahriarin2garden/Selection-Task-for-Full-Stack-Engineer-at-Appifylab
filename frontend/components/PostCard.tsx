'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { PostWithMeta, SessionPayload } from '@/types';
import CommentSection from './CommentSection';
import LikesModal from './LikesModal';

interface PostCardProps {
  post: PostWithMeta;
  user: SessionPayload;
  onDelete?: (id: string) => void;
}

export default function PostCard({ post, user, onDelete }: PostCardProps) {
  const [liked, setLiked] = useState(post.isLikedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showComments, setShowComments] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const isOwner = post.author.id === user.userId;
  const authorAvatar = post.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.id}`;

  const handleLike = async () => {
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);

    try {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: 'POST' });
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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
    if (res.ok) {
      onDelete?.(post.id);
    }
  };

  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16 _feed_inner_area">
      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
        <div className="_feed_inner_timeline_post_top">
          <div className="_feed_inner_timeline_post_box">
            <div className="_feed_inner_timeline_post_box_image">
              <img src={authorAvatar} alt={post.author.firstName} className="_post_img" />
            </div>
            <div className="_feed_inner_timeline_post_box_txt">
              <h4 className="_feed_inner_timeline_post_box_title">
                {post.author.firstName} {post.author.lastName}
              </h4>
              <p className="_feed_inner_timeline_post_box_para">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })} ·{' '}
                <span>{post.visibility === 'PUBLIC' ? '🌐 Public' : '🔒 Private'}</span>
              </p>
            </div>
          </div>
          {isOwner && (
            <div className="_feed_inner_timeline_post_box_dropdown" style={{ position: 'relative' }}>
              <div className="_feed_timeline_post_dropdown">
                <button
                  className="_feed_timeline_post_dropdown_link"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="4" height="17" fill="none" viewBox="0 0 4 17">
                    <circle cx="2" cy="2" r="2" fill="#C4C4C4" />
                    <circle cx="2" cy="8" r="2" fill="#C4C4C4" />
                    <circle cx="2" cy="15" r="2" fill="#C4C4C4" />
                  </svg>
                </button>
              </div>
              {showDropdown && (
                <div className="_feed_timeline_dropdown _timeline_dropdown" style={{ display: 'block' }}>
                  <ul className="_feed_timeline_dropdown_list">
                    <li className="_feed_timeline_dropdown_item">
                      <button
                        onClick={handleDelete}
                        className="_feed_timeline_dropdown_link"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545', width: '100%', textAlign: 'left' }}
                      >
                        <span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18">
                            <path stroke="#dc3545" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M2.25 4.5h13.5M7.5 8.25v4.5M10.5 8.25v4.5M6 4.5V3a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0112 3v1.5m2.25 0V15a1.5 1.5 0 01-1.5 1.5h-7.5a1.5 1.5 0 01-1.5-1.5V4.5h10.5z" />
                          </svg>
                        </span>
                        Delete Post
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <p className="_feed_inner_timeline_post_title" style={{ margin: '12px 0', color: 'var(--text1)', lineHeight: 1.6 }}>
          {post.content}
        </p>

        {post.imageUrl && (
          <div className="_feed_inner_timeline_image" style={{ marginBottom: '12px' }}>
            <img src={post.imageUrl} alt="Post image" className="_time_img" style={{ width: '100%', borderRadius: '6px', maxHeight: '400px', objectFit: 'cover' }} />
          </div>
        )}
      </div>

      <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
        <div className="_feed_inner_timeline_total_reacts_image">
          {likeCount > 0 && (
            <>
              <img src="/images/react_img1.png" alt="" className="_react_img1" />
              <p className="_feed_inner_timeline_total_reacts_para"
                onClick={() => setShowLikesModal(true)}
                style={{ cursor: 'pointer', color: 'var(--text2)', fontSize: '14px', marginLeft: '6px' }}
              >
                {likeCount} {likeCount === 1 ? 'person' : 'people'} liked this
              </p>
            </>
          )}
        </div>
        <div className="_feed_inner_timeline_total_reacts_txt">
          <p className="_feed_inner_timeline_total_reacts_para1">
            <button
              onClick={() => setShowComments(!showComments)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', fontSize: '14px' }}
            >
              <span>{post.commentCount}</span> Comment{post.commentCount !== 1 ? 's' : ''}
            </button>
          </p>
        </div>
      </div>

      <div className="_feed_inner_timeline_reaction _padd_r24 _padd_l24" style={{ borderTop: '1px solid var(--border1)', paddingTop: '12px', display: 'flex', gap: '4px' }}>
        <button
          onClick={handleLike}
          className={`_feed_inner_timeline_reaction_emoji _feed_reaction${liked ? ' _feed_reaction_active' : ''}`}
          style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: liked ? '#1890FF' : 'var(--text2)', fontFamily: 'Poppins, sans-serif', fontSize: '14px', fontWeight: liked ? 600 : 400 }}
        >
          {liked ? '❤️' : '🤍'} Like
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--text2)', fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
        >
          💬 Comment
        </button>
        <button
          style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--text2)', fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
        >
          ↗️ Share
        </button>
      </div>

      <CommentSection postId={post.id} user={user} isOpen={showComments} />

      <LikesModal postId={post.id} isOpen={showLikesModal} onClose={() => setShowLikesModal(false)} />
    </div>
  );
}
