import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'freelancer' | 'admin' | 'superadmin' | 'agent';
  email_verified: boolean;
  phone?: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('connect_accel_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // TODO: Integrate with Supabase Auth
    // For MVP demo, using mock auth
    const mockUser: User = {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      email,
      name: email.split('@')[0],
      role: email.includes('client') ? 'client' : 
            email.includes('freelancer') ? 'freelancer' : 
            email.includes('agent') ? 'agent' :
            email.includes('admin') ? 'admin' : 
            email.includes('super') ? 'superadmin' : 'client',
      email_verified: true,
      created_at: new Date().toISOString(),
    };
    
    setUser(mockUser);
    localStorage.setItem('connect_accel_user', JSON.stringify(mockUser));
  };

  const signup = async (name: string, email: string, password: string, role: string) => {
    // TODO: Integrate with Supabase Auth
    const mockUser: User = {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      email,
      name,
      role: role as User['role'],
      email_verified: false,
      created_at: new Date().toISOString(),
    };
    
    setUser(mockUser);
    localStorage.setItem('connect_accel_user', JSON.stringify(mockUser));
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('connect_accel_user');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('connect_accel_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
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