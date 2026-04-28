import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { 
  FileText, 
  Plus,
  Download, 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Calendar,
  Building2,
  ChevronLeft,
  AlertCircle,
  X,
  FileStack
} from 'lucide-react';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

export default function SalesOrdersHistory() {
  const [sos, setSos] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const qSos = query(collection(db, 'sales_orders'), orderBy('date', 'desc'));
    const unsubSos = onSnapshot(qSos, (snapshot) => {
      setSos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubSos();
  }, []);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedSos = useMemo(() => {
    let result = [...sos];

    // Filter
    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase();
      result = result.filter(so => 
        so.soNo?.toLowerCase().includes(lowSearch) || 
        so.customerName?.toLowerCase().includes(lowSearch) ||
        so.product?.toLowerCase().includes(lowSearch)
      );
    }

    // Sort
    if (sortConfig) {
      result.sort((a, b) => {
        let aValue: any = a[sortConfig.key];
        let bValue: any = b[sortConfig.key];

        // Handle special types
        if (sortConfig.key === 'date') {
          aValue = a.date?.seconds || 0;
          bValue = b.date?.seconds || 0;
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comp = aValue.localeCompare(bValue, undefined, { sensitivity: 'base', numeric: true });
          return sortConfig.direction === 'asc' ? comp : -comp;
        }

        // Generic comparison for numbers/others
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [sos, searchTerm, sortConfig]);

  const exportPDF = (so: any) => {
    const doc = new jsPDF() as any;
    
    doc.setFontSize(20);
    doc.text(`SALES ORDER - ${so.soNo}`, 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('HANNANTH PETRO CHEM PRIVATE LIMITED', 20, 35);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Office No. 201, 2nd Floor, Shreeji Complex, Plot No. 154', 20, 40);
    doc.text('Sector 8, Gandhidham - 370201, Gujarat, India', 20, 44);
    doc.text('Email: hannanthpetrochem@gmail.com | Mobile: +91 96724 18000', 20, 48);
    doc.text('GSTIN: 08AADCH1407J1ZS', 20, 52);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('SALES ORDER NO:', 120, 35);
    doc.setFont('helvetica', 'normal');
    doc.text(so.soNo, 170, 35);
    
    doc.setFont('helvetica', 'bold');
    doc.text('DATE:', 120, 40);
    doc.setFont('helvetica', 'normal');
    doc.text(format(new Date(so.date.seconds * 1000), 'dd/MM/yyyy'), 170, 40);

    doc.line(20, 58, 190, 58);
    doc.setFont('helvetica', 'bold');
    doc.text('CUSTOMER:', 20, 68);
    doc.setFont('helvetica', 'normal');
    doc.text(so.customerName, 20, 73);
    
    let currentY = 78;
    if (so.customerAddress) {
      const splitAddress = doc.splitTextToSize(so.customerAddress, 80);
      doc.text(splitAddress, 20, currentY);
      currentY += (splitAddress.length * 4);
    }
    
    doc.text(`GSTIN: ${so.customerGst}`, 20, currentY);
    currentY += 5;
    if (so.customerEmail) {
      doc.text(`Email: ${so.customerEmail}`, 20, currentY);
      currentY += 5;
    }

    const tableData = [
      ['Product / Description', 'HSN', 'Qty', 'Rate', 'Taxable Amt', 'Tax %', 'GST Amt', 'Total'],
      [
        so.product, 
        '2713', 
        `${so.qty} MT`, 
        `Rs. ${so.rate}`, 
        `Rs. ${so.taxableAmount?.toLocaleString() || (so.qty * so.rate).toLocaleString()}`,
        `${so.tax}%`, 
        `Rs. ${so.gstAmount?.toLocaleString() || (so.qty * so.rate * 0.18).toLocaleString()}`,
        `Rs. ${so.total.toLocaleString()}`
      ]
    ];

    doc.autoTable({
      startY: Math.max(currentY + 5, 88),
      head: [tableData[0]],
      body: [tableData[1]],
      theme: 'grid',
      headStyles: { fillStyle: [37, 99, 235] }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // Summary below table
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary:', 130, finalY);
    doc.setFont('helvetica', 'normal');
    doc.text('Taxable Amount:', 130, finalY + 5);
    doc.text(`Rs. ${so.taxableAmount?.toLocaleString() || (so.qty * so.rate).toLocaleString()}`, 170, finalY + 5);
    doc.text(`GST (${so.tax}%):`, 130, finalY + 10);
    doc.text(`Rs. ${so.gstAmount?.toLocaleString() || (so.qty * so.rate * 0.18).toLocaleString()}`, 170, finalY + 10);
    doc.setFont('helvetica', 'bold');
    doc.text('Grand Total:', 130, finalY + 15);
    doc.text(`Rs. ${so.total.toLocaleString()}`, 170, finalY + 15);

    doc.text('Authorized Signature', 150, finalY + 45);
    doc.line(140, finalY + 40, 190, finalY + 40);

    doc.save(`${so.soNo}.pdf`);
  };

  const generateBulkPDF = () => {
    const selectedSos = sos.filter(so => selectedIds.has(so.id));
    if (selectedSos.length === 0) return;

    const doc = new jsPDF() as any;

    selectedSos.forEach((so, index) => {
      if (index > 0) doc.addPage();
      
      doc.setFontSize(20);
      doc.text(`SALES ORDER - ${so.soNo}`, 105, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('HANNANTH PETRO CHEM PRIVATE LIMITED', 20, 35);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Office No. 201, 2nd Floor, Shreeji Complex, Plot No. 154', 20, 40);
      doc.text('Sector 8, Gandhidham - 370201, Gujarat, India', 20, 44);
      doc.text('Email: hannanthpetrochem@gmail.com | Mobile: +91 96724 18000', 20, 48);
      doc.text('GSTIN: 08AADCH1407J1ZS', 20, 52);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('SALES ORDER NO:', 120, 35);
      doc.setFont('helvetica', 'normal');
      doc.text(so.soNo, 170, 35);
      
      doc.setFont('helvetica', 'bold');
      doc.text('DATE:', 120, 40);
      doc.setFont('helvetica', 'normal');
      doc.text(format(new Date(so.date.seconds * 1000), 'dd/MM/yyyy'), 170, 40);

      doc.line(20, 58, 190, 58);
      doc.setFont('helvetica', 'bold');
      doc.text('CUSTOMER:', 20, 68);
      doc.setFont('helvetica', 'normal');
      doc.text(so.customerName, 20, 73);
      
      let currentY = 78;
      if (so.customerAddress) {
        const splitAddress = doc.splitTextToSize(so.customerAddress, 80);
        doc.text(splitAddress, 20, currentY);
        currentY += (splitAddress.length * 4);
      }
      
      doc.text(`GSTIN: ${so.customerGst}`, 20, currentY);
      currentY += 5;
      if (so.customerEmail) {
        doc.text(`Email: ${so.customerEmail}`, 20, currentY);
        currentY += 5;
      }

      const tableData = [
        ['Product / Description', 'HSN', 'Qty', 'Rate', 'Taxable Amt', 'Tax %', 'GST Amt', 'Total'],
        [
          so.product, 
          '2713', 
          `${so.qty} MT`, 
          `Rs. ${so.rate}`, 
          `Rs. ${so.taxableAmount?.toLocaleString() || (so.qty * so.rate).toLocaleString()}`,
          `${so.tax}%`, 
          `Rs. ${so.gstAmount?.toLocaleString() || (so.qty * so.rate * 0.18).toLocaleString()}`,
          `Rs. ${so.total.toLocaleString()}`
        ]
      ];

      doc.autoTable({
        startY: Math.max(currentY + 5, 88),
        head: [tableData[0]],
        body: [tableData[1]],
        theme: 'grid',
        headStyles: { fillStyle: [37, 99, 235] }
      });

      const finalY = (doc as any).lastAutoTable.finalY + 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary:', 130, finalY);
      doc.setFont('helvetica', 'normal');
      doc.text('Taxable Amount:', 130, finalY + 5);
      doc.text(`Rs. ${so.taxableAmount?.toLocaleString() || (so.qty * so.rate).toLocaleString()}`, 170, finalY + 5);
      doc.text(`GST (${so.tax}%):`, 130, finalY + 10);
      doc.text(`Rs. ${so.gstAmount?.toLocaleString() || (so.qty * so.rate * 0.18).toLocaleString()}`, 170, finalY + 10);
      doc.setFont('helvetica', 'bold');
      doc.text('Grand Total:', 130, finalY + 15);
      doc.text(`Rs. ${so.total.toLocaleString()}`, 170, finalY + 15);

      doc.text('Authorized Signature', 150, finalY + 45);
      doc.line(140, finalY + 40, 190, finalY + 40);
    });

    doc.save(`Sales_Orders_Archive_${format(new Date(), 'ddMMyyyy_HHmm')}.pdf`);
    setSelectedIds(new Set());
    setShowBulkConfirm(false);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredAndSortedSos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSortedSos.map(so => so.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (!sortConfig || sortConfig.key !== column) return <ArrowUpDown className="w-3 h-3 text-slate-300" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />;
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <button 
            onClick={() => navigate('/dashboard/so')}
            className="flex items-center gap-2 text-slate-500 font-bold text-sm mb-2 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Sales
          </button>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            Sales History
          </h1>
          <p className="text-slate-500 font-medium mt-1">Detailed log of all historical sales orders.</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <button
            onClick={() => navigate('/dashboard/so')}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-900 border-2 border-slate-100 rounded-2xl font-black text-sm shadow-sm hover:bg-slate-50 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            Create New SO
          </button>
          
          {selectedIds.size > 0 && (
            <button
              onClick={() => setShowBulkConfirm(true)}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 animate-in zoom-in-95 duration-200"
            >
              <Download className="w-4 h-4" />
              Download Archive ({selectedIds.size})
            </button>
          )}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search SO#, Customer or Product..."
              className="w-full bg-white border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-3 font-bold text-slate-900 outline-none focus:border-blue-500/10 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm shadow-slate-100/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-left w-10">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedIds.size === filteredAndSortedSos.length && filteredAndSortedSos.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th 
                  className={cn(
                    "px-8 py-5 text-left cursor-pointer group transition-colors",
                    sortConfig?.key === 'soNo' ? "bg-blue-50/50" : ""
                  )}
                  onClick={() => handleSort('soNo')}
                >
                  <div className={cn(
                    "flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
                    sortConfig?.key === 'soNo' ? "text-blue-600" : "text-slate-400"
                  )}>
                    SO Number
                    <SortIcon column="soNo" />
                  </div>
                </th>
                <th 
                  className={cn(
                    "px-8 py-5 text-left cursor-pointer group transition-colors",
                    sortConfig?.key === 'date' ? "bg-blue-50/50" : ""
                  )}
                  onClick={() => handleSort('date')}
                >
                  <div className={cn(
                    "flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
                    sortConfig?.key === 'date' ? "text-blue-600" : "text-slate-400"
                  )}>
                    Date
                    <SortIcon column="date" />
                  </div>
                </th>
                <th 
                  className={cn(
                    "px-8 py-5 text-left cursor-pointer group transition-colors",
                    sortConfig?.key === 'customerName' ? "bg-blue-50/50" : ""
                  )}
                  onClick={() => handleSort('customerName')}
                >
                  <div className={cn(
                    "flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
                    sortConfig?.key === 'customerName' ? "text-blue-600" : "text-slate-400"
                  )}>
                    Customer
                    <SortIcon column="customerName" />
                  </div>
                </th>
                <th className="px-8 py-5 text-left">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Product Details
                  </div>
                </th>
                <th 
                  className={cn(
                    "px-8 py-5 text-left cursor-pointer group transition-colors",
                    sortConfig?.key === 'taxableAmount' ? "bg-blue-50/50" : ""
                  )}
                  onClick={() => handleSort('taxableAmount')}
                >
                  <div className={cn(
                    "flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
                    sortConfig?.key === 'taxableAmount' ? "text-blue-600" : "text-slate-400"
                  )}>
                    Taxable Amt
                    <SortIcon column="taxableAmount" />
                  </div>
                </th>
                <th 
                  className={cn(
                    "px-8 py-5 text-left cursor-pointer group transition-colors",
                    sortConfig?.key === 'gstAmount' ? "bg-blue-50/50" : ""
                  )}
                  onClick={() => handleSort('gstAmount')}
                >
                  <div className={cn(
                    "flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
                    sortConfig?.key === 'gstAmount' ? "text-blue-600" : "text-slate-400"
                  )}>
                    GST Amt
                    <SortIcon column="gstAmount" />
                  </div>
                </th>
                <th 
                  className={cn(
                    "px-8 py-5 text-left cursor-pointer group transition-colors",
                    sortConfig?.key === 'total' ? "bg-blue-50/50" : ""
                  )}
                  onClick={() => handleSort('total')}
                >
                  <div className={cn(
                    "flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
                    sortConfig?.key === 'total' ? "text-blue-600" : "text-slate-400"
                  )}>
                    Grand Total
                    <SortIcon column="total" />
                  </div>
                </th>
                <th className="px-8 py-5 text-right">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Action
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAndSortedSos.map((so) => (
                <tr 
                  key={so.id} 
                  className={cn(
                    "hover:bg-blue-50/30 transition-all group/row",
                    selectedIds.has(so.id) && "bg-blue-50/50"
                  )}
                >
                  <td className="px-8 py-5">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedIds.has(so.id)}
                      onChange={() => toggleSelect(so.id)}
                    />
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-[10px] text-slate-500 group-hover/row:bg-blue-600 group-hover/row:text-white transition-colors">
                        SO
                      </div>
                      <span className="font-black text-slate-900">{so.soNo}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">
                        {so.date?.seconds ? format(new Date(so.date.seconds * 1000), 'dd MMM, yyyy') : 'N/A'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Historical Entry
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-300" />
                      <div>
                        <span className="block text-sm font-black text-slate-900">{so.customerName}</span>
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-tight">{so.customerGst}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-black text-slate-600 border border-slate-200">
                      {so.product}
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      {so.qty} MT
                    </span>
                    <div className="mt-1 text-[10px] text-slate-400 font-bold italic">
                      at ₹{so.rate?.toLocaleString()} / MT
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-bold text-slate-700">₹{so.taxableAmount?.toLocaleString() || (so.qty * so.rate).toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">₹{so.gstAmount?.toLocaleString() || (so.qty * so.rate * (so.tax / 100)).toLocaleString()}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">@{so.tax}%</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-lg font-black text-slate-900 tracking-tight">₹{so.total?.toLocaleString()}</span>
                      <span className="text-[10px] text-emerald-500 font-bold uppercase">Total Paid</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => exportPDF(so)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black text-xs hover:bg-blue-600 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>
                  </td>
                </tr>
              ))}
              {filteredAndSortedSos.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-32 text-center">
                    <div className="max-w-md mx-auto px-6">
                      <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <FileText className="w-12 h-12 text-slate-300" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                        {searchTerm ? "No Match Found" : "Your Sales History is Empty"}
                      </h3>
                      <p className="text-slate-500 font-bold leading-relaxed mb-8">
                        {searchTerm 
                          ? `We couldn't find any orders matching "${searchTerm}". Try using different keywords or clearing the search.`
                          : "You haven't generated any sales orders yet. Once you create orders in the Sales module, they will appear here forever."
                        }
                      </p>
                      
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        {searchTerm ? (
                          <button 
                            onClick={() => setSearchTerm('')}
                            className="w-full sm:w-auto px-8 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all active:scale-95"
                          >
                            Clear Search
                          </button>
                        ) : (
                          <button 
                            onClick={() => navigate('/dashboard/so')}
                            className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Create New Order
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showBulkConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
            onClick={() => setShowBulkConfirm(false)}
          />
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
            <div className="bg-slate-50 p-8 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <FileStack className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Bulk Export</h3>
                  <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Confirmation Required</p>
                </div>
              </div>
              <button 
                onClick={() => setShowBulkConfirm(false)}
                className="w-10 h-10 rounded-xl hover:bg-slate-200 flex items-center justify-center transition-colors shadow-sm bg-white border border-slate-200"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <div className="p-8">
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 mb-8">
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <span className="block text-2xl font-black text-blue-900 leading-none mb-1">
                      {selectedIds.size} Orders
                    </span>
                    <span className="text-blue-600/80 font-bold text-sm">
                      Ready for batch processing
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-slate-600 font-medium leading-relaxed mb-8">
                You are about to generate a consolidated PDF archive for <span className="font-black text-slate-900">{selectedIds.size}</span> selected sales orders. 
                Each order will appear on a separate page in the final document.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowBulkConfirm(false)}
                  className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={generateBulkPDF}
                  className="py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Confirm & Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
