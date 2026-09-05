import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, AlertTriangle, PawPrint, Users, MapPin, BarChart3,
  Shield, FileText, Wrench, Eye, Skull, Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { isAdmin, isSupervisor } = useAuth();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/incidents', icon: AlertTriangle, label: 'Incidents' },
    { path: '/patrols', icon: MapPin, label: 'Patrols' },
    { path: '/protected-areas', icon: Shield, label: 'Protected Areas', adminOnly: true },
    { path: '/reports', icon: FileText, label: 'Reports' },
    { path: '/species', icon: PawPrint, label: 'Species' },
    { path: '/rangers', icon: Users, label: 'Rangers' },
    { path: '/poachers', icon: Skull, label: 'Poachers' },
    { path: '/equipment', icon: Wrench, label: 'Equipment', supervisorOnly: true },
    { path: '/observations', icon: Eye, label: 'Observations' },
    { path: '/alerts', icon: Bell, label: 'Alerts' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const filteredItems = navItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.supervisorOnly && !isSupervisor) return false;
    return true;
  });

  const handleNav = () => {
    if (window.innerWidth < 1024) onClose?.();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          bg-zim-800 text-white w-64 min-h-screen flex flex-col shadow-xl
          fixed top-0 left-0 z-40 transition-transform duration-200 ease-in-out
          lg:static lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-5 border-b border-zim-700 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gold-400">ZimParks</h1>
            <p className="text-xs text-earth-300 mt-0.5">Anti-Poaching System</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-earth-400 hover:text-white p-1"
          >
            &#x2715;
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={handleNav}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm
                ${isActive ? 'bg-gold-500/20 text-gold-400 border-l-4 border-gold-500' : 'hover:bg-zim-700/50 text-earth-200'}
              `}
            >
              <item.icon size={18} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-zim-700 text-xs text-earth-400 text-center">
          v2.0 - ZimParks Authority
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
