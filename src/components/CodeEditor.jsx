import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { saveAs } from 'file-saver';

const { FiCopy, FiCheck, FiDownload, FiShare2, FiMaximize2, FiMinimize2 } = FiIcons;

const CodeEditor = ({ code, language }) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const downloadAsFile = (format) => {
    let content = code;
    let fileExtension = language;
    let mimeType = 'text/plain';

    switch (format) {
      case 'md':
        content = `\`\`\`${language}\n${code}\n\`\`\``;
        fileExtension = 'md';
        mimeType = 'text/markdown';
        break;
      case 'txt':
        fileExtension = 'txt';
        break;
      default:
        fileExtension = language;
    }

    const blob = new Blob([content], { type: mimeType });
    saveAs(blob, `code-snippet.${fileExtension}`);
  };

  const shareCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Generated Code',
          text: code,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copy
      handleCopy();
    }
  };

  return (
    <motion.div
      layout
      className={`relative transition-all duration-300 ${
        isExpanded ? 'fixed inset-4 z-50 bg-gray-900' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-300 text-sm font-medium capitalize flex items-center space-x-2">
          <span>{language}</span>
          {copied && (
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-green-400 text-xs"
            >
              Copied!
            </motion.span>
          )}
        </span>

        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            className="group flex items-center space-x-1 bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
          >
            <SafeIcon
              icon={copied ? FiCheck : FiCopy}
              className={`${copied ? 'text-green-400' : ''}`}
            />
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="group flex items-center space-x-1 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
          >
            <SafeIcon icon={isExpanded ? FiMinimize2 : FiMaximize2} />
            <span>{isExpanded ? 'Minimize' : 'Expand'}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={shareCode}
            className="group flex items-center space-x-1 bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
          >
            <SafeIcon icon={FiShare2} />
            <span>Share</span>
          </motion.button>
        </div>
      </div>

      <motion.div
        layout
        className={`relative overflow-hidden rounded-xl backdrop-blur-sm ${
          isExpanded ? 'h-[calc(100vh-6rem)]' : 'max-h-[500px]'
        }`}
      >
        <SyntaxHighlighter
          language={language}
          style={tomorrow}
          customStyle={{
            margin: 0,
            padding: '1.5rem',
            background: 'transparent',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            height: '100%',
            borderRadius: '0.75rem',
          }}
          showLineNumbers={true}
          wrapLines={true}
        >
          {code}
        </SyntaxHighlighter>

        {!isExpanded && code.length > 500 && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none" />
        )}
      </motion.div>
    </motion.div>
  );
};

export default CodeEditor;