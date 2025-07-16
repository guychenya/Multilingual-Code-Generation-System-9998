import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { 
  FiMonitor, FiSmartphone, FiTablet, 
  FiRefreshCw, FiMaximize2, FiMinimize2 
} = FiIcons;

const HtmlPreview = ({ content, isFullscreen, onToggleFullscreen }) => {
  const iframeRef = useRef(null);
  const [viewportSize, setViewportSize] = useState('desktop');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const viewportSizes = {
    mobile: { width: '375px', height: '667px' },
    tablet: { width: '768px', height: '1024px' },
    desktop: { width: '100%', height: '100%' }
  };

  useEffect(() => {
    const renderPreview = () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (!iframeRef.current) return;
        
        const iframe = iframeRef.current;
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        
        // Reset iframe content
        doc.open();
        doc.write('');
        doc.close();
        
        // Add base styles and viewport meta
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body { margin: 0; font-family: system-ui, sans-serif; }
                * { box-sizing: border-box; }
              </style>
            </head>
            <body>${content}</body>
          </html>
        `);
        
        // Handle iframe load complete
        iframe.onload = () => {
          setIsLoading(false);
          console.log('Preview loaded successfully');
        };
        
        // Handle potential errors
        iframe.onerror = (error) => {
          console.error('Preview failed to load:', error);
          setError('Failed to load preview');
          setIsLoading(false);
        };
        
        // Safety timeout
        setTimeout(() => {
          if (isLoading) {
            setIsLoading(false);
          }
        }, 5000);
      } catch (err) {
        console.error('Error rendering preview:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    renderPreview();
  }, [content]);

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      iframe.src = 'about:blank';
      setTimeout(() => {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(content);
        doc.close();
      }, 100);
    }
  };

  return (
    <div className={`relative bg-white rounded-lg overflow-hidden ${
      isFullscreen ? 'fixed inset-4 z-50' : 'h-[500px]'
    }`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 bg-gray-100 border-b">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewportSize('mobile')}
            className={`p-2 rounded ${
              viewportSize === 'mobile'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <SafeIcon icon={FiSmartphone} />
          </button>
          
          <button
            onClick={() => setViewportSize('tablet')}
            className={`p-2 rounded ${
              viewportSize === 'tablet'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <SafeIcon icon={FiTablet} />
          </button>
          
          <button
            onClick={() => setViewportSize('desktop')}
            className={`p-2 rounded ${
              viewportSize === 'desktop'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <SafeIcon icon={FiMonitor} />
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-600 hover:bg-gray-200 rounded"
          >
            <SafeIcon icon={FiRefreshCw} />
          </button>
          
          <button
            onClick={onToggleFullscreen}
            className="p-2 text-gray-600 hover:bg-gray-200 rounded"
          >
            <SafeIcon icon={isFullscreen ? FiMinimize2 : FiMaximize2} />
          </button>
        </div>
      </div>

      {/* Preview Container */}
      <div className="relative w-full h-[calc(100%-3rem)] bg-gray-50 flex items-center justify-center">
        <div
          style={{
            width: viewportSizes[viewportSize].width,
            height: viewportSizes[viewportSize].height,
            transition: 'all 0.3s ease'
          }}
          className="relative bg-white shadow-lg overflow-hidden"
        >
          <iframe
            ref={iframeRef}
            title="HTML Preview"
            className="w-full h-full border-0"
            sandbox="allow-scripts"
          />
          
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="mt-2 text-sm text-gray-600">Loading preview...</p>
              </div>
            </div>
          )}
          
          {/* Error State */}
          {error && (
            <div className="absolute inset-0 bg-red-50 bg-opacity-90 flex items-center justify-center p-4">
              <div className="text-center">
                <div className="text-red-500 text-xl mb-2">⚠️</div>
                <h3 className="text-red-700 font-medium mb-2">Preview Error</h3>
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HtmlPreview;