import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { MdSave, MdImage, MdVideoLibrary, MdLink } from 'react-icons/md';
import './JournalPages.css';

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
  background: '#f8fafc',
  boxSizing: 'border-box'
};

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '600',
  color: '#475569',
  marginBottom: '6px'
};

const ManageHero = () => {
  const [hero, setHero] = useState({
    title: '',
    subtitle: '',
    badge: '',
    primaryButtonText: '',
    primaryButtonLink: '',
    secondaryButtonText: '',
    secondaryButtonLink: '',
    backgroundType: 'video',
    backgroundUrl: '',
    overlayOpacity: '70'
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/home-page`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.hero) {
            setHero({ ...hero, ...data.hero });
            if (data.hero.backgroundUrl) setPreview(data.hero.backgroundUrl);
          }
        }
      } catch (error) {
        console.error('Error fetching hero data:', error);
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHero(prev => ({ ...prev, [name]: value }));
    // Clear preview if url changes
    if (name === 'backgroundUrl') setPreview(value);
  };

  const handleBgTypeChange = (type) => {
    setHero(prev => ({ ...prev, backgroundType: type, backgroundUrl: '' }));
    setPreview(null);
  };

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('media', file);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/home-page/upload-hero-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        const backendUrl = import.meta.env.VITE_API_URL.replace('/api', '');
        const fullUrl = `${backendUrl}${data.imageUrl}`;
        setHero(prev => ({ ...prev, backgroundUrl: fullUrl }));
        setPreview(fullUrl);
        toast.success('Media uploaded successfully!');
      } else {
        toast.error(data.message || 'Upload failed');
      }
    } catch (error) {
      toast.error('Error uploading media');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/home-page`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ hero })
      });
      if (res.ok) {
        toast.success('Hero section saved successfully!');
      } else {
        const err = await res.json();
        throw new Error(err.message || 'Failed to save');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading hero data...</div>;

  return (
    <div className="page-container" style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '80px' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Manage Hero Section</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Customize the home page banner — text, buttons, and background.
          </p>
        </div>
        <button className="btn-primary-action" onClick={handleSave} disabled={loading}>
          <MdSave /> {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Live Preview Bar */}
      {preview && (
        <div style={{ marginBottom: '20px', borderRadius: '12px', overflow: 'hidden', height: '160px', position: 'relative' }}>
          {hero.backgroundType === 'image' ? (
            <img src={preview} alt="Hero preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <video key={preview} src={preview} muted autoPlay loop style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: `rgba(15,118,110,${hero.overlayOpacity / 100})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '2px' }}>{hero.badge}</div>
              <div style={{ fontSize: '18px', fontWeight: 800, lineHeight: 1.3 }}>{hero.title || 'Your Title Here'}</div>
            </div>
          </div>
          <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '11px', padding: '3px 8px', borderRadius: '20px' }}>
            Live Preview
          </div>
        </div>
      )}

      {/* Background Type */}
      <div className="card-panel" style={{ marginBottom: '16px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '16px' }}>Background Type</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => handleBgTypeChange('video')}
            style={{
              flex: 1, padding: '16px', borderRadius: '12px', border: '2px solid',
              borderColor: hero.backgroundType === 'video' ? '#0f766e' : '#e2e8f0',
              background: hero.backgroundType === 'video' ? '#f0fdfa' : 'white',
              cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'
            }}
          >
            <MdVideoLibrary size={28} style={{ color: hero.backgroundType === 'video' ? '#0f766e' : '#94a3b8' }} />
            <span style={{ fontWeight: 700, fontSize: '14px', color: hero.backgroundType === 'video' ? '#0f766e' : '#64748b' }}>Video</span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Upload or paste URL</span>
          </button>
          <button
            onClick={() => handleBgTypeChange('image')}
            style={{
              flex: 1, padding: '16px', borderRadius: '12px', border: '2px solid',
              borderColor: hero.backgroundType === 'image' ? '#0f766e' : '#e2e8f0',
              background: hero.backgroundType === 'image' ? '#f0fdfa' : 'white',
              cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'
            }}
          >
            <MdImage size={28} style={{ color: hero.backgroundType === 'image' ? '#0f766e' : '#94a3b8' }} />
            <span style={{ fontWeight: 700, fontSize: '14px', color: hero.backgroundType === 'image' ? '#0f766e' : '#64748b' }}>Image</span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Upload or paste URL</span>
          </button>
        </div>

        {/* Background URL / Upload */}
        <div style={{ marginTop: '16px' }}>
          <label style={labelStyle}>
            {hero.backgroundType === 'video' ? 'Video URL or Upload' : 'Image URL or Upload'}
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              name="backgroundUrl"
              value={hero.backgroundUrl}
              onChange={handleChange}
              placeholder={hero.backgroundType === 'video'
                ? 'https://example.com/video.mp4'
                : 'https://example.com/image.jpg'
              }
              style={{ ...inputStyle, flex: 1 }}
            />
            <label style={{
              cursor: 'pointer', background: '#0f766e', color: 'white',
              padding: '10px 16px', borderRadius: '8px', fontSize: '13px',
              display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap',
              opacity: uploading ? 0.7 : 1
            }}>
              {hero.backgroundType === 'video' ? <MdVideoLibrary /> : <MdImage />} 
              {uploading ? 'Uploading...' : 'Upload'}
              <input 
                type="file" 
                accept={hero.backgroundType === 'video' ? "video/mp4,video/webm" : "image/*"} 
                style={{ display: 'none' }} 
                onChange={handleMediaUpload} 
                disabled={uploading} 
              />
            </label>
          </div>
        </div>

        {/* Overlay Opacity */}
        <div style={{ marginTop: '16px' }}>
          <label style={labelStyle}>Overlay Darkness: {hero.overlayOpacity}%</label>
          <input
            type="range" min="30" max="90" step="5"
            name="overlayOpacity"
            value={hero.overlayOpacity}
            onChange={handleChange}
            style={{ width: '100%' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
            <span>Lighter (30%)</span><span>Darker (90%)</span>
          </div>
        </div>
      </div>

      {/* Text Content */}
      <div className="card-panel" style={{ marginBottom: '16px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '16px' }}>Text Content</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Badge Text (small label above title)</label>
            <input type="text" name="badge" value={hero.badge} onChange={handleChange} style={inputStyle} placeholder="e.g. Empowering Global Scientific Research" />
          </div>
          <div>
            <label style={labelStyle}>Main Title (H1)</label>
            <input type="text" name="title" value={hero.title} onChange={handleChange} style={inputStyle} placeholder="e.g. Journal of society, behaviour and institutions" />
          </div>
          <div>
            <label style={labelStyle}>Subtitle / Description</label>
            <textarea name="subtitle" value={hero.subtitle} onChange={handleChange} rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Short description under the title..."
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="card-panel">
        <h2 style={{ marginBottom: '16px', fontSize: '16px' }}>Buttons</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Primary Button Text</label>
            <input type="text" name="primaryButtonText" value={hero.primaryButtonText} onChange={handleChange} style={inputStyle} placeholder="e.g. Submit Manuscript" />
          </div>
          <div>
            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '4px' }}><MdLink /> Primary Button Link</label>
            <input type="text" name="primaryButtonLink" value={hero.primaryButtonLink} onChange={handleChange} style={inputStyle} placeholder="e.g. /journals" />
          </div>
          <div>
            <label style={labelStyle}>Secondary Button Text</label>
            <input type="text" name="secondaryButtonText" value={hero.secondaryButtonText} onChange={handleChange} style={inputStyle} placeholder="e.g. Explore Publications" />
          </div>
          <div>
            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '4px' }}><MdLink /> Secondary Button Link</label>
            <input type="text" name="secondaryButtonLink" value={hero.secondaryButtonLink} onChange={handleChange} style={inputStyle} placeholder="e.g. /journals" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageHero;
