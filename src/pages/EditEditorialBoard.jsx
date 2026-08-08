import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { MdSave, MdAdd, MdDelete } from 'react-icons/md';
import './JournalPages.css';

const EditEditorialBoard = () => {
  const [formData, setFormData] = useState({
    editorInChief: {
      name: '',
      affiliation: '',
      email: ''
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
          setFormData({
            editorInChief: data.editorInChief || { name: '', affiliation: '', email: '' },
            team: data.team || []
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
        team: formData.team.filter(i => i.name.trim() !== '')
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
        toast.success("Image uploaded successfully");
        const backendUrl = import.meta.env.VITE_API_URL.replace('/api', '');
        handleObjectArrayChange('team', index, 'img', `${backendUrl}${data.imageUrl}`);
      } else {
        toast.error(data.message || "Failed to upload image");
      }
    } catch (error) {
      toast.error("Error uploading image");
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
            style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
            placeholder="Name (e.g. Prof. John Doe)"
          />
          <input 
            type="text" 
            name="affiliation"
            value={formData.editorInChief?.affiliation || ''} 
            onChange={handleEditorChange} 
            style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
            placeholder="Affiliation (e.g. Stanford University)"
          />
          <input 
            type="email" 
            name="email"
            value={formData.editorInChief?.email || ''} 
            onChange={handleEditorChange} 
            style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
            placeholder="Email Address"
          />
        </div>
      </div>

      <div className="card-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2>Editorial Board Members</h2>
          <button className="btn-secondary-action" onClick={() => addObjectArrayItem('team', { name: '', role: '', img: '' })} style={{ padding: '4px 10px', fontSize: '13px' }}>
            <MdAdd /> Add Member
          </button>
        </div>
        {formData.team.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              value={item.name} 
              onChange={(e) => handleObjectArrayChange('team', i, 'name', e.target.value)} 
              style={{ flex: 1, minWidth: '200px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              placeholder="Name"
            />
            <input 
              type="text" 
              value={item.role} 
              onChange={(e) => handleObjectArrayChange('team', i, 'role', e.target.value)} 
              style={{ flex: 1, minWidth: '200px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              placeholder="Role / Affiliation"
            />
            <div style={{ display: 'flex', flex: 1, minWidth: '250px', gap: '5px' }}>
              <input 
                type="text" 
                value={item.img} 
                onChange={(e) => handleObjectArrayChange('team', i, 'img', e.target.value)} 
                style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                placeholder="Image URL or Upload ->"
              />
              <label style={{ cursor: 'pointer', background: '#3b82f6', color: 'white', padding: '8px 12px', borderRadius: '4px', fontSize: '13px', display: 'flex', alignItems: 'center' }}>
                Upload
                <input 
                  type="file" 
                  accept="image/*" 
                  style={{ display: 'none' }}
                  onChange={(e) => handleImageUpload(e, i)}
                />
              </label>
            </div>
            <button onClick={() => removeObjectArrayItem('team', i)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '0 10px', cursor: 'pointer' }}>
              <MdDelete />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditEditorialBoard;
