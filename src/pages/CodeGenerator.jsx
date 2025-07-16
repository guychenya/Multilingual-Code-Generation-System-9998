import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import CodeEditor from '../components/CodeEditor';
import CodeRunner from '../components/CodeRunner';
import SmartLanguageSelector from '../components/SmartLanguageSelector';
import PromptAnalyzer from '../components/PromptAnalyzer';
import GenerationHistory from '../components/GenerationHistory';
import { generateCode, saveToHistory } from '../services/codeService';
import { enhancePrompt } from '../services/languageDetection';

const { 
  FiSend, FiLoader, FiRefreshCw, FiCode, 
  FiCpu, FiZap, FiCommand, FiFlame, FiTarget 
} = FiIcons;

// Visual feedback for code generation
const GenerationVisualizer = ({ isActive, language, analysis }) => {
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
          {analysis && analysis.confidence > 0.7 
            ? `AI detected ${language} with ${Math.round(analysis.confidence * 100)}% confidence`
            : `Analyzing prompt and crafting optimal solution${'.'.repeat(dots)}`
          }
        </p>
        <div className="flex justify-center space-x-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-purple-500"
              style={{
                animation: `bounce 1.4s ease-in-out ${i * 0.12}s infinite both`
              }}
            />
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
  const [promptAnalysis, setPromptAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Handle escape key to cancel generation
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape' && showVisualizer) {
        setShowVisualizer(false);
        setLoading(false);
        setIsAnalyzing(false);
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
    setIsAnalyzing(true);

    try {
      // Add a small delay to show the analyzer
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Enhance prompt with detected language context
      const enhancedPrompt = enhancePrompt(prompt, language);
      
      // Generate code
      const result = await generateCode(enhancedPrompt, language);
      setGeneratedCode(result.code);

      // Save to history
      const newEntry = {
        id: Date.now(),
        prompt,
        language,
        code: result.code,
        timestamp: new Date().toISOString(),
        analysis: promptAnalysis
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
      setIsAnalyzing(false);
      // Keep processing indicator for a moment to show completion
      setTimeout(() => setIsProcessing(false), 1000);
    }
  };

  const handleClear = () => {
    setPrompt('');
    setGeneratedCode('');
    setIsProcessing(false);
    setPromptAnalysis(null);
    setIsAnalyzing(false);
  };

  const handleAnalysisChange = (analysis) => {
    setPromptAnalysis(analysis);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* ... rest of the JSX remains the same ... */}
      
      {/* Visual generation feedback */}
      <AnimatePresence>
        {(showVisualizer && isAnalyzing) && (
          <GenerationVisualizer 
            isActive={true} 
            language={language} 
            analysis={promptAnalysis} 
          />
        )}
      </AnimatePresence>

      {/* Add custom styles for animation */}
      <style jsx="true">{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default CodeGenerator;