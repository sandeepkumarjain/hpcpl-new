import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Linkedin, Facebook, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 pt-20 pb-10 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 group-hover:shadow-md transition-all">
                <img 
                  src="https://datapartner.btpr.online/ProductPictures/41863602642_LOGO.jpg" 
                  alt="Hannanth Petro Chem Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-black text-xl tracking-tighter leading-none group-hover:text-blue-400 transition-colors">HANNANTH</span>
                <span className="text-blue-500 text-[10px] font-black tracking-[.25em] leading-tight uppercase mt-0.5">Petro Chem</span>
              </div>
            </Link>
            <p className="text-slate-400 font-medium leading-relaxed">
              India's integrated bitumen supply partner since 1997. Redefining logistics 
              through transparency and technology.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-black mb-6 uppercase tracking-widest text-slate-500">Quick Links</h4>
            <ul className="space-y-4">
              {['Home', 'About', 'Products', 'Infrastructure', 'Contact'].map((item) => (
                <li key={item}>
                  <Link 
                    to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                    className="text-slate-400 font-bold hover:text-white transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-black mb-6 uppercase tracking-widest text-slate-500">Contact Details</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-blue-500 mt-1" />
                <div>
                  <span className="block font-bold">+91 96724 18000</span>
                  <span className="block font-bold">+91 91667 86666</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-500 mt-1" />
                <span className="font-bold">info@hannanth.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-500 mt-1" />
                <span className="font-medium text-slate-400 leading-tight">
                  Infront of Jail Well, Near Power House, Bikaner - 334001 (Rajasthan)
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-black mb-6 uppercase tracking-widest text-slate-500">Portal</h4>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <p className="text-sm text-slate-400 font-medium mb-4">
                Access your orders, tracking, and invoices through our customer portal.
              </p>
              <Link 
                to="/login"
                className="block w-full py-3 bg-blue-600 rounded-xl text-center font-black text-sm hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
              >
                Login to Portal
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 font-bold text-xs uppercase tracking-widest">
          <p>© 2026 Hannanth Petro Chem Private Limited. All Rights Reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
