import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import ExportOptions from './ExportOptions';

const { FiChevronDown, FiChevronRight, FiMaximize2, FiMinimize2 } = FiIcons;

const CollapsibleCode = ({ code, language, lineNumbers = true }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const codeRef = useRef(null);

  // Split code into sections based on comments or natural breaks
  const sections = code.split(/(?=\/\/ ---|\/\* ---|\/\/ Section:)/).filter(Boolean);

  useEffect(() => {
    const handleKeyPress = (e) => {
      // Toggle collapse with Ctrl/Cmd + Plus
      if ((e.ctrlKey || e.metaKey) && e.key === '+') {
        e.preventDefault();
        setIsCollapsed(false);
      }
      // Toggle collapse with Ctrl/Cmd + Minus
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        setIsCollapsed(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const toggleSection = (index) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setIsCollapsed(false);
    setExpandedSections(new Set(sections.map((_, i) => i)));
  };

  const collapseAll = () => {
    setIsCollapsed(true);
    setExpandedSections(new Set());
  };

  return (
    <div className="rounded-lg overflow-hidden border border-purple-500/20">
      <div className="bg-gray-800 p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-300 hover:text-white"
          >
            <SafeIcon 
              icon={isCollapsed ? FiChevronRight : FiChevronDown} 
              className="w-5 h-5"
            />
          </motion.button>
          <span className="text-gray-300 text-sm">
            {language} ({sections.length} sections)
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <ExportOptions
            elementRef={codeRef}
            content={code}
            filename={`code-${language}`}
            type="code"
          />
          <button
            onClick={expandAll}
            className="text-sm text-gray-300 hover:text-white flex items-center space-x-1"
          >
            <SafeIcon icon={FiMaximize2} className="w-4 h-4" />
            <span>Expand All</span>
          </button>
          <button
            onClick={collapseAll}
            className="text-sm text-gray-300 hover:text-white flex items-center space-x-1"
          >
            <SafeIcon icon={FiMinimize2} className="w-4 h-4" />
            <span>Collapse All</span>
          </button>
        </div>
      </div>

      <div ref={codeRef} className="code-content">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {sections.map((section, index) => {
                const sectionTitle = section.match(/(?:\/\/|\/\*)\s*(?:---|Section:)\s*(.+?)(?:\r?\n|\*\/)/)?.[1] || `Section ${index + 1}`;
                const sectionCode = section.replace(/(?:\/\/|\/\*)\s*(?:---|Section:)\s*.+?\r?\n/, '').trim();
                const isExpanded = expandedSections.has(index);

                return (
                  <div key={index} className="border-t border-purple-500/20">
                    <button
                      onClick={() => toggleSection(index)}
                      className="w-full text-left px-4 py-2 bg-gray-800/50 hover:bg-gray-800 flex items-center space-x-2"
                    >
                      <SafeIcon 
                        icon={isExpanded ? FiChevronDown : FiChevronRight} 
                        className="w-4 h-4 text-gray-400"
                      />
                      <span className="text-gray-300 text-sm">{sectionTitle}</span>
                    </button>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <SyntaxHighlighter
                            language={language}
                            style={tomorrow}
                            showLineNumbers={lineNumbers}
                            customStyle={{
                              margin: 0,
                              borderRadius: 0,
                              background: 'transparent',
                            }}
                          >
                            {sectionCode}
                          </SyntaxHighlighter>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CollapsibleCode;