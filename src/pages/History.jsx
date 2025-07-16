import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

const { 
  FiClock, FiCode, FiTrash2, FiSearch, 
  FiEye, FiCopy, FiChevronDown, FiChevronUp, 
  FiDownload, FiFilter, FiCalendar, FiX, FiCheck
} = FiIcons;

const HistoryCard = ({ entry, onDelete, onSelect }) => {
  const [expanded, setExpanded] = useState(false);
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

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const codePreview = entry.code.length > 100 
    ? entry.code.slice(0, 100) + '...' 
    : entry.code;

  return (
    <motion.div 
      layout
      className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-lg overflow-hidden"
    >
      {/* Card Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
            {entry.language}
          </span>
          <span className="text-gray-400 text-xs">
            {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
          </span>
        </div>
        
        <h3 className="text-white text-sm font-medium line-clamp-2 mb-2">
          {entry.prompt}
        </h3>
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(entry)}
              className="flex items-center space-x-1 text-xs bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-2 py-1 rounded transition-colors"
            >
              <SafeIcon icon={FiEye} className="text-xs" />
              <span>View</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={copyCode}
              className="flex items-center space-x-1 text-xs bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white px-2 py-1 rounded transition-colors"
            >
              <SafeIcon icon={copied ? FiCheck : FiCopy} className="text-xs" />
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </motion.button>
          </div>
          
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleExpand}
              className="flex items-center space-x-1 text-xs bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white px-2 py-1 rounded transition-colors"
            >
              <SafeIcon icon={expanded ? FiChevronUp : FiChevronDown} className="text-xs" />
              <span>{expanded ? 'Collapse' : 'Expand'}</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDelete(entry.id)}
              className="flex items-center space-x-1 text-xs bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-2 py-1 rounded transition-colors"
            >
              <SafeIcon icon={FiTrash2} className="text-xs" />
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Code Preview - Always visible */}
      <div className="px-4 pb-2">
        <div className="bg-black/30 border border-purple-500/10 rounded overflow-hidden">
          <SyntaxHighlighter
            language={entry.language}
            style={tomorrow}
            customStyle={{
              margin: 0,
              padding: '0.75rem',
              background: 'transparent',
              fontSize: '0.75rem',
              maxHeight: expanded ? '300px' : '60px',
              transition: 'max-height 0.3s ease'
            }}
          >
            {expanded ? entry.code : codePreview}
          </SyntaxHighlighter>
        </div>
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
    // Load history from localStorage
    const savedHistory = localStorage.getItem('codeGenerationHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const filteredHistory = history.filter(entry => {
    const matchesSearch = entry.prompt.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          entry.code.toLowerCase().includes(searchTerm.toLowerCase());
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
    // Store the selected entry to be loaded in the generator
    localStorage.setItem('selectedHistoryEntry', JSON.stringify(entry));
    window.location.href = '#/generator';
  };

  const languages = [...new Set(history.map(entry => entry.language))];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center space-x-3 mb-4 md:mb-0">
            <SafeIcon icon={FiClock} className="text-purple-400" />
            <span>Generation History</span>
          </h1>
          
          <div className="flex flex-wrap gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className="bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white px-3 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
            >
              <SafeIcon icon={FiFilter} />
              <span>Filters</span>
            </motion.button>
            
            {history.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearHistory}
                className="bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white px-3 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
              >
                <SafeIcon icon={FiTrash2} />
                <span>Clear All</span>
              </motion.button>
            )}
            
            <Link to="/generator">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg font-medium flex items-center space-x-2"
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
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-lg p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <SafeIcon icon={FiSearch} className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search prompts and code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="absolute right-3 top-3 text-gray-400 hover:text-white"
                        >
                          <SafeIcon icon={FiX} />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="bg-black/30 border border-purple-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-400"
                    >
                      <option value="all">All Languages</option>
                      {languages.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History Cards Grid */}
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12 bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-lg">
            <SafeIcon icon={FiCode} className="text-gray-400 text-6xl mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              {history.length === 0 
                ? 'No code generation history yet.' 
                : 'No results found.'}
            </p>
            {history.length === 0 && (
              <Link to="/generator">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-6 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center space-x-2"
                >
                  <SafeIcon icon={FiCode} />
                  <span>Generate Some Code</span>
                </motion.button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHistory.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
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
        
        {/* Results Count */}
        {filteredHistory.length > 0 && (
          <div className="mt-4 text-right text-gray-400 text-sm">
            Showing {filteredHistory.length} of {history.length} entries
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default History;