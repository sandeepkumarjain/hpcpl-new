import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { 
  FileText, 
  Truck, 
  Download, 
  Package, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function CustomerPortal() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loadingSheets, setLoadingSheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.companyId) {
      setLoading(false);
      return;
    }

    // Orders query
    const qOrders = query(
      collection(db, 'sales_orders'),
      where('customerId', '==', profile.companyId),
      orderBy('date', 'desc')
    );
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Invoices query
    const qInvoices = query(
      collection(db, 'invoices'),
      where('buyerId', '==', profile.companyId),
      orderBy('date', 'desc')
    );
    const unsubInvoices = onSnapshot(qInvoices, (snapshot) => {
      setInvoices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Loading Sheets query
    const qLoading = query(
      collection(db, 'loading_sheets'),
      where('soldToId', '==', profile.companyId),
      orderBy('date', 'desc')
    );
    const unsubLoading = onSnapshot(qLoading, (snapshot) => {
      setLoadingSheets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsubOrders();
      unsubInvoices();
      unsubLoading();
    };
  }, [profile]);

  const exportInvoicePDF = (inv: any) => {
    const doc = new jsPDF() as any;
    // Simple PDF generation logic similar to InvoicesModule
    doc.setFontSize(20);
    doc.text('PROFORMA INVOICE', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`PI No: ${inv.piNo}`, 20, 35);
    doc.text(`Date: ${format(new Date(inv.date.seconds * 1000), 'dd/MM/yyyy')}`, 20, 40);
    doc.text(`Buyer: ${inv.buyerName}`, 20, 50);
    doc.text(`Total: Rs. ${inv.grandTotal.toLocaleString()}`, 20, 60);
    doc.save(`${inv.piNo}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile?.companyId) {
    return (
      <div className="p-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-black text-slate-900 mb-2">Company Link Missing</h2>
        <p className="text-slate-500 font-medium">Your user profile is not linked to any registered company. Please contact support.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="header">
        <h1 className="text-3xl font-black text-slate-900 leading-tight">Customer Portal</h1>
        <p className="text-slate-500 font-bold text-sm tracking-tight">Connected with <span className="text-blue-600">Company ID: {profile.companyId}</span></p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-blue-50 rounded-2xl">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-900">{orders.length}</h3>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Orders</p>
          </div>
          <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
             <BarChart3 className="w-32 h-32" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-emerald-50 rounded-2xl">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-900">{invoices.length}</h3>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Invoices Paid/Pending</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-orange-50 rounded-2xl">
              <Truck className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-900">{loadingSheets.filter(ls => ls.status === 'On Way').length}</h3>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Vehicles in Transit</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders Section */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-slate-900">Your Recent Orders</h2>
            <div className="p-2 bg-slate-50 rounded-xl">
               <Clock className="w-4 h-4 text-slate-400" />
            </div>
          </div>
          <div className="space-y-4">
            {orders.slice(0, 5).map(so => (
              <div key={so.id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-50 flex items-center justify-between group hover:bg-white hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="block font-black text-slate-900 text-sm">{so.soNo}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{so.product} • {so.qty} MT</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block font-black text-slate-900 text-sm">₹{so.total.toLocaleString()}</span>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{format(new Date(so.date.seconds * 1000), 'dd MMM')}</span>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm font-bold text-slate-400">No active orders found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Invoices Section */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-slate-900">Proforma Invoices</h2>
            <div className="p-2 bg-slate-50 rounded-xl text-slate-400 uppercase text-[10px] font-black tracking-widest">
              Available to Download
            </div>
          </div>
          <div className="space-y-4">
            {invoices.slice(0, 5).map(inv => (
              <div key={inv.id} className="p-4 border-b border-slate-50 flex items-center justify-between group last:border-0 hover:bg-slate-50 rounded-2xl transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-black text-slate-900 text-sm">{inv.piNo}</span>
                    <span className="text-[10px] font-bold text-slate-400">{format(new Date(inv.date.seconds * 1000), 'dd MMM yyyy')}</span>
                  </div>
                </div>
                <button 
                  onClick={() => exportInvoicePDF(inv)}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2"
                >
                  <Download className="w-3 h-3" />
                  PDF
                </button>
              </div>
            ))}
            {invoices.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm font-bold text-slate-400">No invoices generated yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transit Board Section */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-black">Live Transit Board</h2>
              <p className="text-slate-400 font-medium text-sm">Visual tracking for dispatched shipments</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/10">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Live Status</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingSheets.map(ls => (
              <div key={ls.id} className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm group hover:bg-white/10 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-500 rounded-2xl shadow-lg shadow-blue-500/20">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                    ls.status === 'On Way' ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-slate-400"
                  )}>
                    {ls.status}
                  </span>
                </div>
                <h4 className="text-lg font-black tracking-tight">{ls.truckNo}</h4>
                <div className="mt-4 flex items-center justify-between">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Net Weight</span>
                      <span className="text-sm font-bold">{ls.netWt} MT</span>
                   </div>
                   <div className="flex flex-col text-right">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Disp. Date</span>
                      <span className="text-sm font-bold">{format(new Date(ls.date.seconds * 1000), 'dd MMM')}</span>
                   </div>
                </div>
              </div>
            ))}
            {loadingSheets.length === 0 && (
              <div className="col-span-full py-10 text-center opacity-50">
                 <p className="font-bold">No active transit vehicles for your orders.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
