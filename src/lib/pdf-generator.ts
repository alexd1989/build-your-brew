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
  certifications?: Array<{
    licenseType: string;
    issuingAuthority: string;
    expiryDate: string;
    certificateNumber: string;
  }>;
  flightHours?: {
    totalTime: string;
    picTime: string;
    simulatorTime: string;
    instrumentTime: string;
    crossCountryTime: string;
    nightTime: string;
  };
  aircraftExperience?: Array<{
    aircraftModel: string;
    customAircraftModel?: string;
    hoursFlown: string;
    typeRated: boolean;
    lastFlown: string;
    description?: string;
  }>;
  medicalInfo?: {
    medicalClass: string;
    dateOfIssue: string;
    expiryDate: string;
    issuingAuthority: string;
  };
  languageProficiency?: Array<{
    language: string;
    icaoLevel: string;
    expiryDate: string;
  }>;
  training?: Array<{
    trainingName: string;
    customTrainingName?: string;
    provider: string;
    completionDate: string;
    expiryDate: string;
    description?: string;
  }>;
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
}

export const generatePDF = async (data: ResumeData) => {
  try {
    const resumeElement = document.getElementById('resume-preview');
    if (!resumeElement) {
      throw new Error('Resume preview element not found');
    }

    // Show loading state
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
    
    // Get the actual dimensions of the resume element
    const rect = resumeElement.getBoundingClientRect();
    const scrollWidth = resumeElement.scrollWidth;
    const scrollHeight = resumeElement.scrollHeight;
    
    // Create canvas with high quality settings
    const canvas = await html2canvas(resumeElement, {
      scale: 3, // Higher scale for better quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: scrollWidth,
      height: scrollHeight,
      windowWidth: 1200,
      windowHeight: Math.max(1600, scrollHeight),
      foreignObjectRendering: true,
      imageTimeout: 15000,
      removeContainer: true,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById('resume-preview');
        if (clonedElement) {
          // Ensure all styles are properly applied
          clonedElement.style.transform = 'none';
          clonedElement.style.position = 'static';
          clonedElement.style.left = 'auto';
          clonedElement.style.top = 'auto';
          clonedElement.style.width = scrollWidth + 'px';
          clonedElement.style.height = 'auto';
          clonedElement.style.overflow = 'visible';
          clonedElement.style.fontSize = '14px';
          clonedElement.style.lineHeight = '1.5';
          clonedElement.style.fontFamily = 'Arial, sans-serif';
          clonedElement.style.color = '#000000';
          clonedElement.style.background = '#ffffff';
          
          // Fix any text rendering issues
          const allElements = clonedElement.querySelectorAll('*');
          allElements.forEach((el: Element) => {
            const htmlEl = el as HTMLElement;
            htmlEl.style.boxSizing = 'border-box';
            htmlEl.style.webkitFontSmoothing = 'antialiased';
            htmlEl.style.mozOsxFontSmoothing = 'grayscale';
            
            // Ensure text is visible
            const computedStyle = window.getComputedStyle(htmlEl);
            if (computedStyle.color === 'rgba(0, 0, 0, 0)' || computedStyle.color === 'transparent') {
              htmlEl.style.color = '#000000';
            }
          });
        }
      }
    });

    // Remove loading toast
    document.body.removeChild(loadingToast);

    // Create PDF with proper dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let yPosition = 0;
    let remainingHeight = imgHeight;

    // Add pages as needed
    while (remainingHeight > 0) {
      if (yPosition > 0) {
        pdf.addPage();
      }
      
      const pageHeight = Math.min(remainingHeight, pdfHeight);
      const sourceY = (imgHeight - remainingHeight) * (canvas.height / imgHeight);
      const sourceHeight = pageHeight * (canvas.height / imgHeight);
      
      // Create a temporary canvas for this page
      const pageCanvas = document.createElement('canvas');
      const pageCtx = pageCanvas.getContext('2d');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sourceHeight;
      
      if (pageCtx) {
        pageCtx.fillStyle = '#ffffff';
        pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        pageCtx.drawImage(canvas, 0, -sourceY);
        
        pdf.addImage(
          pageCanvas.toDataURL('image/jpeg', 0.95),
          'JPEG',
          0,
          0,
          imgWidth,
          pageHeight,
          undefined,
          'FAST'
        );
      }
      
      remainingHeight -= pageHeight;
      yPosition += pageHeight;
    }

    // Generate filename
    const fileName = data.personalInfo.name 
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
    
    // Show error message
    const errorToast = document.createElement('div');
    errorToast.textContent = 'Error generating PDF. Please try again.';
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
    `;
    document.body.appendChild(errorToast);
    setTimeout(() => {
      if (document.body.contains(errorToast)) {
        document.body.removeChild(errorToast);
      }
    }, 5000);
  }
};