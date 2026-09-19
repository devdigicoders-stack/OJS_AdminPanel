import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiUploadCloud, FiCheckCircle, FiPlus, FiTrash2,
  FiPaperclip, FiAlertCircle, FiBook, FiHelpCircle,
  FiMail, FiExternalLink, FiArrowRight, FiChevronRight,
  FiUser, FiArrowLeft, FiSave, FiCheck, FiFileText, FiEdit2, FiSend,
  FiCopy, FiCalendar, FiUsers, FiEdit3, FiSettings, FiFolder, FiActivity, FiInfo
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const STEPS = [
  { num: 1, title: 'Upload File', desc: 'Completed' },
  { num: 2, title: 'Add Details', desc: 'Completed' },
  { num: 3, title: 'Review', desc: 'Completed' },
  { num: 4, title: 'Submit', desc: 'Completed' },
];

const GUIDELINES = [
  'Manuscript must be in PDF or DOCX format.',
  'Maximum file size should not exceed 25MB.',
  'Ensure text, tables, and figures are clear and readable.',
  'Remove all author identification from the manuscript if blinded review is needed.',
  "Follow the journal's formatting and citation style.",
];

const BEFORE_SUBMIT_TIPS = [
  'Ensure the manuscript file is correct and complete.',
  'Verify all author and corresponding author details.',
  'File format and content follow editorial guidelines.',
  'You can edit details before final submission.'
];

const UploadJournal = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const addFileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [mainFile, setMainFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [additionalFiles, setAdditionalFiles] = useState([]);
  const [submittedJournal, setSubmittedJournal] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ── Form State ──
  const [formData, setFormData] = useState({
    title: '',
    researchArea: '',
    department: '',
    language: 'English',
    abstract: '',
    pages: '',
    primaryAuthor: '',
    email: '',
    coAuthors: '',
    phoneCode: '+91',
    phone: '',
    isSameAuthor: true,
  });
  const [keywords, setKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // ── Drag & Drop ──
  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleMainFile(file);
  };

  const handleMainFile = (file) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    const ext = file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(file.type) && !['pdf', 'doc', 'docx'].includes(ext)) {
      toast.error('Only PDF or DOCX files allowed!');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error('File size must be under 25MB!');
      return;
    }
    setMainFile(file);
    toast.success(`"${file.name}" uploaded successfully!`);
  };

  const handleImageFile = (file) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    const ext = file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(file.type) && !['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      toast.error('Only JPEG, PNG, or WEBP images allowed!');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB!');
      return;
    }
    setImageFile(file);
    toast.success(`"${file.name}" uploaded as thumbnail!`);
  };

  const handleAddFile = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files || files.length === 0) return;
    const newFiles = files.map(file => {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      return { file, name: file.name, size: `${sizeMB} MB` };
    });
    setAdditionalFiles(prev => [...prev, ...newFiles]);
    toast.success(`${files.length} supplementary file(s) added!`);
    e.target.value = '';
  };

  const removeAdditional = (index) => setAdditionalFiles(prev => prev.filter((_, i) => i !== index));

  const commitKeyword = (text) => {
    if (!text || !text.trim()) return;
    const parts = text.split(',').map(k => k.trim()).filter(Boolean);
    setKeywords(prev => {
      const updated = [...prev];
      parts.forEach(p => {
        if (!updated.includes(p)) updated.push(p);
      });
      return updated;
    });
    setNewKeyword('');
  };

  const addKeyword = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commitKeyword(newKeyword);
    }
  };
  const removeKeyword = (kw) => setKeywords(keywords.filter(k => k !== kw));

  const handleNextStep1 = () => {
    if (!mainFile) { toast.error('Please upload your manuscript first!'); return; }
    setCurrentStep(2);
    window.scrollTo(0, 0);
  };

  const handleNextStep2 = () => {
    let currentKeywords = [...keywords];
    if (newKeyword && newKeyword.trim()) {
      const parts = newKeyword.split(',').map(k => k.trim()).filter(Boolean);
      parts.forEach(p => {
        if (!currentKeywords.includes(p)) currentKeywords.push(p);
      });
      setKeywords(currentKeywords);
      setNewKeyword('');
    }

    if (!formData.title.trim()) { toast.error('Journal Title is required'); return; }
    if (!formData.researchArea) { toast.error('Research Area is required'); return; }
    if (!formData.department) { toast.error('Department is required'); return; }
    if (!formData.abstract.trim()) { toast.error('Abstract is required'); return; }
    if (currentKeywords.length === 0) { toast.error('Please add at least one keyword'); return; }
    if (!formData.pages) { toast.error('Number of pages is required'); return; }
    if (!formData.primaryAuthor.trim()) { toast.error('Primary Author name is required'); return; }
    if (!formData.email.trim()) { toast.error('Author Email is required'); return; }
    if (!formData.phone.trim()) { toast.error('Corresponding Author phone is required'); return; }

    Swal.fire({
      title: 'Proceed to Review?',
      text: 'Save journal details and proceed to review.',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#2563EB',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Review Details →',
    }).then((result) => {
      if (result.isConfirmed) {
        toast.success('Details saved!');
        setCurrentStep(3);
        window.scrollTo(0, 0);
      }
    });
  };

  const handleNextStep3 = () => {
    const confirmed = document.getElementById('confirm-checkbox')?.checked;
    if (!confirmed) {
      toast.error('Please confirm that all information is accurate.');
      return;
    }
    Swal.fire({
      title: 'Submit Journal?',
      text: 'Are you sure you want to create and submit this research paper to the system?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563EB',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, Submit Journal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setSubmitting(true);
        try {
          const token = localStorage.getItem('adminToken');
          const data = new FormData();
          data.append('title', formData.title);
          data.append('abstract', formData.abstract);
          data.append('department', formData.department);
          data.append('researchArea', formData.researchArea);
          data.append('language', formData.language);
          data.append('pages', formData.pages);
          data.append('keywords', JSON.stringify(keywords));
          data.append('primaryAuthorName', formData.primaryAuthor);
          data.append('email', formData.email);
          data.append('phone', formData.phone);
          data.append('phoneCode', formData.phoneCode);
          data.append('coAuthors', formData.coAuthors);
          data.append('isSameAuthor', formData.isSameAuthor);

          if (mainFile) {
            data.append('mainFile', mainFile);
          }
          if (imageFile) {
            data.append('image', imageFile);
          }
          if (additionalFiles && additionalFiles.length > 0) {
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
          setSubmittedJournal(newJournal);
          toast.success('Journal submitted successfully!');
          setCurrentStep(4);
          window.scrollTo(0, 0);
        } catch (error) {
          toast.error(error.message || 'Error submitting journal');
        } finally {
          setSubmitting(false);
        }
      }
    });
  };

  const resetForm = () => {
    setMainFile(null);
    setImageFile(null);
    setAdditionalFiles([]);
    setKeywords([]);
    setSubmittedJournal(null);
    setFormData({
      title: '',
      researchArea: '',
      department: '',
      language: 'English',
      abstract: '',
      pages: '',
      primaryAuthor: '',
      email: '',
      coAuthors: '',
      phoneCode: '+91',
      phone: '',
      isSameAuthor: true,
    });
    setCurrentStep(1);
    toast.success('Form reset. You can submit another journal now!');
  };

  const cardStyle = {
    background: '#fff', borderRadius: '14px',
    border: '1px solid #E9ECF0', boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: '1px solid #E5E7EB', fontSize: '13.5px', color: '#111827',
    outline: 'none', transition: 'border 0.2s',
  };

  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' };
  
  const step3ReviewLabel = { fontSize: '12px', color: '#111827', fontWeight: 700, marginBottom: '2px' };
  const step3ReviewValue = { fontSize: '12.5px', color: '#4B5563', margin: 0, lineHeight: 1.5 };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '40px' }}>

      {/* ── Breadcrumb ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#9CA3AF' }}>
        <Link to="/journals" style={{ color: '#6B7280', textDecoration: 'none', fontWeight: 500 }}>Manage Journals</Link>
        <FiChevronRight size={13} />
        <span style={{ color: currentStep === 1 ? '#2563EB' : '#6B7280', fontWeight: currentStep === 1 ? 600 : 500, cursor: currentStep < 4 ? 'pointer' : 'default' }} onClick={() => currentStep < 4 && setCurrentStep(1)}>Upload Journal</span>
        {currentStep >= 2 && (
          <>
            <FiChevronRight size={13} />
            <span style={{ color: currentStep === 2 ? '#2563EB' : '#6B7280', fontWeight: currentStep === 2 ? 600 : 500, cursor: currentStep < 4 ? 'pointer' : 'default' }} onClick={() => currentStep < 4 && setCurrentStep(2)}>Add Details</span>
          </>
        )}
        {currentStep >= 3 && (
          <>
            <FiChevronRight size={13} />
            <span style={{ color: currentStep === 3 ? '#2563EB' : '#6B7280', fontWeight: currentStep === 3 ? 600 : 500, cursor: currentStep < 4 ? 'pointer' : 'default' }} onClick={() => currentStep < 4 && setCurrentStep(3)}>Review</span>
          </>
        )}
        {currentStep >= 4 && (
          <>
            <FiChevronRight size={13} />
            <span style={{ color: '#2563EB', fontWeight: 600 }}>Submit</span>
          </>
        )}
      </div>

      {/* ── Header ── */}
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', fontFamily: 'Poppins, sans-serif', margin: '4px 0 6px' }}>
          {currentStep === 1 ? 'Upload Journal' : currentStep === 2 ? 'Add Journal Details' : currentStep === 3 ? 'Review & Submit' : 'Submit Journal'}
        </h2>
        <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
          {currentStep === 1 ? 'Start by uploading your manuscript file.' : currentStep === 2 ? 'Provide accurate details about your research paper.' : currentStep === 3 ? 'Please review all details carefully before final submission.' : 'Congratulations! The journal has been uploaded and submitted successfully.'}
        </p>
      </div>

      {/* ── Step Progress ── */}
      <div style={{ ...cardStyle, padding: '20px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '18px', left: '10%', right: '10%', height: '2px', background: '#E5E7EB', zIndex: 0 }} />
          <div style={{ position: 'absolute', top: '18px', left: '10%', width: currentStep === 1 ? '0%' : currentStep === 2 ? '26.6%' : currentStep === 3 ? '53.3%' : '80%', height: '2px', background: '#2563EB', zIndex: 1, transition: 'width 0.3s ease' }} />

          {STEPS.map((step) => {
            const isCompleted = step.num < currentStep || currentStep === 4;
            const isActive = step.num === currentStep && currentStep !== 4;
            return (
              <div key={step.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 2, flex: 1 }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: isActive ? '#2563EB' : isCompleted ? '#22C55E' : '#F3F4F6',
                  border: `2px solid ${isActive ? '#2563EB' : isCompleted ? '#22C55E' : '#E5E7EB'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isActive || isCompleted ? '#fff' : '#9CA3AF',
                  fontWeight: 700, fontSize: '14px',
                  boxShadow: isActive ? '0 0 0 4px rgba(37,99,235,0.15)' : 'none',
                  transition: 'all 0.2s',
                }}>
                  {isCompleted ? <FiCheck size={18} /> : step.num}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '12.5px', fontWeight: isActive || isCompleted ? 700 : 500, color: isActive || isCompleted ? '#111827' : '#6B7280', margin: 0 }}>{step.title}</p>
                  <p style={{ fontSize: '11px', color: isActive ? '#2563EB' : '#9CA3AF', margin: '2px 0 0' }}>
                    {isActive ? 'In Progress' : isCompleted ? 'Completed' : 'Pending'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Main Body (Steps 1-3) ── */}
      {currentStep < 4 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px', alignItems: 'start' }}>

          {/* ── Left Column (Forms) ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {currentStep === 1 && (
              <>
                {/* Upload Card */}
                <div style={{ ...cardStyle, padding: '22px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '18px' }}>
                    <div style={{ background: '#EFF6FF', borderRadius: '10px', padding: '10px', display: 'flex', flexShrink: 0 }}>
                      <FiUploadCloud size={20} color="#2563EB" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', fontFamily: 'Poppins, sans-serif', margin: 0 }}>Step 1: Upload Your Manuscript</h3>
                      <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0', lineHeight: 1.5 }}>
                        Upload the research paper in PDF or DOCX format. Make sure the file is final and ready for review.
                      </p>
                    </div>
                  </div>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${dragging ? '#2563EB' : mainFile ? '#22C55E' : '#C7D2FE'}`,
                      borderRadius: '12px', background: dragging ? '#EFF6FF' : mainFile ? '#F0FDF4' : '#F8FAFF',
                      padding: '36px 24px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && handleMainFile(e.target.files[0])} />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <div style={{ background: mainFile ? '#DCFCE7' : '#EFF6FF', borderRadius: '50%', padding: '16px', display: 'flex' }}>
                        <FiUploadCloud size={32} color={mainFile ? '#16A34A' : '#2563EB'} />
                      </div>
                      {mainFile ? (
                        <>
                          <p style={{ fontWeight: 700, fontSize: '14px', color: '#16A34A' }}>✓ {mainFile.name}</p>
                          <p style={{ fontSize: '12px', color: '#6B7280' }}>{(mainFile.size / 1024 / 1024).toFixed(2)} MB — Click to replace</p>
                        </>
                      ) : (
                        <>
                          <p style={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>Drag & Drop your file here</p>
                          <p style={{ fontSize: '13px', color: '#9CA3AF' }}>or</p>
                          <button type="button" style={{ display: 'flex', alignItems: 'center', gap: '7px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 22px', fontWeight: 600, fontSize: '13.5px', cursor: 'pointer', boxShadow: '0 3px 10px rgba(37,99,235,0.3)' }}>
                            <FiPaperclip size={15} /> Browse Files
                          </button>
                        </>
                      )}
                      <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>Supported Formats: PDF, DOCX &nbsp;|&nbsp; Max File Size: 25MB</p>
                    </div>
                  </div>
                </div>

                {/* Cover Image Upload Card */}
                <div style={{ ...cardStyle, padding: '22px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '18px' }}>
                    <div style={{ background: '#FDF4FF', borderRadius: '10px', padding: '10px', display: 'flex', flexShrink: 0 }}>
                      <FiUploadCloud size={20} color="#C026D3" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', fontFamily: 'Poppins, sans-serif', margin: 0 }}>Step 1b: Upload Cover Image</h3>
                      <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0', lineHeight: 1.5 }}>
                        Upload a thumbnail/cover image for the journal. This will be displayed on the website.
                      </p>
                    </div>
                  </div>
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${imageFile ? '#22C55E' : '#F5D0FE'}`,
                      borderRadius: '12px', background: imageFile ? '#F0FDF4' : '#FDF4FF',
                      padding: '36px 24px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    <input ref={imageInputRef} type="file" accept="image/jpeg, image/png, image/webp" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && handleImageFile(e.target.files[0])} />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <div style={{ background: imageFile ? '#DCFCE7' : '#FAE8FF', borderRadius: '50%', padding: '16px', display: 'flex' }}>
                        <FiUploadCloud size={32} color={imageFile ? '#16A34A' : '#C026D3'} />
                      </div>
                      {imageFile ? (
                        <>
                          <p style={{ fontWeight: 700, fontSize: '14px', color: '#16A34A' }}>✓ {imageFile.name}</p>
                          <p style={{ fontSize: '12px', color: '#6B7280' }}>{(imageFile.size / 1024 / 1024).toFixed(2)} MB — Click to replace</p>
                        </>
                      ) : (
                        <>
                          <p style={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>Drag & Drop your image here</p>
                          <p style={{ fontSize: '13px', color: '#9CA3AF' }}>or</p>
                          <button type="button" style={{ display: 'flex', alignItems: 'center', gap: '7px', background: '#C026D3', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 22px', fontWeight: 600, fontSize: '13.5px', cursor: 'pointer', boxShadow: '0 3px 10px rgba(192,38,211,0.3)' }}>
                            <FiPaperclip size={15} /> Browse Images
                          </button>
                        </>
                      )}
                      <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>Supported Formats: JPG, PNG, WEBP &nbsp;|&nbsp; Max File Size: 5MB</p>
                    </div>
                  </div>
                </div>

                {/* Additional Files */}
                <div style={{ ...cardStyle, padding: '18px 22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>Additional Files <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(Optional)</span></h4>
                      <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '2px 0 0' }}>Upload supplementary files, datasets, or appendices (if any)</p>
                    </div>
                    <button type="button" onClick={() => addFileInputRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: '1.5px solid #2563EB', color: '#2563EB', borderRadius: '8px', padding: '6px 14px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>
                      <FiPlus size={14} /> Add More
                    </button>
                    <input ref={addFileInputRef} type="file" multiple style={{ display: 'none' }} onChange={handleAddFile} />
                  </div>
                  {additionalFiles.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {additionalFiles.map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F9FAFB', borderRadius: '10px', padding: '10px 14px', border: '1px solid #F3F4F6' }}>
                          <FiPaperclip size={15} color="#6B7280" style={{ flexShrink: 0 }} />
                          <span style={{ flex: 1, fontSize: '13px', color: '#374151', fontWeight: 500 }}>{f.name}</span>
                          <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{f.size}</span>
                          <button type="button" onClick={() => removeAdditional(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', display: 'flex', padding: '2px' }}><FiTrash2 size={15} /></button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '12.5px', color: '#9CA3AF', textAlign: 'center', padding: '12px' }}>No additional files added yet.</p>
                  )}
                </div>

                {/* Important Note */}
                <div style={{ borderRadius: '12px', border: '1px solid #DBEAFE', background: '#EFF6FF', padding: '14px 18px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <FiAlertCircle size={18} color="#2563EB" style={{ flexShrink: 0, marginTop: '1px' }} />
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '13px', color: '#1E40AF', margin: '0 0 4px' }}>Important Note</p>
                    <p style={{ fontSize: '12.5px', color: '#1D4ED8', lineHeight: 1.6, margin: 0 }}>Ensure that the manuscript is original, not under review elsewhere, and follows the journal's submission guidelines.</p>
                  </div>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                {/* Basic Information */}
                <div style={{ ...cardStyle, padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                    <div style={{ background: '#EFF6FF', borderRadius: '8px', padding: '8px', display: 'flex' }}>
                      <FiBook size={18} color="#2563EB" />
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', fontFamily: 'Poppins, sans-serif', margin: 0 }}>Basic Information</h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={labelStyle}>Journal Title <span style={{ color: '#EF4444' }}>*</span></label>
                      <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Enter the title of the research paper" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Research Area / Subject <span style={{ color: '#EF4444' }}>*</span></label>
                      <select name="researchArea" value={formData.researchArea} onChange={handleInputChange} style={{ ...inputStyle, appearance: 'none', background: '#fff url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236B7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E") no-repeat right 12px center/14px', paddingRight: '36px' }}>
                        <option value="">Select research area</option>
                        <option value="Sociology">Sociology</option>
                        <option value="Political Science">Political Science</option>
                        <option value="Psychology">Psychology</option>
                        <option value="Economics">Economics</option>
                        <option value="Governance and Public Administration">Governance and Public Administration</option>
                        <option value="Criminology">Criminology</option>
                        <option value="Anthropology">Anthropology</option>
                        <option value="Education">Education</option>
                        <option value="Management">Management</option>
                        <option value="Commerce">Commerce</option>
                        <option value="Geography">Geography</option>
                        <option value="Law">Law</option>
                        <option value="Social Work">Social Work</option>
                        <option value="Gender Studies">Gender Studies</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Artificial Intelligence">Artificial Intelligence</option>
                        <option value="Data Science">Data Science</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Department <span style={{ color: '#EF4444' }}>*</span></label>
                      <select name="department" value={formData.department} onChange={handleInputChange} style={{ ...inputStyle, appearance: 'none', background: '#fff url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236B7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E") no-repeat right 12px center/14px', paddingRight: '36px' }}>
                        <option value="">Select department</option>
                        <option value="Social Science">Social Science</option>
                        <option value="Humanities">Humanities</option>
                        <option value="Arts">Arts</option>
                        <option value="Commerce">Commerce</option>
                        <option value="Management">Management</option>
                        <option value="Finance">Finance</option>
                        <option value="Administration">Administration</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Science">Science</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Publication Language <span style={{ color: '#EF4444' }}>*</span></label>
                      <select name="language" value={formData.language} onChange={handleInputChange} style={{ ...inputStyle, appearance: 'none', background: '#fff url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236B7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E") no-repeat right 12px center/14px', paddingRight: '36px' }}>
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                      </select>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={labelStyle}>Abstract <span style={{ color: '#EF4444' }}>*</span></label>
                      <textarea name="abstract" value={formData.abstract} onChange={handleInputChange} rows="4" placeholder="Write or paste abstract here..." style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
                      <p style={{ textAlign: 'right', fontSize: '11px', color: '#9CA3AF', margin: '4px 0 0' }}>{formData.abstract.length} / 3000</p>
                    </div>
                    <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                      <div>
                        <label style={labelStyle}>Keywords <span style={{ color: '#EF4444' }}>*</span></label>
                        <div style={{ ...inputStyle, padding: '6px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {keywords.map(kw => (
                            <span key={kw} style={{ background: '#EFF6FF', color: '#2563EB', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {kw}
                              <FiTrash2 size={12} style={{ cursor: 'pointer' }} onClick={() => removeKeyword(kw)} />
                            </span>
                          ))}
                          <input type="text" placeholder={keywords.length === 0 ? "Enter keywords and press enter or comma" : ""} value={newKeyword} onChange={e => setNewKeyword(e.target.value)} onKeyDown={addKeyword} style={{ border: 'none', outline: 'none', flex: 1, minWidth: '150px', fontSize: '13px', background: 'transparent' }} />
                        </div>
                      </div>
                      <div>
                        <label style={labelStyle}>Number of Pages <span style={{ color: '#EF4444' }}>*</span></label>
                        <input type="number" name="pages" value={formData.pages} onChange={handleInputChange} placeholder="Ex: 10" style={inputStyle} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Author Information */}
                <div style={{ ...cardStyle, padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ background: '#EFF6FF', borderRadius: '8px', padding: '8px', display: 'flex' }}>
                        <FiUser size={18} color="#2563EB" />
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', fontFamily: 'Poppins, sans-serif', margin: 0 }}>Author Information</h3>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={labelStyle}>Primary Author Name <span style={{ color: '#EF4444' }}>*</span></label>
                      <input type="text" name="primaryAuthor" value={formData.primaryAuthor} onChange={handleInputChange} placeholder="e.g. Dr. John Doe" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Email Address <span style={{ color: '#EF4444' }}>*</span></label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="author@domain.com" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Co-authors (if any)</label>
                      <input type="text" name="coAuthors" value={formData.coAuthors} onChange={handleInputChange} placeholder="Enter co-author names separated by comma" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Corresponding Author Phone <span style={{ color: '#EF4444' }}>*</span></label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <select name="phoneCode" value={formData.phoneCode} onChange={handleInputChange} style={{ ...inputStyle, width: '90px', appearance: 'none', background: '#fff url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236B7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E") no-repeat right 8px center/12px', paddingRight: '24px' }}>
                          <option value="+91">+91</option>
                          <option value="+1">+1</option>
                        </select>
                        <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="9876543210" style={{ ...inputStyle, flex: 1 }} />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {currentStep === 3 && (
              <>
                {/* 1. Manuscript Information */}
                <div style={{ ...cardStyle, padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F3F4F6', paddingBottom: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FiFileText size={18} color="#2563EB" />
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', fontFamily: 'Poppins, sans-serif', margin: 0 }}>1. Manuscript Information</h3>
                    </div>
                    <button onClick={() => setCurrentStep(2)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#fff', border: '1px solid #E5E7EB', color: '#2563EB', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                      <FiEdit2 size={12} /> Edit
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <h4 style={step3ReviewLabel}>Manuscript Title</h4>
                        <p style={step3ReviewValue}>{formData.title}</p>
                      </div>
                      <div>
                        <h4 style={step3ReviewLabel}>Research Area / Subject</h4>
                        <p style={step3ReviewValue}>{formData.researchArea}</p>
                      </div>
                      <div>
                        <h4 style={step3ReviewLabel}>Department</h4>
                        <p style={step3ReviewValue}>{formData.department}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <h4 style={step3ReviewLabel}>Publication Language</h4>
                        <p style={step3ReviewValue}>{formData.language}</p>
                      </div>
                      <div>
                        <h4 style={step3ReviewLabel}>Number of Pages</h4>
                        <p style={step3ReviewValue}>{formData.pages}</p>
                      </div>
                      <div>
                        <h4 style={step3ReviewLabel}>Keywords</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                          {keywords.map(kw => (
                            <span key={kw} style={{ background: '#EFF6FF', color: '#2563EB', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>{kw}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <h4 style={step3ReviewLabel}>Abstract</h4>
                      <p style={step3ReviewValue}>
                        {formData.abstract}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Author Information */}
                <div style={{ ...cardStyle, padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F3F4F6', paddingBottom: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FiUser size={18} color="#2563EB" />
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', fontFamily: 'Poppins, sans-serif', margin: 0 }}>2. Author Information</h3>
                    </div>
                    <button onClick={() => setCurrentStep(2)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#fff', border: '1px solid #E5E7EB', color: '#2563EB', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                      <FiEdit2 size={12} /> Edit
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <h4 style={step3ReviewLabel}>Primary Author</h4>
                        <p style={step3ReviewValue}>{formData.primaryAuthor}</p>
                      </div>
                      <div>
                        <h4 style={step3ReviewLabel}>Email Address</h4>
                        <p style={step3ReviewValue}>{formData.email}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <h4 style={step3ReviewLabel}>Corresponding Author</h4>
                        <p style={step3ReviewValue}>Yes</p>
                      </div>
                      <div>
                        <h4 style={step3ReviewLabel}>Phone</h4>
                        <p style={step3ReviewValue}>{formData.phoneCode} {formData.phone}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <h4 style={step3ReviewLabel}>Co-authors</h4>
                        <p style={step3ReviewValue}>{formData.coAuthors || 'None'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Uploaded Files */}
                <div style={{ ...cardStyle, padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F3F4F6', paddingBottom: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FiPaperclip size={18} color="#2563EB" />
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', fontFamily: 'Poppins, sans-serif', margin: 0 }}>3. Uploaded Files</h3>
                    </div>
                    <button onClick={() => setCurrentStep(1)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#fff', border: '1px solid #E5E7EB', color: '#2563EB', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                      <FiEdit2 size={12} /> Edit
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {mainFile && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ background: '#FEE2E2', padding: '6px', borderRadius: '6px', display: 'flex' }}>
                            <span style={{ fontSize: '10px', color: '#DC2626', fontWeight: 700 }}>{mainFile.name.split('.').pop().toUpperCase()}</span>
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{mainFile.name}</span>
                        </div>
                        <span style={{ fontSize: '12px', color: '#6B7280', flex: 1, paddingLeft: '40px' }}>{(mainFile.size / 1024 / 1024).toFixed(2)} MB</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#16A34A', fontSize: '12px', fontWeight: 600 }}>
                          <FiCheckCircle size={14} /> Uploaded
                        </div>
                      </div>
                    )}
                    {imageFile && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ background: '#FDF4FF', padding: '6px', borderRadius: '6px', display: 'flex' }}>
                            <span style={{ fontSize: '10px', color: '#C026D3', fontWeight: 700 }}>IMG</span>
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{imageFile.name}</span>
                        </div>
                        <span style={{ fontSize: '12px', color: '#6B7280', flex: 1, paddingLeft: '40px' }}>{(imageFile.size / 1024 / 1024).toFixed(2)} MB</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#16A34A', fontSize: '12px', fontWeight: 600 }}>
                          <FiCheckCircle size={14} /> Uploaded
                        </div>
                      </div>
                    )}
                    {additionalFiles.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ background: '#DBEAFE', padding: '6px', borderRadius: '6px', display: 'flex' }}>
                            <span style={{ fontSize: '10px', color: '#2563EB', fontWeight: 700 }}>{f.name.split('.').pop().toUpperCase()}</span>
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{f.name}</span>
                        </div>
                        <span style={{ fontSize: '12px', color: '#6B7280', flex: 1, paddingLeft: '40px' }}>{f.size}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#16A34A', fontSize: '12px', fontWeight: 600 }}>
                          <FiCheckCircle size={14} /> Uploaded
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

          </div>

          {/* ── Right Column (Sidebar) ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Submission Progress */}
            <div style={{ ...cardStyle, padding: '18px 20px' }}>
              <h4 style={{ fontWeight: 700, fontSize: '14px', color: '#111827', margin: '0 0 16px' }}>Submission Progress</h4>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '50%', background: `conic-gradient(#2563EB ${(currentStep / 4) * 100}%, #E5E7EB 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                    {(currentStep / 4) * 100}%
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {STEPS.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {s.num < currentStep ? (
                        <FiCheckCircle size={14} color="#22C55E" />
                      ) : s.num === currentStep ? (
                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />
                        </div>
                      ) : (
                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#E5E7EB' }} />
                      )}
                      <span style={{ fontSize: '12px', color: s.num <= currentStep ? '#374151' : '#9CA3AF', fontWeight: s.num === currentStep ? 600 : 500 }}>{s.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {currentStep === 3 && (
              <>
                {/* Before You Submit */}
                <div style={{ ...cardStyle, padding: '18px 20px', background: '#F8FAFC' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '14px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    <h4 style={{ fontWeight: 700, fontSize: '13.5px', color: '#1E40AF', margin: 0 }}>Before You Submit</h4>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {BEFORE_SUBMIT_TIPS.map((tip, i) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <FiCheck size={14} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ fontSize: '12px', color: '#4B5563', lineHeight: 1.5 }}>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Important Note */}
                <div style={{ borderRadius: '12px', border: '1px solid #FECACA', background: '#FEF2F2', padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <FiAlertCircle size={15} color="#DC2626" />
                    <h4 style={{ fontWeight: 700, fontSize: '13.5px', color: '#991B1B', margin: 0 }}>Important Note</h4>
                  </div>
                  <p style={{ fontSize: '12px', color: '#7F1D1D', lineHeight: 1.6, margin: 0 }}>
                    As Admin, once submitted, the journal will be registered with assigned Journal ID and available in Manage Journals for review and publication.
                  </p>
                </div>
              </>
            )}

            {/* Support Note */}
            <div style={{ borderRadius: '14px', border: '1px solid #BBF7D0', background: '#F0FDF4', padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '10px' }}>
                <FiHelpCircle size={16} color="#16A34A" />
                <h4 style={{ fontWeight: 700, fontSize: '13.5px', color: '#15803D', margin: 0 }}>Admin Notice</h4>
              </div>
              <p style={{ fontSize: '12px', color: '#166534', lineHeight: 1.6, margin: 0 }}>
                This submission will automatically link to the specified author or register them as an Author if new.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* ── Main Body (Step 4 Success) ── */}
      {currentStep === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Success Banner */}
          <div style={{ ...cardStyle, background: 'linear-gradient(to right, #F0FDF4, #DCFCE7)', border: '1px solid #BBF7D0', padding: '32px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', position: 'relative', zIndex: 2 }}>
              <div style={{ background: '#22C55E', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(34,197,94,0.25)' }}>
                <FiCheck size={40} color="#fff" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', margin: 0, fontFamily: 'Poppins, sans-serif' }}>Journal Uploaded & Submitted Successfully!</h3>
                <p style={{ fontSize: '13.5px', color: '#4B5563', margin: 0, lineHeight: 1.6, maxWidth: '500px' }}>
                  The journal has been added to the system and is ready for editorial processing, reviewer assignment, or publication.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                  <div style={{ background: '#D1FAE5', color: '#065F46', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #A7F3D0' }}>
                    Submission ID: {submittedJournal?.journalId || 'JNL-NEW'} <FiCopy size={13} style={{ cursor: 'pointer' }} onClick={() => { navigator.clipboard.writeText(submittedJournal?.journalId || ''); toast.success('Copied!'); }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#6B7280' }}>
                    <FiCalendar size={14} /> Submitted on: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} | {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
                  {submittedJournal?._id && (
                    <button onClick={() => navigate(`/journals/${submittedJournal._id}`)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#10B981', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.25)' }}>
                      <FiBook size={16} /> View Journal Details
                    </button>
                  )}
                  <button onClick={resetForm} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}>
                    <FiUploadCloud size={16} /> Upload Another Journal
                  </button>
                  <button onClick={() => navigate('/journals')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                    Manage Journals
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
            
            {/* What Happens Next? */}
            <div style={{ ...cardStyle, padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', fontFamily: 'Poppins, sans-serif', margin: '0 0 20px' }}>What Happens Next?</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '17px', top: '24px', bottom: '24px', width: '2px', background: '#E5E7EB', zIndex: 0 }} />
                
                <div style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1 }}>
                  <div style={{ background: '#EFF6FF', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '4px solid #fff' }}>
                    <FiFileText size={16} color="#2563EB" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>Editorial Screening</h4>
                      <span style={{ background: '#DCFCE7', color: '#16A34A', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>Next Step</span>
                    </div>
                    <p style={{ fontSize: '12.5px', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>Check manuscript for scope, format, and originality.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1 }}>
                  <div style={{ background: '#F3E8FF', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '4px solid #fff' }}>
                    <FiUsers size={16} color="#9333EA" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>Peer Review</h4>
                      <span style={{ background: '#EFF6FF', color: '#2563EB', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>Upcoming</span>
                    </div>
                    <p style={{ fontSize: '12.5px', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>Assign reviewers directly from the journal details page.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1 }}>
                  <div style={{ background: '#DCFCE7', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '4px solid #fff' }}>
                    <FiBook size={16} color="#16A34A" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>Publication</h4>
                      <span style={{ background: '#EFF6FF', color: '#2563EB', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>Upcoming</span>
                    </div>
                    <p style={{ fontSize: '12.5px', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>Approve and publish to make the article publicly accessible.</p>
                  </div>
                </div>

              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Submission Summary */}
              <div style={{ ...cardStyle, padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', fontFamily: 'Poppins, sans-serif', margin: 0 }}>Submission Summary</h3>
                  <button onClick={() => setCurrentStep(3)} style={{ background: '#fff', border: '1px solid #DBEAFE', color: '#2563EB', borderRadius: '6px', padding: '4px 10px', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer' }}>
                    View Details
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ background: '#F8FAFC', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FiUser size={14} color="#6B7280" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>Journal Title</h4>
                      <p style={{ fontSize: '12.5px', color: '#4B5563', margin: 0 }}>{formData.title}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ background: '#F8FAFC', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FiCheckCircle size={14} color="#6B7280" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>Research Area</h4>
                      <p style={{ fontSize: '12.5px', color: '#4B5563', margin: 0 }}>{formData.researchArea}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ background: '#F8FAFC', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FiUser size={14} color="#6B7280" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>Author</h4>
                      <p style={{ fontSize: '12.5px', color: '#4B5563', margin: 0 }}>{formData.primaryAuthor}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ background: '#F8FAFC', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FiFileText size={14} color="#6B7280" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>Files Submitted</h4>
                      <p style={{ fontSize: '12.5px', color: '#4B5563', margin: 0 }}>{(mainFile ? 1 : 0) + (imageFile ? 1 : 0) + additionalFiles.length} Files</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ background: '#F8FAFC', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FiBook size={14} color="#6B7280" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>Total Pages</h4>
                      <p style={{ fontSize: '12.5px', color: '#4B5563', margin: 0 }}>{formData.pages} Pages</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{ ...cardStyle, padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', fontFamily: 'Poppins, sans-serif', margin: '0 0 16px' }}>What You Can Do?</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <button onClick={() => navigate('/journals')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '16px 10px', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <FiFolder size={20} color="#2563EB" />
                    <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#374151', textAlign: 'center' }}>Manage<br/>Journals</span>
                  </button>
                  <button onClick={() => submittedJournal?._id && navigate(`/journals/${submittedJournal._id}`)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '16px 10px', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <FiActivity size={20} color="#2563EB" />
                    <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#374151', textAlign: 'center' }}>Open<br/>Journal</span>
                  </button>
                  <button onClick={resetForm} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '16px 10px', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <FiUploadCloud size={20} color="#2563EB" />
                    <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#374151', textAlign: 'center' }}>Submit<br/>Another</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
          
        </div>
      )}

      {/* ── Footer Actions (Only for Step 1-3) ── */}
      {currentStep < 4 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', paddingTop: '10px' }}>
          {currentStep === 1 && (
            <button type="button" onClick={handleNextStep1} style={{ display: 'flex', alignItems: 'center', gap: '7px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 26px', fontSize: '13.5px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 3px 12px rgba(37,99,235,0.35)', marginLeft: 'auto' }}>
              Save & Next <FiArrowRight size={15} />
            </button>
          )}
          {currentStep === 2 && (
            <>
              <button type="button" onClick={() => setCurrentStep(1)} style={{ display: 'flex', alignItems: 'center', gap: '7px', background: '#fff', border: '1.5px solid #E5E7EB', color: '#6B7280', borderRadius: '10px', padding: '10px 20px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', marginRight: 'auto' }}>
                <FiArrowLeft size={15} /> Previous
              </button>
              <button type="button" onClick={handleNextStep2} style={{ display: 'flex', alignItems: 'center', gap: '7px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 26px', fontSize: '13.5px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 3px 12px rgba(37,99,235,0.35)' }}>
                Next: Review Details <FiArrowRight size={15} />
              </button>
            </>
          )}
          {currentStep === 3 && (
            <>
              <button type="button" onClick={() => setCurrentStep(2)} style={{ display: 'flex', alignItems: 'center', gap: '7px', background: '#fff', border: '1.5px solid #E5E7EB', color: '#6B7280', borderRadius: '10px', padding: '10px 20px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', marginRight: 'auto' }}>
                <FiArrowLeft size={15} /> Previous
              </button>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#374151', cursor: 'pointer', fontWeight: 500, marginRight: '16px' }}>
                <input id="confirm-checkbox" type="checkbox" style={{ width: '16px', height: '16px', accentColor: '#2563EB', cursor: 'pointer' }} />
                I confirm that all the information provided is accurate and complete.
              </label>

              <button type="button" onClick={handleNextStep3} disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: '7px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 26px', fontSize: '13.5px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 3px 12px rgba(37,99,235,0.35)' }}>
                {submitting ? 'Submitting...' : 'Submit Journal'} <FiSend size={15} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadJournal;
