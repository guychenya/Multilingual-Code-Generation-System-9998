import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { analyzePrompt, getFrameworkSuggestions, getLanguageHints } from '../services/languageDetection';

const { 
  FiCode, FiZap, FiChevronDown, FiCheck, 
  FiStar, FiTrendingUp, FiLightbulb, FiX 
} = FiIcons;

const SmartLanguageSelector = ({ 
  prompt, 
  selectedLanguage, 
  onLanguageChange, 
  showSuggestions = true 
}) => {
  const [analysis, setAnalysis] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [displaySuggestions, setDisplaySuggestions] = useState(showSuggestions);
  const dropdownRef = useRef(null);

  const languages = [
    { value: 'javascript', label: 'JavaScript', icon: '🟨' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'html', label: 'HTML', icon: '🌐' },
    { value: 'css', label: 'CSS', icon: '🎨' },
    { value: 'java', label: 'Java', icon: '☕' },
    { value: 'cpp', label: 'C++', icon: '⚡' },
    { value: 'csharp', label: 'C#', icon: '🔷' },
    { value: 'php', label: 'PHP', icon: '🐘' },
    { value: 'ruby', label: 'Ruby', icon: '💎' },
    { value: 'go', label: 'Go', icon: '🐹' },
    { value: 'rust', label: 'Rust', icon: '🦀' },
    { value: 'swift', label: 'Swift', icon: '🍎' },
    { value: 'kotlin', label: 'Kotlin', icon: '🎯' },
    { value: 'typescript', label: 'TypeScript', icon: '🔷' },
    { value: 'sql', label: 'SQL', icon: '🗃️' },
    { value: 'bash', label: 'Bash', icon: '📟' },
    { value: 'powershell', label: 'PowerShell', icon: '💙' },
    { value: 'r', label: 'R', icon: '📊' },
    { value: 'matlab', label: 'MATLAB', icon: '🧮' },
    { value: 'scala', label: 'Scala', icon: '🔴' }
  ];

  // Analyze prompt when it changes
  useEffect(() => {
    if (prompt && prompt.length > 10) {
      const result = analyzePrompt(prompt);
      setAnalysis(result);
      
      // Auto-select if confidence is high and auto mode is enabled
      if (isAutoMode && result.confidence > 0.7 && result.primarySuggestion !== selectedLanguage) {
        onLanguageChange(result.primarySuggestion);
      }
    } else {
      setAnalysis(null);
    }
  }, [prompt, isAutoMode, selectedLanguage, onLanguageChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageSelect = (language) => {
    onLanguageChange(language);
    setShowDropdown(false);
    setIsAutoMode(false); // Disable auto mode when user manually selects
  };

  const getLanguageInfo = (langValue) => {
    return languages.find(lang => lang.value === langValue);
  };

  const selectedLangInfo = getLanguageInfo(selectedLanguage);
  const hints = getLanguageHints(selectedLanguage);

  return (
    <div className="space-y-4">
      {/* Auto/Manual Mode Toggle */}
      <div className="flex items-center justify-between">
        <label className="block text-gray-300 text-sm font-medium flex items-center space-x-2">
          <SafeIcon icon={FiCode} />
          <span>Programming Language</span>
        </label>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAutoMode(!isAutoMode)}
            className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium transition-all ${
              isAutoMode 
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' 
                : 'bg-gray-600/20 text-gray-400 border border-gray-500/30'
            }`}
          >
            <SafeIcon icon={FiZap} className={isAutoMode ? 'text-purple-400' : 'text-gray-500'} />
            <span>{isAutoMode ? 'Auto Detect' : 'Manual'}</span>
          </button>
        </div>
      </div>

      {/* Language Selector */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full bg-black/30 border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-400 flex items-center justify-between hover:bg-black/40 transition-all"
        >
          <div className="flex items-center space-x-3">
            <span className="text-lg">{selectedLangInfo?.icon}</span>
            <span>{selectedLangInfo?.label}</span>
            {analysis && analysis.primarySuggestion === selectedLanguage && (
              <div className="flex items-center space-x-1">
                <SafeIcon icon={FiStar} className="text-yellow-400 text-xs" />
                <span className="text-xs text-yellow-400">Suggested</span>
              </div>
            )}
          </div>
          <SafeIcon icon={FiChevronDown} className={`transform transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-purple-500/30 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto hide-scrollbar"
            >
              {/* Suggestions Section */}
              {analysis && analysis.suggestions.length > 0 && (
                <div className="p-3 border-b border-purple-500/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <SafeIcon icon={FiTrendingUp} className="text-purple-400 text-sm" />
                    <span className="text-purple-300 text-sm font-medium">Suggestions</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {analysis.suggestions.slice(0, 4).map(({ language, confidence }) => {
                      const langInfo = getLanguageInfo(language);
                      return (
                        <button
                          key={language}
                          onClick={() => handleLanguageSelect(language)}
                          className="flex items-center space-x-2 p-2 rounded-lg bg-purple-600/10 hover:bg-purple-600/20 transition-all text-left"
                        >
                          <span className="text-sm">{langInfo?.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-medium truncate">
                              {langInfo?.label}
                            </div>
                            <div className="text-purple-300 text-xs">
                              {Math.round(confidence * 100)}% match
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* All Languages */}
              <div className="p-2">
                <div className="text-gray-400 text-xs font-medium mb-2 px-2">All Languages</div>
                {languages.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => handleLanguageSelect(lang.value)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all ${
                      selectedLanguage === lang.value 
                        ? 'bg-purple-600/20 text-purple-300' 
                        : 'text-gray-300 hover:bg-gray-700/50'
                    }`}
                  >
                    <span className="text-sm">{lang.icon}</span>
                    <span className="flex-1 text-left">{lang.label}</span>
                    {selectedLanguage === lang.value && (
                      <SafeIcon icon={FiCheck} className="text-purple-400 text-sm" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI Analysis Display */}
      {analysis && displaySuggestions && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-purple-600/10 border border-purple-500/30 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiZap} className="text-purple-400" />
              <span className="text-purple-300 text-sm font-medium">AI Analysis</span>
            </div>
            <button
              onClick={() => setDisplaySuggestions(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <SafeIcon icon={FiX} className="text-sm" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {analysis.suggestions.slice(0, 3).map(({ language, confidence }) => {
              const langInfo = getLanguageInfo(language);
              return (
                <div key={language} className="flex items-center space-x-2">
                  <span className="text-sm">{langInfo?.icon}</span>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">{langInfo?.label}</div>
                    <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                      <div 
                        className="bg-purple-500 h-1 rounded-full"
                        style={{ width: `${confidence * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-purple-300">
                    {Math.round(confidence * 100)}%
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Language Hints */}
      {hints.length > 0 && (
        <AnimatePresence>
          {showHints && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiLightbulb} className="text-blue-400" />
                  <span className="text-blue-300 text-sm font-medium">
                    {selectedLangInfo?.label} Best Practices
                  </span>
                </div>
                <button
                  onClick={() => setShowHints(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <SafeIcon icon={FiX} className="text-sm" />
                </button>
              </div>
              
              <ul className="space-y-2">
                {hints.map((hint, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-blue-200">
                    <SafeIcon icon={FiCheck} className="text-blue-400 text-xs mt-0.5 flex-shrink-0" />
                    <span>{hint}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Toggle Hints Button */}
      <button
        onClick={() => setShowHints(!showHints)}
        className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1 transition-colors"
      >
        <SafeIcon icon={FiLightbulb} className="text-xs" />
        <span>{showHints ? 'Hide' : 'Show'} {selectedLangInfo?.label} tips</span>
      </button>
    </div>
  );
};

export default SmartLanguageSelector;