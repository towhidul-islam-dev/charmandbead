"use client";
import React, { useState, useEffect } from 'react';

const PolicyForm = ({ type, initialData }) => {
  const [content, setContent] = useState({ content_en: '', content_bn: '' });

  useEffect(() => {
    if (initialData) setContent(initialData);
  }, [initialData]);

  const save = async () => {
    await fetch('/api/admin/content', {
      method: 'POST',
      body: JSON.stringify({ category: 'Policy', data: { ...content, type } })
    });
    alert(`${type.toUpperCase()} Saved!`);
  };

  return (
    <div>
      <h3 style={{ color: '#3E442B', textTransform: 'capitalize' }}>Edit {type}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
        <div>
          <label style={{ color: '#EA638C', fontWeight: 'bold' }}>English Version</label>
          <textarea rows={15} style={areaStyle} value={content.content_en} onChange={e => setContent({...content, content_en: e.target.value})} />
        </div>
        <div>
          <label style={{ color: '#EA638C', fontWeight: 'bold' }}>Bengali Version</label>
          <textarea rows={15} style={areaStyle} value={content.content_bn} onChange={e => setContent({...content, content_bn: e.target.value})} />
        </div>
      </div>
      <button onClick={save} style={priBtn}>Update {type}</button>
    </div>
  );
};

const areaStyle = { width: '100%', padding: '12px', border: '1px solid #FBB6E6', borderRadius: '8px', marginTop: '10px' };
const priBtn = { background: '#EA638C', color: '#FFF', padding: '12px 25px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '20px' };

export default PolicyForm;