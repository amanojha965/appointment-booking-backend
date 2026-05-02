import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiGrid, FiCalendar, FiUsers, FiSettings, FiLogOut, FiMenu, FiX, FiClock, FiHome } from 'react-icons/fi';

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/admin/appointments', label: 'Appointments', icon: FiCalendar },
  { to: '/admin/services', label: 'Services', icon: FiSettings },
  { to: '/admin/users', label: 'Users', icon: FiUsers },
  { to: '/admin/timeslots', label: 'Time Slots', icon: FiClock },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const SidebarContent = () => (
    <>
      <div className="px-6 py-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
            <FiClock className="text-white text-lg" />
          </div>
          <div>
            <h1 className="font-display font-bold text-white text-base leading-none">BookEase</h1>
            <p className="text-xs text-slate-400 mt-0.5">Admin Panel</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 border-b border-slate-700">
        <div className="flex items-center gap-3 bg-slate-700 rounded-xl p-3">
          <div className="w-9 h-9 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-white text-sm truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">Administrator</p>
          </div>
        </div>
      </div>

      <nav className="px-3 py-4 flex-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">Navigation</p>
        {adminNav.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-all duration-150 ${
                isActive ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`
            }
            onClick={() => setMobileOpen(false)}
          >
            <Icon className="text-base flex-shrink-0" />
            {label}
          </NavLink>
        ))}
        <div className="mt-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">User Side</p>
          <NavLink to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-all" onClick={() => setMobileOpen(false)}>
            <FiHome className="text-base" />
            User Portal
          </NavLink>
        </div>
      </nav>

      <div className="px-3 pb-4">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-slate-700 transition-all">
          <FiLogOut className="text-base" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden lg:flex flex-col w-64 bg-slate-800 h-screen flex-shrink-0">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-slate-800 flex flex-col shadow-xl">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-700">
              <FiX className="text-slate-300 text-xl" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        <header className="lg:hidden bg-slate-800 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-xl hover:bg-slate-700">
            <FiMenu className="text-slate-300 text-xl" />
          </button>
          <span className="font-display font-bold text-white">BookEase Admin</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
