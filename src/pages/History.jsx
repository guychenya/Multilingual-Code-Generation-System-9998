import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

const { FiClock, FiCode, FiTrash2, FiSearch } = FiIcons;

const History = () => {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');

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
    setHistory([]);
    localStorage.removeItem('codeGenerationHistory');
  };

  const deleteEntry = (id) => {
    const updatedHistory = history.filter(entry => entry.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('codeGenerationHistory', JSON.stringify(updatedHistory));
  };

  const languages = [...new Set(history.map(entry => entry.language))];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
            <SafeIcon icon={FiClock} className="text-purple-400" />
            <span>Generation History</span>
          </h1>
          
          {history.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearHistory}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2"
            >
              <SafeIcon icon={FiTrash2} />
              <span>Clear All</span>
            </motion.button>
          )}
        </div>
        
        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6 mb-6">
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
        
        {/* History List */}
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <SafeIcon icon={FiCode} className="text-gray-400 text-6xl mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              {history.length === 0 ? 'No code generation history yet.' : 'No results found.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {entry.language}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-white font-medium mb-2">{entry.prompt}</p>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => deleteEntry(entry.id)}
                    className="text-red-400 hover:text-red-300 p-2"
                  >
                    <SafeIcon icon={FiTrash2} />
                  </motion.button>
                </div>
                
                <pre className="bg-black/30 border border-purple-500/30 rounded-lg p-4 text-gray-300 text-sm overflow-x-auto">
                  <code>{entry.code}</code>
                </pre>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default History;