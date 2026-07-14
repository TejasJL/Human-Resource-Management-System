import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Shield, Plus, X, Briefcase, Trash2, Edit2 } from 'lucide-react';

export default function LeavePlans() {
  const { user, token } = useSelector(state => state.auth);
  const [types, setTypes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const isAdmin = user?.role === 'Admin';
  
  const [formData, setFormData] = useState({
    name: '', casual: 0, sick: 0, paid: 0, unpaid: 0
  });

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      const res = await fetch('/api/employment-types', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setTypes(data);
    } catch (err) { console.error(err); }
  };

  const handleOpenModal = (type = null) => {
    if (type) {
      setEditingType(type);
      setFormData({
        name: type.name,
        casual: type.leavePolicy?.casual || 0,
        sick: type.leavePolicy?.sick || 0,
        paid: type.leavePolicy?.paid || 0,
        unpaid: type.leavePolicy?.unpaid || 0
      });
    } else {
      setEditingType(null);
      setFormData({ name: '', casual: 0, sick: 0, paid: 0, unpaid: 0 });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employment type?")) return;
    try {
      const res = await fetch(`/api/employment-types/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchTypes();
    } catch (err) { console.error(err); }
  };

  const handleAddType = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        leavePolicy: {
          casual: Number(formData.casual),
          sick: Number(formData.sick),
          paid: Number(formData.paid),
          unpaid: Number(formData.unpaid)
        }
      };
      const url = editingType ? `/api/employment-types/${editingType._id}` : '/api/employment-types';
      const method = editingType ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchTypes();
        setFormData({ name: '', casual: 0, sick: 0, paid: 0, unpaid: 0 });
      }
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Leave Plans & Employment Types</h1>
          <p className="text-gray-500 mt-1">Manage employment categories and their respective leave policies.</p>
        </div>
        {isAdmin && (
          <button onClick={() => handleOpenModal()} className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 shadow-premium">
            <Plus size={18} /> Add Category
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {types.map(t => (
          <div key={t._id} className="bg-white rounded-3xl p-6 shadow-premium border border-gray-100 relative group">
            {isAdmin && (
              <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(t)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(t._id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            )}
            <div className="flex items-center gap-4 mb-6 pr-16">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Briefcase size={24} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 truncate">{t.name}</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-500">Paid Leave</span>
                <span className="font-medium">{t.leavePolicy?.paid} Days</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-500">Casual Leave</span>
                <span className="font-medium">{t.leavePolicy?.casual} Days</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-500">Sick Leave</span>
                <span className="font-medium">{t.leavePolicy?.sick} Days</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500">Unpaid Leave</span>
                <span className="font-medium">{t.leavePolicy?.unpaid === 9999 ? 'Unlimited' : t.leavePolicy?.unpaid + ' Days'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold">{editingType ? 'Edit Category' : 'Add Employment Category'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-900"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddType} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category Name (e.g., Full Time)</label>
                <input required type="text" className="w-full px-4 py-2.5 rounded-xl border border-gray-100" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Paid Leaves</label>
                  <input required type="number" min="0" className="w-full px-4 py-2.5 rounded-xl border border-gray-100" value={formData.paid} onChange={e=>setFormData({...formData, paid: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Sick Leaves</label>
                  <input required type="number" min="0" className="w-full px-4 py-2.5 rounded-xl border border-gray-100" value={formData.sick} onChange={e=>setFormData({...formData, sick: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Casual Leaves</label>
                  <input required type="number" min="0" className="w-full px-4 py-2.5 rounded-xl border border-gray-100" value={formData.casual} onChange={e=>setFormData({...formData, casual: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Unpaid Leaves (Limit)</label>
                  <input required type="number" min="0" placeholder="9999 for unlimited" className="w-full px-4 py-2.5 rounded-xl border border-gray-100" value={formData.unpaid} onChange={e=>setFormData({...formData, unpaid: e.target.value})} />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 mt-2">
                {editingType ? 'Update Policy' : 'Create Policy'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
