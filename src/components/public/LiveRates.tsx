import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, query, limit, orderBy, doc } from 'firebase/firestore';
import { TrendingUp, TrendingDown, Clock, Globe, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function LiveRates() {
  const [productRates, setProductRates] = useState<any[]>([]);
  const [indices, setIndices] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Fetch Bitumen Product Rates
    const qProduct = query(collection(db, 'rates'), orderBy('updatedAt', 'desc'));
    const unsubProduct = onSnapshot(qProduct, (snapshot) => {
      setProductRates(snapshot.docs.map(doc => doc.data()));
    });

    // 2. Fetch Global Indices (Brent, USD-INR)
    const unsubIndices = onSnapshot(doc(db, 'live_rates', 'indices'), (snapshot) => {
      if (snapshot.exists()) {
        setIndices(snapshot.data());
      } else {
        setIndices({ brent: 82.45, usdinr: 83.12, updatedAt: new Date() });
      }
      setLoading(false);
    });

    return () => { unsubProduct(); unsubIndices(); };
  }, []);

  if (loading) return (
    <div className="h-64 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  const RateCard = ({ title, value, unit, trend, subtitle }: any) => (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</h3>
          {subtitle && <p className="text-[10px] font-black text-slate-300 uppercase mt-0.5">{subtitle}</p>}
        </div>
        {trend === 'up' ? (
          <TrendingUp className="w-4 h-4 text-emerald-500" />
        ) : (
          <TrendingDown className="w-4 h-4 text-rose-500" />
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black text-slate-900">₹{value?.toLocaleString()}</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{unit}</span>
      </div>
    </motion.div>
  );

  return (
    <section className="py-24 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Market Watch
            </div>
            <h2 className="text-5xl font-black text-slate-900 tracking-tight">Market Indices</h2>
            <p className="text-slate-500 font-medium mt-3 max-w-lg">
              Daily indicative rates for standard bitumen grades across major Indian ports.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <Clock className="w-4 h-4" />
            Reliable Benchmarking
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
          {productRates.slice(0, 3).map((r, i) => (
            <RateCard 
              key={i} 
              title={r.product} 
              subtitle={r.port} 
              value={r.rate} 
              unit="INR/MT" 
              trend={i % 2 === 0 ? 'up' : 'down'} 
            />
          ))}
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-slate-900 p-7 rounded-[2rem] shadow-xl shadow-slate-900/10"
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Brent Crude
              </h3>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-white">${indices?.brent}</span>
              <span className="text-[10px] font-black text-slate-500 uppercase">/ BBL</span>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-blue-600 p-7 rounded-[2rem] shadow-xl shadow-blue-600/10"
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-[10px] font-black text-blue-200 uppercase tracking-widest flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" /> USD-INR
              </h3>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-white">₹{indices?.usdinr}</span>
              <span className="text-[10px] font-black text-blue-300 uppercase">spot</span>
            </div>
          </motion.div>
        </div>

        <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <p className="text-base font-black text-slate-900 tracking-tight">Real-time Syncing</p>
              <p className="text-sm text-slate-400 font-bold">Rates are automatically calibrated with refinery revisions and crude movements.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
             <button 
              onClick={() => navigate('/contact')}
              className="flex-1 md:flex-none px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all"
            >
              Request Full List
            </button>
            <button 
              onClick={() => navigate('/contact')}
              className="flex-1 md:flex-none px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all"
            >
              Book Today
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
