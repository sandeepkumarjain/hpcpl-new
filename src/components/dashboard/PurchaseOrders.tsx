import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { Plus, FileText, Download, Building2, Hash, Calendar, Package, IndianRupee, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function PurchaseOrdersModule() {
  const [pos, setPos] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    supplier: '',
    supplierGst: '',
    product: 'VG30',
    hsn: '2713',
    qty: 0,
    rate: 0,
    tax: 18,
    terms: 'Payment within 7 days'
  });

  useEffect(() => {
    const q = query(collection(db, 'purchase_orders'), orderBy('date', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setPos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const calculateTotal = () => {
    const taxable = formData.qty * formData.rate;
    const taxAmount = (taxable * formData.tax) / 100;
    return taxable + taxAmount;
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const poNo = `PO-${Date.now().toString().slice(-6)}`;
      const total = calculateTotal();
      await addDoc(collection(db, 'purchase_orders'), {
        ...formData,
        poNo,
        total,
        date: Timestamp.now(),
      });
      setIsAdding(false);
      setFormData({
        supplier: '',
        supplierGst: '',
        product: 'VG30',
        hsn: '2713',
        qty: 0,
        rate: 0,
        tax: 18,
        terms: 'Payment within 7 days'
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this purchase order?')) {
      try {
        await deleteDoc(doc(db, 'purchase_orders', id));
      } catch (err) {
        console.error(err);
        alert('Failed to delete PO');
      }
    }
  };

  const exportPDF = (po: any) => {
    const doc = new jsPDF() as any;
    
    // Header
    doc.setFontSize(20);
    doc.text('PURCHASE ORDER', 105, 20, { align: 'center' });
    
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
    doc.text('PURCHASE ORDER NO:', 120, 35);
    doc.setFont('helvetica', 'normal');
    doc.text(po.poNo, 170, 35);
    
    doc.setFont('helvetica', 'bold');
    doc.text('DATE:', 120, 40);
    doc.setFont('helvetica', 'normal');
    doc.text(format(new Date(po.date.seconds * 1000), 'dd/MM/yyyy'), 170, 40);

    // Supplier Info
    doc.line(20, 58, 190, 58);
    doc.setFont('helvetica', 'bold');
    doc.text('SUPPLIER:', 20, 68);
    doc.setFont('helvetica', 'normal');
    doc.text(po.supplier, 20, 73);
    doc.text(`GSTIN: ${po.supplierGst}`, 20, 78);

    // Table
    const tableData = [
      ['Product / Description', 'HSN', 'Qty', 'Rate', 'Tax %', 'Total Amount'],
      [po.product, po.hsn || '2713', `${po.qty} MT`, `Rs. ${po.rate}`, `${po.tax}%`, `Rs. ${po.total.toLocaleString()}`]
    ];

    doc.autoTable({
      startY: 88,
      head: [tableData[0]],
      body: [tableData[1]],
      theme: 'grid',
      headStyles: { fillStyle: [15, 23, 42] }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.text('Terms & Conditions:', 20, finalY);
    doc.setFontSize(8);
    doc.text(po.terms || 'Payment within terms.', 20, finalY + 5);

    doc.setFontSize(10);
    doc.text('Authorized Signature', 150, finalY + 30);
    doc.line(140, finalY + 25, 190, finalY + 25);

    doc.save(`${po.poNo}.pdf`);
  };

  const filteredPos = pos.filter(po => 
    po.poNo?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    po.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-900">Purchase Orders</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Create PO
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search PO Number or Supplier..." 
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border-none shadow-sm font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-xl font-black mb-6">Create Purchase Order</h2>
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Supplier Name</label>
                <div className="relative group/input">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/input:text-blue-500 transition-colors" />
                  <input 
                    type="text" 
                    value={formData.supplier} 
                    onChange={e => setFormData({...formData, supplier: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-2xl pl-12 pr-4 py-3.5 font-bold text-slate-900 transition-all outline-none placeholder:text-slate-300"
                    placeholder="Legal Entity Name"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Supplier GST</label>
                <div className="relative group/input">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/input:text-blue-500 transition-colors" />
                  <input 
                    type="text" 
                    value={formData.supplierGst} 
                    onChange={e => setFormData({...formData, supplierGst: e.target.value.toUpperCase()})}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-2xl pl-12 pr-4 py-3.5 font-bold text-slate-900 transition-all outline-none placeholder:text-slate-300"
                    placeholder="GSTIN"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Product</label>
                <div className="relative group/input">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/input:text-blue-500 transition-colors" />
                  <select 
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-2xl pl-12 pr-4 py-3.5 font-bold text-slate-900 transition-all outline-none appearance-none"
                    value={formData.product}
                    onChange={e => setFormData({...formData, product: e.target.value})}
                  >
                    {['VG10', 'VG30', 'VG40', '60/70', '80/100', 'CRMB', 'PMB', 'Emulsion'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">HSN Code</label>
                <div className="relative group/input">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/input:text-blue-500 transition-colors" />
                  <input 
                    type="text" 
                    value={formData.hsn} 
                    onChange={e => setFormData({...formData, hsn: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-2xl pl-12 pr-4 py-3.5 font-bold text-slate-900 transition-all outline-none placeholder:text-slate-300"
                    placeholder="HSN Code"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Qty (MT)</label>
                  <input 
                    type="number" 
                    value={formData.qty} 
                    onChange={e => setFormData({...formData, qty: Number(e.target.value)})}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-2xl px-4 py-3.5 font-bold text-slate-900 transition-all outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Rate (INR)</label>
                  <input 
                    type="number" 
                    value={formData.rate} 
                    onChange={e => setFormData({...formData, rate: Number(e.target.value)})}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-2xl px-4 py-3.5 font-bold text-slate-900 transition-all outline-none"
                    required
                  />
                </div>
              </div>
              
              <div className="col-span-full p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold text-slate-500">Taxable Amount</span>
                  <span className="text-sm font-black text-slate-900">₹{(formData.qty * formData.rate).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-5">
                  <span className="text-sm font-bold text-slate-500">GST (18%)</span>
                  <span className="text-sm font-black text-slate-900">₹{((formData.qty * formData.rate * 0.18)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-slate-200">
                  <span className="text-lg font-black text-slate-900">Grand Total</span>
                  <span className="text-3xl font-black text-blue-600">₹{calculateTotal().toLocaleString()}</span>
                </div>
              </div>

              <div className="col-span-full flex gap-4 pt-4">
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none disabled:scale-100"
                >
                  {loading ? 'Creating...' : 'Generate Purchase Order'}
                </button>
                <button 
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-2xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">PO Number</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Supplier</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPos.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-black text-slate-900">{po.poNo}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-500">
                    {po.date?.seconds ? format(new Date(po.date.seconds * 1000), 'dd MMM yyyy') : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="block text-sm font-bold text-slate-900">{po.supplier}</span>
                    <span className="text-[10px] text-slate-400 font-black uppercase">{po.supplierGst}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-slate-900">₹{po.total?.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => exportPDF(po)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-black"
                      >
                        <Download className="w-4 h-4" />
                        PDF
                      </button>
                      <button 
                        onClick={() => handleDelete(po.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPos.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">No purchase orders found</p>
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
