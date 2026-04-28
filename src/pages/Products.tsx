import { motion } from 'motion/react';
import { CheckCircle2, Download, Layers, ShieldCheck, Zap, Gauge, Droplets } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PRODUCTS = [
  { 
    name: 'VG-10', 
    fullName: 'Viscosity Grade 10',
    desc: 'Primarily used for spraying applications and surface dressing in colder climates.',
    longDesc: 'VG-10 is suitable for spraying applications and surface dressing. It is also used to manufacture Bitumen Emulsion and Modified Bitumen.',
    image: 'https://datapartner.btpr.online/ProductPictures/41863602642_VG10.png',
    specs: ['Min. Viscosity: 800', 'Softening Point: 40°C', 'Penetration: 80-100'],
  },
  { 
    name: 'VG-30', 
    fullName: 'Viscosity Grade 30',
    desc: 'The industry standard for high-volume road construction in India.',
    longDesc: 'VG-30 is primarily used for the construction of extra-heavy-duty Bitumen pavements that need to endure substantial traffic loads.',
    image: 'https://datapartner.btpr.online/ProductPictures/41863602642_VG30.png',
    specs: ['Min. Viscosity: 2400', 'Softening Point: 47°C', 'Penetration: 45-70'],
  },
  { 
    name: 'VG-40', 
    fullName: 'Viscosity Grade 40',
    desc: 'Engineered for high-stress areas like intersections and heavy-load runways.',
    longDesc: 'VG-40 is used in areas where high temperature and heavy traffic are prevalent, such as intersections, near toll booths, and parking lots.',
    image: 'https://datapartner.btpr.online/ProductPictures/41863602642_VG40Image.png',
    specs: ['Min. Viscosity: 3200', 'Softening Point: 50°C', 'Penetration: 35-50'],
  },
  { 
    name: 'Emulsion', 
    fullName: 'Bitumen Emulsion',
    desc: 'Eco-friendly, water-based bitumen for cold-mix and patch works.',
    longDesc: 'Our emulsions are tailored for tack coats, prime coats, and micro-surfacing, ensuring excellent adhesion even in damp conditions.',
    image: 'https://images.unsplash.com/photo-1516937941344-00b4e0337589?q=80&w=1000&auto=format&fit=crop',
    specs: ['RS-1, RS-2, SS-1', 'Eco-friendly', 'Cold Application'],
  }
];

export default function ProductsPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen">
      {/* Immersive Hero */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1541625602330-2133fe947a2e?q=80&w=2070&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-30 grayscale"
            alt="Product Engineering"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900 to-white z-10" />
        </div>
        
        <div className="relative z-20 text-center max-w-4xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-blue-500 font-black text-xs uppercase tracking-[0.4em] mb-6 block">Material Excellence</span>
            <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none mb-8">
              PIONEER <br/> <span className="text-blue-600">GRADES.</span>
            </h1>
            <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto">
              Compliance with IS 73:2013 standards. Delivering the DNA of modern infrastructure across India.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Product Showcase */}
      <section className="max-w-7xl mx-auto px-4 -mt-32 relative z-30 pb-32">
        <div className="flex flex-col gap-12">
          {PRODUCTS.map((p, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} bg-white rounded-[4rem] border border-slate-100 shadow-2xl overflow-hidden group`}
            >
              <div className="lg:w-1/2 h-[400px] lg:h-auto overflow-hidden relative">
                <img 
                  src={p.image} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                  alt={p.name} 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 to-transparent flex items-end p-12">
                  <div className="text-white">
                    <div className="text-xs font-black uppercase tracking-widest text-blue-400 mb-2">Grade Identification</div>
                    <div className="text-6xl font-black">{p.name}</div>
                  </div>
                </div>
              </div>
              
              <div className="lg:w-1/2 p-12 lg:p-20 flex flex-col justify-center">
                <h3 className="text-4xl font-black text-slate-900 mb-6">{p.fullName}</h3>
                <p className="text-lg text-slate-500 font-medium leading-relaxed mb-10">
                  {p.longDesc}
                </p>
                
                <div className="grid grid-cols-2 gap-6 mb-12">
                  {p.specs.map((s, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">{s}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => navigate('/contact')}
                    className="px-10 py-5 bg-slate-900 text-white rounded-full font-black text-lg hover:bg-blue-600 transition-all flex items-center gap-3"
                  >
                    Get Technical Data <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Technical Standards Section */}
      <section className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-6">UNCOMPROMISED <span className="text-blue-600">QA.</span></h2>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">Every batch undergoes rigorous testing at our in-house lab, ensuring zero-defect supply.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: ShieldCheck, title: 'Refinery Direct', desc: 'Direct sourcing from IOCL and Mundra ensures no middle-man contamination.' },
              { icon: Gauge, title: 'Precision Blending', desc: 'Customized softening points and viscosity for diverse climatic zones.' },
              { icon: Droplets, title: 'Moisture Control', desc: 'Negative moisture tolerances through advanced dehydration processing.' }
            ].map((item, i) => (
              <div key={i} className="p-12 bg-white rounded-[3rem] border border-slate-200 hover:border-blue-600 transition-colors">
                <item.icon className="w-12 h-12 text-blue-600 mb-8" />
                <h4 className="text-2xl font-black text-slate-900 mb-4">{item.title}</h4>
                <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-48 bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Layers className="w-full h-full scale-150 rotate-12" />
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-12">NEED BULK <br/> SUPPLY?</h2>
          <button 
            onClick={() => navigate('/contact')}
            className="px-16 py-8 bg-white text-blue-600 rounded-full font-black text-2xl hover:scale-105 transition-all shadow-2xl"
          >
            Request Quotation
          </button>
        </div>
      </section>
    </div>
  );
}
