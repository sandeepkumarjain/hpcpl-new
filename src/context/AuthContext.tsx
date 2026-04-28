import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface UserProfile {
  id: string;
  role: 'super_admin' | 'admin' | 'staff' | 'customer';
  companyId?: string;
  name: string;
  mobile: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localSession = localStorage.getItem('user_session');
    
    return onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        const docRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile({ id: firebaseUser.uid, ...docSnap.data() } as UserProfile);
        } else {
          setProfile(null);
        }
      } else if (localSession) {
        // Fallback for demo mode
        try {
          const session = JSON.parse(localSession);
          if (session.role) {
            setProfile({
              id: 'demo-user',
              name: 'Demo Admin',
              role: session.role,
              mobile: session.mobile || ''
            } as UserProfile);
          } else {
             setProfile(null);
          }
        } catch (e) {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
  }, []);

  const isAdmin = profile?.role === 'super_admin';
  const isStaff = profile?.role === 'super_admin' || profile?.role === 'staff' || profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, isStaff }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
