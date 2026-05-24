import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoAPI, uploadAPI } from '../api/services';
import { Upload as UploadIcon, AlertCircle, CheckCircle, Loader, Play } from 'lucide-react';

const CATEGORIES = ['Education', 'Technology', 'Gaming', 'Entertainment', 'Music', 'Other'];

export default function Upload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [videoDetails, setVideoDetails] = useState({
    title: '',
    description: '',
    visibility: 'PUBLIC',
    category: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [statusSteps, setStatusSteps] = useState({
    metadata: 'idle',
    initiate: 'idle',
    upload: 'idle',
    thumbnail: 'idle',
  });

  const updateStatus = (key, value) =>
    setStatusSteps(prev => ({ ...prev, [key]: value }));

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (selectedFile.type.startsWith('video/')) {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a valid video file');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVideoDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoDetails.title) return setError('Please enter a title');
    if (!file) return setError('Please select a video file');

    setSubmitting(true);
    setError('');

    // Step 1: Save metadata
    let createdVideo;
    try {
      updateStatus('metadata', 'loading');
      const response = await videoAPI.createVideo(videoDetails);
      createdVideo = response.data;
      updateStatus('metadata', 'done');
    } catch (err) {
      updateStatus('metadata', 'error');
      setError(err.response?.data?.error || 'Failed to save video details.');
      setSubmitting(false);
      return;
    }

    let videoId;
    try {
      // Step 2: Initiate upload
      updateStatus('initiate', 'loading');
      const initiateResponse = await uploadAPI.initiateUpload({
        videoId: createdVideo.id,
        fileName: file.name,
        contentType: file.type,
      });
      const { video_id, presigned_url } = initiateResponse.data;
      videoId = video_id;
      updateStatus('initiate', 'done');

      // Step 3: Upload to MinIO
      updateStatus('upload', 'loading');
      const uploadResponse = await uploadAPI.uploadToMinIO(presigned_url, file);
      if (!uploadResponse.ok) throw new Error(`Upload failed with status ${uploadResponse.status}`);
      updateStatus('upload', 'done');

      // Step 4: Generate thumbnail
      updateStatus('thumbnail', 'loading');
      await uploadAPI.generateThumbnail(videoId);
      updateStatus('thumbnail', 'done');

      setTimeout(() => navigate(`/videos/${videoId}`), 1000);
    } catch (err) {
      const failedStep = statusSteps.initiate === 'loading' ? 'initiate'
        : statusSteps.upload === 'loading' ? 'upload' : 'thumbnail';
      updateStatus(failedStep, 'error');
      setError(err.response?.data?.error || err.message || 'Upload failed.');
      setSubmitting(false);
    }
  };

  const progress = Object.values(statusSteps).filter(s => s === 'done').length;
  const totalSteps = Object.keys(statusSteps).length;
  const progressPct = (progress / totalSteps) * 100;

  return (
    <div style={{ background: '#141414', minHeight: '100vh', margin: '-2rem -1rem', padding: 0 }}>
      {/* Header */}
      <div style={{ padding: '2rem 2rem 1rem', borderBottom: '1px solid #222' }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, color: '#fff', marginBottom: 4 }}>Upload video</h1>
        <p style={{ fontSize: 13, color: '#777' }}>Share your content with StreamBox viewers</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', minHeight: 'calc(100vh - 113px)' }}>
        {/* Left — Form */}
        <div style={{ padding: '2rem', borderRight: '1px solid #222' }}>
          {error && (
            <div style={{ background: 'rgba(229,9,20,0.1)', border: '1px solid rgba(229,9,20,0.3)', color: '#f09595', padding: '10px 14px', borderRadius: 4, marginBottom: '1.5rem', display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
              <AlertCircle size={15} /> {error}
            </div>
          )}

          {/* Drop Zone */}
          <div
            onClick={() => !submitting && document.getElementById('fileInput').click()}
            style={{
              border: `2px dashed ${file ? '#E50914' : '#333'}`,
              borderRadius: 8,
              padding: '3rem 1rem',
              textAlign: 'center',
              cursor: submitting ? 'not-allowed' : 'pointer',
              background: file ? 'rgba(229,9,20,0.05)' : 'transparent',
              marginBottom: '1.5rem',
              transition: 'all 0.2s',
            }}
          >
            <UploadIcon size={40} color={file ? '#E50914' : '#444'} style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, color: file ? '#fff' : '#888', marginBottom: 4 }}>
              {file ? file.name : 'Drag and drop or click to select'}
            </p>
            <p style={{ fontSize: 12, color: '#555' }}>
              {file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : 'MP4, WebM, MOV up to 10 GB'}
            </p>
            <input id="fileInput" type="file" accept="video/*" onChange={handleFileChange} disabled={submitting} style={{ display: 'none' }} />
          </div>

          {/* Title */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Title <span style={{ color: '#E50914' }}>*</span></label>
            <input name="title" type="text" value={videoDetails.title} onChange={handleInputChange} disabled={submitting} placeholder="Give your video a great title" style={inputStyle(submitting)} />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Description</label>
            <textarea name="description" value={videoDetails.description} onChange={handleInputChange} disabled={submitting} rows={4} placeholder="Tell viewers about your video…" style={{ ...inputStyle(submitting), resize: 'vertical', minHeight: 90 }} />
          </div>

          {/* Category + Visibility */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Category</label>
              <select name="category" value={videoDetails.category} onChange={handleInputChange} disabled={submitting} style={{ ...inputStyle(submitting), cursor: 'pointer' }}>
                <option value="">Select…</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Visibility</label>
              <select name="visibility" value={videoDetails.visibility} onChange={handleInputChange} disabled={submitting} style={{ ...inputStyle(submitting), cursor: 'pointer' }}>
                <option value="PUBLIC">Public</option>
                <option value="UNLISTED">Unlisted</option>
                <option value="PRIVATE">Private</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: '100%', padding: '12px',
              background: submitting ? '#333' : '#E50914',
              color: submitting ? '#666' : 'white',
              border: 'none', borderRadius: 4,
              fontSize: 15, fontWeight: 500,
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', transition: 'background 0.15s',
            }}
          >
            {submitting ? 'Publishing…' : 'Publish video'}
          </button>
        </div>

        {/* Right — Sidebar */}
        <div style={{ padding: '2rem', background: '#1a1a1a' }}>
          <p style={sidebarTitleStyle}>Preview</p>

          {/* Thumbnail preview */}
          <div style={{ background: '#0a0a0a', borderRadius: 8, aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', border: '1px solid #2a2a2a', overflow: 'hidden' }}>
            {file ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <Play size={36} color="#E50914" fill="#E50914" />
                <p style={{ fontSize: 11, color: '#555', textAlign: 'center', padding: '0 1rem' }}>{file.name}</p>
              </div>
            ) : (
              <Play size={40} color="#2a2a2a" />
            )}
          </div>

          {/* Live title preview */}
          <p style={{ fontSize: 14, fontWeight: 500, color: videoDetails.title ? '#fff' : '#444', marginBottom: 4, transition: 'color 0.2s' }}>
            {videoDetails.title || 'No title yet'}
          </p>
          <p style={{ fontSize: 12, color: '#555', marginBottom: '1.5rem' }}>
            {file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : 'No file selected'}
          </p>

          {/* Progress bar */}
          {submitting && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ height: 3, background: '#2a2a2a', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: 3, background: '#E50914', borderRadius: 99, width: `${progressPct}%`, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          )}

          <p style={sidebarTitleStyle}>Upload steps</p>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              { key: 'metadata',  label: 'Save video details',   sub: { idle: 'Waiting…', loading: 'Saving…', done: 'Saved', error: 'Failed' } },
              { key: 'initiate',  label: 'Initiate upload',       sub: { idle: 'Waiting…', loading: 'Getting URL…', done: 'Ready', error: 'Failed' } },
              { key: 'upload',    label: 'Upload to storage',     sub: { idle: 'Waiting…', loading: 'Uploading…', done: 'Uploaded', error: 'Failed' } },
              { key: 'thumbnail', label: 'Generate thumbnail',    sub: { idle: 'Waiting…', loading: 'Extracting frame…', done: 'Done', error: 'Failed' } },
            ].map(({ key, label, sub }, i) => {
              const state = statusSteps[key];
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < 3 ? '1px solid #222' : 'none' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12,
                    background: state === 'done' ? '#E50914' : 'transparent',
                    border: `1px solid ${state === 'done' ? '#E50914' : state === 'active' ? '#E50914' : state === 'error' ? '#a32d2d' : '#333'}`,
                    color: state === 'done' ? 'white' : state === 'error' ? '#f09595' : state === 'loading' ? '#E50914' : '#555',
                  }}>
                    {state === 'done' ? <CheckCircle size={14} /> :
                     state === 'loading' ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> :
                     state === 'error' ? <AlertCircle size={14} /> : i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, color: state === 'done' || state === 'loading' ? '#fff' : '#aaa', marginBottom: 2 }}>{label}</p>
                    <p style={{ fontSize: 11, color: state === 'loading' ? '#E50914' : state === 'error' ? '#f09595' : '#555' }}>{sub[state] || 'Waiting…'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const labelStyle = {
  display: 'block', fontSize: 12, color: '#888',
  marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em',
};

const inputStyle = (disabled) => ({
  width: '100%', background: '#2a2a2a',
  border: '1px solid #333', borderRadius: 4,
  padding: '10px 14px', fontSize: 14, color: '#fff',
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  opacity: disabled ? 0.5 : 1,
});

const sidebarTitleStyle = {
  fontSize: 12, fontWeight: 500, color: '#666',
  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem',
};
