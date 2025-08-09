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
    hoursFlown: string;
    typeRated: boolean;
    lastFlown: string;
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
    provider: string;
    completionDate: string;
    expiryDate: string;
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

    // Create canvas from the resume preview with better spacing
    const canvas = await html2canvas(resumeElement, {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      height: resumeElement.scrollHeight,
      width: resumeElement.scrollWidth
    });

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    // Add first page
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Download the PDF
    const fileName = data.personalInfo.name 
      ? `${data.personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`
      : 'Resume.pdf';
    
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
  }
};