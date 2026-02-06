import jsPDF from 'jspdf';

interface Receipt {
  id: string;
  invoice_id: string;
  amount: number;
  payment_method: 'credit_card' | 'bank_transfer' | 'credit_note' | 'cash';
  paid_at: string;
  receipt_url: string;
  status: 'completed' | 'processing' | 'failed';
  description: string;
  reference_number: string;
}

export const generateReceiptPDF = (receipt: Receipt, language: string = 'en') => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Colors - Updated to match new design
  const primaryColor = [91, 95, 249]; // Blue/Purple #5B5FF9
  const textColor = [31, 41, 55]; // Gray-800
  const lightGray = [245, 245, 245]; // #F5F5F5
  const greenColor = [34, 197, 94]; // Green for COMPLETED

  // Header - Larger and more prominent
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 50, 'F');

  // Title - Larger font
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont(undefined, 'bold');
  doc.text("King's College", pageWidth / 2, 25, { align: 'center' });
  doc.setFontSize(16);
  doc.setFont(undefined, 'normal');
  doc.text(
    language === 'th' ? 'ใบเสร็จรับเงิน' : language === 'zh' ? '收据' : 'Payment Receipt',
    pageWidth / 2,
    40,
    { align: 'center' }
  );

  // Reset text color
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);

  // Receipt Info Box - Cleaner design
  const startY = 65;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(20, startY, pageWidth - 40, 45, 'F');

  // Receipt details - Cleaner spacing
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('Receipt Number:', 30, startY + 15);
  doc.setFont(undefined, 'normal');
  doc.text(receipt.reference_number, 100, startY + 15);

  doc.setFont(undefined, 'bold');
  doc.text('Invoice ID:', 30, startY + 25);
  doc.setFont(undefined, 'normal');
  doc.text(receipt.invoice_id, 100, startY + 25);

  doc.setFont(undefined, 'bold');
  doc.text('Date:', 30, startY + 35);
  doc.setFont(undefined, 'normal');
  const formattedDate = new Date(receipt.paid_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(formattedDate, 100, startY + 35);

  // Description section
  const descY = startY + 60;
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Description:', 30, descY);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(11);
  doc.text(receipt.description, 30, descY + 10);

  // Payment details box
  const paymentY = descY + 30;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(20, paymentY, pageWidth - 40, 30, 'F');

  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('Payment Method:', 30, paymentY + 12);
  doc.setFont(undefined, 'normal');
  const paymentMethodLabels = {
    credit_card: 'Credit Card',
    bank_transfer: 'Bank Transfer',
    credit_note: 'Credit Note',
    cash: 'Cash'
  };
  doc.text(paymentMethodLabels[receipt.payment_method], 100, paymentY + 12);

  doc.setFont(undefined, 'bold');
  doc.text('Status:', 30, paymentY + 22);
  doc.setFont(undefined, 'normal');

  // Green color for COMPLETED status
  if (receipt.status === 'completed') {
    doc.setTextColor(greenColor[0], greenColor[1], greenColor[2]);
  } else {
    doc.setTextColor(239, 68, 68); // Red
  }
  doc.text(receipt.status.toUpperCase(), 100, paymentY + 22);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);

  // Amount section with blue separator lines
  const amountY = paymentY + 50;
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(1);
  doc.line(20, amountY, pageWidth - 20, amountY);

  // Total Amount with large blue number
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text('Total Amount:', 30, amountY + 18);

  // Large blue amount - numbers only, no currency symbol
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');

  // Format amount - just numbers with commas, no currency prefix
  const formattedAmount = receipt.amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  doc.text(formattedAmount, pageWidth - 30, amountY + 18, { align: 'right' });

  // Bottom blue line
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(1);
  doc.line(20, amountY + 28, pageWidth - 20, amountY + 28);

  // Footer
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(128, 128, 128);
  const footerY = doc.internal.pageSize.getHeight() - 30;
  doc.text(
    "King's College Parent Portal",
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );
  doc.text(
    'This is an official receipt generated by the King\'s College payment system.',
    pageWidth / 2,
    footerY + 5,
    { align: 'center' }
  );
  doc.text(
    `Generated on: ${new Date().toLocaleString('en-US')}`,
    pageWidth / 2,
    footerY + 10,
    { align: 'center' }
  );

  // Download the PDF
  doc.save(`receipt-${receipt.reference_number}.pdf`);
};
