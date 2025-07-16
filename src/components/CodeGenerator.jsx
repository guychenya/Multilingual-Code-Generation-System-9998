import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import CodeEditor from '../components/CodeEditor';
import CodeRunner from '../components/CodeRunner';
import LanguageSelector from '../components/LanguageSelector';
import GenerationHistory from '../components/GenerationHistory';
import { generateCode, saveToHistory } from '../services/codeService';

const { FiSend, FiLoader, FiRefreshCw, FiCode, FiCpu, FiFlame, FiZap, FiCommand } = FiIcons;

// Visual feedback for code generation
const GenerationVisualizer = ({ isActive, language }) => {
  const [dots, setDots] = useState(0);
  
  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      setDots(prev => (prev + 1) % 4);
    }, 300);
    
    return () => clearInterval(interval);
  }, [isActive]);
  
  if (!isActive) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <div className="bg-gray-900 border border-purple-500/30 rounded-xl p-8 shadow-2xl max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-purple-600/20 animate-ping"></div>
            <div className="relative z-10 bg-purple-600 text-white p-4 rounded-full">
              <SafeIcon icon={FiZap} className="text-3xl animate-pulse" />
            </div>
          </div>
        </div>
        
        <h3 className="text-white text-xl font-bold text-center mb-2">
          Generating {language.charAt(0).toUpperCase() + language.slice(1)} Code
        </h3>
        
        <p className="text-gray-300 text-center mb-6">
          Analyzing prompt and crafting optimal solution{'.'.repeat(dots)}
        </p>
        
        <div className="flex justify-center space-x-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className="h-2 w-2 rounded-full bg-purple-500"
              style={{
                animation: `bounce 1.4s ease-in-out ${i * 0.12}s infinite both`
              }}
            ></div>
          ))}
        </div>
        
        <div className="text-center text-gray-400 text-sm">
          <SafeIcon icon={FiCommand} className="inline mr-1" /> 
          Press Esc to cancel
        </div>
      </div>
    </motion.div>
  );
};

const CodeGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeView, setActiveView] = useState('code');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showVisualizer, setShowVisualizer] = useState(false);

  // Handle escape key to cancel generation
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape' && showVisualizer) {
        setShowVisualizer(false);
        setLoading(false);
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showVisualizer]);

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
    setIsProcessing(true);
    setShowVisualizer(true);
    
    try {
      // Add a small delay to show the visualizer
      await new Promise(resolve => setTimeout(resolve, 800));
      
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
      setShowVisualizer(false);
      
      // Keep processing indicator for a moment to show completion
      setTimeout(() => setIsProcessing(false), 1000);
    }
  };

  const handleClear = () => {
    setPrompt('');
    setGeneratedCode('');
    setIsProcessing(false);
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
              <div className="flex items-center justify-between">
                <h2 className="text-white text-xl font-semibold">Code Generation</h2>
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center space-x-2 text-amber-400"
                  >
                    <SafeIcon
                      icon={FiFlame}
                      className="animate-pulse"
                    />
                    <span className="text-sm">Processing...</span>
                  </motion.div>
                )}
              </div>
              
              <LanguageSelector value={language} onChange={setLanguage} />
              
              <div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Create a function to sort an array of objects by a specific property"
                  className="w-full h-32 bg-black/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none transition-all duration-200"
                />
              </div>
              
              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerate}
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
                  onClick={handleClear}
                  className="bg-gray-600/50 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 hover:bg-gray-600/70 transition-all duration-200"
                >
                  <SafeIcon icon={FiRefreshCw} />
                  <span>Clear</span>
                </motion.button>
              </div>
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
                        activeView === 'code'
                          ? 'text-purple-400'
                          : 'text-gray-300 hover:text-white'
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
                    
                    <button
                      role="tab"
                      aria-selected={activeView === 'execution'}
                      className={`py-3 px-4 text-sm font-medium relative ${
                        activeView === 'execution'
                          ? 'text-purple-400'
                          : 'text-gray-300 hover:text-white'
                      }`}
                      onClick={() => setActiveView('execution')}
                    >
                      <SafeIcon icon={FiCpu} className="inline mr-2" />
                      Execution
                      {activeView === 'execution' && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400"
                        />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <AnimatePresence mode="wait">
                    {activeView === 'code' && (
                      <motion.div
                        key="code"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <CodeEditor code={generatedCode} language={language} />
                      </motion.div>
                    )}
                    
                    {activeView === 'execution' && (
                      <motion.div
                        key="execution"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <CodeRunner code={generatedCode} language={language} />
                      </motion.div>
                    )}
                  </AnimatePresence>
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
      
      {/* Visual generation feedback */}
      <AnimatePresence>
        {showVisualizer && (
          <GenerationVisualizer isActive={true} language={language} />
        )}
      </AnimatePresence>
      
      {/* Add custom styles for animation */}
      <style jsx="true">{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
};

export default CodeGenerator;