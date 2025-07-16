import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { analyzePrompt, getFrameworkSuggestions, enhancePrompt } from '../services/languageDetection';

const { FiZap, FiTarget, FiTrendingUp, FiLayers, FiCode, FiEye, FiX } = FiIcons;

const PromptAnalyzer = ({ prompt, onAnalysisChange, className = '' }) => {
  const [analysis, setAnalysis] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (prompt && prompt.length > 20) {
      setIsAnalyzing(true);
      
      // Debounce analysis
      const timer = setTimeout(() => {
        const result = analyzePrompt(prompt);
        setAnalysis(result);
        setIsAnalyzing(false);
        
        // Notify parent component
        if (onAnalysisChange) {
          onAnalysisChange(result);
        }
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setAnalysis(null);
      setIsAnalyzing(false);
    }
  }, [prompt, onAnalysisChange]);

  if (!analysis && !isAnalyzing) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Analysis Loading */}
      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-purple-600/10 border border-purple-500/30 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiZap} className="text-purple-400 animate-pulse" />
            <span className="text-purple-300 text-sm">Analyzing your prompt...</span>
          </div>
        </motion.div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/30 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiTarget} className="text-purple-400" />
              <span className="text-purple-300 text-sm font-medium">Smart Analysis</span>
            </div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-gray-400 hover:text-white transition-colors flex items-center space-x-1"
            >
              <SafeIcon icon={showDetails ? FiX : FiEye} className="text-sm" />
              <span className="text-xs">{showDetails ? 'Hide' : 'Details'}</span>
            </button>
          </div>

          {/* Primary Suggestion */}
          {analysis.primarySuggestion && (
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <SafeIcon icon={FiTrendingUp} className="text-green-400" />
                <span className="text-green-300 text-sm font-medium">Best Match</span>
              </div>
              <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-green-200 font-medium capitalize">
                    {analysis.primarySuggestion}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${analysis.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-green-300">
                      {Math.round(analysis.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Alternative Suggestions */}
          {analysis.suggestions.length > 1 && (
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <SafeIcon icon={FiLayers} className="text-blue-400" />
                <span className="text-blue-300 text-sm font-medium">Alternative Options</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {analysis.suggestions.slice(1, 5).map(({ language, confidence }) => (
                  <div key={language} className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200 text-sm capitalize">{language}</span>
                      <span className="text-xs text-blue-300">
                        {Math.round(confidence * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                      <div 
                        className="bg-blue-500 h-1 rounded-full"
                        style={{ width: `${confidence * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Analysis */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-purple-500/20 pt-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <SafeIcon icon={FiCode} className="text-gray-400" />
                    <span className="text-gray-300 text-sm font-medium">Detection Details</span>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-gray-300 text-sm font-medium mb-2">Detected Keywords</h4>
                        <div className="space-y-1">
                          {getDetectedKeywords(prompt, analysis.primarySuggestion).map((keyword, index) => (
                            <span key={index} className="inline-block bg-purple-600/20 text-purple-300 px-2 py-1 rounded text-xs mr-1 mb-1">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-gray-300 text-sm font-medium mb-2">Confidence Factors</h4>
                        <div className="space-y-1 text-xs text-gray-400">
                          <div>• Keyword matches: {getKeywordMatches(prompt, analysis.primarySuggestion)}</div>
                          <div>• Pattern matches: {getPatternMatches(prompt, analysis.primarySuggestion)}</div>
                          <div>• Context relevance: {Math.round(analysis.confidence * 100)}%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

// Helper functions for detailed analysis
const getDetectedKeywords = (prompt, language) => {
  const keywords = {
    javascript: ['javascript', 'js', 'react', 'node', 'function', 'const', 'let'],
    python: ['python', 'py', 'def', 'class', 'import', 'django', 'flask'],
    html: ['html', 'webpage', 'website', 'form', 'div', 'button', 'input'],
    css: ['css', 'style', 'design', 'color', 'layout', 'responsive'],
    java: ['java', 'class', 'public', 'static', 'void', 'spring'],
    cpp: ['c++', 'cpp', 'class', 'namespace', 'iostream', 'vector'],
    // Add more as needed
  };

  const langKeywords = keywords[language] || [];
  const normalizedPrompt = prompt.toLowerCase();
  
  return langKeywords.filter(keyword => normalizedPrompt.includes(keyword));
};

const getKeywordMatches = (prompt, language) => {
  return getDetectedKeywords(prompt, language).length;
};

const getPatternMatches = (prompt, language) => {
  const patterns = {
    javascript: [/\b(function|const|let|var)\b/i, /\b(console\.log|document\.)\b/i],
    python: [/\b(def|class|import|from)\b/i, /\b(print|input|range)\b/i],
    html: [/\b(div|span|p|h1|h2|h3|button|input|form)\b/i],
    css: [/\b(color|background|margin|padding|border)\b/i],
    // Add more as needed
  };

  const langPatterns = patterns[language] || [];
  return langPatterns.filter(pattern => pattern.test(prompt)).length;
};

export default PromptAnalyzer;