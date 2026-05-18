import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadAPI, videoAPI } from '../api/services';
import { Upload as UploadIcon, AlertCircle, CheckCircle, Loader } from 'lucide-react';

export default function Upload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [videoDetails, setVideoDetails] = useState({
    title: '',
    description: '',
    category: '',
    visibility: 'PUBLIC',
    videoUrl: 'http://...',
    thumbnailUrl: 'http://...'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Track each sequential step's status
  const [statusSteps, setStatusSteps] = useState({
    metadata: 'idle',  // idle | loading | done | error
    upload: 'idle',
  });

  const updateStatus = (key, value) =>
    setStatusSteps(prev => ({ ...prev, [key]: value }));

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith('video/')) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please select a valid video file');
      }
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

    // Step 1: Save metadata first
    let createdVideo;
    try {
      updateStatus('metadata', 'loading');
      const response = await videoAPI.createVideo(videoDetails);
      createdVideo = response.data;
      updateStatus('metadata', 'done');
    } catch (err) {
      updateStatus('metadata', 'error');
      setError(err.response?.data?.error || 'Failed to save video details. Please try again.');
      setSubmitting(false);
      return; // stop here, don't proceed to upload
    }

    // Step 2: Upload file against the created video ID
    try {
      updateStatus('upload', 'loading');
      await uploadAPI.uploadVideo(file, createdVideo.id);
      updateStatus('upload', 'done');
      navigate(`/videos/${createdVideo.id}`);
    } catch (err) {
      updateStatus('upload', 'error');
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
      setSubmitting(false);
    }
  };

  const StepIndicator = ({ label, status }) => (
    <div className="flex items-center gap-2 text-sm">
      {status === 'idle' && <div className="w-4 h-4 rounded-full border border-gray-500" />}
      {status === 'loading' && <Loader size={16} className="animate-spin text-blue-400" />}
      {status === 'done' && <CheckCircle size={16} className="text-green-400" />}
      {status === 'error' && <AlertCircle size={16} className="text-red-400" />}
      <span className={
        status === 'done' ? 'text-green-400' :
        status === 'error' ? 'text-red-400' :
        status === 'loading' ? 'text-blue-400' :
        'text-gray-500'
      }>
        {label}
      </span>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">Upload Video</h1>
      <p className="text-gray-400 mb-8">Share your video with the world</p>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-6 flex gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-8 border border-gray-700 space-y-6">

        {/* File Picker */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-4">
            Select Video File
          </label>
          <div className="relative border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              disabled={submitting}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="pointer-events-none">
              <UploadIcon size={48} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-300">
                {file ? file.name : 'Drag and drop or click to select video'}
              </p>
              <p className="text-gray-500 text-sm">MP4, WebM, or other video formats</p>
            </div>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={videoDetails.title}
            onChange={handleInputChange}
            disabled={submitting}
            required
            className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:opacity-50"
            placeholder="Enter video title"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={videoDetails.description}
            onChange={handleInputChange}
            disabled={submitting}
            rows="4"
            className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:opacity-50"
            placeholder="Enter video description"
          ></textarea>
        </div>

        {/* Category + Visibility */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Category
            </label>
            <input
              type="text"
              name="category"
              value={videoDetails.category}
              onChange={handleInputChange}
              disabled={submitting}
              className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:opacity-50"
              placeholder="e.g., Education, Music, Gaming"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Visibility
            </label>
            <select
              name="visibility"
              value={videoDetails.visibility}
              onChange={handleInputChange}
              disabled={submitting}
              className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
            >
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
              <option value="UNLISTED">Unlisted</option>
            </select>
          </div>
        </div>

        {/* Sequential step status — only shown after submit */}
        {(submitting || statusSteps.metadata !== 'idle') && (
          <div className="bg-gray-700 rounded-lg px-4 py-3 space-y-2">
            <StepIndicator label="Saving video details..." status={statusSteps.metadata} />
            <StepIndicator label="Uploading video file..." status={statusSteps.upload} />
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition"
        >
          {submitting ? 'Publishing...' : 'Publish Video'}
        </button>
      </form>
    </div>
  );
}
