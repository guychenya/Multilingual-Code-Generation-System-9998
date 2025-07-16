import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { saveAs } from 'file-saver';

const {
  FiMaximize2,
  FiMinimize2,
  FiDownload,
  FiCamera,
  FiRefreshCw,
  FiMonitor,
  FiSmartphone,
  FiTablet
} = FiIcons;

const LivePreview = ({ htmlContent, title }) => {
  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewportSize, setViewportSize] = useState('desktop');
  const [isLoading, setIsLoading] = useState(true);

  const viewportSizes = {
    mobile: { width: '375px', height: '667px' },
    tablet: { width: '768px', height: '1024px' },
    desktop: { width: '100%', height: '100%' }
  };

  useEffect(() => {
    const renderPreview = () => {
      if (!containerRef.current) return;
      setIsLoading(true);

      const iframe = document.createElement('iframe');
      iframe.style.width = viewportSizes[viewportSize].width;
      iframe.style.height = viewportSizes[viewportSize].height;
      iframe.style.border = 'none';
      iframe.style.borderRadius = '0.75rem';
      iframe.style.transition = 'all 0.3s ease';
      
      iframe.onload = () => {
        setIsLoading(false);
      };

      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(iframe);
      iframeRef.current = iframe;

      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(htmlContent);
      doc.close();
    };

    renderPreview();
  }, [htmlContent, viewportSize]);

  const downloadScreenshot = async () => {
    if (!iframeRef.current) return;
    try {
      const canvas = await html2canvas(iframeRef.current.contentDocument.body);
      canvas.toBlob(blob => {
        if (blob) {
          saveAs(blob, `preview-${title}.png`);
        }
      });
    } catch (error) {
      console.error('Error taking screenshot:', error);
    }
  };

  const downloadPDF = async () => {
    if (!iframeRef.current) return;
    try {
      const canvas = await html2canvas(iframeRef.current.contentDocument.body);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; // A4 width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`preview-${title}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <motion.div
      layout
      className={`relative transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 bg-gray-900/95' : ''
      }`}
    >
      <div className="flex items-center justify-between p-4 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <h3 className="text-white font-medium">Preview</h3>
          
          <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg p-1">
            <button
              onClick={() => setViewportSize('mobile')}
              className={`p-2 rounded-lg transition-all ${
                viewportSize === 'mobile'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Mobile View"
            >
              <SafeIcon icon={FiSmartphone} />
            </button>
            
            <button
              onClick={() => setViewportSize('tablet')}
              className={`p-2 rounded-lg transition-all ${
                viewportSize === 'tablet'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Tablet View"
            >
              <SafeIcon icon={FiTablet} />
            </button>
            
            <button
              onClick={() => setViewportSize('desktop')}
              className={`p-2 rounded-lg transition-all ${
                viewportSize === 'desktop'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Desktop View"
            >
              <SafeIcon icon={FiMonitor} />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={downloadScreenshot}
            className="p-2 bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white rounded-lg transition-all"
            title="Take Screenshot"
          >
            <SafeIcon icon={FiCamera} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={downloadPDF}
            className="p-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-all"
            title="Download PDF"
          >
            <SafeIcon icon={FiDownload} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg transition-all"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            <SafeIcon icon={isFullscreen ? FiMinimize2 : FiMaximize2} />
          </motion.button>
        </div>
      </div>

      <div
        className={`relative bg-white rounded-xl overflow-hidden transition-all duration-300 ${
          isFullscreen ? 'h-[calc(100vh-8rem)]' : 'h-[600px]'
        } ${
          viewportSize !== 'desktop' ? 'flex items-center justify-center' : ''
        }`}
      >
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm"
            >
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" />
                <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          ref={containerRef}
          className={`w-full h-full transition-all duration-300 ${
            viewportSize !== 'desktop' ? 'flex items-center justify-center' : ''
          }`}
        />
      </div>
    </motion.div>
  );
};

export default LivePreview;