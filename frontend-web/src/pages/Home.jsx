import React, { useState, useEffect } from 'react';
import { videoAPI } from '../api/services';
import VideoCard from '../components/VideoCard';
import { AlertCircle, Loader } from 'lucide-react';

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, [page]);

  const fetchVideos = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await videoAPI.listVideos(page, 12, 'createdAt');
      setVideos(response.data.content || []);
      setHasMore(response.data.totalPages > page + 1);
    } catch (err) {
      setError('Failed to load videos. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setPage(page + 1);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Discover Videos</h1>
        <p className="text-gray-400">Explore our collection of amazing content</p>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-6 flex gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {loading && videos.length === 0 ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="flex flex-col items-center gap-4">
            <Loader size={48} className="animate-spin text-blue-500" />
            <p className="text-gray-400">Loading videos...</p>
          </div>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">No videos available yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-2 px-8 rounded transition"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

