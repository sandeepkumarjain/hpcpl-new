import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../../lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Plus, Building2, User, Phone, Hash, Trash2, Mail, Pencil, Eye, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function CompaniesModule() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    address: '',
    owner: '',
    gst: '',
    mobile: '',
    email: '',
    logo: ''
  });

  useEffect(() => {
    return onSnapshot(query(collection(db, 'companies'), orderBy('companyName')), (snapshot) => {
      setCompanies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'companies', editingId), formData);
      } else {
        await addDoc(collection(db, 'companies'), formData);
      }
      setIsAdding(false);
      setEditingId(null);
      setFormData({ companyName: '', address: '', owner: '', gst: '', mobile: '', email: '', logo: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (company: any) => {
    setFormData({
      companyName: company.companyName,
      address: company.address || '',
      owner: company.owner,
      gst: company.gst,
      mobile: company.mobile,
      email: company.email || '',
      logo: company.logo || ''
    });
    setEditingId(company.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this company?')) {
      await deleteDoc(doc(db, 'companies', id));
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);

    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setUploadError('Invalid file type. Please upload an image.');
        return;
      }

      // Validate file size (500KB)
      const maxSize = 500 * 1024;
      if (file.size > maxSize) {
        setUploadError('File is too large. Max size is 500KB.');
        return;
      }

      setIsUploading(true);
      try {
        const storageRef = ref(storage, `company_logos/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        setFormData({ ...formData, logo: url });
      } catch (err: any) {
        console.error("Upload error:", err);
        let message = "Failed to upload image. Please try again.";
        if (err.code === 'storage/unauthorized') {
          message = "Unauthorized: You don't have permission to upload.";
        } else if (err.code === 'storage/canceled') {
          message = "Upload canceled.";
        } else if (err.code === 'storage/quota-exceeded') {
          message = "Storage quota exceeded. Please contact support.";
        }
        setUploadError(message);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-900">Admin Registration (Companies)</h1>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ companyName: '', address: '', owner: '', gst: '', mobile: '', email: '', logo: '' });
            setIsAdding(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Company
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-black mb-6">{editingId ? 'Edit Company' : 'Register New Company'}</h2>
            <form onSubmit={handleAdd} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Company Logo</label>
                <div className="p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <div className="flex items-center gap-4 mb-4">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden" 
                      id="logo-upload"
                    />
                    <label 
                      htmlFor="logo-upload" 
                      className={cn(
                        "px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black cursor-pointer hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2",
                        isUploading && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                      {isUploading ? 'Uploading...' : 'Choose Logo'}
                    </label>
                    <div className="flex-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Logo Upload</p>
                      <p className="text-[10px] text-slate-400 font-medium">PNG/JPG up to 500KB</p>
                    </div>
                  </div>

                  {uploadError && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-1">
                      {uploadError}
                    </div>
                  )}

                  {formData.logo ? (
                    <div className="mt-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm inline-block relative group animate-in fade-in slide-in-from-top-2">
                      <img src={formData.logo} alt="Logo Preview" className="w-32 h-20 object-contain" />
                      <button 
                        type="button" 
                        onClick={() => setFormData({...formData, logo: ''})}
                        className="absolute -top-3 -right-3 px-3 py-1 bg-red-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/30 hover:bg-red-600 transition-all active:scale-90"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 p-4 bg-slate-100/50 rounded-xl border border-slate-100 text-center py-8">
                       <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">No Logo Selected</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Company Name</label>
                <div className="relative group/input">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/input:text-blue-500 transition-colors" />
                  <input 
                    type="text" 
                    value={formData.companyName} 
                    onChange={e => setFormData({...formData, companyName: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-2xl pl-12 pr-4 py-3.5 font-bold text-slate-900 transition-all outline-none placeholder:text-slate-300"
                    placeholder="Company Legal Name"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Owner</label>
                  <div className="relative group/input">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/input:text-blue-500 transition-colors" />
                    <input 
                      type="text" 
                      value={formData.owner} 
                      onChange={e => setFormData({...formData, owner: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-2xl pl-12 pr-4 py-3.5 font-bold text-slate-900 transition-all outline-none"
                      placeholder="Proprietor/Owner Name"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Mobile Number</label>
                  <div className="relative group/input">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/input:text-blue-500 transition-colors" />
                    <input 
                      type="tel" 
                      value={formData.mobile} 
                      onChange={e => setFormData({...formData, mobile: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-2xl pl-12 pr-4 py-3.5 font-bold text-slate-900 transition-all outline-none"
                      placeholder="10-digit mobile number"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Email Address</label>
                <div className="relative group/input">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/input:text-blue-500 transition-colors" />
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-2xl pl-12 pr-4 py-3.5 font-bold text-slate-900 transition-all outline-none placeholder:text-slate-300"
                    placeholder="contact@company.com"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">GST Number</label>
                <div className="relative group/input">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/input:text-blue-500 transition-colors" />
                  <input 
                    type="text" 
                    value={formData.gst} 
                    onChange={e => setFormData({...formData, gst: e.target.value.toUpperCase()})}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-2xl pl-12 pr-4 py-3.5 font-bold text-slate-900 transition-all outline-none uppercase"
                    placeholder="e.g. 08AADCH1407J1ZS"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Physical Address</label>
                <textarea 
                  value={formData.address} 
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-2xl px-4 py-3.5 font-bold text-slate-900 transition-all outline-none min-h-[100px] resize-none"
                  placeholder="Full physical/registered address"
                  required
                />
              </div>
              <div className="flex gap-3 pt-6">
                <button type="submit" className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  {editingId ? 'Save Changes' : 'Register Company'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setIsAdding(false);
                    setEditingId(null);
                  }} 
                  className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-2xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map(c => (
          <div key={c.id} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
            <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
              <button 
                onClick={() => navigate(`/dashboard/companies/${c.id}`)}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleEdit(c)}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDelete(c.id)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-white rounded-[1.25rem] flex items-center justify-center border border-slate-100 overflow-hidden">
                {c.logo ? (
                  <img src={c.logo} alt={c.companyName} className="w-full h-full object-contain" />
                ) : (
                  <Building2 className="w-7 h-7 text-blue-600" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-black text-lg text-slate-900 truncate leading-tight">{c.companyName}</h3>
                <span className="text-[10px] font-black text-blue-600 tracking-widest uppercase bg-blue-50/50 px-2 py-0.5 rounded-md">{c.gst}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Proprietor</span>
                  <span className="text-sm font-bold text-slate-700">{c.owner}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Contact</span>
                  <span className="text-sm font-bold text-slate-700">{c.mobile}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Email</span>
                  <span className="text-sm font-bold text-slate-700 truncate max-w-[180px]">{c.email}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Registered Address</span>
                <p className="text-sm font-medium text-slate-500 leading-relaxed italic">
                  {c.address ? `"${c.address}"` : 'No address provided'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {companies.length === 0 && (
        <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/30">
          <Building2 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-bold">No companies registered yet.</p>
        </div>
      )}
    </div>
  );
}
