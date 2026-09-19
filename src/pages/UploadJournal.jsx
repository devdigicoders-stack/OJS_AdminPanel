import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MdCloudUpload,
  MdArrowBack,
  MdCheckCircle,
  MdDelete,
  MdAdd,
  MdDescription,
  MdPerson,
  MdMenuBook,
  MdAttachFile,
  MdImage,
  MdPictureAsPdf,
  MdSend
} from 'react-icons/md';
import toast from 'react-hot-toast';
import './UploadJournal.css';

const DEPARTMENTS = [
  'Social Science',
  'Humanities',
  'Arts',
  'Commerce',
  'Management',
  'Finance',
  'Administration',
  'Engineering',
  'Science',
  'Medical & Health Sciences',
  'Law & Legal Studies',
  'Other'
];

const UploadJournal = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const suppInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [mainFile, setMainFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [additionalFiles, setAdditionalFiles] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    researchArea: '',
    department: '',
    language: 'English',
    abstract: '',
    pages: '',
    primaryAuthor: '',
    email: '',
    phoneCode: '+91',
    phone: '',
    coAuthors: '',
    status: 'Pending Review',
    volume: 'Vol 1',
    issue: 'Issue 1',
    doi: ''
  });

  const [keywords, setKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleKeywordKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const parts = newKeyword.split(',').map(k => k.trim()).filter(Boolean);
      if (parts.length > 0) {
        setKeywords(prev => {
          const updated = [...prev];
          parts.forEach(p => {
            if (!updated.includes(p)) updated.push(p);
          });
          return updated;
        });
        setNewKeyword('');
      }
    }
  };

  const removeKeyword = (kw) => {
    setKeywords(keywords.filter(k => k !== kw));
  };

  const handleMainFile = (file) => {
    if (!file) return;
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    const ext = file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(file.type) && !['pdf', 'doc', 'docx'].includes(ext)) {
      toast.error('Only PDF or DOCX files allowed for manuscript!');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error('File size must be under 25MB!');
      return;
    }
    setMainFile(file);
    toast.success(`Manuscript "${file.name}" selected!`);
  };

  const handleImageFile = (file) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    const ext = file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(file.type) && !['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      toast.error('Only JPG, PNG or WEBP allowed for thumbnail!');
      return;
    }
    setImageFile(file);
    toast.success(`Cover image "${file.name}" selected!`);
  };

  const handleSuppFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files || files.length === 0) return;
    const newItems = files.map(file => ({
      file,
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
    }));
    setAdditionalFiles(prev => [...prev, ...newItems]);
    toast.success(`${files.length} supplementary file(s) added!`);
    e.target.value = '';
  };

  const removeSuppFile = (idx) => {
    setAdditionalFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Auto commit pending keyword text
    let finalKeywords = [...keywords];
    if (newKeyword && newKeyword.trim()) {
      const parts = newKeyword.split(',').map(k => k.trim()).filter(Boolean);
      parts.forEach(p => {
        if (!finalKeywords.includes(p)) finalKeywords.push(p);
      });
      setKeywords(finalKeywords);
      setNewKeyword('');
    }

    if (!mainFile) {
      toast.error('Please upload the main manuscript file (PDF or DOCX)');
      return;
    }
    if (!formData.title.trim()) {
      toast.error('Paper title is required');
      return;
    }
    if (!formData.department) {
      toast.error('Department is required');
      return;
    }
    if (!formData.researchArea.trim()) {
      toast.error('Research area / Subject is required');
      return;
    }
    if (!formData.abstract.trim()) {
      toast.error('Abstract is required');
      return;
    }
    if (finalKeywords.length === 0) {
      toast.error('Please add at least one keyword');
      return;
    }
    if (!formData.primaryAuthor.trim()) {
      toast.error('Primary Author name is required');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Author email is required');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('adminToken');

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('abstract', formData.abstract);
      data.append('department', formData.department);
      data.append('researchArea', formData.researchArea);
      data.append('language', formData.language);
      data.append('pages', formData.pages || '10');
      data.append('keywords', JSON.stringify(finalKeywords));
      data.append('primaryAuthorName', formData.primaryAuthor);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('phoneCode', formData.phoneCode);
      data.append('coAuthors', formData.coAuthors);
      data.append('status', formData.status);
      data.append('volume', formData.volume || '-');
      data.append('issue', formData.issue || '-');
      data.append('doi', formData.doi || '-');

      data.append('mainFile', mainFile);

      if (imageFile) {
        data.append('image', imageFile);
      }

      if (additionalFiles.length > 0) {
        additionalFiles.forEach(af => {
          data.append('additionalFiles', af.file);
        });
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/journals/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to upload journal');
      }

      const newJournal = await res.json();
      toast.success('Journal uploaded successfully!');
      navigate(`/journals/${newJournal._id}`);
    } catch (err) {
      console.error('Upload Error', err);
      toast.error(err.message || 'Error uploading journal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-upload-page">
      <div className="upload-header">
        <div className="header-back">
          <button className="back-btn" onClick={() => navigate('/journals')}>
            <MdArrowBack /> Back to Journals
          </button>
          <h2>Direct Journal Upload (Admin)</h2>
        </div>
        <p className="header-subtitle">
          Upload and register a new research paper or article directly from Admin Panel with custom initial status.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="upload-form-grid">
        <div className="upload-main-col">
          
          {/* File Upload Box */}
          <div className="form-card">
            <div className="card-title">
              <MdCloudUpload className="title-icon" />
              <h3>1. Upload Manuscript & Files</h3>
            </div>

            <div className="dropzone-container">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files[0] && handleMainFile(e.target.files[0])}
              />
              <div
                className={`upload-dropzone ${mainFile ? 'has-file' : ''}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="dropzone-icon">
                  <MdPictureAsPdf size={36} />
                </div>
                {mainFile ? (
                  <div className="dropzone-text">
                    <strong className="selected-filename">✓ {mainFile.name}</strong>
                    <span>{(mainFile.size / 1024 / 1024).toFixed(2)} MB — Click to replace manuscript</span>
                  </div>
                ) : (
                  <div className="dropzone-text">
                    <strong>Click or Drag & Drop Main Manuscript (PDF / DOCX) *</strong>
                    <span>Maximum file size: 25MB</span>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail & Supplementary Uploads */}
            <div className="sub-uploads-grid">
              {/* Cover Thumbnail */}
              <div className="sub-upload-card">
                <label><MdImage /> Cover / Thumbnail Image (Optional)</label>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  style={{ display: 'none' }}
                  onChange={(e) => e.target.files[0] && handleImageFile(e.target.files[0])}
                />
                <button
                  type="button"
                  className="sub-upload-btn"
                  onClick={() => imageInputRef.current?.click()}
                >
                  {imageFile ? `✓ ${imageFile.name}` : '+ Choose Cover Image'}
                </button>
              </div>

              {/* Supplementary Files */}
              <div className="sub-upload-card">
                <label><MdAttachFile /> Supplementary Files / Datasets (Optional)</label>
                <input
                  ref={suppInputRef}
                  type="file"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleSuppFiles}
                />
                <button
                  type="button"
                  className="sub-upload-btn"
                  onClick={() => suppInputRef.current?.click()}
                >
                  + Add Supplementary Files
                </button>
              </div>
            </div>

            {additionalFiles.length > 0 && (
              <div className="supp-list">
                <strong>Supplementary Files List ({additionalFiles.length}):</strong>
                {additionalFiles.map((af, idx) => (
                  <div key={idx} className="supp-item">
                    <span>{af.name} ({af.size})</span>
                    <button type="button" onClick={() => removeSuppFile(idx)}><MdDelete /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Paper Information Card */}
          <div className="form-card">
            <div className="card-title">
              <MdMenuBook className="title-icon" />
              <h3>2. Paper Information</h3>
            </div>

            <div className="form-group">
              <label>Paper Title <span className="req">*</span></label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter complete journal / paper title"
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Department <span className="req">*</span></label>
                <select name="department" value={formData.department} onChange={handleInputChange} required>
                  <option value="">-- Select Department --</option>
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Research Area / Subject <span className="req">*</span></label>
                <input
                  type="text"
                  name="researchArea"
                  value={formData.researchArea}
                  onChange={handleInputChange}
                  placeholder="e.g. Sociology, Machine Learning"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Abstract <span className="req">*</span></label>
              <textarea
                name="abstract"
                value={formData.abstract}
                onChange={handleInputChange}
                rows="5"
                placeholder="Paste or write abstract here..."
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Publication Language</label>
                <select name="language" value={formData.language} onChange={handleInputChange}>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>

              <div className="form-group">
                <label>Number of Pages</label>
                <input
                  type="number"
                  name="pages"
                  value={formData.pages}
                  onChange={handleInputChange}
                  placeholder="e.g. 12"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Keywords (Press Enter or comma to add) <span className="req">*</span></label>
              <div className="keywords-input-box">
                {keywords.map(kw => (
                  <span key={kw} className="kw-tag">
                    {kw}
                    <MdDelete onClick={() => removeKeyword(kw)} />
                  </span>
                ))}
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={handleKeywordKeyDown}
                  placeholder={keywords.length === 0 ? "Type keyword and press Enter" : ""}
                />
              </div>
            </div>
          </div>

        </div>

        {/* ── Sidebar Column ── */}
        <div className="upload-sidebar-col">
          
          {/* Initial Status & Publishing */}
          <div className="form-card">
            <div className="card-title">
              <MdDescription className="title-icon" />
              <h3>Status & Publication</h3>
            </div>

            <div className="form-group">
              <label>Initial Status</label>
              <select name="status" value={formData.status} onChange={handleInputChange} className="status-dropdown">
                <option value="Pending Review">Pending Review</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved">Approved</option>
                <option value="Published">Published (Direct)</option>
              </select>
            </div>

            {formData.status === 'Published' && (
              <div className="pub-extra-fields">
                <div className="form-group">
                  <label>Volume</label>
                  <input type="text" name="volume" value={formData.volume} onChange={handleInputChange} placeholder="Vol 1" />
                </div>
                <div className="form-group">
                  <label>Issue</label>
                  <input type="text" name="issue" value={formData.issue} onChange={handleInputChange} placeholder="Issue 1" />
                </div>
                <div className="form-group">
                  <label>DOI (Optional)</label>
                  <input type="text" name="doi" value={formData.doi} onChange={handleInputChange} placeholder="10.1234/praxis.xx" />
                </div>
              </div>
            )}
          </div>

          {/* Author Details Card */}
          <div className="form-card">
            <div className="card-title">
              <MdPerson className="title-icon" />
              <h3>Author Information</h3>
            </div>

            <div className="form-group">
              <label>Primary Author Name <span className="req">*</span></label>
              <input
                type="text"
                name="primaryAuthor"
                value={formData.primaryAuthor}
                onChange={handleInputChange}
                placeholder="Dr. John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address <span className="req">*</span></label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="author@domain.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <div className="phone-row">
                <select name="phoneCode" value={formData.phoneCode} onChange={handleInputChange} style={{ width: '85px' }}>
                  <option value="+91">+91</option>
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                </select>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="9876543210"
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Co-authors (if any)</label>
              <input
                type="text"
                name="coAuthors"
                value={formData.coAuthors}
                onChange={handleInputChange}
                placeholder="Names separated by comma"
              />
            </div>
          </div>

          {/* Submit Button Card */}
          <button type="submit" className="submit-journal-btn" disabled={loading}>
            <MdSend size={18} /> {loading ? 'Uploading Journal...' : 'Upload & Create Journal'}
          </button>

        </div>
      </form>
    </div>
  );
};

export default UploadJournal;
