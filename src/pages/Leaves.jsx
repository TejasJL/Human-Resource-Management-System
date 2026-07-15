import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Calendar as CalendarIcon, Plus, Clock, CheckCircle, XCircle, X, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function Leaves() {
  const { user, token } = useSelector(state => state.auth);
  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isAdmin = user?.role === 'Admin';
  
  const [formData, setFormData] = useState({
    leaveType: 'Casual',
    fromDate: '',
    toDate: '',
    reason: '',
    isHalfDay: false,
    halfDayPeriod: ''
  });

  useEffect(() => {
    fetchLeaves();
    if (!isAdmin) fetchBalances();
  }, [isAdmin]);

  const fetchBalances = async () => {
    try {
      const res = await fetch('/api/leaves/balances', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setBalances(data);
    } catch(err) { console.error(err); }
  };


  const fetchLeaves = async () => {
    try {
      const endpoint = isAdmin ? '/api/leaves' : '/api/leaves/my';
      const res = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setLeaves(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/leaves/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchLeaves();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLeave = async (id) => {
    if (!window.confirm('Are you sure you want to delete this orphaned leave request?')) return;
    try {
      const res = await fetch(`/api/leaves/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchLeaves();
      } else {
        const error = await res.json();
        alert(error.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.isHalfDay) {
        delete payload.halfDayPeriod;
      }
      const res = await fetch('/api/leaves/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchLeaves();
        setFormData({ leaveType: 'Casual Leave', fromDate: '', toDate: '', reason: '', isHalfDay: false, halfDayPeriod: '' });
      } else {
        const error = await res.json();
        alert(error.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved': return <CheckCircle size={16} className="text-green-500" />;
      case 'Rejected': return <XCircle size={16} className="text-red-500" />;
      default: return <Clock size={16} className="text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Time Off</h1>
          <p className="text-gray-500 mt-1">Manage leave requests and time off policies.</p>
        </div>
        {!isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-premium shadow-blue-600/20"
          >
            <Plus size={18} />
            Request Time Off
          </button>
        )}
      </div>

      
      {!isAdmin && balances.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {balances.map(b => (
            <div key={b.type} className="bg-white rounded-2xl p-5 shadow-premium border border-gray-100">
              <h3 className="text-gray-500 text-sm font-medium">{b.type}</h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">{b.remaining}</span>
                <span className="text-sm text-gray-500">/ {b.total} left</span>
              </div>
              <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: b.total === 'Unlimited' ? '0%' : `${(b.used / b.total) * 100}%` }}></div>
              </div>
              <div className="mt-2 text-xs text-gray-500 text-right">{b.used} used</div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-premium border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Leave Requests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-50">
            <thead className="bg-gray-50">
              <tr>
                {isAdmin && <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>}
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Leave Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                {isAdmin && <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 4} className="px-6 py-12 text-center">
                    <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                      <CalendarIcon className="text-gray-500" size={24} />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900">No leave requests</h3>
                    <p className="mt-1 text-sm text-gray-500">There are no time off requests to display.</p>
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-gray-50/50 transition-colors">
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{leave.employeeId?.fullName || <span className="text-gray-400 italic">Deleted Employee</span>}</div>
                        <div className="text-xs text-gray-500">{leave.employeeId?.employeeId || '-'}</div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {leave.leaveType}
                      </div>
                      {leave.isHalfDay && <span className="ml-2 text-xs text-gray-500">(Half Day - {leave.halfDayPeriod})</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{format(new Date(leave.fromDate), 'MMM d, yyyy')}</div>
                      {leave.fromDate !== leave.toDate && (
                        <div className="text-xs text-gray-500">to {format(new Date(leave.toDate), 'MMM d, yyyy')}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {leave.reason || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(leave.status)}
                        <span className={`text-sm font-medium ${
                          leave.status === 'Approved' ? 'text-green-700' :
                          leave.status === 'Rejected' ? 'text-red-700' :
                          'text-amber-700'
                        }`}>
                          {leave.status}
                        </span>
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {leave.status === 'Pending' && (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleUpdateStatus(leave._id, 'Approved')} className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md">Approve</button>
                            <button onClick={() => handleUpdateStatus(leave._id, 'Rejected')} className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md">Reject</button>
                          </div>
                        )}
                        {!leave.employeeId && (
                          <div className="flex justify-end mt-2">
                            <button 
                              onClick={() => handleDeleteLeave(leave._id)} 
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors inline-flex items-center"
                              title="Delete orphaned record"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Request Time Off</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitLeave} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Leave Type</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm bg-white"
                  value={formData.leaveType}
                  onChange={(e) => setFormData({...formData, leaveType: e.target.value})}
                  required
                >
                  <option value="Paid Leave">Paid Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Unpaid Leave">Unpaid Leave</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">From Date</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                    value={formData.fromDate}
                    onChange={(e) => setFormData({...formData, fromDate: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">To Date</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                    value={formData.toDate}
                    onChange={(e) => setFormData({...formData, toDate: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Leave Duration</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm bg-white"
                  value={formData.isHalfDay ? formData.halfDayPeriod : 'Full Day'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'Full Day') {
                      setFormData({...formData, isHalfDay: false, halfDayPeriod: ''});
                    } else {
                      setFormData({...formData, isHalfDay: true, halfDayPeriod: val});
                    }
                  }}
                >
                  <option value="Full Day">Full Day</option>
                  <option value="First Half">First Half</option>
                  <option value="Second Half">Second Half</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason (Optional)</label>
                <textarea 
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                  rows="3"
                  placeholder="Why are you requesting time off?"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                ></textarea>
              </div>
              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-premium shadow-blue-600/20 disabled:bg-blue-400"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
