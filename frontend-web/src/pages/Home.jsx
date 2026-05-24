import React, { useState, useEffect } from 'react';
import { videoAPI } from '../api/services';
import VideoCard from '../components/VideoCard';
import { AlertCircle, Loader, Search, ChevronRight } from 'lucide-react';

const CATEGORIES = ['All', 'Education', 'Technology', 'Gaming', 'Entertainment', 'Music'];

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchVideos();
  }, [page]);

  const fetchVideos = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await videoAPI.listVideos(page, 12, 'createdAt');
      const incoming = response.data.content || [];
      setVideos(prev => page === 0 ? incoming : [...prev, ...incoming]);
      setHasMore(response.data.totalPages > page + 1);
    } catch (err) {
      setError('Failed to load videos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = videos.filter(v => {
    const matchCat = activeCategory === 'All' || v.category === activeCategory;
    const matchSearch = v.title?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = filtered[0];
  const rest = filtered.slice(1);
  const trending = filtered.slice(0, 4);
  const recent = filtered.slice(0, 8);

  return (
    <div style={{ background: '#141414', minHeight: '100vh', margin: '-2rem -1rem', padding: 0 }}>

      {/* Search + Category Bar */}
      <div style={{ padding: '1.5rem 1.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#222', border: '1px solid #333', borderRadius: 4, padding: '6px 12px', flex: '0 0 auto' }}>
          <Search size={14} color="#555" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search titles…"
            style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 13, width: 180, fontFamily: 'inherit' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '6px 16px', borderRadius: 3, border: '1px solid',
                borderColor: activeCategory === cat ? '#fff' : '#333',
                background: activeCategory === cat ? '#fff' : 'transparent',
                color: activeCategory === cat ? '#000' : '#aaa',
                fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ margin: '1rem 1.5rem', background: '#2a1a1a', border: '1px solid #5a2a2a', color: '#f09595', padding: '12px 16px', borderRadius: 4, display: 'flex', gap: 8, alignItems: 'center' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {loading && videos.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
          <Loader size={40} color="#E50914" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#555', fontSize: 14 }}>Loading videos…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#555' }}>
          <p style={{ fontSize: 16 }}>No videos found</p>
        </div>
      ) : (
        <>
          {/* Hero Banner */}
          {featured && (
            <div style={{ position: 'relative', background: '#0a0a0a', aspectRatio: '16/5', display: 'flex', alignItems: 'flex-end', padding: '2rem 2rem', overflow: 'hidden', marginTop: '0.75rem', marginBottom: 0 }}>
              {featured.thumbnailUrl ? (
                <img src={featured.thumbnailUrl} alt={featured.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
              ) : (
                <div style={{ position: 'absolute', inset: 0, background: '#1a1a2a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 80, color: '#2a2a3a' }}>▶</span>
                </div>
              )}
              {/* Gradient overlay */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #141414 0%, rgba(20,20,20,0.5) 50%, rgba(20,20,20,0.1) 100%)' }} />
              <div style={{ position: 'relative', zIndex: 2, maxWidth: 480 }}>
                <span style={{ display: 'inline-block', background: '#E50914', color: 'white', fontSize: 11, padding: '3px 10px', borderRadius: 3, marginBottom: 10, letterSpacing: '0.05em' }}>Featured</span>
                <h1 style={{ fontSize: 28, fontWeight: 500, color: '#fff', marginBottom: 8, lineHeight: 1.2 }}>{featured.title}</h1>
                {featured.description && (
                  <p style={{ fontSize: 13, color: '#aaa', marginBottom: 16, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {featured.description}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 10 }}>
                  <a href={`/videos/${featured.id}`} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', color: '#000', border: 'none', borderRadius: 4, padding: '8px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer', textDecoration: 'none' }}>
                    ▶ Play
                  </a>
                  <a href={`/videos/${featured.id}`} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(109,109,110,0.5)', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 20px', fontSize: 14, cursor: 'pointer', textDecoration: 'none' }}>
                    ⓘ More info
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Trending Row */}
          {trending.length > 0 && (
            <Section title="Trending now" videos={trending} />
          )}

          {/* Recent Row */}
          {recent.length > 0 && (
            <Section title="Recently uploaded" videos={recent} />
          )}

          {/* Load More */}
          {hasMore && (
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={loading}
                style={{ background: 'transparent', border: '1px solid #333', color: '#aaa', padding: '10px 32px', borderRadius: 4, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {loading ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Section({ title, videos }) {
  return (
    <div style={{ padding: '1.5rem 1.5rem 0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: 16, fontWeight: 500, color: '#e5e5e5' }}>{title}</h2>
        <span style={{ fontSize: 12, color: '#aaa', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
          See all <ChevronRight size={12} />
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 6 }}>
        {videos.map(video => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
