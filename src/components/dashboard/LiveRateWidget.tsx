import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, query, orderBy, setDoc, doc, Timestamp } from 'firebase/firestore';
import { TrendingUp, ArrowRight, RefreshCw, Save } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';

export function LiveRateWidget() {
  const [rates, setRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempRate, setTempRate] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'rates'), orderBy('product'));
    const unsub = onSnapshot(q, (snapshot) => {
      setRates(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleUpdate = async (r: any) => {
    if (!tempRate) return;
    try {
      await setDoc(doc(db, 'rates', r.id), {
        ...r,
        rate: Number(tempRate),
        updatedAt: Timestamp.now()
      });
      setEditingId(null);
      setTempRate('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-xl">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Live Port Rates</h2>
        </div>
        <Link to="/dashboard/rates" className="text-blue-600 font-bold text-xs hover:underline flex items-center gap-1">
          Full Management <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-3">
        {rates.slice(0, 5).map((r) => (
          <div 
            key={r.id} 
            className="group flex items-center justify-between p-4 bg-slate-50 hover:bg-white hover:shadow-md hover:shadow-slate-200/50 rounded-2xl transition-all border border-transparent hover:border-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] text-slate-400 group-hover:text-blue-500 shadow-sm border border-slate-100 transition-colors">
                {r.product}
              </div>
              <div>
                <span className="block text-sm font-black text-slate-900 leading-tight">{r.product}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{r.port}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {editingId === r.id ? (
                <div className="flex items-center gap-2 animate-in zoom-in-95">
                  <input 
                    type="number" 
                    autoFocus
                    value={tempRate}
                    onChange={(e) => setTempRate(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdate(r)}
                    className="w-20 px-3 py-1.5 bg-white border-2 border-blue-500 rounded-lg font-black text-xs outline-none"
                    placeholder="New Rate"
                  />
                  <button 
                    onClick={() => handleUpdate(r)}
                    className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-lg font-black text-slate-900 tracking-tight">₹{r.rate.toLocaleString()}</span>
                  <button 
                    onClick={() => {
                      setEditingId(r.id);
                      setTempRate(r.rate.toString());
                    }}
                    className="p-2 opacity-0 group-hover:opacity-100 bg-white shadow-sm border border-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {!loading && rates.length === 0 && (
          <div className="py-12 text-center">
            <TrendingUp className="w-8 h-8 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-400">No rates available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
