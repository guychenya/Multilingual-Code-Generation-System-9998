import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';

const { FiDownload, FiFile, FiFileText, FiImage, FiCopy, FiLoader } = FiIcons;

const ExportOptions = ({ elementRef, content, filename = 'export', type = 'code' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFeedback, setExportFeedback] = useState(null);

  const showFeedback = (message, isError = false) => {
    setExportFeedback({
      message,
      isError
    });
    
    setTimeout(() => {
      setExportFeedback(null);
    }, 3000);
  };

  const downloadAsText = () => {
    try {
      setIsExporting(true);
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, `${filename}.txt`);
      showFeedback('Text file downloaded successfully');
    } catch (error) {
      console.error('Error downloading as text:', error);
      showFeedback('Failed to download text file', true);
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  const downloadAsMarkdown = () => {
    try {
      setIsExporting(true);
      let markdownContent = content;
      
      if (type === 'code') {
        // Wrap code in markdown code block
        markdownContent = `\`\`\`\n${content}\n\`\`\``;
      }
      
      const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
      saveAs(blob, `${filename}.md`);
      showFeedback('Markdown file downloaded successfully');
    } catch (error) {
      console.error('Error downloading as markdown:', error);
      showFeedback('Failed to download markdown file', true);
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  const captureScreenshot = async () => {
    if (!elementRef.current) return;
    
    setIsExporting(true);
    try {
      const element = elementRef.current;
      
      // Set background for better capture
      const originalBg = element.style.background;
      element.style.background = '#1a1a2e';
      
      // Show capture feedback inside the element
      const feedbackEl = document.createElement('div');
      feedbackEl.style.position = 'absolute';
      feedbackEl.style.top = '10px';
      feedbackEl.style.left = '10px';
      feedbackEl.style.padding = '5px 10px';
      feedbackEl.style.backgroundColor = 'rgba(79, 70, 229, 0.8)';
      feedbackEl.style.color = 'white';
      feedbackEl.style.borderRadius = '4px';
      feedbackEl.style.zIndex = '9999';
      feedbackEl.textContent = 'Capturing...';
      
      element.appendChild(feedbackEl);
      
      // Delay to ensure UI feedback is visible
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#1a1a2e',
        logging: false,
        onclone: (clonedDoc) => {
          // Additional styling for the cloned element if needed
          const clonedElement = clonedDoc.querySelector('.code-content');
          if (clonedElement) {
            clonedElement.style.padding = '20px';
          }
          
          // Remove feedback from the clone to avoid capturing it
          const clonedFeedback = clonedDoc.querySelector('div[style*="Capturing..."]');
          if (clonedFeedback && clonedFeedback.parentNode) {
            clonedFeedback.parentNode.removeChild(clonedFeedback);
          }
        }
      });
      
      // Remove feedback
      if (feedbackEl.parentNode === element) {
        element.removeChild(feedbackEl);
      }
      
      // Restore original background
      element.style.background = originalBg;
      
      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, `${filename}.png`);
          showFeedback('Screenshot saved successfully');
        } else {
          throw new Error('Failed to create image blob');
        }
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      showFeedback('Failed to capture screenshot', true);
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  const exportToPDF = async () => {
    if (!elementRef.current) return;
    
    setIsExporting(true);
    try {
      const element = elementRef.current;
      
      // Set background for better capture
      const originalBg = element.style.background;
      element.style.background = '#1a1a2e';
      
      // Show export feedback inside the element
      const feedbackEl = document.createElement('div');
      feedbackEl.style.position = 'absolute';
      feedbackEl.style.top = '10px';
      feedbackEl.style.left = '10px';
      feedbackEl.style.padding = '5px 10px';
      feedbackEl.style.backgroundColor = 'rgba(220, 38, 38, 0.8)';
      feedbackEl.style.color = 'white';
      feedbackEl.style.borderRadius = '4px';
      feedbackEl.style.zIndex = '9999';
      feedbackEl.textContent = 'Exporting to PDF...';
      
      element.appendChild(feedbackEl);
      
      // Delay to ensure UI feedback is visible
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#1a1a2e',
        logging: false,
        onclone: (clonedDoc) => {
          // Remove feedback from the clone to avoid capturing it
          const clonedFeedback = clonedDoc.querySelector('div[style*="Exporting to PDF..."]');
          if (clonedFeedback && clonedFeedback.parentNode) {
            clonedFeedback.parentNode.removeChild(clonedFeedback);
          }
        }
      });
      
      // Remove feedback
      if (feedbackEl.parentNode === element) {
        element.removeChild(feedbackEl);
      }
      
      // Restore original background
      element.style.background = originalBg;
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Calculate dimensions to fit A4
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add metadata
      pdf.setProperties({
        title: filename,
        creator: 'Code Generator',
        creationDate: new Date()
      });
      
      // Add content
      let heightLeft = imgHeight;
      let position = 0;
      let pageNumber = 1;
      
      while (heightLeft >= 0) {
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        if (heightLeft >= 0) {
          pdf.addPage();
          position -= pageHeight;
          pageNumber++;
        }
      }
      
      // Save the PDF
      pdf.save(`${filename}.pdf`);
      showFeedback('PDF exported successfully');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      showFeedback('Failed to export PDF', true);
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className={`flex items-center space-x-2 bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium ${
          isExporting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <SafeIcon
          icon={isExporting ? FiLoader : FiDownload}
          className={isExporting ? 'animate-spin' : ''}
        />
        <span>{isExporting ? 'Exporting...' : 'Export'}</span>
      </motion.button>
      
      {exportFeedback && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`absolute right-0 mt-2 px-3 py-2 rounded-md shadow-lg z-50 text-sm ${
            exportFeedback.isError
              ? 'bg-red-600 text-white'
              : 'bg-green-600 text-white'
          }`}
        >
          {exportFeedback.message}
        </motion.div>
      )}
      
      {isOpen && !isExporting && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg overflow-hidden z-50"
        >
          <div className="py-1">
            <button
              onClick={() => {
                downloadAsText();
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
            >
              <SafeIcon icon={FiFileText} className="mr-2" />
              Plain Text (.txt)
            </button>
            
            <button
              onClick={() => {
                downloadAsMarkdown();
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
            >
              <SafeIcon icon={FiFile} className="mr-2" />
              Markdown (.md)
            </button>
            
            <button
              onClick={() => {
                captureScreenshot();
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
            >
              <SafeIcon icon={FiImage} className="mr-2" />
              Screenshot (.png)
            </button>
            
            <button
              onClick={() => {
                exportToPDF();
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
            >
              <SafeIcon icon={FiCopy} className="mr-2" />
              PDF Document (.pdf)
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ExportOptions;