import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { MdSave, MdAdd, MdDelete } from 'react-icons/md';
import './JournalPages.css';

const cleanImageUrl = (url) => {
  if (!url) return '';
  let cleaned = url.trim();
  cleaned = cleaned.replace(/^https?:\/\/\.praxis\.org\.in(\/api)?/, 'https://api.praxis.org.in');
  cleaned = cleaned.replace('/api/uploads/', '/uploads/');
  const backendBase = (import.meta.env.VITE_API_URL || 'https://api.praxis.org.in/api').replace(/\/api\/?$/, '');
  cleaned = cleaned.replace(/^http:\/\/(localhost|127\.0\.0\.1):5000/, backendBase);
  if (cleaned.startsWith('/uploads')) {
    cleaned = `${backendBase}${cleaned}`;
  }
  return cleaned;
};

const EditEditorialBoard = () => {
  const [formData, setFormData] = useState({
    editorInChief: {
      name: '',
      affiliation: '',
      email: '',
      universityUrl: ''
    },
    team: []
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/about-page`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOriginalData(data);
          const sanitizedTeam = (data.team || []).map(member => ({
            ...member,
            universityUrl: member.universityUrl || '',
            img: cleanImageUrl(member.img)
          }));
          setFormData({
            editorInChief: {
              name: data.editorInChief?.name || '',
              affiliation: data.editorInChief?.affiliation || '',
              email: data.editorInChief?.email || '',
              universityUrl: data.editorInChief?.universityUrl || ''
            },
            team: sanitizedTeam
          });
        }
      } catch (error) {
        console.error('Error fetching about page:', error);
      } finally {
        setFetching(false);
      }
    };
    fetchPage();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const cleanedData = {
        ...originalData,
        editorInChief: formData.editorInChief,
        team: formData.team
          .filter(i => i.name.trim() !== '')
          .map(i => ({ 
            ...i, 
            universityUrl: (i.universityUrl || '').trim(),
            img: cleanImageUrl(i.img) 
          }))
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/about-page`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(cleanedData)
      });

      if (res.ok) {
        toast.success(`Editorial Board updated successfully!`);
        setFormData({
          ...formData,
          team: cleanedData.team
        });
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

  const handleEditorChange = (e) => {
    setFormData({
      ...formData,
      editorInChief: {
        ...formData.editorInChief,
        [e.target.name]: e.target.value
      }
    });
  };

  const handleObjectArrayChange = (field, index, key, value) => {
    const newArr = [...formData[field]];
    newArr[index] = { ...newArr[index], [key]: value };
    setFormData({ ...formData, [field]: newArr });
  };

  const addObjectArrayItem = (field, defaultObj) => {
    setFormData({ ...formData, [field]: [...formData[field], defaultObj] });
  };

  const removeObjectArrayItem = (field, index) => {
    const newArr = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArr });
  };

  const handleImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('image', file);

    const toastId = toast.loading("Uploading image...");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/about-page/upload-image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: uploadData,
      });

      const data = await response.json();
      if (response.ok) {
        const backendUrl = (import.meta.env.VITE_API_URL || 'https://api.praxis.org.in/api').replace(/\/api\/?$/, '');
        const newImgUrl = cleanImageUrl(`${backendUrl}${data.imageUrl}`);
        
        const newTeam = [...formData.team];
        newTeam[index] = { ...newTeam[index], img: newImgUrl };
        setFormData(prev => ({ ...prev, team: newTeam }));

        // Auto-save immediately to database so refresh won't revert it
        const cleanedData = {
          ...originalData,
          editorInChief: formData.editorInChief,
          team: newTeam
            .filter(i => i.name.trim() !== '')
            .map(i => ({ 
              ...i, 
              universityUrl: (i.universityUrl || '').trim(),
              img: cleanImageUrl(i.img) 
            }))
        };

        const saveRes = await fetch(`${import.meta.env.VITE_API_URL}/about-page`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: JSON.stringify(cleanedData)
        });

        if (saveRes.ok) {
          toast.success("Image uploaded & saved successfully!", { id: toastId });
        } else {
          toast.success("Image uploaded. Please click 'Save Changes' to save.", { id: toastId });
        }
      } else {
        toast.error(data.message || "Failed to upload image", { id: toastId });
      }
    } catch (error) {
      toast.error("Error uploading image", { id: toastId });
      console.error(error);
    }
  };

  if (fetching) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading page data...</div>;

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '100px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title">Edit Editorial Board</h1>
        <div className="header-actions">
          <button className="btn-primary-action" onClick={handleSave} disabled={loading}>
            <MdSave /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="card-panel">
        <h2>Editor-in-Chief</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input 
            type="text" 
            name="name"
            value={formData.editorInChief?.name || ''} 
            onChange={handleEditorChange} 
            style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
            placeholder="Name (e.g. Prof. John Doe)"
          />
          <input 
            type="text" 
            name="affiliation"
            value={formData.editorInChief?.affiliation || ''} 
            onChange={handleEditorChange} 
            style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
            placeholder="Affiliation (e.g. Stanford University)"
          />
          <input 
            type="email" 
            name="email"
            value={formData.editorInChief?.email || ''} 
            onChange={handleEditorChange} 
            style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
            placeholder="Email Address"
          />
          <input 
            type="url" 
            name="universityUrl"
            value={formData.editorInChief?.universityUrl || ''} 
            onChange={handleEditorChange} 
            style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
            placeholder="University / Profile Link (e.g. https://...)"
          />
        </div>
      </div>

      <div className="card-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2>Editorial Board Members</h2>
          <button className="btn-secondary-action" onClick={() => addObjectArrayItem('team', { name: '', role: '', universityUrl: '', img: '' })} style={{ padding: '6px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MdAdd /> Add Member
          </button>
        </div>
        {formData.team.map((item, i) => (
          <div 
            key={i} 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '10px', 
              marginBottom: '14px', 
              padding: '14px', 
              background: '#f8fafc', 
              borderRadius: '8px', 
              border: '1px solid #e2e8f0' 
            }}
          >
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                value={item.name || ''} 
                onChange={(e) => handleObjectArrayChange('team', i, 'name', e.target.value)} 
                style={{ flex: 1, minWidth: '220px', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff' }}
                placeholder="Name (e.g. Dr. Chittranjan Senapati)"
              />
              <input 
                type="text" 
                value={item.role || ''} 
                onChange={(e) => handleObjectArrayChange('team', i, 'role', e.target.value)} 
                style={{ flex: 1.5, minWidth: '250px', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff' }}
                placeholder="Role / Affiliation"
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input 
                type="url" 
                value={item.universityUrl || ''} 
                onChange={(e) => handleObjectArrayChange('team', i, 'universityUrl', e.target.value)} 
                style={{ flex: 1.2, minWidth: '220px', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff' }}
                placeholder="University / Profile Link (e.g. https://...)"
              />
              <div style={{ display: 'flex', flex: 1, minWidth: '250px', gap: '6px' }}>
                <input 
                  type="text" 
                  value={item.img || ''} 
                  onChange={(e) => handleObjectArrayChange('team', i, 'img', e.target.value)} 
                  style={{ flex: 1, padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff' }}
                  placeholder="Image URL or Upload ->"
                />
                <label style={{ cursor: 'pointer', background: '#3b82f6', color: 'white', padding: '9px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                  Upload
                  <input 
                    type="file" 
                    accept="image/*" 
                    style={{ display: 'none' }}
                    onChange={(e) => handleImageUpload(e, i)}
                  />
                </label>
              </div>
              <button 
                onClick={() => removeObjectArrayItem('team', i)} 
                title="Delete member"
                style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', padding: '0 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <MdDelete size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditEditorialBoard;
