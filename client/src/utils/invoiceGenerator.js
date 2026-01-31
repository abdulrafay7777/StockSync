import jsPDF from 'jspdf';

export const generateInvoice = ({ orderId, customerName, phone, address, product, quantity, paymentMethod }) => {
  const doc = new jsPDF();
  const totalAmount = product.price * quantity;
  const date = new Date().toLocaleDateString();

  // --- 1. BRANDING & HEADER ---
  doc.setFillColor(37, 99, 235); // Blue Brand Color
  doc.rect(0, 0, 210, 40, 'F'); // Top Header Bar

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", 105, 25, null, null, "center");

  // --- 2. ORDER DETAILS ---
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  // Right Side: Order Info
  doc.text(`Order ID:`, 140, 55);
  doc.text(`Date:`, 140, 60);
  doc.text(`Status:`, 140, 65);
  
  doc.setFont("helvetica", "bold");
  doc.text(`#${orderId ? orderId.slice(-6).toUpperCase() : "PENDING"}`, 165, 55);
  doc.text(date, 165, 60);
  doc.setTextColor(37, 99, 235); // Blue status
  doc.text("CONFIRMED", 165, 65);

  // Left Side: Customer Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text("Bill To:", 20, 55);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(customerName, 20, 62);
  doc.text(phone, 20, 67);
  
  // Address wrap
  const splitAddress = doc.splitTextToSize(address, 80);
  doc.text(splitAddress, 20, 72);

  // --- 3. PRODUCT TABLE ---
  const startY = 95;
  
  // Table Header
  doc.setFillColor(243, 244, 246); // Light Gray
  doc.rect(15, startY, 180, 10, 'F');
  
  doc.setFont("helvetica", "bold");
  doc.text("Item Description", 20, startY + 7);
  doc.text("Qty", 130, startY + 7);
  doc.text("Price", 160, startY + 7);
  doc.text("Total", 185, startY + 7, null, null, "right");

  // Table Row
  doc.setFont("helvetica", "normal");
  doc.text(product.title, 20, startY + 20);
  doc.text(quantity.toString(), 130, startY + 20);
  doc.text(`${product.price}`, 160, startY + 20);
  doc.setFont("helvetica", "bold");
  doc.text(`${totalAmount}`, 185, startY + 20, null, null, "right");

  // Bottom Line
  doc.setDrawColor(200, 200, 200);
  doc.line(15, startY + 30, 195, startY + 30);

  // --- 4. TOTALS SECTION ---
  doc.setFontSize(12);
  doc.text("Subtotal:", 140, startY + 45);
  doc.text("Shipping:", 140, startY + 52);
  doc.setFontSize(14);
  doc.setTextColor(37, 99, 235);
  // doc.text("Grand Total:", 140, startY + 62);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(`${totalAmount}`, 185, startY + 45, null, null, "right");
  doc.text("0", 185, startY + 52, null, null, "right"); // Free shipping logic
  doc.setFontSize(14);
  doc.setTextColor(37, 99, 235);
  doc.text(`PKR ${totalAmount}`, 185, startY + 62, null, null, "right");

  // --- 5. FOOTER & PAYMENT ---
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  
  const paymentText = paymentMethod === 'ONLINE' 
    ? "PAID VIA ONLINE TRANSFER" 
    : "DUE UPON DELIVERY (CASH)";
  
  doc.text(`Payment Method: ${paymentText}`, 105, 270, null, null, "center");
  doc.text("Thank you for shopping with us!", 105, 280, null, null, "center");

  // Save File
  const fileName = `Invoice_${customerName.replace(/\s+/g, '_')}_${orderId ? orderId.slice(-4) : 'new'}.pdf`;
  doc.save(fileName);
};