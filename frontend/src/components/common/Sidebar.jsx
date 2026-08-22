import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, AlertTriangle, PawPrint, Users, MapPin, BarChart3 } from 'lucide-react';

const Sidebar = ({ isOpen }) => {
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/incidents', icon: AlertTriangle, label: 'Incidents' },
    { path: '/species', icon: PawPrint, label: 'Species' },
    { path: '/rangers', icon: Users, label: 'Rangers' },
    { path: '/patrols', icon: MapPin, label: 'Patrols' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  return (
    <aside className="bg-zim-800 text-white w-64 min-h-screen fixed top-0 left-0 z-30 flex flex-col shadow-xl">
      <div className="p-5 border-b border-zim-700">
        <h1 className="text-xl font-bold text-gold-400">🌿 ZimParks</h1>
        <p className="text-xs text-earth-300 mt-0.5">Anti-Poaching System</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
              ${isActive ? 'bg-gold-500/20 text-gold-400 border-l-4 border-gold-500' : 'hover:bg-zim-700/50 text-earth-200'}
            `}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-zim-700 text-xs text-earth-400 text-center">
        v2.0 · TLS 1.3
      </div>
    </aside>
  );
};

export default Sidebar;