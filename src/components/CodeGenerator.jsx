import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import CodeEditor from './CodeEditor';
import CodeRunner from './CodeRunner';
import LanguageSelector from './LanguageSelector';
import PromptAnalyzer from './PromptAnalyzer';
import GenerationHistory from './GenerationHistory';
import { generateCode, saveToHistory } from '../services/codeService';
import { enhancePrompt } from '../services/languageDetection';

const { FiSend, FiLoader, FiRefreshCw, FiCode, FiMessageSquare } = FiIcons;

const CodeGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeView, setActiveView] = useState('code');

  useEffect(() => {
    const savedHistory = localStorage.getItem('codeGenerationHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error parsing saved history:', error);
      }
    }
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    try {
      const result = await generateCode(prompt, language);
      setGeneratedCode(result.code);
      
      const newEntry = {
        id: Date.now(),
        prompt,
        language,
        code: result.code,
        timestamp: new Date().toISOString()
      };
      
      setHistory(prev => {
        const updated = [newEntry, ...prev];
        saveToHistory(newEntry);
        return updated;
      });
    } catch (error) {
      console.error('Error generating code:', error);
      setGeneratedCode('// Error generating code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePromptSubmit = (e) => {
    e.preventDefault();
    handleGenerate();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="backdrop-blur-sm bg-opacity-5 bg-white rounded-xl overflow-hidden">
            <div className="p-6 space-y-4">
              <h2 className="text-white text-xl font-semibold flex items-center space-x-2">
                <SafeIcon icon={FiMessageSquare} />
                <span>What would you like to create?</span>
              </h2>

              <LanguageSelector value={language} onChange={setLanguage} />

              <form onSubmit={handlePromptSubmit}>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Create a function to sort an array of objects by a specific property"
                  className="w-full h-32 bg-black/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none transition-all duration-200"
                />
                <div className="flex space-x-4 mt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading || !prompt.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {loading ? (
                      <>
                        <SafeIcon icon={FiLoader} className="animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <SafeIcon icon={FiSend} />
                        <span>Generate Code</span>
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      setPrompt('');
                      setGeneratedCode('');
                    }}
                    className="bg-gray-600/50 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 hover:bg-gray-600/70 transition-all duration-200"
                  >
                    <SafeIcon icon={FiRefreshCw} />
                    <span>Clear</span>
                  </motion.button>
                </div>
              </form>
            </div>
          </div>

          {/* Generated Code */}
          <AnimatePresence>
            {generatedCode && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="backdrop-blur-sm bg-opacity-5 bg-white rounded-xl overflow-hidden"
              >
                <div className="border-b border-purple-500/10">
                  <div className="flex px-4" role="tablist">
                    <button
                      role="tab"
                      aria-selected={activeView === 'code'}
                      className={`py-3 px-4 text-sm font-medium relative ${
                        activeView === 'code' ? 'text-purple-400' : 'text-gray-300 hover:text-white'
                      }`}
                      onClick={() => setActiveView('code')}
                    >
                      <SafeIcon icon={FiCode} className="inline mr-2" />
                      Code
                      {activeView === 'code' && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400"
                        />
                      )}
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <CodeEditor code={generatedCode} language={language} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* History Section */}
        <div className="lg:col-span-1">
          <GenerationHistory
            history={history}
            onSelect={(entry) => {
              setPrompt(entry.prompt);
              setLanguage(entry.language);
              setGeneratedCode(entry.code);
              setActiveView('code');
            }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default CodeGenerator;