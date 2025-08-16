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
    console.log('Starting PDF generation...');
    
    // Find the resume preview element
    const resumeElement = document.getElementById('resume-preview');
    if (!resumeElement) {
      throw new Error('Resume preview element not found. Make sure the resume is visible on the page.');
    }

    console.log('Resume element found:', resumeElement);

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

    // Wait for any pending renders
    await new Promise(resolve => setTimeout(resolve, 500));

    // Ensure all images are loaded
    const images = resumeElement.querySelectorAll('img');
    console.log('Found images:', images.length);
    
    if (images.length > 0) {
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve; // Continue even if image fails to load
        });
      }));
    }

    // Get element dimensions
    const rect = resumeElement.getBoundingClientRect();
    const elementWidth = resumeElement.scrollWidth || rect.width;
    const elementHeight = resumeElement.scrollHeight || rect.height;

    console.log('Element dimensions:', { elementWidth, elementHeight });

    if (elementWidth === 0 || elementHeight === 0) {
      throw new Error('Resume element has zero dimensions. Please ensure the resume content is visible.');
    }

    // Create a temporary container for better rendering
    const tempContainer = document.createElement('div');
    tempContainer.style.cssText = `
      position: absolute;
      left: -9999px;
      top: -9999px;
      width: ${elementWidth}px;
      height: ${elementHeight}px;
      background: white;
      overflow: visible;
    `;
    document.body.appendChild(tempContainer);

    // Clone the resume element
    const clonedElement = resumeElement.cloneNode(true) as HTMLElement;
    clonedElement.style.cssText = `
      width: ${elementWidth}px;
      height: auto;
      background: white;
      color: black;
      font-family: Arial, sans-serif;
      font-size: 14px;
      line-height: 1.4;
      padding: 20px;
      margin: 0;
      border: none;
      border-radius: 0;
      box-shadow: none;
      transform: none;
      position: static;
      overflow: visible;
    `;

    // Ensure all text is visible and properly styled
    const allElements = clonedElement.querySelectorAll('*');
    allElements.forEach((el: Element) => {
      const htmlEl = el as HTMLElement;
      const computedStyle = window.getComputedStyle(htmlEl);
      
      // Force visible text
      if (computedStyle.color === 'rgba(0, 0, 0, 0)' || 
          computedStyle.color === 'transparent' ||
          computedStyle.color === 'inherit') {
        htmlEl.style.color = '#000000';
      }
      
      // Ensure proper font rendering
      (htmlEl.style as any).webkitFontSmoothing = 'antialiased';
      (htmlEl.style as any).mozOsxFontSmoothing = 'grayscale';
      
      // Fix any layout issues
      if (htmlEl.style.display === 'none') {
        htmlEl.style.display = 'block';
      }
    });

    tempContainer.appendChild(clonedElement);

    // Wait a bit for the clone to render
    await new Promise(resolve => setTimeout(resolve, 100));

    console.log('Creating canvas...');

    // Create canvas with simpler settings
    const canvas = await html2canvas(clonedElement, {
      scale: 1, // Use scale 1 for better compatibility
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: true, // Enable logging for debugging
      width: elementWidth,
      height: elementHeight,
      windowWidth: elementWidth,
      windowHeight: elementHeight,
      foreignObjectRendering: false, // Disable for better compatibility
      imageTimeout: 10000,
      removeContainer: true,
    });

    console.log('Canvas created:', { width: canvas.width, height: canvas.height });

    // Clean up temporary container
    if (document.body.contains(tempContainer)) {
      document.body.removeChild(tempContainer);
    }

    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('Generated canvas is empty. Please ensure the resume content is visible.');
    }

    // Create PDF
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
    
    console.log('PDF dimensions:', { imgWidth, imgHeight, pdfWidth, pdfHeight });

    // Convert canvas to image
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    // Add image to PDF
    pdf.addImage(
      imgData,
      'JPEG',
      10, // 10mm left margin
      10, // 10mm top margin
      imgWidth,
      imgHeight,
      undefined,
      'FAST'
    );

    // Generate filename
    const fileName = data.personalInfo?.name 
      ? `${data.personalInfo.name.replace(/[^a-zA-Z0-9]/g, '_')}_Resume.pdf`
      : 'Resume.pdf';
    
    console.log('Saving PDF as:', fileName);
    
    // Save the PDF
    pdf.save(fileName);
    
    // Remove loading toast
    if (document.body.contains(loadingToast)) {
      document.body.removeChild(loadingToast);
    }
    
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
    
    console.log('PDF generation completed successfully');
    
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
    
    throw error;
  }
};