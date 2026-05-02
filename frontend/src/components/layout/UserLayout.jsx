import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome, FiGrid, FiCalendar, FiUser, FiLogOut,
  FiMenu, FiX, FiShield, FiClock
} from 'react-icons/fi';

const navItems = [
  { to: '/', label: 'Home', icon: FiHome, end: true },
  { to: '/services', label: 'Services', icon: FiGrid },
  { to: '/appointments', label: 'My Appointments', icon: FiCalendar },
  { to: '/profile', label: 'Profile', icon: FiUser },
];

export default function UserLayout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
            <FiClock className="text-white text-lg" />
          </div>
          <div>
            <h1 className="font-display font-bold text-gray-900 text-base leading-none">BookEase</h1>
            <p className="text-xs text-gray-400 mt-0.5">Appointment System</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3 bg-primary-50 rounded-xl p-3">
          <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 text-sm truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-3 py-4 flex-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Menu</p>
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-all duration-150 ${
                isActive ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
            onClick={() => setMobileOpen(false)}
          >
            <Icon className="text-base flex-shrink-0" />
            {label}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2 mt-4">Admin</p>
            <NavLink to="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
              onClick={() => setMobileOpen(false)}
            >
              <FiShield className="text-base" />
              Admin Panel
            </NavLink>
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-150"
        >
          <FiLogOut className="text-base" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 h-screen flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white flex flex-col shadow-xl">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100">
              <FiX className="text-gray-500 text-xl" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-xl hover:bg-gray-100">
            <FiMenu className="text-gray-600 text-xl" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <FiClock className="text-white text-sm" />
            </div>
            <span className="font-display font-bold text-gray-900">BookEase</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
