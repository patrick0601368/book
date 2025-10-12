import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ContentData {
  title: string;
  topic: string;
  subject: string;
  content: string;
  difficulty?: string;
  grade?: string;
  state?: string;
  schoolType?: string;
  language?: string;
  country?: string;
}

export const generatePDF = async (contentData: ContentData, element?: HTMLElement): Promise<void> => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Helper function to add text with word wrapping
    const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
      
      const lines = pdf.splitTextToSize(text, contentWidth);
      lines.forEach((line: string) => {
        if (yPosition > pdf.internal.pageSize.getHeight() - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += fontSize * 0.5;
      });
    };

    // Helper function to add a line break
    const addLineBreak = (size: number = 5) => {
      yPosition += size;
      if (yPosition > pdf.internal.pageSize.getHeight() - margin) {
        pdf.addPage();
        yPosition = margin;
      }
    };

    // Title
    addText(contentData.title, 18, true);
    addLineBreak(8);

    // Metadata
    addText(`Subject: ${contentData.subject}`, 12);
    if (contentData.topic) addText(`Topic: ${contentData.topic}`, 12);
    if (contentData.difficulty) addText(`Difficulty: ${contentData.difficulty}`, 12);
    if (contentData.grade) addText(`Grade: ${contentData.grade}`, 12);
    if (contentData.state) addText(`State: ${contentData.state}`, 12);
    if (contentData.schoolType) addText(`School Type: ${contentData.schoolType}`, 12);
    if (contentData.language) addText(`Language: ${contentData.language}`, 12);
    if (contentData.country) addText(`Country: ${contentData.country}`, 12);
    
    addLineBreak(10);

    // Add a separator line
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    addLineBreak(10);

    // If we have a rendered element (for complex formatting with MathJax)
    if (element) {
      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: element.scrollWidth,
          height: element.scrollHeight,
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Check if image fits on current page
        if (yPosition + imgHeight > pdf.internal.pageSize.getHeight() - margin) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10;
      } catch (error) {
        console.warn('Failed to capture element as image, falling back to text:', error);
        // Fallback to text content
        addText(contentData.content.replace(/<[^>]*>/g, ''), 11);
      }
    } else {
      // Fallback: convert HTML to plain text and add
      const plainText = contentData.content
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/\\[()]/g, '') // Remove LaTeX delimiters
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      addText(plainText, 11);
    }

    // Add footer with generation date
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(
        `Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${pageCount}`,
        margin,
        pdf.internal.pageSize.getHeight() - 10
      );
    }

    // Generate filename
    const filename = `${contentData.title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
    
    // Download the PDF
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

// Alternative function for simpler content without MathJax
export const generateSimplePDF = (contentData: ContentData): void => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPosition = margin;

  // Helper function to add text
  const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    const lines = pdf.splitTextToSize(text, contentWidth);
    lines.forEach((line: string) => {
      if (yPosition > pdf.internal.pageSize.getHeight() - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += fontSize * 0.5;
    });
  };

  // Title
  addText(contentData.title, 18, true);
  yPosition += 10;

  // Metadata
  addText(`Subject: ${contentData.subject}`, 12);
  if (contentData.topic) addText(`Topic: ${contentData.topic}`, 12);
  yPosition += 10;

  // Content (strip HTML)
  const plainText = contentData.content
    .replace(/<[^>]*>/g, '')
    .replace(/\\[()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  addText(plainText, 11);

  // Download
  const filename = `${contentData.title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
  pdf.save(filename);
};
