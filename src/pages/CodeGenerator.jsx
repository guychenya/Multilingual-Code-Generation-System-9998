import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import CodeEditor from '../components/CodeEditor';
import CodeRunner from '../components/CodeRunner';
import LanguageSelector from '../components/LanguageSelector';
import GenerationHistory from '../components/GenerationHistory';
import { generateCode, saveToHistory } from '../services/codeService';

const { FiSend, FiLoader, FiRefreshCw, FiCode, FiCpu } = FiIcons;

const CodeGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeView, setActiveView] = useState('code'); // 'code' or 'execution'
  
  // Load history from localStorage on component mount
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
      
      // Update both state and localStorage
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

  const handleClear = () => {
    setPrompt('');
    setGeneratedCode('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6 shadow-xl">
            <h2 className="text-white text-xl font-semibold mb-4">Code Generation</h2>
            <div className="space-y-4">
              <LanguageSelector value={language} onChange={setLanguage} />
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Describe what you want to build:
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Create a function to sort an array of objects by a specific property"
                  className="w-full h-32 bg-black/30 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 resize-none"
                />
              </div>
              
              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 shadow-lg"
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
                  onClick={handleClear}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 shadow-lg"
                >
                  <SafeIcon icon={FiRefreshCw} />
                  <span>Clear</span>
                </motion.button>
              </div>
            </div>
          </div>
          
          {/* Generated Code */}
          {generatedCode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6 shadow-xl"
            >
              {/* Tabs for Code and Execution */}
              <div className="flex border-b border-purple-500/20 mb-4">
                <button
                  className={`py-2 px-4 text-sm font-medium ${
                    activeView === 'code'
                      ? 'text-purple-400 border-b-2 border-purple-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                  onClick={() => setActiveView('code')}
                >
                  <SafeIcon icon={FiCode} className="inline mr-2" />
                  Code
                </button>
                
                <button
                  className={`py-2 px-4 text-sm font-medium ${
                    activeView === 'execution'
                      ? 'text-purple-400 border-b-2 border-purple-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                  onClick={() => setActiveView('execution')}
                >
                  <SafeIcon icon={FiCpu} className="inline mr-2" />
                  Execution
                </button>
              </div>
              
              {/* Tab content */}
              <div className={activeView === 'code' ? 'block' : 'hidden'}>
                <CodeEditor code={generatedCode} language={language} />
              </div>
              
              <div className={activeView === 'execution' ? 'block' : 'hidden'}>
                <CodeRunner code={generatedCode} language={language} />
              </div>
            </motion.div>
          )}
        </div>
        
        {/* History Section */}
        <div className="lg:col-span-1">
          <GenerationHistory
            history={history}
            onSelect={(entry) => {
              setPrompt(entry.prompt);
              setLanguage(entry.language);
              setGeneratedCode(entry.code);
              setActiveView('code'); // Reset to code view when selecting from history
            }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default CodeGenerator;