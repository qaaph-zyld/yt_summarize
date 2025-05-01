import React, { useState } from 'react';
import { FileText, FileDown, Printer, X } from 'lucide-react';
import { generateFullAnalysisText, downloadAsFile } from '../utils/shareUtils';
import { useAppContext } from '../context/AppContext';

/**
 * ExportOptions component for exporting video analysis in various formats
 */
const ExportOptions = () => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const { state } = useAppContext();
  const { result } = state;

  if (!result) return null;

  const handleExportClick = () => {
    setShowExportMenu(!showExportMenu);
  };

  const handleExportFormat = (format) => {
    if (!result) return;
    
    const title = result.metadata.title || 'YouTube-Summary';
    const filename = title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const content = generateFullAnalysisText(result);
    
    downloadAsFile(content, filename, format);
    setShowExportMenu(false);
  };

  const handlePrint = () => {
    // Add a print-specific class to the body before printing
    document.body.classList.add('printing');
    
    // Print the page
    window.print();
    
    // Remove the print class after printing
    setTimeout(() => {
      document.body.classList.remove('printing');
    }, 500);
    
    setShowExportMenu(false);
  };

  const generatePDF = async () => {
    try {
      // Dynamically import jspdf and html2canvas only when needed
      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas')).default;
      
      const element = document.querySelector('.results-container');
      if (!element) return;
      
      // Show a loading indicator
      const loadingEl = document.createElement('div');
      loadingEl.className = 'export-loading';
      loadingEl.innerHTML = '<div class="loading-spinner"></div><p>Generating PDF...</p>';
      document.body.appendChild(loadingEl);
      
      try {
        // Create a clone of the element to avoid modifying the original
        const clone = element.cloneNode(true);
        clone.style.width = '800px';
        clone.style.padding = '20px';
        clone.style.position = 'absolute';
        clone.style.top = '-9999px';
        clone.style.left = '-9999px';
        document.body.appendChild(clone);
        
        // Make sure all tabs are visible in the clone
        const tabs = clone.querySelectorAll('.tab-content');
        tabs.forEach(tab => {
          tab.style.display = 'block';
        });
        
        // Generate canvas from the element
        const canvas = await html2canvas(clone, {
          scale: 1.5,
          useCORS: true,
          logging: false
        });
        
        // Remove the clone
        document.body.removeChild(clone);
        
        // Create PDF
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        
        let heightLeft = imgHeight;
        let position = 0;
        
        // Add first page
        pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, imgHeight * ratio);
        heightLeft -= pdfHeight;
        
        // Add subsequent pages if needed
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, imgHeight * ratio);
          heightLeft -= pdfHeight;
        }
        
        // Save the PDF
        const title = result.metadata.title || 'YouTube-Summary';
        const filename = title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        pdf.save(`${filename}.pdf`);
      } finally {
        // Remove loading indicator
        document.body.removeChild(loadingEl);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try another export format.');
    }
    
    setShowExportMenu(false);
  };

  return (
    <div className="export-options-container">
      <button 
        className="export-button" 
        onClick={handleExportClick}
        aria-label="Export"
        aria-expanded={showExportMenu}
        title="Export"
      >
        <FileDown size={18} />
        <span>Export</span>
      </button>
      
      {showExportMenu && (
        <div className="export-menu">
          <div className="export-menu-header">
            <h3>Export Options</h3>
            <button 
              className="close-button" 
              onClick={() => setShowExportMenu(false)}
              aria-label="Close export menu"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="export-menu-options">
            <button onClick={() => handleExportFormat('txt')}>
              <FileText size={16} />
              <span>Text File (.txt)</span>
            </button>
            
            <button onClick={() => handleExportFormat('md')}>
              <FileText size={16} />
              <span>Markdown (.md)</span>
            </button>
            
            <button onClick={() => handleExportFormat('html')}>
              <FileText size={16} />
              <span>HTML Document (.html)</span>
            </button>
            
            <button onClick={generatePDF}>
              <FileText size={16} />
              <span>PDF Document (.pdf)</span>
            </button>
            
            <button onClick={handlePrint}>
              <Printer size={16} />
              <span>Print</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportOptions;
