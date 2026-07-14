import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Calendar, Plus, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';

export default function Holidays() {
  const { user, token } = useSelector(state => state.auth);
  const [holidays, setHolidays] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isAdmin = user?.role === 'Admin';
  
  const [formData, setFormData] = useState({ name: '', date: '', description: '' });

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const res = await fetch('/api/holidays', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setHolidays(data);
    } catch (err) { console.error(err); }
  };

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/holidays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchHolidays();
        setFormData({ name: '', date: '', description: '' });
      }
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this holiday?')) return;
    try {
      await fetch(`/api/holidays/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      fetchHolidays();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Holidays</h1>
          <p className="text-gray-500 mt-1">Company-wide annual holidays.</p>
        </div>
        {isAdmin && (
          <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 shadow-premium">
            <Plus size={18} /> Add Holiday
          </button>
        )}
      </div>
      <div className="bg-white rounded-3xl shadow-premium border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-50">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Holiday Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
              {isAdmin && <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {holidays.length === 0 ? (
               <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No holidays added yet.</td></tr>
            ) : holidays.map(h => (
              <tr key={h._id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 font-medium text-gray-900">{h.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{format(new Date(h.date), 'MMM d, yyyy')}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{h.description}</td>
                {isAdmin && (
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(h._id)} className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"><Trash2 size={16}/></button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold">Add Holiday</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-900"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddHoliday} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Holiday Name</label>
                <input required type="text" className="w-full px-4 py-2.5 rounded-xl border border-gray-100" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
                <input required type="date" className="w-full px-4 py-2.5 rounded-xl border border-gray-100" value={formData.date} onChange={e=>setFormData({...formData, date: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea className="w-full px-4 py-2.5 rounded-xl border border-gray-100" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700">Submit</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
