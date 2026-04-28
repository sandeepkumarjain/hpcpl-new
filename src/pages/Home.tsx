import { useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useTransform, animate } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Box, Shield, Zap, Globe, Clock, TrendingUp, Quote, Cpu, Activity, Ruler, BoxIcon } from 'lucide-react';
import LiveRates from '../components/public/LiveRates';

const FEATURES = [
  {
    icon: Shield,
    title: "Refinery Direct",
    desc: "Direct sourcing from Kandla, Mundra & IOCL ensures genuine quality & competitive pricing.",
    color: "blue"
  },
  {
    icon: Zap,
    title: "Precision Logistics",
    desc: "24 owned high-performance tankers with cold-chain technology for PG and specialty grades.",
    color: "amber"
  },
  {
    icon: Box,
    title: "Versatile Grades",
    desc: "VG-10, VG-30, VG-40, PMB & CRMB custom blends tailored for specific terrain requirements.",
    color: "emerald"
  },
  {
    icon: Globe,
    title: "Pan-India Reach",
    desc: "Active supply nodes across 76+ partner plants ensuring last-mile delivery efficiency.",
    color: "indigo"
  }
];

function Counter({ value, duration = 2 }: { value: string, duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  
  // Extract number from string (e.g., "76+" -> 76)
  const numericValue = parseInt(value.replace(/[^0-9]/g, ''), 10);
  const suffix = value.replace(/[0-9]/g, '');

  useEffect(() => {
    if (inView) {
      const controls = animate(count, numericValue, { duration });
      return controls.stop;
    }
  }, [inView, count, numericValue, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-white selection:bg-blue-600 selection:text-white">
      {/* Editorial Hero Section */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.3 }}
            transition={{ duration: 1.5 }}
            className="w-full h-full"
          >
            <img 
              src="https://images.unsplash.com/photo-1541625602330-2133fe947a2e?q=80&w=2070&auto=format&fit=crop" 
              className="w-full h-full object-cover grayscale"
              alt="Bitumen Supply Industrial"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-10" />
          
          {/* Technical Graphics Layer */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-4xl relative">
            {/* Background Glow */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] -z-10" />
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="inline-block text-white font-black text-[10px] sm:text-xs uppercase tracking-[0.4em] mb-8 bg-blue-600 px-6 py-2 rounded-full border border-blue-400 shadow-xl shadow-blue-600/20">
                Pioneering Bits Since 1997
              </span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl md:text-5xl font-black text-white leading-[1.2] tracking-tighter mb-10 relative inline-block"
            >
              <span className="relative z-10">INDIA'S</span> <br/>
              <span className="text-blue-600 underline decoration-8 underline-offset-8 relative z-10">INTEGRATED</span> <br/>
              <span className="relative z-10">BITUMEN CORE.</span>
              <div className="absolute -inset-12 bg-blue-600/10 blur-[80px] rounded-full -z-0" />
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-lg md:text-xl text-slate-400 font-medium mb-12 max-w-2xl leading-relaxed bg-slate-950/20 backdrop-blur-sm p-4 -ml-4 rounded-xl border-l-4 border-blue-600"
            >
              Driving road infrastructure excellence through a 
              seamless manufacturing, processing, and logistics ecosystem.
            </motion.p>

            {/* Floating Graphic Nodes */}
            <div className="absolute -right-20 top-20 hidden 2xl:block space-y-4">
              {[
                { icon: Cpu, label: "Smart Node" },
                { icon: Activity, label: "Live Sync" }
              ].map((node, i) => (
                <motion.div 
                  key={i}
                  animate={{ x: [0, 10, 0], y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: i * 2 }}
                  className="flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-md px-4 py-2 rounded-full shadow-2xl"
                >
                  <node.icon className="w-4 h-4 text-blue-500" />
                  <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{node.label}</span>
                </motion.div>
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap gap-6"
            >
              <button 
                onClick={() => navigate('/contact')}
                className="group relative px-10 py-5 bg-blue-600 text-white rounded-full font-black text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-blue-600/30"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Book Material <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              
              <a 
                href="#rates" 
                className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-full font-black text-lg backdrop-blur-md hover:bg-white/10 transition-all"
              >
                Live Rates
              </a>
            </motion.div>
          </div>
        </div>

        {/* Floating Stats */}
        <div className="absolute bottom-12 right-12 hidden xl:block z-30">
          <div className="grid grid-cols-1 gap-4">
            {[
              { label: 'DELIVERY REACH', value: '76+ PLANTS' },
              { label: 'FLEET CAPACITY', value: '24 TANKERS' },
              { label: 'MARKET TRUST', value: '30 YEARS' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + (i * 0.1) }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl min-w-[240px]"
              >
                <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">{stat.label}</div>
                <div className="text-2xl font-black text-white">{stat.value}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee Ticker */}
      <div className="bg-blue-600 py-4 overflow-hidden whitespace-nowrap border-y border-blue-400">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="flex items-center gap-12 font-black text-white text-sm uppercase tracking-[0.2em]"
        >
          {Array(10).fill(" VG-10 • VG-30 • VG-40 • PMB • CRMB • EMULSION • S-65 • ").map((text, i) => (
            <span key={i}>{text}</span>
          ))}
        </motion.div>
      </div>

      {/* Command Center - Unique Technical Grid */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent opacity-50" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="mb-24">
            <span className="text-blue-600 font-black text-xs uppercase tracking-[0.4em] mb-4 block">System Architecture</span>
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter">
              The Command <br/> <span className="text-slate-400">Center.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { title: "Smart Logistics", stat: "24 Units", desc: "GPS-synchronized tanker fleet with real-time payload monitoring." },
                { title: "Direct Pipeline", stat: "IOCL/Mundra", desc: "Digital linkage with major refineries for priority gate-pass issuance." },
                { title: "Quality Lab", stat: "ISO 9001", desc: "Multi-stage NABL testing protocol for every batch of VG/PMB." },
                { title: "Active Nodes", stat: "76 Units", desc: "Decentralized storage and processing hubs across Northwest India." }
              ].map((item, i) => (
                <div key={i} className="p-8 bg-white border border-slate-200 rounded-[2rem] hover:border-blue-600 transition-all group shadow-sm">
                  <div className="flex justify-between items-start mb-6">
                    <h4 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{item.title}</h4>
                    <span className="text-[10px] font-black text-blue-500 px-2 py-1 bg-blue-50 bg-opacity-50 rounded uppercase tracking-widest">{item.stat}</span>
                  </div>
                  <p className="text-slate-500 font-medium text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="lg:col-span-4">
              <div className="bg-slate-900 rounded-[2.5rem] p-10 h-full text-white flex flex-col justify-between">
                <div>
                  <TrendingUp className="w-12 h-12 text-blue-500 mb-8" />
                  <h3 className="text-3xl font-black mb-6">Real-Time <br/> Edge.</h3>
                  <p className="text-slate-400 font-medium mb-12">
                    Our digital integration allows for same-day dispatch and zero-wait loading at refinery gates.
                  </p>
                </div>
                <div className="pt-8 border-t border-white/10">
                   <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-blue-500 mb-2">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     Network Status: Optimal
                   </div>
                   <div className="text-white/40 text-[10px]">Last Sync: Just now</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - Brutalist Narrative */}
      <section className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-end gap-12 mb-24">
            <div className="max-w-2xl">
              <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-8">
                UNCOMPROMISED <br/>
                <span className="text-blue-600">CAPABILITY.</span>
              </h2>
              <p className="text-xl text-slate-500 font-medium leading-relaxed">
                From high-viscosity road projects to specialized formulations, our infrastructure 
                is built to handle the most demanding logistics schedules.
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="w-32 h-32 rounded-full border-2 border-slate-900 flex items-center justify-center p-8 text-center leading-[0.8] font-black text-slate-900 text-xs uppercase tracking-tighter">
                Integrated <br/> <br/> Since <br/> <br/> 1997
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="group p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:bg-slate-900 hover:text-white transition-all duration-500"
              >
                <div className={`w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-10 shadow-sm border border-slate-100 group-hover:bg-slate-800 group-hover:border-slate-700 transition-all`}>
                  <f.icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tight">{f.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed group-hover:text-slate-400">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Rates Highlight */}
      <div id="rates" className="bg-slate-50 border-y border-slate-100">
        <LiveRates />
      </div>

      {/* Large Counter Section */}
      <section className="py-48 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-24 opacity-5 pointer-events-none">
          <TrendingUp className="w-96 h-96" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
              <h2 className="text-6xl font-black leading-[0.85] tracking-tighter">
                SCALE THAT <br/>
                <span className="text-blue-500 text-8xl">REDEFINES</span> <br/>
                SUPPLY.
              </h2>
              <div className="flex flex-col gap-8">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full border border-blue-500 flex items-center justify-center font-black text-blue-500 flex-shrink-0">1</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Automated Inventory Management</h4>
                    <p className="text-slate-400 font-medium">Real-time tracking of plant stock levels and refinery gate out schedules.</p>
                  </div>
                </div>
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full border border-blue-500 flex items-center justify-center font-black text-blue-500 flex-shrink-0">2</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">24/7 Dispatch Control</h4>
                    <p className="text-slate-400 font-medium">Own fleet ensures we control the timeline, not third-party vendors.</p>
                  </div>
                </div>
              </div>
            </div>

          <div className="grid grid-cols-2 gap-4 lg:gap-8 relative lg:p-4">
              <div className="absolute inset-0 bg-blue-500/10 blur-[100px] -z-10" />
               {[
                 { val: "24", unit: "TANKERS", label: "Owned Fleet", icon: Zap },
                 { val: "76+", unit: "PLANTS", label: "Supply Points", icon: Globe },
                 { val: "30", unit: "YEARS", label: "Experience", icon: TrendingUp },
                 { val: "100%", unit: "PURITY", label: "IOCL Standard", icon: Shield },
               ].map((item, i) => (
                 <motion.div 
                   key={i} 
                   initial={{ opacity: 0, scale: 0.9 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   viewport={{ once: true }}
                   transition={{ delay: i * 0.1 }}
                   className="p-6 lg:p-12 bg-white/5 border border-white/10 rounded-[2.5rem] lg:rounded-[3rem] hover:bg-blue-600/10 transition-all group overflow-hidden relative"
                 >
                    {/* Decorative Background Icon */}
                    <item.icon className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 group-hover:text-blue-500/10 transition-colors -rotate-12" />
                    
                    <div className="text-4xl lg:text-7xl font-black text-blue-500 mb-2 leading-none group-hover:scale-110 transition-transform origin-left">
                      <Counter value={item.val} />
                    </div>
                    <div className="text-[10px] lg:text-xs font-black uppercase tracking-[0.25em] text-white opacity-40 mb-4">{item.unit}</div>
                    <div className="text-xs lg:text-sm font-bold text-slate-300">{item.label}</div>
                 </motion.div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-12">
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter">Partner with the <br/> <span className="text-blue-600 underline decoration-8">Best in Bitumen.</span></h2>
            <p className="text-xl text-slate-500 font-medium">Ready to streamline your supply chain? Contact our logistics experts today for custom pricing and delivery schedules.</p>
            <div className="flex flex-wrap justify-center gap-6">
              <button 
                onClick={() => navigate('/contact')}
                className="px-12 py-6 bg-slate-900 text-white rounded-full font-black text-lg hover:bg-slate-800 transition-all flex items-center gap-3"
              >
                Get a Quote <ArrowRight className="w-6 h-6" />
              </button>
              <button 
                onClick={() => navigate('/products')}
                className="px-12 py-6 bg-slate-50 text-slate-900 border-2 border-slate-900 rounded-full font-black text-lg hover:bg-slate-100 transition-all"
              >
                View Products
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
