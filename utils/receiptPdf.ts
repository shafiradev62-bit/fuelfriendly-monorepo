type ReceiptLike = {
  id?: string;
  trackingNumber?: string;
  createdAt?: string;
  driverName?: string;
  driverPhone?: string;
  fuelType?: string;
  fuelQuantity?: string | number;
  fuelCost?: number;
  serviceFee?: number;
  totalAmount?: number;
  currency?: string;
  stationName?: string;
  deliveryAddress?: string;
  cartItems?: Array<{ name?: string; price?: number; quantity?: number }>;
};

const toNumber = (value: any) => (typeof value === 'number' && Number.isFinite(value) ? value : 0);

const toTwo = (value: any) => toNumber(value).toFixed(2);

const escapePdfText = (value: string) =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');

const createPdfBlob = (lines: string[]) => {
  const sanitizedLines = lines.map((line) => escapePdfText(line));
  let y = 780;
  const contentParts: string[] = [];
  for (const line of sanitizedLines) {
    contentParts.push(`BT /F1 12 Tf 50 ${y} Td (${line}) Tj ET`);
    y -= 16;
    if (y < 40) break;
  }
  const streamContent = contentParts.join('\n');
  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  const obj3 = '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n';
  const obj4 = '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n';
  const obj5 = `5 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj\n`;
  const header = '%PDF-1.4\n';
  const body = obj1 + obj2 + obj3 + obj4 + obj5;
  const offset1 = header.length;
  const offset2 = offset1 + obj1.length;
  const offset3 = offset2 + obj2.length;
  const offset4 = offset3 + obj3.length;
  const offset5 = offset4 + obj4.length;
  const xrefOffset = header.length + body.length;
  const xref = `xref\n0 6\n0000000000 65535 f \n${String(offset1).padStart(10, '0')} 00000 n \n${String(offset2).padStart(10, '0')} 00000 n \n${String(offset3).padStart(10, '0')} 00000 n \n${String(offset4).padStart(10, '0')} 00000 n \n${String(offset5).padStart(10, '0')} 00000 n \n`;
  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([header, body, xref, trailer], { type: 'application/pdf' });
};

export const buildReceiptData = (order: any, driverData?: { name?: string; phone?: string }): ReceiptLike => {
  const cartItems = Array.isArray(order?.cartItems) ? order.cartItems : [];
  const cartTotal = cartItems.reduce((sum: number, item: any) => sum + (toNumber(item?.price) * toNumber(item?.quantity || 1)), 0);
  const fuelCost = toNumber(order?.fuelCost || order?.breakdown?.fuelCost);
  const serviceFee = toNumber(order?.serviceFee || order?.breakdown?.deliveryFee || order?.breakdown?.serviceFee);
  const totalAmount = toNumber(order?.totalAmount || order?.grandTotal) || fuelCost + serviceFee + cartTotal;
  return {
    ...order,
    id: order?.id || order?.trackingNumber || `receipt_${Date.now()}`,
    trackingNumber: order?.trackingNumber || `FF-${Date.now()}`,
    createdAt: new Date().toISOString(),
    driverName: driverData?.name || order?.driverName || 'Fuel Friend',
    driverPhone: driverData?.phone || order?.driverPhone || '',
    fuelType: order?.fuelType || 'Regular',
    fuelQuantity: order?.fuelQuantity || '1x',
    fuelCost,
    serviceFee,
    totalAmount,
    currency: order?.currency || '$',
    stationName: order?.stationName || order?.station?.name || 'Fuel Station',
    deliveryAddress: order?.deliveryAddress || order?.station?.address || 'Pickup point',
    cartItems
  };
};

export const saveReceiptForUser = (userId: string, receipt: ReceiptLike) => {
  if (!userId) return;
  const key = `userReceipts_${userId}`;
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  const deduped = Array.isArray(existing)
    ? existing.filter((item: any) => item?.trackingNumber !== receipt.trackingNumber)
    : [];
  deduped.unshift(receipt);
  localStorage.setItem(key, JSON.stringify(deduped));
};

export const downloadReceiptPdf = (receipt: ReceiptLike) => {
  const lines: string[] = [
    'FUELFRIENDLY RECEIPT',
    '',
    `Order ID: ${receipt.trackingNumber || '-'}`,
    `Date: ${new Date(receipt.createdAt || Date.now()).toLocaleString()}`,
    `Fuel Friend: ${receipt.driverName || '-'}`,
    '',
    `Fuel: ${receipt.fuelType || '-'} (${receipt.fuelQuantity || '-'})`,
    `Fuel Cost: ${receipt.currency || '$'}${toTwo(receipt.fuelCost)}`,
    `Service Fee: ${receipt.currency || '$'}${toTwo(receipt.serviceFee)}`,
    ''
  ];
  if (Array.isArray(receipt.cartItems)) {
    for (const item of receipt.cartItems) {
      if (!item?.name) continue;
      lines.push(`${item.name} x${toNumber(item.quantity || 1)} - ${receipt.currency || '$'}${toTwo(toNumber(item.price) * toNumber(item.quantity || 1))}`);
    }
    lines.push('');
  }
  lines.push(`TOTAL: ${receipt.currency || '$'}${toTwo(receipt.totalAmount)}`);
  lines.push(`Station: ${receipt.stationName || '-'}`);
  lines.push(`Pickup: ${receipt.deliveryAddress || '-'}`);
  const blob = createPdfBlob(lines);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `receipt_${receipt.trackingNumber || Date.now()}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1200);
};

export const openReceiptPdfInNewTab = (receipt: ReceiptLike) => {
  const lines = [
    'FUELFRIENDLY RECEIPT',
    '',
    `Order ID: ${receipt.trackingNumber || '-'}`,
    `Date: ${new Date(receipt.createdAt || Date.now()).toLocaleString()}`,
    `Fuel Friend: ${receipt.driverName || '-'}`,
    `TOTAL: ${receipt.currency || '$'}${toTwo(receipt.totalAmount)}`,
    '',
    `Station: ${receipt.stationName || '-'}`,
    `Pickup: ${receipt.deliveryAddress || '-'}`
  ];
  const blob = createPdfBlob(lines);
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  setTimeout(() => URL.revokeObjectURL(url), 3000);
};
