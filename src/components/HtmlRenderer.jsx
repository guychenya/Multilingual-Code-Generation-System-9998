import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import ShareButtons from './ShareButtons';

const { FiMaximize2, FiMinimize2, FiDownload, FiCamera, FiRefreshCw } = FiIcons;

const HtmlRenderer = ({ htmlContent }) => {
  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [renderError, setRenderError] = useState(null);

  useEffect(() => {
    if (!htmlContent) return;
    
    setIsLoading(true);
    setRenderError(null);
    
    try {
      // Create a new iframe element
      const iframe = document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      iframe.style.borderRadius = '0.375rem';
      iframe.style.backgroundColor = 'white';
      
      // Handle iframe load event
      iframe.onload = () => {
        console.log('HtmlRenderer: iframe loaded');
        setIsLoading(false);
      };
      
      // Handle iframe error event
      iframe.onerror = (error) => {
        console.error('HtmlRenderer: iframe error', error);
        setRenderError('Failed to load HTML content');
        setIsLoading(false);
      };
      
      // Clear container and append iframe
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(iframe);
        iframeRef.current = iframe;
        
        // Get iframe document and write HTML content
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(htmlContent);
        doc.close();
        
        // Set timeout to ensure loading state gets cleared even if onload doesn't fire
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error rendering HTML:', error);
      setRenderError(`Error rendering HTML: ${error.message}`);
      setIsLoading(false);
    }
    
    // Cleanup function
    return () => {
      try {
        if (containerRef.current && iframeRef.current) {
          containerRef.current.removeChild(iframeRef.current);
        }
      } catch (error) {
        console.error('Error cleaning up iframe:', error);
      }
    };
  }, [htmlContent]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const downloadHtml = () => {
    try {
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      saveAs(blob, 'rendered-page.html');
    } catch (error) {
      console.error('Error downloading HTML:', error);
      alert('Failed to download HTML. Please try again.');
    }
  };

  const captureScreenshot = async () => {
    if (!iframeRef.current) return;
    
    try {
      // Show capture feedback
      const feedbackEl = document.createElement('div');
      feedbackEl.style.position = 'absolute';
      feedbackEl.style.top = '0';
      feedbackEl.style.left = '0';
      feedbackEl.style.right = '0';
      feedbackEl.style.padding = '10px';
      feedbackEl.style.backgroundColor = 'rgba(79, 70, 229, 0.8)';
      feedbackEl.style.color = 'white';
      feedbackEl.style.textAlign = 'center';
      feedbackEl.style.zIndex = '9999';
      feedbackEl.textContent = 'Capturing screenshot...';
      
      if (containerRef.current) {
        containerRef.current.appendChild(feedbackEl);
      }
      
      // Delay to ensure UI feedback is visible
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const iframe = iframeRef.current;
      
      // Use html2canvas with improved settings
      const canvas = await html2canvas(iframe, {
        useCORS: true,
        allowTaint: true,
        scale: 2, // Higher quality
        logging: false
      });
      
      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, 'rendered-page.png');
        } else {
          console.error('Failed to create blob from canvas');
          alert('Failed to capture screenshot. Please try again.');
        }
        
        // Remove feedback
        if (containerRef.current && feedbackEl.parentNode === containerRef.current) {
          containerRef.current.removeChild(feedbackEl);
        }
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      alert('Failed to capture screenshot. Please try again.');
    }
  };

  const exportToPdf = async () => {
    if (!iframeRef.current) return;
    
    try {
      // Show export feedback
      const feedbackEl = document.createElement('div');
      feedbackEl.style.position = 'absolute';
      feedbackEl.style.top = '0';
      feedbackEl.style.left = '0';
      feedbackEl.style.right = '0';
      feedbackEl.style.padding = '10px';
      feedbackEl.style.backgroundColor = 'rgba(220, 38, 38, 0.8)';
      feedbackEl.style.color = 'white';
      feedbackEl.style.textAlign = 'center';
      feedbackEl.style.zIndex = '9999';
      feedbackEl.textContent = 'Exporting as PDF...';
      
      if (containerRef.current) {
        containerRef.current.appendChild(feedbackEl);
      }
      
      // Delay to ensure UI feedback is visible
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const iframe = iframeRef.current;
      
      // Use html2canvas with improved settings
      const canvas = await html2canvas(iframe, {
        useCORS: true,
        allowTaint: true,
        scale: 2, // Higher quality
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Create PDF with proper dimensions
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add metadata
      pdf.setProperties({
        title: 'HTML Render',
        subject: 'Rendered HTML Page',
        author: 'AI Code Generator',
        creator: 'AI Code Generator'
      });
      
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('rendered-page.pdf');
      
      // Remove feedback
      if (containerRef.current && feedbackEl.parentNode === containerRef.current) {
        containerRef.current.removeChild(feedbackEl);
      }
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Failed to export as PDF. Please try again.');
    }
  };

  const reloadFrame = () => {
    if (!iframeRef.current) return;
    
    try {
      setIsLoading(true);
      setRenderError(null);
      
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      
      doc.open();
      doc.write(htmlContent);
      doc.close();
      
      iframe.onload = () => {
        setIsLoading(false);
      };
      
      // Set timeout to ensure loading state gets cleared
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Error reloading iframe:', error);
      setRenderError(`Error reloading: ${error.message}`);
      setIsLoading(false);
    }
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-gray-900 p-6' : 'relative'}`}>
      <div className="flex items-center justify-between mb-3 bg-gray-800 p-3 rounded-t-lg">
        <h3 className="text-white text-lg font-medium">HTML Preview</h3>
        
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={reloadFrame}
            className="p-2 bg-gray-700 rounded text-white"
            title="Reload"
          >
            <SafeIcon icon={FiRefreshCw} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={downloadHtml}
            className="p-2 bg-blue-600 rounded text-white"
            title="Download HTML"
          >
            <SafeIcon icon={FiDownload} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={captureScreenshot}
            className="p-2 bg-green-600 rounded text-white"
            title="Capture Screenshot"
          >
            <SafeIcon icon={FiCamera} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportToPdf}
            className="p-2 bg-red-600 rounded text-white"
            title="Export to PDF"
          >
            <SafeIcon icon={FiDownload} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleFullscreen}
            className="p-2 bg-purple-600 rounded text-white"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            <SafeIcon icon={isFullscreen ? FiMinimize2 : FiMaximize2} />
          </motion.button>
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className={`bg-white rounded-b-lg ${
          isFullscreen ? 'h-[calc(100%-4rem)]' : 'h-[500px]'
        } overflow-hidden relative`}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto mb-2"></div>
              <p className="text-gray-700">Loading preview...</p>
            </div>
          </div>
        )}
        
        {renderError && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 bg-opacity-90 z-10">
            <div className="text-center p-6 max-w-md">
              <div className="text-red-600 text-4xl mb-4">⚠️</div>
              <h3 className="text-red-800 text-lg font-bold mb-2">Rendering Error</h3>
              <p className="text-red-700 mb-4">{renderError}</p>
              <button 
                onClick={reloadFrame}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
        
        {/* iframe will be inserted here */}
      </div>
      
      {!isFullscreen && (
        <div className="mt-4 flex justify-center">
          <ShareButtons
            title="HTML Preview"
            text="Check out this HTML page I generated with AI"
          />
        </div>
      )}
    </div>
  );
};

export default HtmlRenderer;