import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';

const { FiPlay, FiLoader, FiTerminal, FiRefreshCw, FiDownload, FiCamera, FiCpu } = FiIcons;

const CodeRunner = ({ code, language }) => {
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('output');
  const iframeRef = useRef(null);
  const outputRef = useRef(null);
  const previewRef = useRef(null);

  const runJavaScript = () => {
    setIsRunning(true);
    setError(null);
    try {
      // Create a sandbox iframe for safely executing JS code
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      // Prepare console.log capture
      const logs = [];
      const originalConsoleLog = iframe.contentWindow.console.log;
      iframe.contentWindow.console.log = (...args) => {
        logs.push(
          args
            .map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            )
            .join(' ')
        );
        originalConsoleLog.apply(iframe.contentWindow.console, args);
      };

      // Execute the code and capture any errors
      try {
        // Add a wrapper to catch errors and return values
        const wrappedCode = `
          try {
            ${code}
            // Return any output that might be in the last line
            "Code executed successfully";
          } catch (e) {
            "Error: " + e.message;
          }
        `;
        const result = iframe.contentWindow.eval(wrappedCode);
        if (logs.length > 0) {
          setOutput(logs.join('\n'));
        } else {
          setOutput(result);
        }
      } catch (e) {
        setError(`Error: ${e.message}`);
        setOutput(`Error: ${e.message}`);
      }

      // Clean up
      document.body.removeChild(iframe);
    } catch (e) {
      setError(`Error setting up execution environment: ${e.message}`);
      setOutput(`Error: ${e.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const runCode = () => {
    setOutput('');
    setActiveTab('output');
    
    if (language === 'javascript') {
      runJavaScript();
    } else if (language === 'html') {
      runHTML();
      setActiveTab('preview');
    } else {
      setOutput(`Running ${language} code is not supported in the browser. Try JavaScript or HTML instead.`);
    }
  };

  const runHTML = () => {
    setIsRunning(true);
    setError(null);
    try {
      if (!previewRef.current) return;

      // Create or use existing iframe
      if (!iframeRef.current) {
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '500px';
        iframe.style.border = '1px solid #4f46e5';
        iframe.style.borderRadius = '0.375rem';
        iframe.style.backgroundColor = 'white';
        
        const container = previewRef.current;
        if (container) {
          container.innerHTML = '';
          container.appendChild(iframe);
          iframeRef.current = iframe;
        }
      }

      // Write content to iframe
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(code);
      doc.close();
      
      // Set onload handler after writing content
      iframe.onload = () => {
        setIsRunning(false);
        console.log("HTML preview loaded successfully");
      };
      
      setOutput('HTML preview rendered in the Preview tab');
    } catch (e) {
      setError(`Error rendering HTML: ${e.message}`);
      setOutput(`Error: ${e.message}`);
    } finally {
      // Set a timeout to ensure we exit the loading state even if iframe load fails
      setTimeout(() => {
        setIsRunning(false);
      }, 2000);
    }
  };

  const clearOutput = () => {
    setOutput('');
    setError(null);
    
    // Clear HTML preview if it exists
    try {
      if (iframeRef.current && language === 'html') {
        const iframe = iframeRef.current;
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write('');
        doc.close();
      }
    } catch (error) {
      console.error('Error clearing iframe:', error);
    }
  };

  // Reset the runner when code or language changes
  useEffect(() => {
    clearOutput();
  }, [code, language]);

  const downloadOutput = () => {
    try {
      const content = output;
      const blob = new Blob([content], { type: 'text/plain' });
      saveAs(blob, 'code-output.txt');
    } catch (error) {
      console.error('Error downloading output:', error);
      // Show user-friendly error message
      alert('Failed to download output. Please try again.');
    }
  };

  const downloadHTMLPreview = () => {
    try {
      if (language !== 'html' || !iframeRef.current) return;
      
      const iframe = iframeRef.current;
      const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
      const iframeContent = iframeDocument.documentElement.outerHTML;
      
      // Download as HTML file
      const blob = new Blob([iframeContent], { type: 'text/html;charset=utf-8' });
      saveAs(blob, 'preview.html');
    } catch (error) {
      console.error('Error downloading HTML preview:', error);
      alert('Failed to download HTML. Please try again.');
    }
  };

  const captureScreenshot = async () => {
    try {
      if (language !== 'html' || !iframeRef.current) return;
      
      const iframe = iframeRef.current;
      
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
      
      if (previewRef.current) {
        previewRef.current.appendChild(feedbackEl);
      }
      
      // Delay to ensure UI feedback is visible
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Use html2canvas to capture the iframe content
      const canvas = await html2canvas(iframe, {
        useCORS: true,
        allowTaint: true,
        logging: false,
        scale: 2 // Higher quality
      });
      
      // Convert to PNG and download
      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, 'preview-screenshot.png');
        } else {
          console.error('Failed to create blob from canvas');
          alert('Failed to capture screenshot. Please try again.');
        }
        
        // Remove feedback
        if (previewRef.current && feedbackEl.parentNode === previewRef.current) {
          previewRef.current.removeChild(feedbackEl);
        }
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      alert('Failed to capture screenshot. Please try again.');
    }
  };

  const exportAsPDF = async () => {
    try {
      if (language !== 'html' || !iframeRef.current) return;
      
      const iframe = iframeRef.current;
      
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
      
      if (previewRef.current) {
        previewRef.current.appendChild(feedbackEl);
      }
      
      // Delay to ensure UI feedback is visible
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Use html2canvas to capture the iframe content
      const canvas = await html2canvas(iframe, {
        useCORS: true,
        allowTaint: true,
        scale: 2, // Higher quality
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add metadata
      pdf.setProperties({
        title: 'HTML Preview',
        subject: 'Generated HTML Preview',
        author: 'AI Code Generator',
        creator: 'AI Code Generator'
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('preview.pdf');
      
      // Remove feedback
      if (previewRef.current && feedbackEl.parentNode === previewRef.current) {
        previewRef.current.removeChild(feedbackEl);
      }
    } catch (error) {
      console.error('Error exporting as PDF:', error);
      alert('Failed to export as PDF. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white text-lg font-semibold flex items-center space-x-2">
          <SafeIcon icon={FiCpu} />
          <span>Code Execution</span>
        </h3>
        
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={runCode}
            disabled={isRunning || !code}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <SafeIcon icon={FiLoader} className="animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <SafeIcon icon={FiPlay} />
                <span>Run Code</span>
              </>
            )}
          </motion.button>
          
          {output && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearOutput}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
            >
              <SafeIcon icon={FiRefreshCw} />
              <span>Clear</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Tabs for Output and Preview */}
      {(output || language === 'html') && (
        <div className="bg-gray-900 border border-indigo-500/30 rounded-lg overflow-hidden">
          <div className="flex border-b border-indigo-500/30">
            <button
              className={`py-2 px-4 text-sm font-medium ${
                activeTab === 'output'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
              onClick={() => setActiveTab('output')}
            >
              <SafeIcon icon={FiTerminal} className="inline mr-2" />
              Output
            </button>
            
            {language === 'html' && (
              <button
                className={`py-2 px-4 text-sm font-medium ${
                  activeTab === 'preview'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
                onClick={() => setActiveTab('preview')}
              >
                <SafeIcon icon={FiPlay} className="inline mr-2" />
                Preview
              </button>
            )}
            
            {/* Download buttons for the active tab */}
            <div className="ml-auto flex">
              {activeTab === 'output' && output && (
                <button
                  onClick={downloadOutput}
                  className="py-2 px-4 text-sm font-medium text-gray-300 hover:bg-gray-800 flex items-center"
                >
                  <SafeIcon icon={FiDownload} className="mr-2" />
                  Download Output
                </button>
              )}
              
              {activeTab === 'preview' && language === 'html' && (
                <>
                  <button
                    onClick={downloadHTMLPreview}
                    className="py-2 px-4 text-sm font-medium text-gray-300 hover:bg-gray-800 flex items-center"
                  >
                    <SafeIcon icon={FiDownload} className="mr-2" />
                    Download HTML
                  </button>
                  
                  <button
                    onClick={captureScreenshot}
                    className="py-2 px-4 text-sm font-medium text-gray-300 hover:bg-gray-800 flex items-center"
                  >
                    <SafeIcon icon={FiCamera} className="mr-2" />
                    Screenshot
                  </button>
                  
                  <button
                    onClick={exportAsPDF}
                    className="py-2 px-4 text-sm font-medium text-gray-300 hover:bg-gray-800 flex items-center"
                  >
                    <SafeIcon icon={FiDownload} className="mr-2" />
                    Export PDF
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* Tab content */}
          <div className={`${activeTab === 'output' ? 'block' : 'hidden'}`}>
            <div
              ref={outputRef}
              className={`p-4 overflow-auto max-h-60 ${error ? 'text-red-400' : 'text-gray-300'}`}
            >
              {output ? (
                <pre className="text-sm font-mono whitespace-pre-wrap">{output}</pre>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Run the code to see output here
                </div>
              )}
            </div>
          </div>
          
          <div
            ref={previewRef}
            className={`p-4 relative ${activeTab === 'preview' ? 'block' : 'hidden'}`}
          >
            {language !== 'html' && (
              <div className="text-center py-8 text-gray-500">
                HTML preview is only available for HTML code
              </div>
            )}
            {/* HTML iframe will be inserted here */}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeRunner;