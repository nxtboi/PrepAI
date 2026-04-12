
import React, { useState } from 'react';
import { User } from '../../types';
import { BellIcon, ChevronDownIcon, LogoutIcon, CheckCircleIcon, AcademicCapIcon } from '../icons/Icons';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  
  const notifications = [
    {
      icon: <CheckCircleIcon className="text-green-500" />,
      message: 'Your Q-Bank on "Thermodynamics" is ready!',
      time: '5 mins ago',
    },
    {
      icon: <AcademicCapIcon className="text-blue-500" />,
      message: 'New study material for "Organic Chemistry" has been added.',
      time: '2 hours ago',
    },
  ];

  return (
    <header className="bg-cream p-4 flex items-center justify-between border-b border-slate-200">
      <div>
        <h1 className="text-xl font-semibold text-charcoal font-serif">Welcome back, {user.name.split(' ')[0]}!</h1>
        <p className="text-sm text-charcoal-light">Let's continue your journey to success.</p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative p-2 rounded-full hover:bg-slate-200 text-charcoal-light"
          >
            <BellIcon />
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>
          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10 border border-slate-200">
              <div className="p-3 font-bold text-charcoal border-b border-slate-200">
                Notifications
              </div>
              <ul className="py-1 max-h-80 overflow-y-auto">
                {notifications.map((notif, index) => (
                   <li key={index} className="flex items-start px-4 py-3 hover:bg-slate-50 cursor-pointer">
                    <div className="flex-shrink-0 w-6 h-6 mt-0.5">{notif.icon}</div>
                    <div className="ml-3">
                      <p className="text-sm text-charcoal">{notif.message}</p>
                      <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
               <div className="p-2 text-center border-t border-slate-200 bg-slate-50">
                <a href="#" className="text-sm font-semibold text-primary hover:underline">View All Notifications</a>
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-200"
          >
            <img
              src={`https://i.pravatar.cc/40?u=${user.email}`}
              alt="User Avatar"
              className="w-8 h-8 rounded-full"
            />
            <span className="hidden md:block font-medium text-charcoal">{user.name}</span>
            <ChevronDownIcon />
          </button>
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-slate-200">
              <a href="#/profile" className="block px-4 py-2 text-sm text-charcoal hover:bg-slate-100">
                My Profile
              </a>
              <button
                onClick={onLogout}
                className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogoutIcon/>
                <span className="ml-2">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
