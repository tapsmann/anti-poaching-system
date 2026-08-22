import React from 'react';
import { Search, Bell, User, Menu } from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-earth-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
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
        <button className="relative p-2 hover:bg-earth-100 rounded-full transition-colors">
          <Bell size={20} className="text-zim-700" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zim-600 flex items-center justify-center text-white font-semibold text-sm">
            TN
          </div>
          <span className="text-sm font-medium text-zim-800 hidden sm:block">Thandeka Ncube</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;