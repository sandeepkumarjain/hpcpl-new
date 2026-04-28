import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { FileText, Download, User, Calendar, ReceiptIndianRupee } from 'lucide-react';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function InvoicesModule() {
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'invoices'), orderBy('date', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setInvoices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const exportPDF = (inv: any) => {
    const doc = new jsPDF() as any;
    
    // Header with Logo
    if (inv.sellerLogo) {
      doc.addImage(inv.sellerLogo, 'PNG', 20, 15, 30, 30);
    }

    doc.setFontSize(22);
    doc.text('PROFORMA INVOICE', 105, 20, { align: 'center' });
    
    const headerX = inv.sellerLogo ? 55 : 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(inv.sellerName || 'HANNANTH PETRO CHEM PRIVATE LIMITED', headerX, 35);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(inv.sellerAddress || 'Office No. 201, 2nd Floor, Shreeji Complex, Plot No. 154', headerX, 40);
    doc.text(inv.sellerAddressCity || 'Sector 8, Gandhidham - 370201, Gujarat, India', headerX, 44);
    doc.text(`Email: ${inv.sellerEmail || 'hannanthpetrochem@gmail.com'} | Mobile: ${inv.sellerPhone || '+91 96724 18000'}`, headerX, 48);
    doc.text(`GSTIN: ${inv.sellerGst || '08AADCH1407J1ZS'}`, headerX, 52);
    doc.text('BANK: HDFC BANK LTD', 20, 56);
    doc.text('A/C: 502000XXXXXXX', 20, 60);
    doc.text('IFSC: HDFC000XXXX', 20, 64);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PI NUMBER:', 120, 35);
    doc.setFont('helvetica', 'normal');
    doc.text(inv.piNo, 170, 35);
    
    doc.setFont('helvetica', 'bold');
    doc.text('DATE:', 120, 40);
    doc.setFont('helvetica', 'normal');
    doc.text(format(new Date(inv.date.seconds * 1000), 'dd/MM/yyyy'), 170, 40);

    doc.line(20, 72, 190, 72);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO:', 20, 80);
    doc.setFont('helvetica', 'normal');
    doc.text(inv.buyerName || 'Buyer Name', 20, 85);
    
    let currentY = 90;
    if (inv.buyerAddress) {
      const splitAddress = doc.splitTextToSize(inv.buyerAddress, 80);
      doc.text(splitAddress, 20, currentY);
      currentY += (splitAddress.length * 4);
    }
    
    doc.text(`GSTIN: ${inv.buyerGst || 'N/A'}`, 20, currentY);
    currentY += 5;
    if (inv.buyerEmail) {
      doc.text(`Email: ${inv.buyerEmail}`, 20, currentY);
      currentY += 5;
    }

    const tableData = [
      ['Description', 'HSN', 'Qty (KG)', 'Rate', 'Taxable Value'],
      ['VG30 Bitumen (Packed)', '2713', `${inv.netWt}`, `Rs. ${inv.soldRate}`, `Rs. ${inv.taxable.toLocaleString()}`]
    ];

    doc.autoTable({
      startY: Math.max(currentY + 5, 105),
      head: [tableData[0]],
      body: [tableData[1]],
      theme: 'grid',
      headStyles: { fillStyle: [15, 23, 42] }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Subtotal:', 140, finalY);
    doc.setFont('helvetica', 'normal');
    doc.text(`Rs. ${inv.taxable.toLocaleString()}`, 170, finalY);

    doc.setFont('helvetica', 'bold');
    doc.text('GST (18%):', 140, finalY + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Rs. ${inv.gst.toLocaleString()}`, 170, finalY + 5);

    doc.setFont('helvetica', 'bold');
    doc.text('Round Off:', 140, finalY + 10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Rs. ${inv.roundOff.toLocaleString()}`, 170, finalY + 10);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Grand Total:', 140, finalY + 20);
    doc.text(`Rs. ${inv.grandTotal.toLocaleString()}`, 170, finalY + 20);

    doc.setFontSize(10);
    doc.text('Authorized Signature', 150, finalY + 50);
    doc.line(140, finalY + 45, 190, finalY + 45);

    doc.save(`${inv.piNo}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-900">Proforma Invoices</h1>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">PI Number</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Buyer</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-black text-slate-900">{inv.piNo}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-500">
                    {inv.date?.seconds ? format(new Date(inv.date.seconds * 1000), 'dd MMM yyyy') : 'N/A'}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700">{inv.buyerName || 'Client'}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-blue-600">₹{inv.grandTotal?.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => exportPDF(inv)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-black ml-auto"
                    >
                      <Download className="w-4 h-4" />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <ReceiptIndianRupee className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">No invoices generated yet</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
