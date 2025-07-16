import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const { 
  FiClock, FiCode, FiTrash2, FiSearch, 
  FiEye, FiCopy, FiChevronRight, 
  FiFilter, FiX, FiCheck
} = FiIcons;

const HistoryCard = ({ entry, onDelete, onSelect }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(entry.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  return (
    <motion.div 
      layout
      className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-lg p-4 hover:bg-white/10 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-xs font-medium">
          {entry.language}
        </span>
        <span className="text-gray-400 text-xs">
          {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
        </span>
      </div>
      
      <h3 className="text-white text-sm font-medium line-clamp-2 mb-3">
        {entry.prompt}
      </h3>
      
      <div className="flex items-center justify-between mt-auto">
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(entry)}
            className="flex items-center space-x-1 text-xs bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-3 py-1.5 rounded-lg transition-all duration-200"
          >
            <SafeIcon icon={FiEye} className="text-xs" />
            <span>View</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={copyCode}
            className="flex items-center space-x-1 text-xs bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white px-3 py-1.5 rounded-lg transition-all duration-200"
          >
            <SafeIcon icon={copied ? FiCheck : FiCopy} className="text-xs" />
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </motion.button>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDelete(entry.id)}
          className="text-red-400 hover:text-red-300 transition-colors p-1.5"
        >
          <SafeIcon icon={FiTrash2} className="text-xs" />
        </motion.button>
      </div>
    </motion.div>
  );
};

const History = () => {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const savedHistory = localStorage.getItem('codeGenerationHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const filteredHistory = history.filter(entry => {
    const matchesSearch = entry.prompt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLanguage = selectedLanguage === 'all' || entry.language === selectedLanguage;
    return matchesSearch && matchesLanguage;
  });

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all history?')) {
      setHistory([]);
      localStorage.removeItem('codeGenerationHistory');
    }
  };

  const deleteEntry = (id) => {
    const updatedHistory = history.filter(entry => entry.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('codeGenerationHistory', JSON.stringify(updatedHistory));
  };
  
  const navigateToGenerator = (entry) => {
    localStorage.setItem('selectedHistoryEntry', JSON.stringify(entry));
    window.location.href = '#/generator';
  };

  const languages = [...new Set(history.map(entry => entry.language))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
              <SafeIcon icon={FiClock} className="text-purple-400" />
              <span>Generation History</span>
            </h1>
            
            <div className="flex flex-wrap items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowFilters(!showFilters)}
                className="bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200"
              >
                <SafeIcon icon={FiFilter} />
                <span>Filters</span>
              </motion.button>
              
              {history.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={clearHistory}
                  className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200"
                >
                  <SafeIcon icon={FiTrash2} />
                  <span>Clear All</span>
                </motion.button>
              )}
              
              <Link to="/generator">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200"
                >
                  <SafeIcon icon={FiCode} />
                  <span>New Generation</span>
                </motion.button>
              </Link>
            </div>
          </div>

          {/* Filters Section */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-lg p-4"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by prompt..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-all duration-200"
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          <SafeIcon icon={FiX} />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="bg-black/30 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-400 transition-all duration-200"
                  >
                    <option value="all">All Languages</option>
                    {languages.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* History Cards Grid */}
          {filteredHistory.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-lg"
            >
              <SafeIcon icon={FiCode} className="text-gray-400 text-6xl mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-6">
                {history.length === 0 
                  ? 'No code generation history yet.' 
                  : 'No matching results found.'}
              </p>
              {history.length === 0 && (
                <Link to="/generator">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center space-x-2 transition-all duration-200"
                  >
                    <SafeIcon icon={FiCode} />
                    <span>Start Generating Code</span>
                  </motion.button>
                </Link>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
              {filteredHistory.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <HistoryCard 
                    entry={entry} 
                    onDelete={deleteEntry}
                    onSelect={navigateToGenerator}
                  />
                </motion.div>
              ))}
            </div>
          )}
          
          {/* Results Summary */}
          {filteredHistory.length > 0 && (
            <div className="text-right text-gray-400 text-sm">
              Showing {filteredHistory.length} of {history.length} entries
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default History;