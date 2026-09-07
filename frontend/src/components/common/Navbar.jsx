import React from 'react';
import { Search, Bell, LogOut, Menu, MapPin, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onMenuClick }) => {
  const { ranger, logout, isAdmin, role } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const initials = ranger?.name
    ? ranger.name.split(' ').map((n) => n[0]).join('').slice(0, 2)
    : '??';

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-earth-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden text-zim-800">
          <Menu size={24} />
        </button>
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search incidents, rangers, species..."
            className="pl-10 pr-4 py-2 w-80 border border-earth-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zim-500 bg-earth-50/50 text-sm"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        {ranger?.assigned_area_name && (
          <div className="hidden md:flex items-center gap-1 text-sm text-zim-700 bg-zim-50 px-3 py-1.5 rounded-lg border border-zim-200">
            <MapPin size={14} />
            <span className="font-medium">{ranger.assigned_area_name}</span>
          </div>
        )}
        {isAdmin && (
          <div className="hidden md:flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
            <Shield size={12} />
            <span>ADMIN</span>
          </div>
        )}
        {!isAdmin && role === 'supervisor' && (
          <div className="hidden md:flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200">
            <Shield size={12} />
            <span>SUPERVISOR</span>
          </div>
        )}
        <button className="relative p-2 hover:bg-earth-100 rounded-full transition-colors">
          <Bell size={20} className="text-zim-700" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zim-600 flex items-center justify-center text-white font-semibold text-sm">
            {initials}
          </div>
          <span className="text-sm font-medium text-zim-800 hidden sm:block">
            {ranger?.name || 'Unknown'}
          </span>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-2 hover:bg-red-50 rounded-full transition-colors text-gray-500 hover:text-red-600"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
