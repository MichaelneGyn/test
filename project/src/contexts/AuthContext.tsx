import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  plan: 'free' | 'premium' | 'enterprise';
  servers: Server[];
}

interface Server {
  id: string;
  name: string;
  icon?: string;
  memberCount: number;
  role: 'owner' | 'admin' | 'moderator';
  features: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  updateUserPlan: (plan: 'free' | 'premium' | 'enterprise') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento inicial
    const savedUser = localStorage.getItem('mdbot_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simular login
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: '1',
      email,
      name: email.split('@')[0],
      plan: 'free',
      servers: [
        {
          id: '1',
          name: 'FOLK',
          memberCount: 1250,
          role: 'owner',
          features: ['premium']
        },
        {
          id: '2',
          name: 'Servidor de douglinhas',
          memberCount: 850,
          role: 'admin',
          features: ['basic']
        },
        {
          id: '3',
          name: 'Bots',
          memberCount: 2100,
          role: 'admin',
          features: ['premium']
        },
        {
          id: '4',
          name: 'Nosso cantinho',
          memberCount: 45,
          role: 'admin',
          features: ['basic']
        }
      ]
    };
    
    setUser(mockUser);
    localStorage.setItem('mdbot_user', JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mdbot_user');
  };

  const updateUserPlan = (plan: 'free' | 'premium' | 'enterprise') => {
    if (user) {
      const updatedUser = { ...user, plan };
      setUser(updatedUser);
      localStorage.setItem('mdbot_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, updateUserPlan }}>
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