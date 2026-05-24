import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { uploadAPI, videoAPI } from '../api/services';
import { AlertCircle, Loader, Play, Edit, Trash2, Clock, Tag, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function VideoDetail() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [streamUrl, setStreamUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchVideo();
    fetchStreamUrl();
  }, [videoId]);

  const fetchVideo = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await videoAPI.getVideo(videoId);
      setVideo(response.data);
    } catch (err) {
      setError('Failed to load video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStreamUrl = async () => {
    try {
      const response = await uploadAPI.getMinioStreamUrl(videoId);
      setStreamUrl(response.data.presigned_url);
    } catch (err) {
      console.error('Failed to fetch stream URL', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    setDeleting(true);
    setError('');
    try {
      await videoAPI.deleteVideo(videoId);
      navigate('/');
    } catch (err) {
      setError('Failed to delete video. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
        <Loader size={40} color="#E50914" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#555', fontSize: 14 }}>Loading video…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div style={{ background: 'rgba(229,9,20,0.1)', border: '1px solid rgba(229,9,20,0.3)', color: '#f09595', padding: '12px 16px', borderRadius: 4, display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
        <AlertCircle size={15} /> {error || 'Video not found'}
      </div>
    );
  }

  const isOwner = user && video.uploaderId === user.id;
  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const visConfig = {
    PUBLIC:   { label: 'Public',   color: '#5DCAA5', bg: 'rgba(29,158,117,0.15)' },
    PRIVATE:  { label: 'Private',  color: '#F09595', bg: 'rgba(229,9,20,0.15)' },
    UNLISTED: { label: 'Unlisted', color: '#EF9F27', bg: 'rgba(239,159,39,0.15)' },
  };
  const vis = visConfig[video.visibility] || visConfig.PUBLIC;

  return (
    <div style={{ background: '#141414', minHeight: '100vh', margin: '-2rem -1rem', padding: 0 }}>

      {/* Video Player */}
      <div style={{ background: '#000', width: '100%' }}>
        {streamUrl ? (
          <video
            controls
            controlsList="nodownload"
            preload="metadata"
            crossOrigin="anonymous"
            style={{ width: '100%', maxHeight: '70vh', display: 'block' }}
          >
            <source src={streamUrl} type={video.contentType || 'video/mp4'} />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div style={{ aspectRatio: '16/9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: '#0a0a0a' }}>
            <Play size={64} color="#333" />
            <p style={{ color: '#555', fontSize: 14 }}>Video not available</p>
          </div>
        )}
      </div>

      {/* Video Info */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {error && (
          <div style={{ background: 'rgba(229,9,20,0.1)', border: '1px solid rgba(229,9,20,0.3)', color: '#f09595', padding: '10px 14px', borderRadius: 4, marginBottom: '1.5rem', display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
          <h1 style={{ fontSize: 22, fontWeight: 500, color: '#fff', flex: 1, lineHeight: 1.3 }}>{video.title}</h1>
          {isOwner && (
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button
                onClick={() => navigate(`/edit/${videoId}`)}
                style={btnStyle('#2a2a2a', '#aaa')}
              >
                <Edit size={15} /> Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={btnStyle('rgba(229,9,20,0.15)', '#f09595')}
              >
                <Trash2 size={15} /> {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          )}
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {video.category && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#777' }}>
              <Tag size={13} /> {video.category}
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#777' }}>
            <Clock size={13} /> {formatDate(video.createdAt)}
          </span>
          {video.durationInSeconds && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#777' }}>
              <Play size={13} /> {formatDuration(video.durationInSeconds)}
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '2px 10px', borderRadius: 3, background: vis.bg, color: vis.color }}>
            <Eye size={12} /> {vis.label}
          </span>
          {video.uploadStatus && (
            <span style={{ fontSize: 12, color: video.uploadStatus === 'COMPLETED' ? '#5DCAA5' : video.uploadStatus === 'FAILED' ? '#f09595' : '#EF9F27' }}>
              {video.uploadStatus}
            </span>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#222', marginBottom: '1.5rem' }} />

        {/* Description */}
        <div>
          <p style={{ fontSize: 12, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Description</p>
          <p style={{ fontSize: 14, color: '#aaa', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
            {video.description || 'No description provided'}
          </p>
        </div>
      </div>
    </div>
  );
}

const btnStyle = (bg, color) => ({
  display: 'flex', alignItems: 'center', gap: 6,
  background: bg, border: 'none', color,
  padding: '7px 14px', borderRadius: 4,
  fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
});

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}
