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

// Helper function to convert number to words
const numberToWords = (num: number): string => {
  const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
  const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
  const teens = ['TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];

  if (num === 0) return 'ZERO';

  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return '';
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) {
      return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    }
    return ones[Math.floor(n / 100)] + ' HUNDRED' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
  };

  let result = '';
  const billion = Math.floor(num / 1000000000);
  const million = Math.floor((num % 1000000000) / 1000000);
  const thousand = Math.floor((num % 1000000) / 1000);
  const remainder = num % 1000;

  if (billion > 0) result += convertLessThanThousand(billion) + ' BILLION ';
  if (million > 0) result += convertLessThanThousand(million) + ' MILLION ';
  if (thousand > 0) result += convertLessThanThousand(thousand) + ' THOUSAND ';
  if (remainder > 0) result += convertLessThanThousand(remainder);

  return result.trim();
};

export const generateReceiptPDF = (receipt: Receipt, language: string = 'en') => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Colors
  const black = [0, 0, 0];
  const gray = [128, 128, 128];

  // Hardcoded data
  const schoolData = {
    name: "King's College",
    location: 'BANGKOK',
    address: '727 Ratchadapisek Road, Bang Phongphang, Yannawa, Bangkok 10120, Thailand',
    phone: '+66 (0) 2481 9955',
    email: 'finance@kingsbangkok.ac.th',
    website: 'www.kingsbangkok.ac.th'
  };

  const studentData = {
    id: 'KC2025277',
    name: 'Harper Black',
    contactName: 'David Black',
    address: '',
    yearGroup: 'Year 7',
    schoolYear: '2025-2026'
  };

  const invoiceData = {
    no: 1,
    invoiceNo: receipt.invoice_id,
    invoiceDate: new Date(receipt.paid_at).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }),
    invoiceAmount: receipt.amount,
    receivedAmount: receipt.amount,
    outstandingAmount: 0
  };

  const paymentData = {
    method: receipt.payment_method === 'bank_transfer' ? 'bank-transfer' : receipt.payment_method,
    bankName: '-',
    bankBranch: '-',
    chequeNo: '-',
    chequeDate: '-'
  };

  // Start drawing PDF
  doc.setTextColor(black[0], black[1], black[2]);

  // Logo placeholder (using text)
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text("King's College", pageWidth / 2, 20, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text('INTERNATIONAL SCHOOL', pageWidth / 2, 25, { align: 'center' });

  // Location
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text(schoolData.location, pageWidth / 2, 35, { align: 'center' });

  // Address and contact
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text(schoolData.address, pageWidth / 2, 42, { align: 'center' });
  doc.text(
    `${schoolData.phone}, ${schoolData.email}, ${schoolData.website}`,
    pageWidth / 2,
    47,
    { align: 'center' }
  );

  // RECEIPT header
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('RECEIPT', pageWidth / 2, 58, { align: 'center' });

  // Student and Receipt info section (two columns)
  const infoY = 68;
  doc.setFontSize(9);

  // Left column - Student info
  doc.setFont(undefined, 'normal');
  doc.text(`Student ID no.${studentData.id}`, 15, infoY);
  doc.text(`Student name${studentData.name}`, 15, infoY + 5);
  doc.text(`Contact name${studentData.contactName}`, 15, infoY + 10);
  doc.text(`Address`, 15, infoY + 15);

  // Right column - Receipt info
  doc.text(`Receipt no.${receipt.reference_number}`, pageWidth - 75, infoY, { align: 'right' });
  const receiptDate = new Date(receipt.paid_at).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  doc.text(`Receipt date${receiptDate}`, pageWidth - 75, infoY + 5, { align: 'right' });
  doc.text(`Year group${studentData.yearGroup}`, pageWidth - 75, infoY + 10, { align: 'right' });
  doc.text(`School year${studentData.schoolYear}`, pageWidth - 75, infoY + 15, { align: 'right' });

  // Invoice table
  const tableY = infoY + 30;
  doc.setFontSize(8);

  // Table headers
  doc.setFillColor(255, 255, 255);
  doc.rect(15, tableY, pageWidth - 30, 8, 'S');

  doc.setFont(undefined, 'bold');
  doc.text('No.', 20, tableY + 5);
  doc.text('Invoice no.', 35, tableY + 5);
  doc.text('Invoice date', 80, tableY + 5);
  doc.text('Invoice amount', 120, tableY + 5);
  doc.text('Received amount', 150, tableY + 5);
  doc.text('Outstanding amount', 175, tableY + 5);
  doc.text('(THB)', 120, tableY + 9);
  doc.text('(THB)', 152, tableY + 9);
  doc.text('(THB)', 178, tableY + 9);

  // Table row
  const rowY = tableY + 15;
  doc.rect(15, tableY + 8, pageWidth - 30, 12, 'S');
  doc.setFont(undefined, 'normal');
  doc.text(invoiceData.no.toString(), 20, rowY);
  doc.text(invoiceData.invoiceNo, 35, rowY);
  doc.text(invoiceData.invoiceDate, 80, rowY);
  doc.text(invoiceData.invoiceAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }), 130, rowY, { align: 'right' });
  doc.text(invoiceData.receivedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }), 162, rowY, { align: 'right' });
  doc.text(invoiceData.outstandingAmount === 0 ? '-' : invoiceData.outstandingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }), 190, rowY, { align: 'right' });

  // Amount in words and total
  const totalY = rowY + 10;
  doc.setFont(undefined, 'normal');
  const bahtWhole = Math.floor(receipt.amount);
  const satang = Math.round((receipt.amount - bahtWhole) * 100);
  const amountInWords = numberToWords(bahtWhole) + ' BAHT' + (satang > 0 ? ' ' + numberToWords(satang) + ' SATANG' : '') + ' ONLY';
  doc.text(amountInWords, 15, totalY);

  doc.setFont(undefined, 'bold');
  doc.text('TOTAL', 150, totalY);
  doc.text(`${receipt.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}-`, 190, totalY, { align: 'right' });

  // Payment method table
  const paymentTableY = totalY + 10;
  doc.rect(15, paymentTableY, pageWidth - 30, 8, 'S');
  doc.setFontSize(8);
  doc.setFont(undefined, 'bold');
  doc.text('Payment method', 40, paymentTableY + 5);
  doc.text('Bank name', 75, paymentTableY + 5);
  doc.text('Bank branch', 110, paymentTableY + 5);
  doc.text('Cheque no.', 145, paymentTableY + 5);
  doc.text('Cheque date', 175, paymentTableY + 5);

  // Payment data row
  doc.rect(15, paymentTableY + 8, pageWidth - 30, 8, 'S');
  doc.setFont(undefined, 'normal');
  doc.text(paymentData.method, 40, paymentTableY + 13);
  doc.text(paymentData.bankName, 75, paymentTableY + 13);
  doc.text(paymentData.bankBranch, 110, paymentTableY + 13);
  doc.text(paymentData.chequeNo, 145, paymentTableY + 13);
  doc.text(paymentData.chequeDate, 175, paymentTableY + 13);

  // Collector and signature
  const sigY = paymentTableY + 25;
  doc.setFontSize(9);
  doc.text('System', 50, sigY);
  doc.text('Porntip Jansintrangkul', pageWidth - 80, sigY);
  doc.setFont(undefined, 'bold');
  doc.text('Collector', 50, sigY + 5);
  doc.text('Authorised signature', pageWidth - 80, sigY + 5);

  // Disclaimer
  doc.setFontSize(7);
  doc.setFont(undefined, 'italic');
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.text(
    'In case of payment made by cheque, this receipt will not be valid until the cheque has been honoured by the bank.',
    pageWidth / 2,
    sigY + 15,
    { align: 'center', maxWidth: pageWidth - 30 }
  );

  // Download the PDF
  doc.save(`receipt-${receipt.reference_number}.pdf`);
};
