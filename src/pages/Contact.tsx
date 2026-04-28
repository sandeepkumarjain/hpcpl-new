import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, ArrowUpRight, Newspaper, Globe } from 'lucide-react';
import React, { useState } from 'react';

const CONTACT_DETAILS = [
  {
    icon: Phone,
    title: 'Hotline',
    value: '+91 96724 18000, +91 91667 86666',
    desc: 'Support & Sales'
  },
  {
    icon: Mail,
    title: 'Digital',
    value: 'info@hannanth.com',
    desc: 'Rapid correspondence.'
  },
  {
    icon: MapPin,
    title: 'Headquarters',
    value: 'Bikaner, Rajasthan',
    desc: 'Registered HQ India.'
  }
];

const BLOGS = [
  {
    category: 'Industry Update',
    title: 'The Shift toward Cold-Mix Bitumen Emulsions in 2024',
    excerpt: 'How eco-friendly road construction is redefining the Indian infrastructure landscape.',
    image: 'https://images.unsplash.com/photo-1541625602330-2133fe947a2e?q=80&w=600&auto=format&fit=crop',
    date: 'Dec 12, 2023'
  },
  {
    category: 'Technical Guide',
    title: 'Optimizing Bitumen Grade Selection for Extreme Climates',
    excerpt: 'Understanding Viscosity Grade variations for Thar Desert vs Himalayan terrains.',
    image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecb?q=80&w=600&auto=format&fit=crop',
    date: 'Jan 05, 2024'
  },
  {
    category: 'Supply Chain',
    title: 'Digitalization of Logistics: Real-time Tanker Tracking',
    excerpt: 'Reducing gate-to-gate TAT through integrated refinery pipeline digital systems.',
    image: 'https://images.unsplash.com/photo-1579450371190-324385172242?q=80&w=600&auto=format&fit=crop',
    date: 'Feb 18, 2024'
  }
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Construct WhatsApp API URL
    // Param format: Name,Email,Phone,Grade,Message
    // Truncate message if it's too long for a single param
    const messageShort = String(data.message).substring(0, 100);
    const params = [
      data.name,
      data.email,
      data.phone,
      data.grade,
      messageShort
    ].join(',');

    const apiUrl = `https://whatsapp.gntindia.com/api/sendtemplate.php?LicenseNumber=41863602642&APIKey=IPK2N0tlRno3CyrOxZfd7pX8F&Contact=919672418000&Template=customer_form&Param=${encodeURIComponent(params)}`;

    try {
      // Use no-cors if the API doesn't support CORS from any domain, 
      // though typically for these endpoints we just fire and forget or check response
      await fetch(apiUrl, { mode: 'no-cors' });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
      form.reset();
    } catch (error) {
      console.error('API Error:', error);
      // Fallback behavior even if call fails to not block user
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
      form.reset();
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Editorial Header */}
      <section className="py-32 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-3xl"
          >
            <span className="text-blue-500 font-black text-xs uppercase tracking-[0.4em] mb-6 block">Connectivity</span>
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none mb-10">
              OPEN <br/> <span className="text-blue-600">CHANNELS.</span>
            </h1>
            <p className="text-xl text-slate-400 font-medium">
              Direct access to technical consulting, bulk logistics, and rate verification. No barriers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Grid Layout: Form + Details */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Inquiry Form */}
          <div className="lg:col-span-8">
            <div className="bg-slate-50 p-12 lg:p-16 rounded-[4rem] border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <Send className="w-64 h-64" />
              </div>
              
              <div className="relative z-10">
                <h2 className="text-3xl font-black text-slate-900 mb-12">Customer Required Form</h2>
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <input name="name" type="text" placeholder="Full Name" required className="bg-white border-b-2 border-slate-200 px-0 py-4 focus:border-blue-600 outline-none transition-all font-bold" />
                    <input name="email" type="email" placeholder="Business Email" required className="bg-white border-b-2 border-slate-200 px-0 py-4 focus:border-blue-600 outline-none transition-all font-bold" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <input name="phone" type="tel" placeholder="Contact Number" required className="bg-white border-b-2 border-slate-200 px-0 py-4 focus:border-blue-600 outline-none transition-all font-bold" />
                    <select name="grade" required className="bg-white border-b-2 border-slate-200 px-0 py-4 focus:border-blue-600 outline-none transition-all font-bold appearance-none">
                      <option value="">Select Bitumen Grade</option>
                      <option value="VG-10">VG-10</option>
                      <option value="VG-30">VG-30</option>
                      <option value="VG-40">VG-40</option>
                      <option value="Emulsion">Emulsion / Custom</option>
                    </select>
                  </div>
                  <textarea name="message" rows={4} placeholder="Project Details / Inquiry" required className="w-full bg-white border-b-2 border-slate-200 px-0 py-4 focus:border-blue-600 outline-none transition-all font-bold resize-none" />
                  
                  <button type="submit" className="px-12 py-6 bg-slate-900 text-white rounded-full font-black text-lg hover:bg-blue-600 transition-all flex items-center gap-3">
                    {submitted ? 'Inquiry Dispatched' : 'Submit Inquiry'} <ArrowUpRight className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Quick Contact & Info */}
          <div className="lg:col-span-4 space-y-8">
            {CONTACT_DETAILS.map((item, i) => (
              <div key={i} className="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                <item.icon className="w-8 h-8 text-blue-600 mb-6" />
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{item.title}</div>
                <div className="text-xl font-black text-slate-900 mb-2">{item.value}</div>
                <p className="text-sm text-slate-500 font-medium">{item.desc}</p>
              </div>
            ))}
            
            <div className="p-10 bg-blue-600 rounded-[3.5rem] text-white">
              <h4 className="text-2xl font-black mb-4 tracking-tight">Express Verification</h4>
              <p className="text-blue-100 font-medium text-sm leading-relaxed mb-8">
                Registered customers can verify gate-pass credentials directly through the portal.
              </p>
              <button className="w-full py-4 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl font-black text-sm uppercase tracking-widest transition-all">
                Login to Portal
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Blogs Column Section */}
      <section className="py-32 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-20">
            <div>
              <span className="text-blue-600 font-black text-xs uppercase tracking-[0.4em] mb-4 block">Knowledge Center</span>
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter">THE BITUMEN <br/> <span className="text-slate-400">CHRONICLE.</span></h2>
            </div>
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-200">
                  <Newspaper className="w-5 h-5 text-slate-900" />
               </div>
               <span className="font-black text-sm uppercase tracking-widest">Industry Insights</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {BLOGS.map((blog, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="group cursor-pointer"
              >
                <div className="aspect-[4/5] rounded-[3.5rem] overflow-hidden mb-8 relative">
                   <img src={blog.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={blog.title} />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent p-10 flex flex-col justify-end">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">{blog.category}</span>
                      <h3 className="text-2xl font-black text-white leading-tight mb-4">{blog.title}</h3>
                      <div className="flex items-center justify-between text-white/50 text-xs font-black uppercase tracking-widest">
                         <span>{blog.date}</span>
                         <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </div>
                   </div>
                </div>
                <p className="text-slate-500 font-medium leading-relaxed line-clamp-3">
                  {blog.excerpt}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Presence Visual Overlay */}
      <section className="h-[40vh] bg-slate-900 relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none px-20">
          <Globe className="w-full h-full scale-110 text-white" />
        </div>
        <div className="text-center relative z-10 px-4">
           <h3 className="text-3xl md:text-5xl font-black text-white tracking-tight italic opacity-60">"Seamless Supply, Standard Compliant."</h3>
        </div>
      </section>
    </div>
  );
}
