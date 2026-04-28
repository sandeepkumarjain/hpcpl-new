import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp, getDocs } from 'firebase/firestore';
import { Plus, FileText, Download, Building2, Hash, Package, History, Image as ImageIcon, X, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { cn } from '../../lib/utils';

export default function SalesOrdersModule() {
  const [sos, setSos] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    customerGst: '',
    product: 'VG30',
    qty: 0,
    rate: 0,
    tax: 18,
    image: '',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const qSos = query(collection(db, 'sales_orders'), orderBy('date', 'desc'));
    const unsubSos = onSnapshot(qSos, (snapshot) => {
      setSos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const fetchCompanies = async () => {
      const snap = await getDocs(collection(db, 'companies'));
      setCompanies(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchCompanies();

    return () => unsubSos();
  }, []);

  const calculateTotals = () => {
    const taxableAmount = formData.qty * formData.rate;
    const gstAmount = (taxableAmount * formData.tax) / 100;
    const total = taxableAmount + gstAmount;
    return { taxableAmount, gstAmount, total };
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId) return alert('Please select a customer');
    
    setLoading(true);
    try {
      const soNo = `SO-${Date.now().toString().slice(-6)}`;
      const { taxableAmount, gstAmount, total } = calculateTotals();
      await addDoc(collection(db, 'sales_orders'), {
        ...formData,
        soNo,
        taxableAmount,
        gstAmount,
        total,
        date: Timestamp.now(),
      });
      setIsAdding(false);
      setFormData({
        customerId: '',
        customerName: '',
        customerGst: '',
        product: 'VG30',
        qty: 0,
        rate: 0,
        tax: 18,
        image: '',
      });
      setImagePreview(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size too large. Please upload an image smaller than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData({ ...formData, image: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, image: '' });
  };

  const exportPDF = (so: any) => {
    const doc = new jsPDF() as any;
    
    doc.setFontSize(20);
    doc.text('SALES ORDER', 105, 20, { align: 'center' });
    
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-900">Sales Orders</h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard/so-history')}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all"
          >
            <History className="w-4 h-4" />
            View History
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create SO
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-xl font-black mb-6">Create Sales Order</h2>
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Select Customer</label>
                <div className="relative group/input">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/input:text-blue-500 transition-colors" />
                  <select 
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-2xl pl-12 pr-4 py-3.5 font-bold text-slate-900 transition-all outline-none appearance-none"
                    value={formData.customerId}
                    onChange={e => {
                      const c = companies.find(comp => comp.id === e.target.value);
                      setFormData({
                        ...formData, 
                        customerId: e.target.value,
                        customerName: c?.companyName || '',
                        customerGst: c?.gst || '',
                        customerAddress: c?.address || '',
                        customerEmail: c?.email || ''
                      });
                    }}
                    required
                  >
                    <option value="">Choose Company...</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Customer GST</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={formData.customerGst} 
                    readOnly
                    className="w-full bg-slate-100 border-2 border-transparent rounded-2xl pl-12 pr-4 py-3.5 font-bold text-slate-500 outline-none"
                    placeholder="GSTIN (Auto)"
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

              <div className="col-span-full space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Product Image (Optional)</label>
                <div className="flex flex-col gap-4">
                  {!imagePreview ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-[2rem] hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-xs text-slate-500 font-bold">Click to upload or drag and drop</p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest">PNG, JPG up to 2MB</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                  ) : (
                    <div className="relative w-full aspect-video md:aspect-[21/9] rounded-[2rem] overflow-hidden border border-slate-200 group">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          type="button"
                          onClick={removeImage}
                          className="p-3 bg-white text-red-600 rounded-2xl font-black text-xs flex items-center gap-2 hover:scale-105 transition-transform"
                        >
                          <X className="w-4 h-4" />
                          Remove Image
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="col-span-full p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold text-slate-500">Taxable Amount</span>
                  <span className="text-sm font-black text-slate-900">₹{(formData.qty * formData.rate).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-5">
                  <span className="text-sm font-bold text-slate-500">GST (18%)</span>
                  <span className="text-sm font-black text-slate-900">₹{((formData.qty * formData.rate * 0.18)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-blue-100">
                  <span className="text-lg font-black text-slate-900">Final Sales Value</span>
                  <span className="text-3xl font-black text-blue-600">₹{calculateTotals().total.toLocaleString()}</span>
                </div>
              </div>

              <div className="col-span-full flex gap-4 pt-4">
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none disabled:scale-100"
                >
                  {loading ? 'Creating...' : 'Generate Sales Order'}
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
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">SO Number</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Product / Qty</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Breakdown</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Total Amount</th>
                <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sos.map((so) => (
                <tr key={so.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-black text-slate-900">{so.soNo}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-500">
                    {so.date?.seconds ? format(new Date(so.date.seconds * 1000), 'dd MMM yyyy') : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="block text-sm font-bold text-slate-900">{so.customerName}</span>
                    <span className="text-[10px] text-slate-400 font-black uppercase">{so.customerGst}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="block text-sm font-bold text-slate-900">{so.product}</span>
                    <span className="text-xs font-bold text-slate-500">{so.qty} MT @ ₹{so.rate}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-black uppercase">Taxable: ₹{so.taxableAmount?.toLocaleString() || (so.qty * so.rate).toLocaleString()}</span>
                      <span className="text-[10px] text-blue-600 font-black uppercase">GST ({so.tax}%): ₹{so.gstAmount?.toLocaleString() || (so.qty * so.rate * 0.18).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-slate-900">₹{so.total?.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => exportPDF(so)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-black ml-auto"
                    >
                      <Download className="w-4 h-4" />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
              {sos.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">No sales orders found</p>
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
