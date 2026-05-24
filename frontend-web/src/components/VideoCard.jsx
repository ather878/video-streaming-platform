import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

export default function VideoCard({ video }) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const formatDate = (date) => new Date(date).toLocaleDateString();

  const visStyle = {
    PUBLIC:   { background: 'rgba(29,158,117,0.2)', color: '#5DCAA5' },
    PRIVATE:  { background: 'rgba(229,9,20,0.15)',  color: '#F09595' },
    UNLISTED: { background: 'rgba(239,159,39,0.15)', color: '#EF9F27' },
  };

  return (
    <Link to={`/videos/${video.id}`} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          borderRadius: 4,
          overflow: 'hidden',
          background: '#222',
          cursor: 'pointer',
          border: hovered ? '2px solid #E50914' : '2px solid transparent',
          transition: 'border-color 0.15s, transform 0.15s',
          transform: hovered ? 'scale(1.03)' : 'scale(1)',
        }}
      >
        {/* Thumbnail */}
        <div style={{ position: 'relative', aspectRatio: '16/9', background: '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {video.thumbnailUrl && !imgError ? (
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              onError={() => setImgError(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', fontSize: 28 }}>
              ▶
            </div>
          )}

          {/* Hover overlay */}
          {hovered && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(229,9,20,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E50914', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Play size={14} color="white" fill="white" />
              </div>
            </div>
          )}

          {/* Duration badge */}
          {video.durationInSeconds && (
            <div style={{ position: 'absolute', bottom: 6, right: 6, background: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: 10, padding: '2px 5px', borderRadius: 2 }}>
              {formatDuration(video.durationInSeconds)}
            </div>
          )}

          {/* New badge — if uploaded within 7 days */}
          {isNew(video.createdAt) && (
            <div style={{ position: 'absolute', top: 6, left: 6, background: '#E50914', color: 'white', fontSize: 10, padding: '2px 6px', borderRadius: 2 }}>
              New
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '8px 10px' }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: hovered ? '#fff' : '#e5e5e5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 3, transition: 'color 0.15s' }}>
            {video.title}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#777' }}>
            <span>{video.category || 'Uncategorized'}</span>
            {video.visibility && (
              <span style={{ padding: '1px 6px', borderRadius: 2, fontSize: 10, ...visStyle[video.visibility] }}>
                {video.visibility}
              </span>
            )}
            <span style={{ marginLeft: 'auto' }}>{formatDate(video.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function isNew(dateStr) {
  if (!dateStr) return false;
  const diff = Date.now() - new Date(dateStr).getTime();
  return diff < 7 * 24 * 60 * 60 * 1000;
}
