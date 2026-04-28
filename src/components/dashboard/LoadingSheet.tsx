import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp, doc, updateDoc, getDoc, getDocs } from 'firebase/firestore';
import { Plus, Search, Truck, MoreVertical, FileText, Upload, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

export default function LoadingSheetModule() {
  const [loadingSheets, setLoadingSheets] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    truckNo: '',
    driverNo: '',
    status: 'On Way',
    grossWt: 0,
    drums: 0,
    drumWeight: 9,
    purchaseRate: 0,
    soldRate: 0,
    soldToId: '',
    purchaseFromId: '',
  });
  const [weightSlip, setWeightSlip] = useState<File | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'loading_sheets'), orderBy('date', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setLoadingSheets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const fetchCompanies = async () => {
        const snap = await getDocs(collection(db, 'companies'));
        setCompanies(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchCompanies();

    return unsub;
  }, []);

  const calculateNetWeight = (gross: number, drums: number, drumWeight: number) => {
    return gross - (drums * drumWeight); // Formula: Net = Gross - (Drums × Drum Weight)
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const netWt = calculateNetWeight(formData.grossWt, formData.drums, formData.drumWeight);
    
    // In a real app, you'd upload the weightSlip to Firebase Storage here
    // For this implementation, we'll store a mock URL if a file is selected
    const weightSlipUrl = weightSlip ? `mock_storage/weight_slips/${weightSlip.name}` : '';

    try {
      const purchaseCompany = companies.find(c => c.id === formData.purchaseFromId);
      const soldCompany = companies.find(c => c.id === formData.soldToId);

      await addDoc(collection(db, 'loading_sheets'), {
        ...formData,
        purchaseFromName: purchaseCompany?.companyName || '',
        soldToName: soldCompany?.companyName || '',
        netWt,
        weightSlipUrl,
        date: Timestamp.now(),
      });
      setIsAdding(false);
      setWeightSlip(null);
      setFormData({
        truckNo: '',
        driverNo: '',
        status: 'On Way',
        grossWt: 0,
        drums: 0,
        drumWeight: 9,
        purchaseRate: 0,
        soldRate: 0,
        soldToId: '',
        purchaseFromId: '',
      });
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'loading_sheets', id), { status: newStatus });
    } catch (err) {
      console.error(err);
    }
  };

  const generatePI = async (ls: any) => {
    if (!ls.soldToId) return alert('No buyer assigned to this truck.');
    try {
      const buyerDoc = await getDoc(doc(db, 'companies', ls.soldToId));
      const buyerData = buyerDoc.data();
      
      // Attempt to find the "HANANTH" seller company to get the logo/address
      const companiesSnap = await getDocs(collection(db, 'companies'));
      const seller = companiesSnap.docs
        .map(d => ({ id: d.id, ...d.data() } as any))
        .find(c => c.companyName.toUpperCase().includes('HANNANTH')) || companiesSnap.docs[0]?.data();

      const taxable = ls.netWt * ls.soldRate;
      const gst = taxable * 0.18;
      const total = taxable + gst;
      const roundedTotal = Math.round(total);
      const roundOff = roundedTotal - total;

      const piNo = `PI-${Date.now().toString().slice(-6)}`;

      await addDoc(collection(db, 'invoices'), {
        piNo,
        date: Timestamp.now(),
        buyerId: ls.soldToId,
        buyerName: buyerData?.companyName,
        buyerGst: buyerData?.gst,
        buyerAddress: buyerData?.address || '',
        buyerEmail: buyerData?.email || '',
        sellerId: seller?.id || '',
        sellerName: seller?.companyName || 'HANNANTH PETRO CHEM PRIVATE LIMITED',
        sellerAddress: seller?.address || 'Office No. 201, 2nd Floor, Shreeji Complex, Plot No. 154',
        sellerGst: seller?.gst || '08AADCH1407J1ZS',
        sellerEmail: seller?.email || 'hannanthpetrochem@gmail.com',
        sellerPhone: seller?.mobile || '+91 96724 18000',
        sellerLogo: seller?.logo || '',
        loadingSheetId: ls.id,
        taxable,
        gst,
        roundOff,
        grandTotal: roundedTotal,
        netWt: ls.netWt,
        soldRate: ls.soldRate
      });
      alert(`Proforma Invoice ${piNo} generated!`);
    } catch (err) {
      console.error(err);
    }
  };

  const statusColors: any = {
    'On Way': 'bg-blue-50 text-blue-600',
    'Gate In': 'bg-yellow-50 text-yellow-600',
    'Under Loading': 'bg-orange-50 text-orange-600',
    'Loading Completed': 'bg-emerald-50 text-emerald-600',
    'Waiting Payment': 'bg-purple-50 text-purple-600',
    'Driver Not Responding': 'bg-red-50 text-red-600',
    'Driver Not Coming': 'bg-slate-50 text-slate-600',
  };

  const filteredSheets = loadingSheets.filter(ls => 
    ls.truckNo?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    ls.driverNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-900">Loading Sheet</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Entry
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-xl font-black mb-6">New Loading Entry</h2>
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Truck Number</label>
                <div className="relative group/input">
                  <Truck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/input:text-blue-500 transition-colors" />
                  <input 
                    type="text" 
                    value={formData.truckNo} 
                    onChange={e => setFormData({...formData, truckNo: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-2xl pl-12 pr-4 py-3.5 font-bold text-slate-900 transition-all outline-none placeholder:text-slate-300"
                    placeholder="e.g. RJ 14 GB 1234"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Driver Number</label>
                <input 
                  type="tel" 
                  value={formData.driverNo} 
                  onChange={e => setFormData({...formData, driverNo: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-2xl px-5 py-3.5 font-bold text-slate-900 transition-all outline-none placeholder:text-slate-300"
                  placeholder="Mobile Number"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Initial Status</label>
                <select 
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-2xl px-5 py-3.5 font-bold text-slate-900 transition-all outline-none appearance-none cursor-pointer"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Purchase From</label>
                <select 
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-2xl px-5 py-3.5 font-bold text-slate-900 transition-all outline-none appearance-none cursor-pointer"
                  value={formData.purchaseFromId}
                  onChange={e => setFormData({...formData, purchaseFromId: e.target.value})}
                  required
                >
                  <option value="">Select Supplier...</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Purchase Rate</label>
                <input 
                  type="number" 
                  value={formData.purchaseRate} 
                  onChange={e => setFormData({...formData, purchaseRate: Number(e.target.value)})}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-2xl px-5 py-3.5 font-bold text-slate-900 transition-all outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Sold To (Customer)</label>
                <select 
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-2xl px-5 py-3.5 font-bold text-slate-900 transition-all outline-none appearance-none cursor-pointer"
                  value={formData.soldToId}
                  onChange={e => setFormData({...formData, soldToId: e.target.value})}
                  required
                >
                  <option value="">Select Customer...</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Sold Rate</label>
                <input 
                  type="number" 
                  value={formData.soldRate} 
                  onChange={e => setFormData({...formData, soldRate: Number(e.target.value)})}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-2xl px-5 py-3.5 font-bold text-slate-900 transition-all outline-none"
                />
              </div>

              <div className="col-span-full space-y-2.5 mt-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Weight Slip (JPG/PNG Only)</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-[1.5rem] cursor-pointer bg-slate-50 hover:bg-slate-100/80 hover:border-blue-300 transition-all group/upload">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-slate-400 group-hover/upload:text-blue-500 group-hover/upload:scale-110 transition-all mb-2" />
                      <p className="text-sm text-slate-500 font-bold">
                        {weightSlip ? weightSlip.name : 'Click to upload weight slip'}
                      </p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/png, image/jpeg"
                      onChange={e => setWeightSlip(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
              </div>
              <div className="col-span-full border-t border-slate-100 pt-6 mt-2">
                <h3 className="text-xs font-black text-slate-900/40 uppercase tracking-[0.2em] mb-5">Weight Details (Mandatory if Completed)</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Gross Wt (KG)</label>
                    <input 
                      type="number" 
                      value={formData.grossWt} 
                      onChange={e => setFormData({...formData, grossWt: Number(e.target.value)})}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-2xl px-5 py-3.5 font-bold text-slate-900 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Drums</label>
                    <input 
                      type="number" 
                      value={formData.drums} 
                      onChange={e => setFormData({...formData, drums: Number(e.target.value)})}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-2xl px-5 py-3.5 font-bold text-slate-900 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Drum Weight (KG)</label>
                    <input 
                      type="number" 
                      value={formData.drumWeight} 
                      onChange={e => setFormData({...formData, drumWeight: Number(e.target.value)})}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-2xl px-5 py-3.5 font-bold text-slate-900 transition-all outline-none"
                    />
                  </div>
                </div>
                <div className="mt-6 p-6 bg-blue-50/50 border border-blue-100 rounded-[1.5rem] flex justify-between items-center">
                  <span className="text-sm font-bold text-blue-900/60 uppercase tracking-wider">Calculated Net Weight</span>
                  <span className="text-2xl font-black text-blue-600 font-mono tracking-tight">{calculateNetWeight(formData.grossWt, formData.drums, formData.drumWeight).toLocaleString()} KG</span>
                </div>
              </div>

              <div className="col-span-full flex gap-4 mt-6">
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Save Loading Entry
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
        <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search Truck or Driver..." 
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border-none shadow-sm font-bold text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select className="px-4 py-3 rounded-xl bg-white border-none shadow-sm font-bold text-xs">
              <option>All Status</option>
              {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/20">
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Truck / Driver</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Weight Details</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Purchase Details</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Sales Details</th>
                <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSheets.map((ls) => (
                <tr key={ls.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="block text-sm font-bold text-slate-900">
                      {ls.date?.seconds ? format(new Date(ls.date.seconds * 1000), 'dd MMM yyyy') : 'N/A'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider italic">
                      {ls.date?.seconds ? format(new Date(ls.date.seconds * 1000), 'hh:mm a') : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Truck className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <span className="block text-sm font-black text-slate-900">{ls.truckNo}</span>
                        <span className="text-[11px] text-slate-500 font-bold">{ls.driverNo || 'No Driver No.'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusPicker 
                      currentStatus={ls.status} 
                      onStatusChange={(newStatus) => updateStatus(ls.id, newStatus)} 
                      statusColors={statusColors}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900">{ls.netWt?.toLocaleString() || 0} KG</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">G: {ls.grossWt} | D: {ls.drums}</span>
                        {ls.weightSlipUrl && (
                          <a 
                            href={ls.weightSlipUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                            title="View Weight Slip"
                          >
                            <Upload className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="block text-sm font-bold text-slate-900">{ls.purchaseFromName || 'Direct'}</span>
                    <span className="text-[11px] text-emerald-600 font-black tracking-tight">₹{ls.purchaseRate?.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="block text-sm font-bold text-slate-900">{ls.soldToName || 'New Client'}</span>
                    <span className="text-[11px] text-blue-600 font-black tracking-tight">₹{ls.soldRate?.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {ls.status === 'Loading Completed' && (
                      <button 
                        onClick={() => generatePI(ls)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                        title="Generate PI"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    )}
                    <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSheets.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center grayscale opacity-50">
                       <Truck className="w-12 h-12 mb-4" />
                       <p className="text-sm font-bold text-slate-500">No matching loading sheets found</p>
                    </div>
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

function StatusPicker({ currentStatus, onStatusChange, statusColors }: any) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 group",
          statusColors[currentStatus]
        ) + " cursor-pointer"}
      >
        {currentStatus}
        <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 z-20 py-2 overflow-hidden"
            >
              {Object.keys(statusColors).map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    onStatusChange(status);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer",
                    status === currentStatus ? "bg-slate-50 text-blue-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  {status}
                  {status === currentStatus && <Check className="w-3 h-3" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
