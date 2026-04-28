import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, setDoc, doc, onSnapshot, deleteDoc, Timestamp } from 'firebase/firestore';
import { TrendingUp, Plus, Trash2, Edit3, Save, Globe, DollarSign, RefreshCw } from 'lucide-react';

const PORTS = ['Kandla', 'Mundra', 'Pipavav', 'Hazira'];
const PRODUCTS = ['VG10', 'VG30', 'VG40', '60/70', '80/100', 'CRMB', 'PMB', 'Emulsion'];

export default function RatesManagement() {
  const [rates, setRates] = useState<any[]>([]);
  const [globalRates, setGlobalRates] = useState<any>({ brent: 0, usdinr: 0 });
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ product: 'VG30', port: 'Kandla', rate: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const unsubRates = onSnapshot(collection(db, 'rates'), (snapshot) => {
      setRates(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubGlobal = onSnapshot(doc(db, 'live_rates', 'indices'), (snapshot) => {
      if (snapshot.exists()) setGlobalRates(snapshot.data());
    });

    return () => { unsubRates(); unsubGlobal(); };
  }, []);

  const updateGlobalRate = async (field: string, value: number) => {
    await setDoc(doc(db, 'live_rates', 'indices'), {
      [field]: value,
      updatedAt: Timestamp.now()
    }, { merge: true });
  };

  const syncWithSheet = async () => {
    try {
      const response = await fetch('/api/sync-rates', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingId || `${formData.product}-${formData.port}`.toLowerCase().replace('/', '');
    try {
      await setDoc(doc(db, 'rates', id), {
        ...formData,
        rate: Number(formData.rate),
        updatedAt: Timestamp.now()
      });
      setIsAdding(false);
      setEditingId(null);
      setFormData({ product: 'VG30', port: 'Kandla', rate: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'rates', id));
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-slate-900 p-6 rounded-3xl text-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Brent Crude ($)</h3>
            <Globe className="w-4 h-4 text-slate-500" />
          </div>
          <input 
            type="number" 
            step="0.01"
            value={globalRates.brent} 
            onChange={e => updateGlobalRate('brent', Number(e.target.value))}
            className="w-full bg-transparent border-none p-0 text-3xl font-black focus:ring-0"
          />
          <p className="text-[10px] text-slate-600 font-bold mt-2 lowercase">per barrel</p>
        </div>
        <div className="bg-blue-600 p-6 rounded-3xl text-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-black text-blue-200 uppercase tracking-widest">USD-INR (₹)</h3>
            <DollarSign className="w-4 h-4 text-blue-200" />
          </div>
          <input 
            type="number" 
            step="0.01"
            value={globalRates.usdinr} 
            onChange={e => updateGlobalRate('usdinr', Number(e.target.value))}
            className="w-full bg-transparent border-none p-0 text-3xl font-black focus:ring-0"
          />
          <p className="text-[10px] text-blue-400 font-bold mt-2 lowercase">spot rate</p>
        </div>
        <button 
          onClick={syncWithSheet}
          className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4 hover:bg-slate-50 transition-all text-left group"
        >
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:rotate-180 transition-transform duration-700">
            <RefreshCw className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900">Sheet Sync</p>
            <p className="text-[10px] text-slate-400 font-bold">Auto-sync active</p>
          </div>
        </button>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-900">Live Rates Management</h1>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ product: 'VG30', port: 'Kandla', rate: '' });
            setIsAdding(true);
          }}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Update Rate
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {rates.map(r => (
          <div key={r.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative group">
            <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
              <button 
                onClick={() => {
                  setEditingId(r.id);
                  setFormData({ product: r.product, port: r.port, rate: r.rate.toString() });
                  setIsAdding(true);
                }}
                className="p-2 text-slate-300 hover:text-blue-500"
                title="Edit Rate"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDelete(r.id)}
                className="p-2 text-slate-300 hover:text-red-500"
                title="Delete Rate"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-50 rounded-xl">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-black text-slate-900">{r.product}</h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{r.port}</span>
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900">₹{r.rate.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">/ Metric Ton</span>
            </div>
          </div>
        ))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <h2 className="text-xl font-black mb-6">{editingId ? 'Edit Rate' : 'Update Daily Rate'}</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
               <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Product</label>
                 <select 
                   className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-2xl px-5 py-3.5 font-bold text-slate-900 transition-all outline-none appearance-none cursor-pointer"
                   value={formData.product}
                   onChange={e => setFormData({...formData, product: e.target.value})}
                 >
                   {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
                 </select>
               </div>
               <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Port</label>
                 <select 
                   className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-2xl px-5 py-3.5 font-bold text-slate-900 transition-all outline-none appearance-none cursor-pointer"
                   value={formData.port}
                   onChange={e => setFormData({...formData, port: e.target.value})}
                 >
                   {PORTS.map(p => <option key={p} value={p}>{p}</option>)}
                 </select>
               </div>
               <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">New Rate (₹)</label>
                 <input 
                   type="number"
                   value={formData.rate}
                   onChange={e => setFormData({...formData, rate: e.target.value})}
                   className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-2xl px-5 py-3.5 font-bold text-slate-900 transition-all outline-none"
                   required
                 />
               </div>
               <div className="pt-4 space-y-3">
                 <button 
                  type="submit" 
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                   Save & Push Update
                 </button>
                 <button 
                  type="button" 
                  onClick={() => setIsAdding(false)} 
                  className="w-full py-2 text-slate-400 font-bold text-sm"
                >
                  Cancel
                </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
