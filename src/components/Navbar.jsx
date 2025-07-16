import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCode, FiHome, FiClock, FiZap } = FiIcons;

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: FiHome },
    { path: '/generator', label: 'Code Generator', icon: FiCode },
    { path: '/history', label: 'History', icon: FiClock }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-black/20 backdrop-blur-lg border-b border-purple-500/20 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <SafeIcon icon={FiZap} className="text-purple-400 text-2xl" />
            <span className="text-white font-bold text-xl">AI Code Gen</span>
          </Link>
          
          <div className="flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <SafeIcon icon={item.icon} className="text-lg" />
                <span>{item.label}</span>
                {location.pathname === item.path && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-4 left-0 right-0 h-0.5 bg-purple-400"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;