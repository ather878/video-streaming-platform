import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { uploadAPI, videoAPI, streamingAPI } from '../api/services';
import { AlertCircle, Loader, Play, Edit, Trash2 } from 'lucide-react';
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
      console.error(err);
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
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }

    setDeleting(true);
    setError('');

    try {
      await videoAPI.deleteVideo(videoId);
      navigate('/');
    } catch (err) {
      setError('Failed to delete video. Please try again.');
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader size={48} className="animate-spin text-blue-500" />
          <p className="text-gray-400">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded flex gap-2">
        <AlertCircle size={20} />
        <p>{error || 'Video not found'}</p>
      </div>
    );
  }

  const isOwner = user && video.uploaderId === user.id;
  const formatDate = (date) => new Date(date).toLocaleDateString();

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded flex gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {/* Video Player */}
        {streamUrl ? (
          <video
            controls
            className="w-full h-full"
            controlsList="nodownload"
            preload="metadata"
            crossOrigin="anonymous"
          >
            <source src={streamUrl} type={video.contentType || 'video/mp4'} />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="text-center">
            <Play size={64} className="mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400">Video not available</p>
          </div>
        )}

      {/* Video Info */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{video.title}</h1>
            <div className="flex items-center gap-4 text-gray-400 text-sm mb-4">
              <span>{video.category || 'Uncategorized'}</span>
              <span>•</span>
              <span>{formatDate(video.createdAt)}</span>
              <span>•</span>
              <span className={`px-3 py-1 rounded ${
                video.visibility === 'PUBLIC'
                  ? 'bg-green-900 text-green-200'
                  : video.visibility === 'PRIVATE'
                  ? 'bg-red-900 text-red-200'
                  : 'bg-yellow-900 text-yellow-200'
              }`}>
                {video.visibility}
              </span>
            </div>
          </div>
          {isOwner && (
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/edit/${videoId}`)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition"
              >
                <Edit size={18} />
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-4 py-2 rounded transition"
              >
                <Trash2 size={18} />
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>

        <div className="prose prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mb-2">Description</h2>
          <p className="text-gray-300 whitespace-pre-wrap">
            {video.description || 'No description provided'}
          </p>
        </div>

        {video.uploadStatus && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-gray-400 text-sm">
              Status: <span className={`font-semibold ${
                video.uploadStatus === 'COMPLETED' ? 'text-green-400' :
                video.uploadStatus === 'FAILED' ? 'text-red-400' :
                'text-yellow-400'
              }`}>{video.uploadStatus}</span>
            </p>
            {video.durationInSeconds && (
              <p className="text-gray-400 text-sm mt-2">
                Duration: {formatDuration(video.durationInSeconds)}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  return `${minutes}m ${secs}s`;
}

