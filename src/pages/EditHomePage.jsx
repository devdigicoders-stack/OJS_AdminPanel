import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { MdSave, MdAdd, MdDelete } from 'react-icons/md';
import './JournalPages.css';

const EditHomePage = () => {
  const [formData, setFormData] = useState({
    stats: [],
    domains: []
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/home-page`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setFormData({
            stats: data.stats || [],
            domains: data.domains || []
          });
        }
      } catch (error) {
        console.error('Error fetching home page:', error);
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
        stats: formData.stats.filter(i => i.label.trim() !== '' && i.value.trim() !== ''),
        domains: formData.domains.filter(i => i.name.trim() !== '')
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/home-page`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(cleanedData)
      });

      if (res.ok) {
        toast.success(`Home page updated successfully!`);
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


  if (fetching) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading page data...</div>;

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '100px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title">Edit Home Page</h1>
        <div className="header-actions">
          <button className="btn-primary-action" onClick={handleSave} disabled={loading}>
            <MdSave /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="card-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2>Platform Statistics</h2>
          <button className="btn-secondary-action" onClick={() => addObjectArrayItem('stats', { label: '', value: '', icon: 'FaCheckCircle' })} style={{ padding: '4px 10px', fontSize: '13px' }}>
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
            <input 
              type="text" 
              value={item.icon} 
              onChange={(e) => handleObjectArrayChange('stats', i, 'icon', e.target.value)} 
              style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              placeholder="Icon (e.g. FaBook)"
            />
            <button onClick={() => removeObjectArrayItem('stats', i)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '0 10px', cursor: 'pointer' }}>
              <MdDelete />
            </button>
          </div>
        ))}
      </div>

      <div className="card-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2>Research Domains (Disciplines)</h2>
          <button className="btn-secondary-action" onClick={() => addObjectArrayItem('domains', { name: '', icon: 'FaCheckCircle' })} style={{ padding: '4px 10px', fontSize: '13px' }}>
            <MdAdd /> Add Domain
          </button>
        </div>
        {formData.domains.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input 
              type="text" 
              value={item.name} 
              onChange={(e) => handleObjectArrayChange('domains', i, 'name', e.target.value)} 
              style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              placeholder="Domain Name (e.g. Computer Science)"
            />
            <input 
              type="text" 
              value={item.icon} 
              onChange={(e) => handleObjectArrayChange('domains', i, 'icon', e.target.value)} 
              style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              placeholder="Icon (e.g. FaLaptopCode)"
            />
            <button onClick={() => removeObjectArrayItem('domains', i)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '0 10px', cursor: 'pointer' }}>
              <MdDelete />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditHomePage;
