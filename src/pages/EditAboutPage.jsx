import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { toast } from 'react-hot-toast';
import { MdSave, MdAdd, MdDelete } from 'react-icons/md';
import './JournalPages.css'; // Reusing styles

const EditAboutPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    introduction: '',
    mission: [''],
    vision: [''],
    objectives: [''],
    features: [],
    researchAreas: [],
    team: [],
    processSteps: [''],
    stats: []
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
    const fetchPage = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/about-page`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setFormData({
            introduction: data.introduction || '',
            mission: data.mission?.length ? data.mission : [''],
            vision: data.vision?.length ? data.vision : [''],
            objectives: data.objectives?.length ? data.objectives : [''],
            features: data.features || [],
            researchAreas: data.researchAreas || [],
            team: data.team || [],
            processSteps: data.processSteps?.length ? data.processSteps : [''],
            stats: data.stats || []
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
      // Clean up empty data before sending to prevent validation errors
      const cleanedData = {
        ...formData,
        mission: formData.mission.filter(i => i.trim() !== ''),
        vision: formData.vision.filter(i => i.trim() !== ''),
        objectives: formData.objectives.filter(i => i.trim() !== ''),
        processSteps: formData.processSteps.filter(i => i.trim() !== ''),
        features: formData.features.filter(i => i.title.trim() !== ''),
        researchAreas: formData.researchAreas.filter(i => i.name.trim() !== ''),
        team: formData.team.filter(i => i.name.trim() !== ''),
        stats: formData.stats.filter(i => i.label.trim() !== '' && i.value.trim() !== '')
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
        toast.success(`About page updated successfully!`);
        // update local state to match cleaned data so inputs reflect reality
        setFormData(cleanedData);
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

  // Helper for simple string arrays
  const handleStringArrayChange = (field, index, value) => {
    const newArr = [...formData[field]];
    newArr[index] = value;
    setFormData({ ...formData, [field]: newArr });
  };
  const addStringArrayItem = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };
  const removeStringArrayItem = (field, index) => {
    const newArr = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArr });
  };

  // Helper for object arrays
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
        <h1 className="page-title">Edit About Page</h1>
        <div className="header-actions">
          <button className="btn-primary-action" onClick={handleSave} disabled={loading}>
            <MdSave /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="card-panel">
        <h2>Introduction</h2>
        <div className="quill-container" style={{ height: '300px', marginBottom: '40px' }}>
          <ReactQuill 
            theme="snow" 
            value={formData.introduction} 
            onChange={(content) => setFormData({ ...formData, introduction: content })} 
            modules={modules}
            style={{ height: '100%' }}
          />
        </div>
      </div>

      {['mission', 'vision', 'objectives', 'processSteps'].map(field => (
        <div className="card-panel" key={field}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ textTransform: 'capitalize' }}>{field.replace(/([A-Z])/g, ' $1').trim()}</h2>
            <button className="btn-secondary-action" onClick={() => addStringArrayItem(field)} style={{ padding: '4px 10px', fontSize: '13px' }}>
              <MdAdd /> Add Item
            </button>
          </div>
          {formData[field].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input 
                type="text" 
                value={item} 
                onChange={(e) => handleStringArrayChange(field, i, e.target.value)} 
                style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                placeholder={`Enter ${field} point...`}
              />
              <button onClick={() => removeStringArrayItem(field, i)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '0 10px', cursor: 'pointer' }}>
                <MdDelete />
              </button>
            </div>
          ))}
        </div>
    ))}

      <div className="card-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2>Why Choose Our Journal (Features)</h2>
          <button className="btn-secondary-action" onClick={() => addObjectArrayItem('features', { title: '', icon: 'FaCheckCircle' })} style={{ padding: '4px 10px', fontSize: '13px' }}>
            <MdAdd /> Add Feature
          </button>
        </div>
        {formData.features.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input 
              type="text" 
              value={item.title} 
              onChange={(e) => handleObjectArrayChange('features', i, 'title', e.target.value)} 
              style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              placeholder="Feature Title"
            />
            <input 
              type="text" 
              value={item.icon} 
              onChange={(e) => handleObjectArrayChange('features', i, 'icon', e.target.value)} 
              style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              placeholder="Icon (e.g. FaGlobe)"
            />
            <button onClick={() => removeObjectArrayItem('features', i)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '0 10px', cursor: 'pointer' }}>
              <MdDelete />
            </button>
          </div>
        ))}
      </div>

      <div className="card-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2>Research Areas</h2>
          <button className="btn-secondary-action" onClick={() => addObjectArrayItem('researchAreas', { name: '', icon: 'FaCheckCircle' })} style={{ padding: '4px 10px', fontSize: '13px' }}>
            <MdAdd /> Add Area
          </button>
        </div>
        {formData.researchAreas.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input 
              type="text" 
              value={item.name} 
              onChange={(e) => handleObjectArrayChange('researchAreas', i, 'name', e.target.value)} 
              style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              placeholder="Research Area Name"
            />
            <input 
              type="text" 
              value={item.icon} 
              onChange={(e) => handleObjectArrayChange('researchAreas', i, 'icon', e.target.value)} 
              style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              placeholder="Icon (e.g. FaMicroscope)"
            />
            <button onClick={() => removeObjectArrayItem('researchAreas', i)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '0 10px', cursor: 'pointer' }}>
              <MdDelete />
            </button>
          </div>
        ))}
      </div>

      <div className="card-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2>Journal Statistics</h2>
          <button className="btn-secondary-action" onClick={() => addObjectArrayItem('stats', { label: '', value: '' })} style={{ padding: '4px 10px', fontSize: '13px' }}>
            <MdAdd /> Add Stat
          </button>
        </div>
        {formData.stats.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input 
              type="text" 
              value={item.label} 
              onChange={(e) => handleObjectArrayChange('stats', i, 'label', e.target.value)} 
              style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              placeholder="Label (e.g. Published Journals)"
            />
            <input 
              type="text" 
              value={item.value} 
              onChange={(e) => handleObjectArrayChange('stats', i, 'value', e.target.value)} 
              style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              placeholder="Value (e.g. 150+)"
            />
            <button onClick={() => removeObjectArrayItem('stats', i)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '0 10px', cursor: 'pointer' }}>
              <MdDelete />
            </button>
          </div>
        ))}
      </div>

      <div className="card-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2>Editorial Team</h2>
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
              placeholder="Role"
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

export default EditAboutPage;
