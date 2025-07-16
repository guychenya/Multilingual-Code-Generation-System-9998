import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const { 
  FiDownload, FiFile, FiFileText, FiImage, 
  FiCopy, FiLoader, FiCheck, FiAlertCircle 
} = FiIcons;

const ExportManager = ({ content, type, filename, onExport }) => {
  const [status, setStatus] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const showStatus = (message, type = 'info', duration = 3000) => {
    setStatus({ message, type });
    setTimeout(() => setStatus(null), duration);
  };

  const handleExport = async (format) => {
    if (isExporting) return;
    
    setIsExporting(true);
    try {
      showStatus('Preparing export...', 'info');
      
      let result;
      switch (format) {
        case 'text': {
          const blob = new Blob([content], { 
            type: 'text/plain;charset=utf-8' 
          });
          saveAs(blob, `${filename}.txt`);
          result = 'Text file exported successfully';
          break;
        }
        
        case 'markdown': {
          const mdContent = type === 'code' 
            ? `\`\`\`\n${content}\n\`\`\`` 
            : content;
          const blob = new Blob([mdContent], { 
            type: 'text/markdown;charset=utf-8' 
          });
          saveAs(blob, `${filename}.md`);
          result = 'Markdown file exported successfully';
          break;
        }
        
        case 'pdf': {
          const pdf = new jsPDF();
          pdf.setProperties({
            title: filename,
            subject: 'Exported content',
            creator: 'Code Generator',
            author: 'Code Generator'
          });
          
          if (type === 'code') {
            pdf.setFont('Courier');
            pdf.setFontSize(10);
            const splitContent = pdf.splitTextToSize(content, 180);
            pdf.text(splitContent, 15, 15);
          } else {
            // For HTML content, render to canvas first
            const element = document.createElement('div');
            element.innerHTML = content;
            document.body.appendChild(element);
            
            const canvas = await html2canvas(element, {
              scale: 2,
              useCORS: true,
              logging: false
            });
            
            document.body.removeChild(element);
            
            const imgData = canvas.toDataURL('image/png');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          }
          
          pdf.save(`${filename}.pdf`);
          result = 'PDF exported successfully';
          break;
        }
        
        case 'image': {
          if (!onExport?.element) {
            throw new Error('No element provided for image export');
          }
          
          const canvas = await html2canvas(onExport.element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#1a1a2e'
          });
          
          canvas.toBlob((blob) => {
            if (!blob) throw new Error('Failed to create image');
            saveAs(blob, `${filename}.png`);
          }, 'image/png', 1.0);
          
          result = 'Image exported successfully';
          break;
        }
        
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
      
      showStatus(result, 'success');
      if (onExport?.callback) onExport.callback(format);
    } catch (error) {
      console.error('Export error:', error);
      showStatus(`Export failed: ${error.message}`, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={isExporting}
        onClick={() => handleExport('text')}
        className={`
          inline-flex items-center px-3 py-1.5 rounded-lg
          ${isExporting ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
          text-white text-sm font-medium transition-colors
        `}
      >
        <SafeIcon
          icon={isExporting ? FiLoader : FiDownload}
          className={isExporting ? 'animate-spin mr-2' : 'mr-2'}
        />
        <span>{isExporting ? 'Exporting...' : 'Export'}</span>
      </motion.button>

      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`
              absolute top-full left-0 mt-2 px-3 py-2 rounded-lg shadow-lg
              ${status.type === 'success' && 'bg-green-600'}
              ${status.type === 'error' && 'bg-red-600'}
              ${status.type === 'info' && 'bg-blue-600'}
              text-white text-sm whitespace-nowrap
            `}
          >
            <SafeIcon
              icon={
                status.type === 'success' ? FiCheck :
                status.type === 'error' ? FiAlertCircle :
                FiLoader
              }
              className={`
                inline-block mr-2
                ${status.type === 'info' && 'animate-spin'}
              `}
            />
            {status.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl invisible group-hover:visible">
        <div className="py-1">
          <button
            onClick={() => handleExport('text')}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
          >
            <SafeIcon icon={FiFileText} className="mr-2" />
            Plain Text (.txt)
          </button>
          
          <button
            onClick={() => handleExport('markdown')}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
          >
            <SafeIcon icon={FiFile} className="mr-2" />
            Markdown (.md)
          </button>
          
          <button
            onClick={() => handleExport('image')}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
          >
            <SafeIcon icon={FiImage} className="mr-2" />
            Image (.png)
          </button>
          
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
          >
            <SafeIcon icon={FiCopy} className="mr-2" />
            PDF Document
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportManager;