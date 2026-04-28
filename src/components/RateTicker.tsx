import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';

export interface Rate {
  product: string;
  port: string;
  rate: number;
  updatedAt: any;
}

export function RateTicker() {
  const [rates, setRates] = useState<Rate[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'rates'), orderBy('product'));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Rate);
      setRates(data);
    });
  }, []);

  if (rates.length === 0) return null;

  return (
    <div className="bg-slate-900 text-white py-2 overflow-hidden h-10 flex items-center">
      <motion.div 
        animate={{ x: [1000, -2000] }}
        transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
        className="flex whitespace-nowrap gap-12 font-mono text-xs items-center"
      >
        <span className="text-blue-400 font-bold uppercase">Live Bitumen Rates:</span>
        {rates.map((rate, i) => (
          <div key={i} className="flex gap-4">
            <span className="font-bold">{rate.product}</span>
            <span className="text-green-400">₹{rate.rate.toLocaleString()} ({rate.port})</span>
          </div>
        ))}
        <span className="text-yellow-400 font-bold">Brent Crude: $82.40</span>
        <span className="text-pink-400 font-bold">USD-INR: 83.15</span>
      </motion.div>
    </div>
  );
}
