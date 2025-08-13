import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
    profilePhoto?: string;
  };
  workExperience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    startDate: string;
    endDate: string;
  }>;
  skills: Array<{
    name: string;
    selected?: boolean;
    level?: string;
  }>;
  [key: string]: any; // Allow for additional sections
}

export const generatePDF = async (data: ResumeData) => {
  try {
    // Find the resume preview element
    const resumeElement = document.getElementById('resume-preview');
    if (!resumeElement) {
      throw new Error('Resume preview element not found. Make sure the resume is visible on the page.');
    }

    // Show loading indicator
    const loadingToast = document.createElement('div');
    loadingToast.textContent = 'Generating PDF...';
    loadingToast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #333;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 9999;
      font-family: Arial, sans-serif;
    `;
    document.body.appendChild(loadingToast);

    // Wait for any pending renders and images to load
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Ensure all images are loaded
    const images = resumeElement.querySelectorAll('img');
    await Promise.all(Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve; // Continue even if image fails to load
      });
    }));

    // Get the computed styles and dimensions
    const computedStyle = window.getComputedStyle(resumeElement);
    const elementWidth = resumeElement.scrollWidth;
    const elementHeight = resumeElement.scrollHeight;

    console.log('Element dimensions:', { elementWidth, elementHeight });

    // Create canvas with high DPI settings
    const canvas = await html2canvas(resumeElement, {
      scale: 2, // High DPI for better quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: elementWidth,
      height: elementHeight,
      windowWidth: elementWidth,
      windowHeight: elementHeight,
      foreignObjectRendering: true,
      imageTimeout: 15000,
      removeContainer: true,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById('resume-preview');
        if (clonedElement) {
          // Apply styles to ensure proper rendering
          clonedElement.style.position = 'static';
          clonedElement.style.transform = 'none';
          clonedElement.style.width = elementWidth + 'px';
          clonedElement.style.height = 'auto';
          clonedElement.style.overflow = 'visible';
          clonedElement.style.background = '#ffffff';
          clonedElement.style.color = '#000000';
          clonedElement.style.fontSize = '14px';
          clonedElement.style.lineHeight = '1.4';
          clonedElement.style.fontFamily = 'Arial, sans-serif';
          
          // Ensure all text is visible
          const allElements = clonedElement.querySelectorAll('*');
          allElements.forEach((el: Element) => {
            const htmlEl = el as HTMLElement;
            const computedStyle = window.getComputedStyle(htmlEl);
            
            // Fix invisible text
            if (computedStyle.color === 'rgba(0, 0, 0, 0)' || 
                computedStyle.color === 'transparent' ||
                computedStyle.color === 'inherit') {
              htmlEl.style.color = '#000000';
            }
            
            // Ensure proper font rendering
            htmlEl.style.webkitFontSmoothing = 'antialiased';
            htmlEl.style.mozOsxFontSmoothing = 'grayscale';
            
            // Fix any layout issues
            if (htmlEl.style.display === 'none') {
              htmlEl.style.display = 'block';
            }
          });
        }
      }
    });

    // Remove loading toast
    if (document.body.contains(loadingToast)) {
      document.body.removeChild(loadingToast);
    }

    console.log('Canvas dimensions:', { width: canvas.width, height: canvas.height });

    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('Generated canvas is empty. Please ensure the resume content is visible.');
    }

    // Create PDF with A4 dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm
    
    // Calculate scaling to fit content properly
    const imgWidth = pdfWidth - 20; // Leave 10mm margin on each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let yPosition = 10; // Start with 10mm top margin
    let remainingHeight = imgHeight;
    let pageNumber = 1;

    // Add content to PDF, splitting across pages if necessary
    while (remainingHeight > 0) {
      if (pageNumber > 1) {
        pdf.addPage();
      }
      
      const availableHeight = pdfHeight - 20; // Leave 10mm margin top and bottom
      const pageHeight = Math.min(remainingHeight, availableHeight);
      const sourceY = (imgHeight - remainingHeight) * (canvas.height / imgHeight);
      const sourceHeight = pageHeight * (canvas.height / imgHeight);
      
      // Create a temporary canvas for this page
      const pageCanvas = document.createElement('canvas');
      const pageCtx = pageCanvas.getContext('2d');
      
      if (!pageCtx) {
        throw new Error('Could not get canvas context');
      }
      
      pageCanvas.width = canvas.width;
      pageCanvas.height = sourceHeight;
      
      // Fill with white background
      pageCtx.fillStyle = '#ffffff';
      pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      
      // Draw the portion of the original canvas
      pageCtx.drawImage(canvas, 0, -sourceY);
      
      // Add to PDF
      const imgData = pageCanvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(
        imgData,
        'JPEG',
        10, // 10mm left margin
        yPosition,
        imgWidth,
        pageHeight,
        undefined,
        'FAST'
      );
      
      remainingHeight -= pageHeight;
      pageNumber++;
      yPosition = 10; // Reset Y position for new pages
    }

    // Generate filename
    const fileName = data.personalInfo?.name 
      ? `${data.personalInfo.name.replace(/[^a-zA-Z0-9]/g, '_')}_Resume.pdf`
      : 'Resume.pdf';
    
    // Save the PDF
    pdf.save(fileName);
    
    // Show success message
    const successToast = document.createElement('div');
    successToast.textContent = 'PDF downloaded successfully!';
    successToast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 9999;
      font-family: Arial, sans-serif;
    `;
    document.body.appendChild(successToast);
    setTimeout(() => {
      if (document.body.contains(successToast)) {
        document.body.removeChild(successToast);
      }
    }, 3000);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Remove loading toast if it exists
    const loadingToast = document.querySelector('div[style*="Generating PDF"]');
    if (loadingToast && document.body.contains(loadingToast)) {
      document.body.removeChild(loadingToast);
    }
    
    // Show error message
    const errorToast = document.createElement('div');
    errorToast.textContent = `Error generating PDF: ${error.message}`;
    errorToast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ef4444;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 9999;
      font-family: Arial, sans-serif;
      max-width: 300px;
      word-wrap: break-word;
    `;
    document.body.appendChild(errorToast);
    setTimeout(() => {
      if (document.body.contains(errorToast)) {
        document.body.removeChild(errorToast);
      }
    }, 5000);
    
    throw error; // Re-throw for any additional error handling
  }
};