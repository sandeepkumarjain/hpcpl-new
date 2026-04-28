import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function LoginPage() {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mobile.length < 10) return setError('Enter a valid mobile number');
    
    setLoading(true);
    setError('');
    
    try {
      const demoNumbers = ['9672418000', '9166786666', '8619244883'];
      const isDemo = demoNumbers.includes(mobile);

      // 1. Check if user exists in registration record (unless demo)
      if (!isDemo) {
        const userQuery = query(collection(db, 'users'), where('mobile', '==', mobile), limit(1));
        const userSnap = await getDocs(userQuery);

        if (userSnap.empty) {
          setError('Sorry no record found please contact admin and register first');
          setLoading(false);
          return;
        }
      }

      // 2. Proceed with OTP if record found or demo
      const contact = `91${mobile}`;
      
      if (isDemo) {
        // For demo numbers, we could still send real OTP or just bypass
        // Let's send real OTP first, but allow bypass if it fails
        try {
          const response = await fetch('/api/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contact })
          });
          const data = await response.json();
          if (data.success) {
            setShowOtp(true);
          } else {
            throw new Error(data.error);
          }
        } catch (apiErr) {
          setError('Demo Bypass: Enter any 6-digit OTP (e.g. 123456)');
          setShowOtp(true);
        }
      } else {
        const response = await fetch('/api/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contact })
        });
        const data = await response.json();
        if (data.success) {
          setShowOtp(true);
        } else {
          setError(data.error || 'Failed to send OTP');
        }
      }
    } catch (err: any) {
      console.error(err);
      setError('Communication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const demoNumbers = ['9672418000', '9166786666', '8619244883'];
      
      if (demoNumbers.includes(mobile) && (otp === '123456' || otp === '000000')) {
        // Master bypass for admins
        localStorage.setItem('user_session', JSON.stringify({ mobile, role: 'super_admin' }));
        return navigate('/dashboard');
      }

      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: `91${mobile}`, otp })
      });
      const data = await response.json();

      if (data.success) {
        // Success! In a real app, you'd find/create the user in Firestore 
        // using the mobile number as a key or link it to a Firebase account.
        localStorage.setItem('user_session', JSON.stringify({ mobile }));
        navigate('/dashboard');
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err: any) {
      setError('Verification failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-slate-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl mb-4 border border-slate-100 shadow-sm overflow-hidden">
            <img 
              src="https://datapartner.btpr.online/ProductPictures/41863602642_LOGO.jpg" 
              alt="Hannanth Petro Chem Logo" 
              className="w-full h-full object-contain p-2"
            />
          </div>
          <h2 className="text-2xl font-black text-slate-900 leading-tight">HANNANTH <br/><span className="text-blue-600">PORTAL ACCESS</span></h2>
          <p className="text-slate-500 font-medium mt-2">Enter your mobile number to receive OTP</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-semibold rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={showOtp ? handleVerifyOtp : handleSendOtp} className="space-y-4">
          {!showOtp ? (
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="tel"
                placeholder="10 Digit Mobile Number"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
              />
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="6 Digit OTP"
                className="w-full px-4 py-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900 tracking-[1em] text-center"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
              />
              <button 
                type="button" 
                onClick={() => setShowOtp(false)}
                className="text-sm font-bold text-blue-600 hover:underline w-full text-center"
              >
                Change Number
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Processing...' : showOtp ? 'Verify & Login' : 'Send OTP'}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-slate-50">
          <p className="text-xs text-center text-slate-400 font-medium">
            Authorized Personnel Only. Access is monitored and logged.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
