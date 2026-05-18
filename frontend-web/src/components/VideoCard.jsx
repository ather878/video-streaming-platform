import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Eye } from 'lucide-react';

export default function VideoCard({ video }) {
  const formatDate = (date) => new Date(date).toLocaleDateString();
  const formatViews = (views) => views?.toLocaleString() || '0';

  return (
    <Link to={`/videos/${video.id}`}>
      <div className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition transform hover:scale-105 duration-300">
        {/* Thumbnail */}
        <div className="relative bg-gray-700 aspect-video flex items-center justify-center overflow-hidden">
          {video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22%3E%3Crect fill=%22%23374151%22 width=%22400%22 height=%22300%22/%3E%3C/svg%3E';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Play size={48} />
            </div>
          )}
          {/* Play overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 flex items-center justify-center transition">
            <Play size={48} className="text-white opacity-0 hover:opacity-100" fill="white" />
          </div>
          {/* Duration badge */}
          {video.durationInSeconds && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 px-2 py-1 rounded text-sm">
              {formatDuration(video.durationInSeconds)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-lg truncate hover:text-blue-400">
            {video.title}
          </h3>
          <p className="text-gray-400 text-sm line-clamp-2 my-2">
            {video.description || 'No description'}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{video.category || 'Uncategorized'}</span>
            <span>{formatDate(video.createdAt)}</span>
          </div>
          {/* Visibility badge */}
          <div className="mt-2">
            <span
              className={`inline-block text-xs px-2 py-1 rounded ${
                video.visibility === 'PUBLIC'
                  ? 'bg-green-900 text-green-200'
                  : video.visibility === 'PRIVATE'
                  ? 'bg-red-900 text-red-200'
                  : 'bg-yellow-900 text-yellow-200'
              }`}
            >
              {video.visibility}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

