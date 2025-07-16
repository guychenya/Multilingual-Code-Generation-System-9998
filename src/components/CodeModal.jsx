import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const { 
  FiX, FiMaximize2, FiMinimize2, FiDownload, 
  FiCode, FiPlay, FiShare2, FiCopy, FiImage 
} = FiIcons;

const CodeModal = ({ code, language, isOpen, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('code');
  const [exportStatus, setExportStatus] = useState(null);
  const contentRef = useRef(null);
  const iframeRef = useRef(null);

  const handleExport = async (format) => {
    try {
      setExportStatus({ type: 'loading', message: `Preparing ${format.toUpperCase()} export...` });
      
      switch (format) {
        case 'html': {
          if (language !== 'html') throw new Error('HTML export only available for HTML content');
          const blob = new Blob([code], { type: 'text/html;charset=utf-8' });
          saveAs(blob, 'code.html');
          break;
        }
        
        case 'pdf': {
          const element = contentRef.current;
          const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#1a1a2e'
          });
          
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
          });
          
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save('code-export.pdf');
          break;
        }
        
        case 'png': {
          const element = contentRef.current;
          const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#1a1a2e'
          });
          
          canvas.toBlob((blob) => {
            saveAs(blob, 'code-screenshot.png');
          });
          break;
        }
        
        case 'md': {
          const markdown = `\`\`\`${language}\n${code}\n\`\`\``;
          const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
          saveAs(blob, 'code.md');
          break;
        }
        
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
      
      setExportStatus({ type: 'success', message: 'Export completed successfully!' });
      setTimeout(() => setExportStatus(null), 2000);
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus({ type: 'error', message: `Export failed: ${error.message}` });
      setTimeout(() => setExportStatus(null), 3000);
    }
  };

  const renderContent = () => {
    if (language === 'html' && activeTab === 'preview') {
      return (
        <div className="w-full h-full bg-white rounded-lg overflow-hidden">
          <iframe
            ref={iframeRef}
            srcDoc={code}
            title="HTML Preview"
            className="w-full h-full border-none"
            sandbox="allow-scripts"
            onLoad={() => console.log('Preview loaded')}
            onError={(e) => console.error('Preview error:', e)}
          />
        </div>
      );
    }

    return (
      <pre className="w-full h-full p-4 overflow-auto text-sm font-mono text-gray-300 whitespace-pre-wrap">
        {code}
      </pre>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className={`
              relative bg-gray-900 rounded-xl shadow-2xl overflow-hidden
              ${isFullscreen ? 'fixed inset-4' : 'w-11/12 max-w-4xl h-[80vh]'}
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold text-white">
                  {language.charAt(0).toUpperCase() + language.slice(1)} Code
                </h3>
                
                {language === 'html' && (
                  <div className="flex border border-gray-600 rounded-lg">
                    <button
                      onClick={() => setActiveTab('code')}
                      className={`px-3 py-1 text-sm rounded-l-lg ${
                        activeTab === 'code'
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <SafeIcon icon={FiCode} className="inline mr-1" />
                      Code
                    </button>
                    <button
                      onClick={() => setActiveTab('preview')}
                      className={`px-3 py-1 text-sm rounded-r-lg ${
                        activeTab === 'preview'
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <SafeIcon icon={FiPlay} className="inline mr-1" />
                      Preview
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Export Menu */}
                <div className="relative group">
                  <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700">
                    <SafeIcon icon={FiDownload} />
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 py-2 bg-gray-800 rounded-lg shadow-xl invisible group-hover:visible">
                    <button
                      onClick={() => handleExport('md')}
                      className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700"
                    >
                      Export as Markdown
                    </button>
                    <button
                      onClick={() => handleExport('pdf')}
                      className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700"
                    >
                      Export as PDF
                    </button>
                    <button
                      onClick={() => handleExport('png')}
                      className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700"
                    >
                      Save as Image
                    </button>
                    {language === 'html' && (
                      <button
                        onClick={() => handleExport('html')}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700"
                      >
                        Download HTML
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Share Button */}
                <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700">
                  <SafeIcon icon={FiShare2} />
                </button>
                
                {/* Copy Button */}
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(code);
                    setExportStatus({ type: 'success', message: 'Code copied to clipboard!' });
                    setTimeout(() => setExportStatus(null), 2000);
                  }}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
                >
                  <SafeIcon icon={FiCopy} />
                </button>
                
                {/* Screenshot Button */}
                <button
                  onClick={() => handleExport('png')}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
                >
                  <SafeIcon icon={FiImage} />
                </button>
                
                {/* Fullscreen Toggle */}
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
                >
                  <SafeIcon icon={isFullscreen ? FiMinimize2 : FiMaximize2} />
                </button>
                
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
                >
                  <SafeIcon icon={FiX} />
                </button>
              </div>
            </div>
            
            {/* Content Area */}
            <div ref={contentRef} className="relative h-[calc(100%-4rem)] overflow-hidden">
              {renderContent()}
              
              {/* Export Status Feedback */}
              <AnimatePresence>
                {exportStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`
                      absolute bottom-4 left-1/2 transform -translate-x-1/2
                      px-4 py-2 rounded-lg shadow-lg
                      ${exportStatus.type === 'loading' && 'bg-blue-600'}
                      ${exportStatus.type === 'success' && 'bg-green-600'}
                      ${exportStatus.type === 'error' && 'bg-red-600'}
                      text-white text-sm
                    `}
                  >
                    {exportStatus.message}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CodeModal;