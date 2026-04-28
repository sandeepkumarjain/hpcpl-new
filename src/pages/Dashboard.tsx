import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Truck, 
  FileSignature, 
  BarChart3, 
  Settings,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Clock,
  LogOut,
  ChevronRight,
  User
} from 'lucide-react';
import { cn } from '../lib/utils';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import LoadingSheetModule from '../components/dashboard/LoadingSheet';
import CompaniesModule from '../components/dashboard/Companies';
import RatesManagement from '../components/dashboard/Rates';
import PurchaseOrdersModule from '../components/dashboard/PurchaseOrders';
import SalesOrdersModule from '../components/dashboard/SalesOrders';
import SalesOrdersHistory from '../components/dashboard/SalesOrdersHistory';
import CompanyDetails from '../components/dashboard/CompanyDetails';
import InvoicesModule from '../components/dashboard/Invoices';
import CustomerPortal from '../components/dashboard/CustomerPortal';
import { LiveRateWidget } from '../components/dashboard/LiveRateWidget';

// Placeholder sub-components
const StatsCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm shadow-slate-100/50">
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-3 rounded-2xl", color)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <span className="text-green-500 font-bold text-xs flex items-center bg-green-50 px-2 py-1 rounded-full">
        <TrendingUp className="w-3 h-3 mr-1" />
        +12%
      </span>
    </div>
    <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">{title}</span>
    <h3 className="text-3xl font-black text-slate-900 mt-1">{value}</h3>
  </div>
);

const PortalDashboard = () => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Welcome Back</h1>
        <p className="text-slate-500 font-medium">Here's what's happening today at Hannanth Petro Chem.</p>
      </div>
      <button className="px-6 py-3 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-500/20 flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95">
        <Plus className="w-5 h-5" />
        New Order
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard title="Open Orders" value="14" icon={FileText} color="bg-blue-500" />
      <StatsCard title="Transit Trucks" value="08" icon={Truck} color="bg-orange-500" />
      <StatsCard title="Pending Loading" value="05" icon={Clock} color="bg-purple-500" />
      <StatsCard title="Revenue (MTD)" value="₹1.2Cr" icon={BarChart3} color="bg-emerald-500" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white rounded-3xl border border-slate-100 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-slate-900">Recent Loading Activities</h2>
            <Link to="/dashboard/loading" className="text-blue-600 font-bold text-sm hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="text-left py-4 text-slate-400 font-bold text-xs uppercase tracking-widest">Truck No</th>
                  <th className="text-left py-4 text-slate-400 font-bold text-xs uppercase tracking-widest">Status</th>
                  <th className="text-left py-4 text-slate-400 font-bold text-xs uppercase tracking-widest">Destination</th>
                  <th className="text-right py-4 text-slate-400 font-bold text-xs uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { truck: 'RJ 14 GB 1234', status: 'On Way', dest: 'Kandla', color: 'text-blue-600 bg-blue-50' },
                  { truck: 'GJ 12 AT 5678', status: 'Loading Completed', dest: 'Barmer', color: 'text-emerald-600 bg-emerald-50' },
                  { truck: 'RJ 19 CC 9001', status: 'Gate In', dest: 'Mundra', color: 'text-orange-600 bg-orange-50' },
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="py-4 font-black text-slate-900">{row.truck}</td>
                    <td className="py-4">
                      <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider", row.color)}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-4 font-bold text-slate-500">{row.dest}</td>
                    <td className="py-4 text-right">
                      <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <LiveRateWidget />
      </div>

      <div className="bg-slate-900 rounded-3xl p-8 text-white h-fit sticky top-8">
        <h2 className="text-xl font-black mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-3">
          {[
            { label: 'Register New Company', icon: Users, href: '/dashboard/companies' },
            { label: 'Generate PO', icon: FileSignature, href: '/dashboard/po' },
            { label: 'Update Live Rates', icon: TrendingUp, href: '/dashboard/rates' },
          ].map((item, i) => (
            <Link 
              key={i} 
              to={item.href}
              className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group"
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
            </Link>
          ))}
        </div>
        
        <div className="mt-12 p-6 bg-blue-600/20 rounded-2xl border border-blue-600/30">
          <h4 className="text-sm font-black mb-2">Fleet Management Tips</h4>
          <p className="text-xs text-blue-200 leading-relaxed">
            Ensure driver numbers are verified before loading to prevent communication gaps.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default function DashboardLayout() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !profile) {
      navigate('/login');
    }
  }, [profile, loading, navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!profile) return null;

  const isCustomer = profile?.role === 'customer';

  const sidebarItems = isCustomer ? [
    { label: 'Customer Portal', icon: LayoutDashboard, href: '/dashboard/portal' },
    { label: 'Live Rates', icon: TrendingUp, href: '/dashboard/rates' },
    { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ] : [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Companies', icon: Users, href: '/dashboard/companies' },
    { label: 'Purchase Orders', icon: FileSignature, href: '/dashboard/po' },
    { label: 'Sales Orders', icon: FileText, href: '/dashboard/so' },
    { label: 'Sales History', icon: Clock, href: '/dashboard/so-history' },
    { label: 'Loading Sheet', icon: Truck, href: '/dashboard/loading' },
    { label: 'Invoices', icon: FileText, href: '/dashboard/invoices' },
    { label: 'Live Rates', icon: TrendingUp, href: '/dashboard/rates' },
    { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-8 border-b border-slate-50">
          <Link to="/" className="flex items-center gap-3 mb-2 group">
            <div className="w-10 h-10 bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm transition-all group-hover:shadow-md">
              <img 
                src="https://datapartner.btpr.online/ProductPictures/41863602642_CompanyLogo1.jpeg" 
                alt="Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-slate-900 font-extrabold text-xl tracking-tight group-hover:text-blue-600 transition-colors">HANNANTH</span>
          </Link>
          <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Admin Portal</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all group",
                location.pathname === item.href 
                  ? "bg-blue-50 text-blue-600" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("w-5 h-5", location.pathname === item.href ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-50">
          <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-slate-900 truncate">{profile.name}</span>
                <span className="text-[10px] text-slate-500 font-black uppercase">{profile.role.replace('_', ' ')}</span>
              </div>
            </div>
            <button 
              onClick={async () => {
                await signOut(auth);
                localStorage.removeItem('user_session');
                navigate('/login');
              }}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4 md:p-8 lg:p-12">
          <Routes>
            <Route index element={isCustomer ? <Navigate to="portal" /> : <PortalDashboard />} />
            <Route path="portal" element={isCustomer ? <CustomerPortal /> : <Navigate to="/dashboard" replace />} />
            <Route path="companies" element={<CompaniesModule />} />
            <Route path="companies/:id" element={<CompanyDetails />} />
            <Route path="po" element={<PurchaseOrdersModule />} />
            <Route path="so" element={<SalesOrdersModule />} />
            <Route path="so-history" element={<SalesOrdersHistory />} />
            <Route path="loading" element={<LoadingSheetModule />} />
            <Route path="invoices" element={<InvoicesModule />} />
            <Route path="rates" element={<RatesManagement />} />
            <Route path="settings" element={<div className="p-20 text-center font-black">System Settings</div>} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
