import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, AlertTriangle, PawPrint, Users, MapPin, BarChart3,
  Shield, FileText, Wrench, Eye, Skull, Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen }) => {
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

  return (
    <aside className="bg-zim-800 text-white w-64 min-h-screen fixed top-0 left-0 z-30 flex flex-col shadow-xl">
      <div className="p-5 border-b border-zim-700">
        <h1 className="text-xl font-bold text-gold-400">ZimParks</h1>
        <p className="text-xs text-earth-300 mt-0.5">Anti-Poaching System</p>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
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
  );
};

export default Sidebar;
