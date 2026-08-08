import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { toast } from 'react-hot-toast';
import { MdArrowBack, MdSave, MdPublish, MdPreview } from 'react-icons/md';
import './JournalPages.css';

const EditJournalPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  // We determine edit mode based on whether the page already exists in the DB or not
  const [isEditMode, setIsEditMode] = useState(false);

  const getDefaultTitle = (s) => {
    if (s === 'author-submission-guidelines') return 'Author / Submission Guidelines';
    if (s === 'peer-review-policy') return 'Peer Review Policy';
    if (s === 'ethics-malpractice-statement') return 'Ethics & Malpractice Statement';
    return '';
  };

  const [formData, setFormData] = useState({
    _id: '',
    title: getDefaultTitle(slug),
    slug: slug || '',
    shortDescription: '',
    content: '',
    status: 'draft',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'blockquote', 'code-block'],
      ['clean']
    ],
  };

  useEffect(() => {
    if (slug) {
      const fetchPage = async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/journal-pages/admin/${slug}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
          });
          if (res.ok) {
            const data = await res.json();
            setFormData(data);
            setIsEditMode(true);
          } else {
            // Not found, will start as create mode
            setIsEditMode(false);
          }
        } catch (error) {
          console.error('Error fetching page:', error);
        } finally {
          setFetching(false);
        }
      };
      fetchPage();
    } else {
      setFetching(false);
    }
  }, [slug, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContentChange = (content) => {
    setFormData({ ...formData, content });
  };

  const handleSave = async (status) => {
    setLoading(true);
    try {
      const payload = { ...formData, status };
      const url = isEditMode 
        ? `${import.meta.env.VITE_API_URL}/journal-pages/${slug}` 
        : `${import.meta.env.VITE_API_URL}/journal-pages`;
      
      const res = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(`Page ${status === 'published' ? 'published' : 'saved as draft'}!`);
        if (!isEditMode) setIsEditMode(true);
      } else {
        const err = await res.json();
        throw new Error(err.message || 'Error saving page');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    if (!formData.slug) {
      toast.error('Please add a slug first to preview.');
      return;
    }
    toast.success('Save as draft first, then click View in the list page.');
  };

  if (fetching) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading page data...</div>;

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">{isEditMode ? 'Edit ' + formData.title : 'Create ' + formData.title}</h1>
        </div>
        <div className="header-actions">
          <button className="btn-secondary-action" onClick={handlePreview}>
            <MdPreview /> Preview
          </button>
          <button className="btn-secondary-action" onClick={() => handleSave('draft')} disabled={loading}>
            <MdSave /> {loading ? 'Saving...' : 'Save Draft'}
          </button>
          <button className="btn-primary-action" onClick={() => handleSave('published')} disabled={loading}>
            <MdPublish /> {loading ? 'Publishing...' : (isEditMode && formData.status === 'published' ? 'Update & Publish' : 'Publish')}
          </button>
        </div>
      </div>

      <div className="card-panel">
        <h2>Basic Information</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Page Title * (Fixed)</label>
            <input 
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              placeholder="e.g., Peer Review Policy"
              required
              readOnly
              style={{ backgroundColor: '#f1f5f9' }}
            />
          </div>
          <div className="form-group">
            <label>URL Slug * (Fixed)</label>
            <input 
              type="text" 
              name="slug" 
              value={formData.slug} 
              onChange={handleChange} 
              placeholder="e.g., peer-review-policy"
              required
              readOnly
              style={{ backgroundColor: '#f1f5f9' }}
            />
          </div>
        </div>
        <div className="form-group" style={{ marginTop: '10px' }}>
          <label>Short Description / Intro</label>
          <textarea 
            name="shortDescription" 
            value={formData.shortDescription} 
            onChange={handleChange} 
            style={{ height: '80px' }}
            placeholder="A brief summary of the policy..."
          ></textarea>
        </div>
      </div>

      <div className="card-panel">
        <h2>Main Content *</h2>
        <div className="quill-container" style={{ height: '400px', marginBottom: '40px' }}>
          <ReactQuill 
            theme="snow" 
            value={formData.content} 
            onChange={handleContentChange} 
            modules={modules}
            style={{ height: '100%' }}
          />
        </div>
      </div>

      <div className="card-panel">
        <h2>SEO Settings (Optional)</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>SEO Title</label>
            <input 
              type="text" 
              name="seoTitle" 
              value={formData.seoTitle} 
              onChange={handleChange} 
            />
          </div>
          <div className="form-group">
            <label>SEO Keywords (comma separated)</label>
            <input 
              type="text" 
              name="seoKeywords" 
              value={formData.seoKeywords} 
              onChange={handleChange} 
            />
          </div>
        </div>
        <div className="form-group" style={{ marginTop: '10px' }}>
          <label>SEO Description</label>
          <textarea 
            name="seoDescription" 
            value={formData.seoDescription} 
            onChange={handleChange} 
            style={{ height: '80px' }}
          ></textarea>
        </div>
      </div>
      
    </div>
  );
};

export default EditJournalPage;
