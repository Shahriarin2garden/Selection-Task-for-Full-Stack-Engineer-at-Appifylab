'use client';

import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { PostWithMeta, SessionPayload } from '@/types';

interface CreatePostProps {
  user: SessionPayload;
  onPostCreated: (post: PostWithMeta) => void;
}

export default function CreatePost({ user, onPostCreated }: CreatePostProps) {
  const [content, setContent]       = useState('');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [imageFile, setImageFile]   = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Track the object URL so we can revoke it when no longer needed
  const previewUrlRef = useRef<string | null>(null);

  const avatarUrl = user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.userId}`;

  // Revoke the object URL when the component unmounts to free memory
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Revoke any previous preview URL
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    previewUrlRef.current = objectUrl;
    setImageFile(file);
    setImagePreview(objectUrl);
  };

  const removeImage = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      let imageUrl = '';

      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });

        if (!uploadRes.ok) {
          const err = await uploadRes.json().catch(() => ({}));
          toast.error(err.error || 'Image upload failed. Please try again.');
          return;
        }

        const data = await uploadRes.json();
        imageUrl = data.url;
      }

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), imageUrl, visibility }),
      });

      if (!res.ok) {
        toast.error('Failed to create post. Please try again.');
        return;
      }

      const post = await res.json();
      onPostCreated(post);

      // Reset form
      setContent('');
      removeImage();
      setVisibility('PUBLIC');
    } catch {
      toast.error('Something went wrong. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="_feed_inner_text_area _b_radious6 _padd_b24 _padd_t24 _mar_b16 _feed_inner_area">
      <div className="_feed_inner_text_area_profile _padd_r24 _padd_l24">
        <div className="_feed_inner_text_area_image">
          <img src={avatarUrl} alt="Profile" className="_text_area_img" />
        </div>
        <div className="_feed_inner_text_area_input" style={{ flex: 1 }}>
          <textarea
            className="_feed_inner_text_area_inpt"
            placeholder={`What's on your mind, ${user.firstName}?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              border: '1px solid var(--border1)',
              borderRadius: '6px',
              padding: '10px 14px',
              resize: 'none',
              background: 'var(--bg2)',
              color: 'var(--text1)',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '14px',
            }}
          />
        </div>
      </div>

      {imagePreview && (
        <div className="_padd_r24 _padd_l24" style={{ marginTop: '12px', position: 'relative', display: 'inline-block' }}>
          <img src={imagePreview} alt="Preview" style={{ maxWidth: '200px', borderRadius: '6px', maxHeight: '150px', objectFit: 'cover' }} />
          <button
            onClick={removeImage}
            style={{
              position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: '#fff',
              border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
            }}
          >
            ×
          </button>
        </div>
      )}

      <div className="_feed_inner_text_area_bottom _padd_r24 _padd_l24" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
        <div className="_feed_inner_text_area_item" style={{ display: 'flex', gap: '8px', flex: 1 }}>
          <button
            type="button"
            className="_feed_inner_text_area_bottom_photo_link"
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20">
                <path fill="#666" d="M13.916 0c3.109 0 5.18 2.429 5.18 5.914v8.17c0 3.486-2.072 5.916-5.18 5.916H5.999C2.89 20 .827 17.572.827 14.085v-8.17C.827 2.43 2.897 0 6 0h7.917z" />
              </svg>
            </span>
            Photo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            style={{ display: 'none' }}
            onChange={handleImageSelect}
          />

          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as 'PUBLIC' | 'PRIVATE')}
            style={{
              border: '1px solid var(--border1)', borderRadius: '6px', padding: '6px 10px',
              background: 'var(--bg1)', color: 'var(--text2)', fontSize: '13px', cursor: 'pointer',
            }}
          >
            <option value="PUBLIC">🌐 Public</option>
            <option value="PRIVATE">🔒 Private</option>
          </select>
        </div>

        <div className="_feed_inner_text_area_btn">
          <button
            type="button"
            className="_feed_inner_text_area_btn_link"
            onClick={handleSubmit}
            disabled={isSubmitting || !content.trim()}
            style={{
              background: '#1890FF', color: '#fff', border: 'none', borderRadius: '6px',
              padding: '8px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              opacity: !content.trim() ? 0.6 : 1,
            }}
          >
            {isSubmitting && <span className="spinner" />}
            <span>Post</span>
          </button>
        </div>
      </div>
    </div>
  );
}
