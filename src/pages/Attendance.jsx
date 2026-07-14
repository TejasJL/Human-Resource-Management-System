import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { CheckSquare, Calendar, Filter, FileText, List } from 'lucide-react';

export default function Attendance() {
  const { user, token } = useSelector(state => state.auth);
  const [attendance, setAttendance] = useState([]);
  const isAdmin = user?.role === 'Admin';
  
  const [activeTab, setActiveTab] = useState('log');
  const [reportData, setReportData] = useState([]);
  const [reportMonth, setReportMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ employeeId: '', dateRangeStart: '', dateRangeEnd: '', month: '' });
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    if (isAdmin) {
      fetch('/api/employees', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => setEmployees(Array.isArray(data) ? data : []))
        .catch(err => setEmployees([]));
    }
  }, [isAdmin, token]);

  useEffect(() => {
    fetchAttendance();
    if (isAdmin && activeTab === 'report') fetchReport();
  }, [isAdmin, activeTab, reportMonth]);

  const fetchReport = async () => {
    try {
      const res = await fetch(`/api/attendance/report?month=${reportMonth}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setReportData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendance = async (currentFilters = filters) => {
    try {
      let endpoint = isAdmin ? '/api/attendance' : '/api/attendance/my';
      if (isAdmin) {
        const queryParams = new URLSearchParams();
        if (currentFilters.employeeId) queryParams.append('employeeId', currentFilters.employeeId);
        if (currentFilters.month) queryParams.append('month', currentFilters.month);
        if (currentFilters.dateRangeStart && currentFilters.dateRangeEnd) queryParams.append('dateRange', `${currentFilters.dateRangeStart},${currentFilters.dateRangeEnd}`);
        if (queryParams.toString()) endpoint += `?${queryParams.toString()}`;
      }
      const res = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) { setAttendance([]); return; }
      const data = await res.json();
      setAttendance(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setAttendance([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Attendance</h1>
          <p className="text-gray-500 mt-1">{isAdmin ? 'Monitor company-wide attendance and late marks.' : 'View your daily attendance and time logs.'}</p>
        </div>
        {isAdmin && activeTab === 'log' && (
          <button onClick={() => setShowFilters(!showFilters)} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <Filter size={16} />
            Filter Data
          </button>
        )}
      </div>

      {showFilters && isAdmin && activeTab === 'log' && (
        <div className="bg-white p-6 rounded-3xl shadow-premium border border-gray-100 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Employee</label>
            <select value={filters.employeeId} onChange={e => setFilters({...filters, employeeId: e.target.value})} className="px-4 py-2 border border-gray-100 rounded-xl text-sm bg-white">
              <option value="">All Employees</option>
              {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.fullName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Specific Month</label>
            <input type="month" value={filters.month} onChange={e => setFilters({...filters, month: e.target.value, dateRangeStart: '', dateRangeEnd: ''})} className="px-4 py-2 border border-gray-100 rounded-xl text-sm bg-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Date Range Start</label>
            <input type="date" value={filters.dateRangeStart} onChange={e => setFilters({...filters, dateRangeStart: e.target.value, month: ''})} className="px-4 py-2 border border-gray-100 rounded-xl text-sm bg-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Date Range End</label>
            <input type="date" value={filters.dateRangeEnd} onChange={e => setFilters({...filters, dateRangeEnd: e.target.value, month: ''})} className="px-4 py-2 border border-gray-100 rounded-xl text-sm bg-white" />
          </div>
          <button onClick={() => fetchAttendance(filters)} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 text-sm h-[42px]">
            Apply Filters
          </button>
          <button onClick={() => { const cleared = { employeeId: '', dateRangeStart: '', dateRangeEnd: '', month: '' }; setFilters(cleared); fetchAttendance(cleared); }} className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl font-medium hover:bg-gray-200 text-sm h-[42px]">
            Clear
          </button>
        </div>
      )}

      {isAdmin && (
        <div className="flex items-center gap-2 border-b border-gray-100">
          <button 
            onClick={() => setActiveTab('log')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${activeTab === 'log' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <List size={18} />
            Daily Log
          </button>
          <button 
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${activeTab === 'report' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <FileText size={18} />
            Monthly Report
          </button>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-premium border border-gray-100 overflow-hidden">
        {activeTab === 'log' ? (
          <>
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Attendance Log</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-50">
                <thead className="bg-gray-50">
              <tr>
                {isAdmin && <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>}
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Punch History</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Working Hours</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-6 py-12 text-center">
                    <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                      <CheckSquare className="text-gray-500" size={24} />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900">No records found</h3>
                    <p className="mt-1 text-sm text-gray-500">There are no attendance records to display.</p>
                  </td>
                </tr>
              ) : (
                attendance.map((record) => {
                  return (
                    <tr key={record._id} className="hover:bg-gray-50/50 transition-colors">
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{record.employeeId?.fullName || <span className="text-gray-400 italic">Deleted Employee</span>}</div>
                          <div className="text-xs text-gray-500">{record.employeeId?.employeeId || '-'}</div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Calendar size={14} className="text-gray-500" />
                          {format(new Date(record.date), 'MMM d, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                        <div className="flex flex-wrap gap-2">
                          {(record.punches || []).map((p, i) => {
                            const punchType = p.type || p.action;
                            const punchTime = p.timestamp || p.time;
                            if (!punchTime) return null;
                            return (
                              <span key={i} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${punchType === 'In' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                {punchType}: {format(new Date(punchTime), 'hh:mm a')}
                              </span>
                            );
                          })}
                          {(record.punches || []).length === 0 && '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.totalWorkingHours} hrs
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.isLate ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                            Late Mark
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                            On Time
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
          </>
        ) : (
          <>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Monthly Attendance Report</h2>
              <input 
                type="month" 
                value={reportMonth}
                onChange={(e) => setReportMonth(e.target.value)}
                className="px-4 py-2 border border-gray-100 rounded-xl text-sm text-gray-700 bg-white"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-50">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Employee</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Total Days</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Present</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Absent</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Leaves</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Late Marks</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {reportData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No report data found.</td>
                    </tr>
                  ) : (
                    reportData.map((row) => (
                      <tr key={row.employeeId} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{row.fullName}</div>
                          <div className="text-xs text-gray-500">{row.employeeCode}</div>
                        </td>
                        <td className="px-6 py-4 text-center text-sm font-medium">{row.totalWorkingDays}</td>
                        <td className="px-6 py-4 text-center text-sm text-green-600 font-semibold">{row.presentDays}</td>
                        <td className="px-6 py-4 text-center text-sm text-red-600 font-semibold">{row.absentDays}</td>
                        <td className="px-6 py-4 text-center text-sm text-blue-600 font-semibold">{row.leaveDays}</td>
                        <td className="px-6 py-4 text-center text-sm text-orange-600 font-semibold">{row.lateMarks}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
