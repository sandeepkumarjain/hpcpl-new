import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, storage } from '../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  ChevronLeft,
  ShieldCheck,
  Globe,
  Clock,
  Pencil,
  Save,
  X,
  Trash2,
  Loader2,
  Upload
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function CompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'companies', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          setCompany(data);
          setEditData(data);
        }
      } catch (err) {
        console.error("Error fetching company:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [id]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setEditData({ ...editData, logo: url });
      } catch (err: any) {
        console.error("Upload error:", err);
        setUploadError("Failed to upload image. Please try again.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!id) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, 'companies', id);
      await updateDoc(docRef, {
        companyName: editData.companyName,
        owner: editData.owner,
        gst: editData.gst,
        mobile: editData.mobile,
        email: editData.email,
        address: editData.address,
        logo: editData.logo || ''
      });
      setCompany(editData);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating company:", err);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!id) return;
    if (window.confirm("Are you sure you want to remove the company logo?")) {
      setIsSaving(true);
      try {
        const docRef = doc(db, 'companies', id);
        await updateDoc(docRef, { logo: '' });
        setCompany({ ...company, logo: '' });
        setEditData({ ...editData, logo: '' });
      } catch (err) {
        console.error("Error removing logo:", err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="p-20 text-center">
        <p className="text-slate-500 font-bold">Company not found.</p>
        <button onClick={() => navigate('/dashboard/companies')} className="mt-4 text-blue-600 font-bold hover:underline">
          Back to Companies
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard/companies')}
            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 shadow-sm transition-all active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Company Details</h1>
            <p className="text-slate-500 font-bold text-sm">Full profile for {company.companyName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setEditData(company);
                }}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 shadow-lg shadow-slate-900/10 transition-all active:scale-95"
            >
              <Pencil className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Info Card */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 overflow-hidden relative">
            <div className="relative z-10">
              <div className="flex items-center gap-6 mb-10">
                <div className="relative group">
                  <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center border border-slate-100 overflow-hidden shadow-sm relative">
                    {isEditing ? (
                      editData.logo ? (
                        <img src={editData.logo} alt={editData.companyName} className="w-full h-full object-contain" />
                      ) : (
                        <Building2 className="w-10 h-10 text-blue-600" />
                      )
                    ) : (
                      company.logo ? (
                        <img src={company.logo} alt={company.companyName} className="w-full h-full object-contain" />
                      ) : (
                        <Building2 className="w-10 h-10 text-blue-600" />
                      )
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div className="absolute -bottom-2 -right-2 flex gap-1">
                      <label className="w-8 h-8 bg-blue-600 text-white rounded-xl shadow-lg flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-all active:scale-90">
                        <Upload className="w-4 h-4" />
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={isUploading} />
                      </label>
                      {editData.logo && (
                        <button 
                          onClick={() => setEditData({...editData, logo: ''})}
                          className="w-8 h-8 bg-red-500 text-white rounded-xl shadow-lg flex items-center justify-center hover:bg-red-600 transition-all active:scale-90"
                          title="Remove Logo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}

                  {company.logo && !isEditing && (
                    <button 
                      onClick={handleRemoveLogo}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-red-600 active:scale-90"
                      title="Remove Logo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <div className="space-y-4">
                      <input 
                        type="text"
                        className="w-full text-2xl font-black text-slate-900 border-b-2 border-blue-100 focus:border-blue-600 outline-none pb-1 bg-transparent"
                        value={editData.companyName}
                        onChange={(e) => setEditData({...editData, companyName: e.target.value})}
                      />
                      {uploadError && (
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest animate-in fade-in slide-in-from-top-1">{uploadError}</p>
                      )}
                    </div>
                  ) : (
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight truncate">{company.companyName}</h2>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-md flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Profile
                    </span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-md">
                      GST: {isEditing ? (
                        <input 
                          className="bg-transparent border-none focus:ring-0 outline-none w-24 p-0 text-[10px] font-black uppercase"
                          value={editData.gst}
                          onChange={(e) => setEditData({...editData, gst: e.target.value})}
                        />
                      ) : company.gst}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Proprietor / Owner</span>
                      {isEditing ? (
                        <input 
                          className="w-full text-lg font-bold text-slate-900 border-b border-slate-100 focus:border-blue-600 outline-none pb-1 bg-transparent"
                          value={editData.owner}
                          onChange={(e) => setEditData({...editData, owner: e.target.value})}
                        />
                      ) : (
                        <span className="text-lg font-bold text-slate-900">{company.owner}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mobile Contact</span>
                      {isEditing ? (
                        <input 
                          className="w-full text-lg font-bold text-slate-900 border-b border-slate-100 focus:border-blue-600 outline-none pb-1 bg-transparent"
                          value={editData.mobile}
                          onChange={(e) => setEditData({...editData, mobile: e.target.value})}
                        />
                      ) : (
                        <span className="text-lg font-bold text-slate-900">{company.mobile}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</span>
                      {isEditing ? (
                        <input 
                          className="w-full text-lg font-bold text-slate-900 border-b border-slate-100 focus:border-blue-600 outline-none pb-1 bg-transparent"
                          value={editData.email}
                          onChange={(e) => setEditData({...editData, email: e.target.value})}
                        />
                      ) : (
                        <span className="text-lg font-bold text-slate-900 break-all">{company.email || 'Not Provided'}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                      <Globe className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</span>
                      <span className="text-lg font-bold text-emerald-600 uppercase">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl -z-0"></div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-slate-900" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Registered Office Address</h3>
            </div>
            <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
               {isEditing ? (
                 <textarea 
                    className="w-full bg-transparent text-lg font-medium text-slate-600 leading-relaxed italic outline-none focus:ring-2 focus:ring-blue-100 rounded-xl p-2"
                    value={editData.address}
                    rows={3}
                    onChange={(e) => setEditData({...editData, address: e.target.value})}
                 />
               ) : (
                 <p className="text-lg font-medium text-slate-600 leading-relaxed italic">
                   "{company.address || 'No registered address on file.'}"
                 </p>
               )}
            </div>
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
             <div className="relative z-10">
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Account Integrity</h4>
                <div className="space-y-4">
                   <div className="flex items-center gap-2 text-emerald-400">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">KYC Verified</span>
                   </div>
                   <div className="flex items-center gap-2 text-blue-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Member Since 2024</span>
                   </div>
                </div>
             </div>
             <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-600/10 rounded-full blur-2xl"></div>
          </div>

          <div className="bg-blue-600 rounded-[2rem] p-8 text-white">
             <h4 className="text-sm font-black uppercase tracking-widest text-blue-200 mb-6">Internal Notes</h4>
             <p className="text-sm font-medium leading-relaxed text-blue-50">
               This profile is strictly for verified trade partners. All orders must be validated against the registered GST number provided.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
