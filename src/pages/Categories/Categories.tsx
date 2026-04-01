import React, { useState } from 'react';
import { Tags, Search, Plus, Edit2, Trash2, X, Save } from 'lucide-react';

const Categories: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    displayOrder: '',
    status: true
  });

  const [categoryData, setCategoryData] = useState([
    { 
      id: 1, 
      name: 'Starters', 
      subtitle: 'APPETIZERS & SOUPS',
      description: 'Kickstart the meal with our premium selection of appetizers, both vegetarian and non-vegetarian offerings to satisfy early cravings before the main course.', 
      displayOrder: '1', 
      itemsCount: 12, 
      status: true,
      tags: ['Quick Prep', 'High Margin', 'Spicy']
    },
    { 
      id: 2, 
      name: 'Main Course', 
      subtitle: 'HEAVY MEALS & COMBOS',
      description: 'Hearty and fulfilling dishes ranging from traditional curries to global platters. Ensures maximum customer satisfaction with beautifully plated massive portions.', 
      displayOrder: '2', 
      itemsCount: 25, 
      status: true,
      tags: ['Chef Special', 'Popular', 'Family']
    },
    { 
      id: 3, 
      name: 'Beverages', 
      subtitle: 'HOT & COLD DRINKS',
      description: 'A finely curated list of artisanal coffees, teas, imported aerated cans, and in-house special mocktails meant to accompany every meal.', 
      displayOrder: '3', 
      itemsCount: 18, 
      status: true,
      tags: ['Chilled', 'Signature', 'Refills']
    },
    { 
      id: 4, 
      name: 'Desserts', 
      subtitle: 'SWEETS & ICE CREAMS',
      description: 'Delicate, handcrafted sweet offerings including traditional delicacies, premium ice cream scoops, and signature brownie sizzlers for the perfect ending.', 
      displayOrder: '4', 
      itemsCount: 8, 
      status: false,
      tags: ['Sweet', 'Bestseller', 'Kids']
    },
  ]);

  const handleOpenModal = (category?: any) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name || '',
        description: category.description || '',
        displayOrder: category.displayOrder || '',
        status: category.status !== undefined ? category.status : true
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '', description: '', displayOrder: '', status: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, status: e.target.checked }));
  };

  const handleSave = () => {
    if (editingCategory) {
      setCategoryData(prev => prev.map(cat => 
        cat.id === editingCategory.id ? { ...cat, ...formData } : cat
      ));
    } else {
      const newCategory = {
        ...formData,
        id: Date.now(),
        subtitle: 'NEW CATEGORY',
        itemsCount: 0,
        tags: ['New Added']
      };
      setCategoryData(prev => [newCategory, ...prev]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setCategoryData(prev => prev.filter(cat => cat.id !== id));
    }
  };

  const filteredData = categoryData.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container" style={{
      animation: 'modalContentIn 0.5s ease-out',
      background: 'transparent',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      color: 'var(--cream)',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <style>{`
        /* ── Add button styling from Tables ──────────────────── */
        .btn-add {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          height: 48px;
          padding: 0 22px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          background: linear-gradient(135deg, var(--ember) 0%, var(--amber) 100%);
          color: #1a0a00;
          box-shadow: 0 4px 20px rgba(245,158,11,0.25);
          transition: transform .15s, box-shadow .15s;
          position: relative;
          overflow: hidden;
          white-space: nowrap;
        }
        .btn-add::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, var(--amber) 0%, var(--amber-lt) 100%);
          opacity: 0;
          transition: opacity .2s;
        }
        .btn-add:hover::before { opacity: 1; }
        .btn-add:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(245,158,11,0.4); }
        .btn-add:active { transform: translateY(0); }
        .btn-add > * { position: relative; z-index: 1; }

        .card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
          padding: 32px;
        }
        @media (max-width: 768px) {
          .card-grid {
            grid-template-columns: 1fr;
            padding: 16px;
          }
        }
        
        .cat-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 18px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: border-color .2s, background .2s, transform .2s, box-shadow .2s;
          position: relative;
        }
        .cat-card::before {
          content: '';
          position: absolute;
          top: -30px; right: -30px;
          width: 80px; height: 80px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(234,88,12,0.15) 0%, transparent 70%);
          pointer-events: none;
          transition: opacity .2s;
          opacity: 0;
        }
        .cat-card:hover::before { opacity: 1; }
        .cat-card:hover {
          border-color: var(--border-h);
          background: var(--card-hov);
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(245,158,11,0.1);
        }

        .dark-input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid rgba(245,158,11,0.15);
          background: rgba(255,255,255,0.03);
          color: var(--cream);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          outline: none;
          transition: border 0.2s, box-shadow 0.2s;
        }
        .dark-input:focus {
          border-color: rgba(245,158,11,0.5);
          box-shadow: 0 0 0 3px rgba(245,158,11,0.1);
        }
        .dark-input::placeholder {
          color: rgba(255,255,255,0.3);
        }
      `}</style>
      
      <header className="app-header" style={{
        padding: '12px 24px',
        background: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            background: 'rgba(245,158,11,0.1)', 
            color: 'var(--amber)', 
            border: '1px solid rgba(245,158,11,0.18)',
            width: '42px', height: '42px', 
            borderRadius: '10px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <Tags size={20} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: 700, margin: 0, color: 'var(--cream)', lineHeight: 1.1 }}>
              <em style={{ fontStyle: 'italic', color: 'var(--amber-lt)' }}>Category</em> Management
            </h2>
          </div>
        </div>

        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', color: 'var(--muted)' }} />
            <input
              type="text"
              placeholder="Search categories..."
              className="dark-input"
              style={{ width: '220px', paddingLeft: '38px', height: '48px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-add" onClick={() => handleOpenModal()}>
            <Plus size={18} /> Add Category
          </button>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '32px' }}>
        <div className="card-grid">
          {filteredData.length > 0 ? filteredData.map((cat) => (
            <div key={cat.id} className="cat-card">
              
              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", margin: '0 0 6px 0', fontSize: '1.4rem', fontWeight: 700, color: 'var(--cream)' }}>
                    {cat.name}
                  </h3>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--amber)', letterSpacing: '1px' }}>
                    {cat.subtitle || `DISPLAY ORDER: ${cat.displayOrder}`}
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--muted)', margin: '0 0 20px 0', flex: 1 }}>
                  {cat.description || 'No detailed description provided for this category.'}
                </p>

                {cat.tags && cat.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: 'auto' }}>
                    {cat.tags.map((tag, tIdx) => (
                      <span key={tIdx} style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid var(--border)', color: 'var(--amber-lt)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600 }}>
                        {tag}
                      </span>
                    ))}
                    {!cat.status && (
                       <span style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600 }}>
                       Inactive
                     </span>
                    )}
                  </div>
                )}
              </div>

              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: 'var(--surface)' }}>
                <button 
                  onClick={() => handleOpenModal(cat)} 
                  style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--cream)', padding: '6px 16px', borderRadius: '30px', fontSize: '0.8rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseOver={(e: any) => e.currentTarget.style.borderColor = 'var(--amber)'} 
                  onMouseOut={(e: any) => e.currentTarget.style.borderColor = 'var(--border)'} 
                >
                  <Edit2 size={13} /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(cat.id)} 
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: 'rgba(239,68,68,0.8)', padding: '6px 16px', borderRadius: '30px', fontSize: '0.8rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseOver={(e: any) => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.45)'; }} 
                  onMouseOut={(e: any) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = 'rgba(239,68,68,0.8)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }} 
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>

            </div>
          )) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: 'var(--muted)', fontSize: '1.1rem' }}>
              No categories found.
            </div>
          )}
        </div>
      </div>

      {/* OFFCANVAS BACKDROP */}
      {isModalOpen && (
        <div 
          onClick={handleCloseModal}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(14, 11, 8, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1040, transition: 'all 0.3s ease'
          }} 
        />
      )}

      {/* OFFCANVAS PANEL */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px', maxWidth: '100%', 
        background: 'var(--surface)', borderLeft: '1px solid var(--border)', zIndex: 1050,
        transform: isModalOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: '-10px 0 40px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 700, color: 'var(--cream)' }}>
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h2>
          <button onClick={handleCloseModal} style={{ background: 'rgba(245,158,11,0.1)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--amber)', transition: 'background 0.2s' }} onMouseOver={(e: any) => e.currentTarget.style.background = 'rgba(245,158,11,0.2)'} onMouseOut={(e: any) => e.currentTarget.style.background = 'rgba(245,158,11,0.1)'}>
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="input-group">
            <label style={{ fontSize: '11px', letterSpacing: '0.1em', fontWeight: 500, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px', display: 'block' }}>Category Name *</label>
            <input name="name" value={formData.name} onChange={handleInputChange} type="text" placeholder="e.g. Starters" className="dark-input" />
          </div>

          <div className="input-group">
            <label style={{ fontSize: '11px', letterSpacing: '0.1em', fontWeight: 500, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px', display: 'block' }}>Description</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Brief details about the category..." rows={3} className="dark-input" style={{ resize: 'vertical' }} />
          </div>

          <div className="input-group">
            <label style={{ fontSize: '11px', letterSpacing: '0.1em', fontWeight: 500, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px', display: 'block' }}>Sort Order</label>
            <input name="displayOrder" value={formData.displayOrder} onChange={handleInputChange} type="number" placeholder="e.g. 1" className="dark-input" />
          </div>
          
          <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
            <label style={{ fontSize: '11px', letterSpacing: '0.1em', fontWeight: 500, textTransform: 'uppercase', color: 'var(--muted)' }}>Active Status</label>
            <label className="toggle-switch">
              <input type="checkbox" checked={formData.status} onChange={handleStatusChange} />
              <span className="toggle-switch-slider" style={{ background: formData.status ? 'var(--amber)' : 'rgba(255,255,255,0.1)' }}></span>
            </label>
          </div>
        </div>

        <div style={{ padding: '24px 32px', borderTop: '1px solid var(--border)', display: 'flex', gap: '16px', background: 'var(--surface)' }}>
          <button 
            onClick={handleCloseModal} 
            style={{ flex: 1, height: '42px', borderRadius: '10px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif" }} 
            onMouseOver={(e: any) => { e.currentTarget.style.borderColor = 'var(--border-h)'; e.currentTarget.style.color = 'var(--cream)'; }} 
            onMouseOut={(e: any) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; }} 
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            className="btn-add"
            style={{ flex: 2, height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: 0 }} 
          >
            <Save size={18} /> {editingCategory ? 'Save Changes' : 'Add Category'}
          </button>
        </div>
      </div>

    </div>
  );
};

export default Categories;
