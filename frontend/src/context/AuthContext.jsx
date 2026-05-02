import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import api from '../lib/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [appUser, setAppUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRestricted, setIsRestricted] = useState(false);

  const fetchAppUser = async (session) => {
    if (session) {
      localStorage.setItem('jwt', session.access_token);
      try {
        const { data } = await api.get('/users/me');
        setAppUser(data);
        if (data?.restricted) {
          setIsRestricted(true);
        }
      } catch (err) {
        console.error("Failed to fetch app user", err);
      }
    } else {
      localStorage.removeItem('jwt');
      setAppUser(null);
      setIsRestricted(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      fetchAppUser(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      fetchAppUser(session);
    });

    const handleRestricted = () => {
      setIsRestricted(true);
      supabase.auth.signOut();
    };
    window.addEventListener('auth:restricted', handleRestricted);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('auth:restricted', handleRestricted);
    };
  }, []);

  const value = {
    signUp: (data) => supabase.auth.signUp(data),
    signIn: (data) => supabase.auth.signInWithPassword(data),
    signOut: () => supabase.auth.signOut(),
    user,
    appUser,
    loading
  };

  if (isRestricted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
          <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Account Suspended</h2>
          <p className="text-slate-500 mb-8">Your account has been restricted from accessing the platform. Please contact the administrator.</p>
          <button 
            onClick={() => { setIsRestricted(false); supabase.auth.signOut(); }}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-3 rounded-xl transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
