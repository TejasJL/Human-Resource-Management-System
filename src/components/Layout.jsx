import React, { useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice.js';
import { LogOut, LayoutDashboard, Users, Calendar, CheckSquare, Briefcase, Shield, Menu, X, ChevronRight, User as UserIcon } from 'lucide-react';

export default function Layout() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    dispatch(logout());
  };

  const isAdmin = user?.role === 'Admin';

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, show: true },
    { name: 'Directory', path: '/employees', icon: Users, show: isAdmin },
    { name: 'Time & Attendance', path: '/attendance', icon: CheckSquare, show: true },
    { name: 'Time Off', path: '/leaves', icon: Calendar, show: true },
    { name: 'Holidays', path: '/holidays', icon: Calendar, show: true },
    { name: 'Payroll', path: '/payroll', icon: Briefcase, show: true },
    { name: 'Leave Plans', path: '/leave-plans', icon: Shield, show: isAdmin },
  ];

  const currentNav = navItems.find(item => item.path === location.pathname) || navItems[0];

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-gray-900/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-72 bg-gradient-to-b from-[#0B1121] to-[#0F172A] border-r border-white/5 text-gray-700 transform transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-20 px-8 bg-[#0B1121]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white tracking-tighter">
              HR
            </div>
            <span className="text-2xl font-bold tracking-tight text-white font-outfit">FocusFlow</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="px-6 py-8">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Menu</div>
          <nav className="space-y-1">
            {navItems.filter(i => i.show).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-600/10 text-blue-400 font-medium' 
                      : 'hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-blue-400' : 'text-gray-500'} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6">
          <div className="p-4 bg-white/5 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-medium shadow-inner">
                {user?.fullName?.charAt(0) || <UserIcon size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.fullName}</p>
                <p className="text-xs text-gray-500 truncate">{user?.role}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-sm font-medium text-gray-700 bg-white/5 hover:bg-white/10 hover:text-white rounded-xl transition-colors"
            >
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-900">
              <Menu size={24} />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-gray-500">Workspace</span>
              <ChevronRight size={14} className="text-gray-700" />
              <span className="font-medium text-gray-900">{currentNav.name}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}