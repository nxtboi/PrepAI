
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { User } from '../../types';
import { HomeIcon, BookOpenIcon, BeakerIcon, LightBulbIcon, ChartBarIcon, UserCircleIcon, ShieldCheckIcon, ChevronLeftIcon, ChevronRightIcon, AcademicCapIcon } from '../icons/Icons';

interface SidebarProps {
  user: User;
}

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <HomeIcon /> },
    { name: 'Q-Bank Generator', path: '/q-bank-generator', icon: <BookOpenIcon /> },
    { name: 'AI Doubt Solver', path: '/doubt-solver', icon: <LightBulbIcon /> },
    { name: 'Topic Wise Notes', path: '/topic-notes', icon: <AcademicCapIcon /> },
    { name: 'Analytics', path: '/analytics', icon: <ChartBarIcon /> },
    { name: 'Profile', path: '/profile', icon: <UserCircleIcon /> },
  ];

  if (user.isAdmin) {
    navItems.push({ name: 'Admin', path: '/admin', icon: <ShieldCheckIcon /> });
  }

  return (
    <div className={`relative flex flex-col bg-white h-screen shadow-md transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        {!isCollapsed && <span className="text-2xl font-bold font-serif text-primary-800">PrepAI</span>}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-full hover:bg-slate-100 text-charcoal-light">
          {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>
      </div>
      <nav className="flex-grow mt-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.name} className="px-4 py-1">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg transition-colors duration-200 relative ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 font-semibold'
                      : 'text-charcoal-light hover:bg-slate-100'
                  } ${isCollapsed ? 'justify-center' : ''}`
                }
              >
                <div className="w-6 h-6">{item.icon}</div>
                {!isCollapsed && <span className="ml-4">{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
