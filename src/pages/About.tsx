import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { Quote, ArrowRight, ShieldCheck, Zap, Globe, Package, Shield, Activity, Cpu } from 'lucide-react';

const TIMELINE = [
  { year: '1997', title: 'The Genesis', desc: 'Started as a small haulage operation with single tanker in Rajasthan.' },
  { year: '2012', title: 'Processing Hub', desc: 'Established our first processing unit in Mundra, Gujarat, marking our entry into manufacturing.' },
  { year: '2016', title: 'Fleet Expansion', desc: 'Expanded owned tankers to 24, becoming a regional logistics leader with real-time GPS tracking.' },
  { year: '2020', title: 'Bitumen Giant', desc: 'Partnered with 76+ plants across North and West India, creating a massive distribution network.' },
  { year: '2025', title: 'Tech Integrated', desc: 'Launching Hannanth Digital Portal for real-time logistics tracking and inventory management.' },
];

const VALUES = [
  { icon: ShieldCheck, title: 'Quality First', desc: 'Every drop is tested at NABL-accredited labs before dispatch.' },
  { icon: Zap, title: 'Efficiency', desc: 'Our owned logistics ensure zero delays and consistent supply chains.' },
  { icon: Globe, title: 'Integrity', desc: 'Transparent pricing and ethical sourcing are our foundational pillars.' },
  { icon: Package, title: 'Innovation', desc: 'Pioneering custom PMB and CRMB blends for specialized terrains.' },
];

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div ref={containerRef} className="bg-white">
      {/* Editorial Hero Section */}
      <section className="relative h-[110vh] flex items-center justify-center overflow-hidden bg-slate-900 px-4">
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-transparent to-slate-900 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1541888941259-7927394602f9?q=80&w=2070&auto=format&fit=crop" 
            className="w-full h-full object-cover grayscale brightness-50 scale-110"
            alt="Industrial Background"
          />
        </motion.div>

        <div className="relative z-20 max-w-7xl mx-auto w-full">
          <div className="flex flex-col lg:flex-row items-end justify-between gap-12">
            <div className="max-w-4xl">
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-block text-blue-500 font-black text-xs uppercase tracking-[0.3em] mb-6"
              >
                Established 1997
              </motion.span>
              <h1 className="text-[12vw] lg:text-[10vw] font-black text-white leading-[0.82] tracking-tighter mix-blend-difference">
                BITUMIN <br/>
                <span className="text-blue-600">LEGACY.</span>
              </h1>
            </div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:max-w-sm text-slate-400 font-medium text-lg leading-relaxed border-l-2 border-blue-600 pl-8"
            >
              For three decades, we have been the backbone of India's road infrastructure, providing seamless bitumen supply chains from refineries to construction sites.
            </motion.div>
          </div>
        </div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scroll to Explore</span>
          <div className="w-px h-12 bg-gradient-to-b from-blue-600 to-transparent" />
        </motion.div>
      </section>

      {/* Split Narrative Section */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
              <div className="space-y-6">
                <h2 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-tight">
                  Integrated <br/> Ecosystem.
                </h2>
                <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg">
                  We don't just transport bitumen; we process, test, and distribute it with precision that only 30 years of experience can provide.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {VALUES.map((value, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="group"
                  >
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <value.icon className="w-6 h-6" />
                    </div>
                    <h4 className="font-black text-slate-900 mb-2">{value.title}</h4>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{value.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1516939884455-1445c8652f83?q=80&w=1887&auto=format&fit=crop"
                  className="w-full h-full object-cover"
                  alt="Quality Control"
                />
              </div>
              <div className="absolute -bottom-12 -left-12 bg-blue-600 p-12 rounded-[3rem] text-white hidden lg:block shadow-2xl">
                <div className="text-6xl font-black mb-2 tracking-tighter">76+</div>
                <div className="text-sm font-black uppercase tracking-widest opacity-80">Distribution Hubs</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder's Premium Section */}
      <section className="py-32 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-[4rem] overflow-hidden shadow-sm border border-slate-100 grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-5 relative h-[500px] lg:h-auto">
              <img 
                src="https://datapartner.btpr.online/ProductPictures/41863602642_WhatsAppImage2026-04-27at3.24.02PM.jpeg"
                className="absolute inset-0 w-full h-full object-cover"
                alt="Anand Gandhi"
              />
              <div className="absolute inset-0 bg-blue-600/10 mix-blend-multiply" />
            </div>
            <div className="lg:col-span-7 p-12 lg:p-24 flex flex-col justify-center">
              <Quote className="w-16 h-16 text-blue-100 mb-8" />
              <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 italic mb-10 leading-snug">
                "Our journey has always been about more than just supply. It's about building the roads that connect our nation's future."
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-2xl font-black text-slate-900">Anand Gandhi</h4>
                  <p className="text-blue-600 font-black text-sm uppercase tracking-widest">Founder & Managing Director</p>
                </div>
                <div className="hidden sm:block">
                  <div className="text-slate-900 font-serif italic text-6xl opacity-10">Gandhi</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* High-Impact Technical Timeline */}
      <section className="py-48 bg-slate-950 relative overflow-hidden">
        {/* Technical Graphics Layer */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-timeline" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-timeline)" />
          </svg>
        </div>

        {/* Global Glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[180px] pointer-events-none" />
        <div className="absolute bottom-40 right-1/4 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[180px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="mb-40 text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-blue-500 font-black text-xs uppercase tracking-[0.8em] mb-6 block">Evolutionary Roadmap</span>
              <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-none">
                THE <span className="text-blue-600">CHRONICLE.</span>
              </h2>
              
              {/* Graphic Element */}
              <div className="flex items-center justify-center gap-6">
                <div className="h-px bg-gradient-to-r from-transparent via-blue-900 to-blue-600 w-32" />
                <div className="relative">
                  <div className="w-4 h-4 rounded-full bg-blue-600 animate-ping absolute inset-0 opacity-50" />
                  <div className="w-4 h-4 rounded-full bg-blue-600 relative z-10 border-2 border-slate-950" />
                </div>
                <div className="h-px bg-gradient-to-l from-transparent via-blue-900 to-blue-600 w-32" />
              </div>
            </motion.div>
          </div>

          <div className="relative space-y-64 lg:space-y-96">
            {/* Central Data Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-600/0 via-blue-600/30 to-blue-600/0 hidden lg:block" />

            {TIMELINE.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                className={`relative flex flex-col lg:flex-row items-center gap-12 lg:gap-0 ${i % 2 === 0 ? '' : 'lg:flex-row-reverse'}`}
              >
                {/* Year Label - Outlined Graphic Typography */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.1] lg:opacity-30 translate-y-[-10%]">
                  <span className="text-[12rem] md:text-[22rem] font-black text-transparent stroke-white stroke-2 select-none" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.4)' }}>
                    {item.year}
                  </span>
                </div>

                {/* Content Card with Technical Sub-elements */}
                <div className="w-full lg:w-1/2 z-10 px-4">
                  <motion.div 
                    whileHover={{ y: -10, scale: 1.02 }}
                    className={`bg-slate-950/40 backdrop-blur-2xl p-10 lg:p-14 rounded-[3.5rem] border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative group overflow-hidden ${i % 2 === 0 ? 'lg:mr-16' : 'lg:ml-16'}`}
                  >
                    {/* Interior Graphic */}
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                       <Shield className="w-32 h-32 text-blue-500" />
                    </div>

                    {/* Prominent Year Badge */}
                    <div className="absolute top-0 left-0">
                      <div className="bg-blue-600 px-8 py-3 rounded-br-[2rem] flex items-center gap-3 shadow-lg shadow-blue-900/50">
                        <span className="text-white font-black text-2xl tracking-tighter">{item.year}</span>
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      </div>
                    </div>

                    <div className="relative z-10 space-y-6 pt-8">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                           <span className="text-[#3b82f6] font-black text-[10px] uppercase tracking-[0.4em]">Node Established</span>
                        </div>
                        <span className="text-white/40 font-mono text-xs tracking-widest">{item.year}.00_SYNC</span>
                      </div>

                      <h4 className="text-3xl lg:text-5xl font-black text-white tracking-tighter italic">
                        {item.title}
                      </h4>
                      <p className="text-lg text-slate-400 font-medium leading-relaxed">
                        {item.desc}
                      </p>
                      
                      {/* Technical Status Badges */}
                      <div className="pt-8 flex flex-wrap gap-4">
                        <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
                          <Activity className="w-3 h-3 text-blue-500" />
                          <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">Verified</span>
                        </div>
                        <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
                          <Cpu className="w-3 h-3 text-blue-500" />
                          <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">System Sync</span>
                        </div>
                      </div>
                    </div>

                    {/* Edge Highlight */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                </div>

                {/* Central Connector Node */}
                <div className="hidden lg:flex items-center justify-center w-12 h-12 relative z-20">
                   <div className="w-3 h-3 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.8)]" />
                   <div className="absolute inset-0 border border-blue-600/20 rounded-full animate-spin-slow" />
                </div>

                {/* Balanced Empty Side */}
                <div className="hidden lg:block lg:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Reach Footer CTA */}
      <section className="bg-slate-900 py-32 rounded-t-[4rem]">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-12">
                READY TO <span className="text-blue-600">CONNECT?</span>
            </h2>
            <div className="flex flex-wrap justify-center gap-6">
                <a href="/contact" className="px-12 py-6 bg-blue-600 text-white rounded-full font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20">
                    Partner With Us
                </a>
                <a href="/products" className="px-12 py-6 bg-white text-slate-900 rounded-full font-black text-lg hover:bg-slate-100 transition-all">
                    Explore Solutions
                </a>
            </div>
        </div>
      </section>
    </div>
  );
}
