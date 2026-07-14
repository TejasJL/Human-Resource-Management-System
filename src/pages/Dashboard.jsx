import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Clock, Play, Square, Coffee, Calendar as CalendarIcon, Briefcase, CheckSquare } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, parseISO, isBefore, isWeekend } from 'date-fns';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function Dashboard() {
  const { user, token } = useSelector(state => state.auth);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allMonthAttendance, setAllMonthAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayDetails, setSelectedDayDetails] = useState(null);

  const fetchData = async () => {
    try {
      const month = format(currentDate, 'MM');
      const year = format(currentDate, 'yyyy');
      
      const [attRes, leavesRes, holRes] = await Promise.all([
        fetch(`/api/attendance/my?month=${month}&year=${year}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/leaves/my', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/holidays', { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);
      
      const attData = attRes.ok ? await attRes.json() : [];
      const leavesData = leavesRes.ok ? await leavesRes.json() : [];
      const holData = holRes.ok ? await holRes.json() : [];
      
      setAllMonthAttendance(Array.isArray(attData) ? attData : []);
      setLeaves(Array.isArray(leavesData) ? leavesData : []);
      setHolidays(Array.isArray(holData) ? holData : []);
      
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const todayRecord = (Array.isArray(attData) ? attData : []).find(r => r.date === todayStr);
      setAttendance(todayRecord);

      // Fetch balances separately so errors don't crash everything
      try {
        const balRes = await fetch('/api/leaves/balances', { headers: { 'Authorization': `Bearer ${token}` } });
        if (balRes.ok) {
          const balData = await balRes.json();
          setBalances(Array.isArray(balData) ? balData : []);
        }
      } catch (e) { /* balances not critical */ }

    } catch (err) {
      console.error(err);
    }
  };

  const fetchTodayAttendance = async () => {}; // dummy to keep existing references happy

  useEffect(() => {
    if (user?.role !== 'Admin') {
      fetchData();
    }
  }, [user, token, currentDate]);

  const handlePunchIn = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/attendance/punch-in', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok) {
        await fetchData();
      } else {
        alert(data.message || 'Could not punch in');
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePunchOut = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/attendance/punch-out', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok) {
        await fetchData();
      } else {
        alert(data.message || 'Could not punch out');
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const dateFormat = "d";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const getDayDetails = (day) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const hol = holidays.find(h => h.date === dayStr);
    const att = allMonthAttendance.find(a => a.date === dayStr);
    // Find any leave (approved or pending) covering this date
    const approvedLeave = leaves.find(l => 
      l.status === 'Approved' && 
      (dayStr >= l.fromDate && dayStr <= l.toDate)
    );
    const pendingLeave = leaves.find(l => 
      l.status === 'Pending' && 
      (dayStr >= l.fromDate && dayStr <= l.toDate)
    );
    const leave = approvedLeave || pendingLeave;
    
    let colorClass = "bg-white";
    let type = "Regular";
    
    if (hol) {
      colorClass = "bg-purple-100 text-purple-800 border-purple-200";
      type = "Holiday";
    } else if (approvedLeave) {
      if (approvedLeave.isHalfDay) {
        colorClass = "bg-yellow-100 text-yellow-800 border-yellow-200";
        type = "Half Day Leave";
      } else if (approvedLeave.leaveType === "Unpaid Leave") {
        colorClass = "bg-orange-100 text-orange-800 border-orange-200";
        type = "Unpaid Leave";
      } else {
        colorClass = "bg-blue-100 text-blue-800 border-blue-200";
        type = "Paid Leave";
      }
    } else if (pendingLeave) {
      colorClass = "bg-amber-100 text-amber-800 border-amber-200";
      type = "Leave (Pending)";
    } else if (att && att.punches.length > 0) {
      colorClass = "bg-green-100 text-green-800 border-green-200";
      type = "Present";
    } else if (!isWeekend(day) && isBefore(day, new Date()) && !isSameDay(day, new Date())) {
      colorClass = "bg-red-100 text-red-800 border-red-200";
      type = "Absent";
    } else if (isSameDay(day, new Date())) {
      colorClass = "bg-blue-50 border-blue-400 font-bold text-blue-900";
    }
    
    return { hol, att, leave, colorClass, type, dayStr };
  };

  const isAdmin = user?.role === 'Admin';

  const punches = attendance?.punches || [];
  const lastPunch = punches[punches.length - 1];
  const isPunchedIn = lastPunch?.type === 'In';

  const currentTime = new Date();
  const greeting = currentTime.getHours() < 12 ? 'Good morning' : currentTime.getHours() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">{greeting}, {user?.fullName?.split(' ')[0]}</h1>
        <p className="text-gray-500 mt-2">Here's what's happening today, {format(currentTime, 'EEEE, MMMM do')}.</p>
      </div>
      
      {!isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Time Tracking Widget */}
          <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-premium border border-gray-100 flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="text-lg font-semibold text-gray-900">Time Clock</h3>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${isPunchedIn ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {isPunchedIn ? '● Active' : '● Offline'}
              </div>
            </div>

            <div className="text-center mb-10 relative z-10">
              <div className="text-5xl font-bold text-gray-900 tracking-tight font-mono">
                {format(currentTime, 'HH:mm')}
              </div>
              <div className="text-gray-500 mt-1">{format(currentTime, 'O')}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-auto relative z-10">
              <button
                onClick={handlePunchIn}
                disabled={isPunchedIn || loading}
                className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl font-medium transition-all ${
                  isPunchedIn 
                    ? 'bg-gray-50 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 hover:-translate-y-0.5'
                }`}
              >
                <Play size={20} className={isPunchedIn ? '' : 'fill-current'} />
                <span className="text-sm">Punch In</span>
              </button>
              <button
                onClick={handlePunchOut}
                disabled={!isPunchedIn || loading}
                className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl font-medium transition-all ${
                  !isPunchedIn 
                    ? 'bg-gray-50 text-gray-500 cursor-not-allowed' 
                    : 'bg-[#0F172A] text-white hover:bg-black shadow-md shadow-black/10 hover:-translate-y-0.5'
                }`}
              >
                <Square size={20} className={!isPunchedIn ? '' : 'fill-current'} />
                <span className="text-sm">Punch Out</span>
              </button>
            </div>
          </div>

          {/* Stats Widgets */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-3xl shadow-premium border border-gray-100 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 text-gray-50">
                <Clock size={120} strokeWidth={1} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Clock size={20} />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Working Hours</h3>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-5xl font-bold text-gray-900 tracking-tight">
                    {attendance?.totalWorkingHours || '0.00'}
                  </p>
                  <span className="text-lg font-medium text-gray-500">hrs</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-premium border border-gray-100 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 text-gray-50">
                <Coffee size={120} strokeWidth={1} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <Coffee size={20} />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Break Duration</h3>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-5xl font-bold text-gray-900 tracking-tight">
                    {attendance?.totalBreakDuration || '0.00'}
                  </p>
                  <span className="text-lg font-medium text-gray-500">hrs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Leave Balances Widget */}
          <div className="lg:col-span-3 mt-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Balances</h3>
            {balances.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 shadow-premium border border-gray-100 text-center text-gray-500 text-sm">
                No leave policy assigned. Contact your administrator.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {balances.map(b => (
                  <div key={b.type} className="bg-white rounded-2xl p-5 shadow-premium border border-gray-100">
                    <h4 className="text-gray-500 text-sm font-semibold mb-3">{b.type}</h4>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Available</span>
                        <span className="font-semibold text-gray-900">{b.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Used</span>
                        <span className="font-semibold text-red-600">{b.used}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-100 pt-1.5">
                        <span className="text-gray-500">Remaining</span>
                        <span className="font-bold text-green-600">{b.remaining}</span>
                      </div>
                    </div>
                    <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: b.total === 'Unlimited' || b.total === 0 ? '0%' : `${Math.min(100, (b.used / b.total) * 100)}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Calendar Widget */}
          
          <div className="lg:col-span-3 bg-white p-8 rounded-3xl shadow-premium border border-gray-100 mt-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Attendance Calendar</h3>
              <div className="flex items-center gap-4">
                <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft size={20}/></button>
                <span className="font-medium text-lg min-w-[120px] text-center">{format(currentDate, 'MMMM yyyy')}</span>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight size={20}/></button>
              </div>
            </div>
            
            <div className="flex gap-4 items-center flex-wrap mb-6 text-sm">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-green-500 rounded-full"></span>Present</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-500 rounded-full"></span>Absent</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-blue-500 rounded-full"></span>Paid Leave</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-orange-500 rounded-full"></span>Unpaid</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-yellow-400 rounded-full"></span>Half Day</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-purple-500 rounded-full"></span>Holiday</span>
            </div>
            
            <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-100 rounded-xl overflow-hidden">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="bg-gray-50 py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{d}</div>
              ))}
              {days.map((day, idx) => {
                const details = getDayDetails(day);
                const isCurrentMonth = isSameMonth(day, monthStart);
                return (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedDayDetails({ day, ...details })}
                    className={`bg-white min-h-[80px] p-2 cursor-pointer transition-colors hover:bg-gray-50 ${!isCurrentMonth ? 'opacity-40' : ''}`}
                  >
                    <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm ${details.colorClass}`}>
                      {format(day, dateFormat)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {selectedDayDetails && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm overflow-y-auto">
              <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden my-8">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <h2 className="text-xl font-semibold">{format(selectedDayDetails.day, 'MMMM do, yyyy')}</h2>
                  <button onClick={() => setSelectedDayDetails(null)} className="text-gray-500 hover:text-gray-900"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-5">
                  {/* Status Badge */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Day Status</p>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${selectedDayDetails.colorClass}`}>
                      {selectedDayDetails.type}
                    </span>
                  </div>

                  {/* Holiday Section */}
                  {selectedDayDetails.hol ? (
                    <div className="bg-purple-50 rounded-2xl p-4">
                      <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">🎉 Holiday</p>
                      <p className="font-semibold text-gray-900">{selectedDayDetails.hol.name}</p>
                      {selectedDayDetails.hol.description && <p className="text-sm text-gray-500 mt-0.5">{selectedDayDetails.hol.description}</p>}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Holiday</p>
                      <p className="text-sm text-gray-500">No holiday on this date</p>
                    </div>
                  )}

                  {/* Leave Section */}
                  {selectedDayDetails.leave ? (
                    <div className="bg-blue-50 rounded-2xl p-4">
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">📋 Leave Details</p>
                      <p className="font-semibold text-gray-900">{selectedDayDetails.leave.leaveType}</p>
                      {selectedDayDetails.leave.isHalfDay && (
                        <span className="inline-block mt-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">{selectedDayDetails.leave.halfDayPeriod || 'Half Day'}</span>
                      )}
                      <p className="text-sm text-gray-500 mt-1">Status: <span className="font-medium">{selectedDayDetails.leave.status}</span></p>
                      {selectedDayDetails.leave.reason && <p className="text-sm text-gray-500 mt-0.5">Reason: {selectedDayDetails.leave.reason}</p>}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Leave Details</p>
                      <p className="text-sm text-gray-500">No approved leave on this date</p>
                    </div>
                  )}

                  {/* Attendance Section */}
                  {selectedDayDetails.att && selectedDayDetails.att.punches?.length > 0 ? (
                    <div className="bg-green-50 rounded-2xl p-4">
                      <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-2">⏰ Attendance</p>
                      <div className="space-y-2 mb-3">
                        {selectedDayDetails.att.punches.map((p, i) => {
                          const punchType = p.type || p.action;
                          const punchTime = p.timestamp || p.time;
                          if (!punchTime) return null;
                          return (
                            <div key={i} className="flex justify-between items-center bg-white px-3 py-2 rounded-xl">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${punchType === 'In' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                {punchType}
                              </span>
                              <span className="font-medium text-gray-900 text-sm">{format(new Date(punchTime), 'hh:mm a')}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="grid grid-cols-2 gap-3 border-t border-green-100 pt-3">
                        <div>
                          <p className="text-xs text-gray-500">Working Hours</p>
                          <p className="font-bold text-gray-900">{selectedDayDetails.att.totalWorkingHours || '0.00'} hrs</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Late Mark</p>
                          <p className={`font-bold ${selectedDayDetails.att.isLate ? 'text-red-600' : 'text-green-600'}`}>
                            {selectedDayDetails.att.isLate ? '⚠ Yes' : '✓ No'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Attendance</p>
                      <p className="text-sm text-gray-500">No punch records for this date</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-lg shadow-blue-900/20 text-white relative overflow-hidden group">
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform duration-500">
              <Briefcase size={140} />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 border border-white/20">
                <Briefcase size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Company Overview</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                Monitor active employees, run automated payroll workflows, and track compliance metrics in real-time.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-fuchsia-700 p-8 rounded-3xl shadow-lg shadow-purple-900/20 text-white relative overflow-hidden group">
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform duration-500">
              <CalendarIcon size={140} />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 border border-white/20">
                <CalendarIcon size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Leave Requests</h3>
              <p className="text-purple-100 text-sm leading-relaxed">
                Review and approve time off, manage holidays, and configure custom leave policies.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-3xl shadow-lg shadow-emerald-900/20 text-white relative overflow-hidden group">
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform duration-500">
              <CheckSquare size={140} />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 border border-white/20">
                <CheckSquare size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Daily Attendance</h3>
              <p className="text-emerald-100 text-sm leading-relaxed">
                Review company-wide punch records, track late marks, and identify absenteeism trends.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}