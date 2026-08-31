import React, { createContext, useContext, useState, useEffect } from 'react';
import { IUser, UserRole } from '@shared/types';
import { api } from '../api/client';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isOrganizer: boolean;
  isUser: boolean;
  login: (email: string, password?: string, rememberMe?: boolean) => Promise<IUser>;
  googleLogin: (googleData: {
    email: string;
    name?: string;
    picture?: string;
    role?: 'USER' | 'ORGANIZER';
  }) => Promise<IUser>;
  adminLogin: (email: string, password?: string, rememberMe?: boolean) => Promise<IUser>;
  register: (data: {
    name?: string;
    fullName?: string;
    email: string;
    password?: string;
    phone?: string;
    role?: 'USER' | 'ORGANIZER';
    city?: string;
    state?: string;
    organizationName?: string;
    organizationDescription?: string;
    businessCategory?: string;
    experience?: string;
    services?: string[];
  }) => Promise<IUser>;
  logout: () => Promise<void>;
  adminLogout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string; resetToken?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  adminForgotPassword: (email: string) => Promise<{ success: boolean; message: string; resetToken?: string }>;
  adminResetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; message: string }>;
  updateUser: (updatedData: Partial<IUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('utsavmitra_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      const savedToken = localStorage.getItem('utsavmitra_token');
      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get<{ success: boolean; user: IUser }>('/auth/me');
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          localStorage.removeItem('utsavmitra_token');
          localStorage.removeItem('utsavmitra_refresh_token');
          setToken(null);
          setUser(null);
        }
      } catch {
        localStorage.removeItem('utsavmitra_token');
        localStorage.removeItem('utsavmitra_refresh_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Public Login (USER & ORGANIZER)
  const login = async (email: string, password = '', rememberMe = false): Promise<IUser> => {
    setIsLoading(true);
    try {
      const res = await api.post<{
        success: boolean;
        message: string;
        token: string;
        refreshToken?: string;
        user: IUser;
      }>('/auth/login', { email, password, rememberMe });

      if (res.success && res.token && res.user) {
        localStorage.setItem('utsavmitra_token', res.token);
        if (res.refreshToken) {
          localStorage.setItem('utsavmitra_refresh_token', res.refreshToken);
        }
        setToken(res.token);
        setUser(res.user);
        return res.user;
      }
      throw new Error(res.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth Login / Registration
  const googleLogin = async (googleData: {
    email: string;
    name?: string;
    picture?: string;
    role?: 'USER' | 'ORGANIZER';
  }): Promise<IUser> => {
    setIsLoading(true);
    try {
      const res = await api.post<{
        success: boolean;
        message: string;
        token: string;
        refreshToken?: string;
        user: IUser;
      }>('/auth/google', googleData);

      if (res.success && res.token && res.user) {
        localStorage.setItem('utsavmitra_token', res.token);
        if (res.refreshToken) {
          localStorage.setItem('utsavmitra_refresh_token', res.refreshToken);
        }
        setToken(res.token);
        setUser(res.user);
        return res.user;
      }
      throw new Error(res.message || 'Google authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Dedicated Admin Login
  const adminLogin = async (email: string, password = '', rememberMe = false): Promise<IUser> => {
    setIsLoading(true);
    try {
      const res = await api.post<{
        success: boolean;
        message: string;
        token: string;
        refreshToken?: string;
        user: IUser;
      }>('/admin/auth/login', { email, password, rememberMe });

      if (res.success && res.token && res.user) {
        localStorage.setItem('utsavmitra_token', res.token);
        if (res.refreshToken) {
          localStorage.setItem('utsavmitra_refresh_token', res.refreshToken);
        }
        setToken(res.token);
        setUser(res.user);
        return res.user;
      }
      throw new Error(res.message || 'Admin authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Public Registration (Client / Organizer)
  const register = async (data: any): Promise<IUser> => {
    setIsLoading(true);
    try {
      const res = await api.post<{
        success: boolean;
        message: string;
        token: string;
        refreshToken?: string;
        user: IUser;
      }>('/auth/register', data);

      if (res.success && res.token && res.user) {
        localStorage.setItem('utsavmitra_token', res.token);
        if (res.refreshToken) {
          localStorage.setItem('utsavmitra_refresh_token', res.refreshToken);
        }
        setToken(res.token);
        setUser(res.user);
        return res.user;
      }
      throw new Error(res.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', {}).catch(() => {});
    } finally {
      localStorage.removeItem('utsavmitra_token');
      localStorage.removeItem('utsavmitra_refresh_token');
      setToken(null);
      setUser(null);
    }
  };

  const adminLogout = async () => {
    try {
      await api.post('/admin/auth/logout', {}).catch(() => {});
    } finally {
      localStorage.removeItem('utsavmitra_token');
      localStorage.removeItem('utsavmitra_refresh_token');
      setToken(null);
      setUser(null);
    }
  };

  const forgotPassword = async (email: string) => {
    return api.post<{ success: boolean; message: string; resetToken?: string }>('/auth/forgot-password', { email });
  };

  const resetPassword = async (token: string, newPassword: string) => {
    return api.post<{ success: boolean; message: string }>('/auth/reset-password', { token, newPassword });
  };

  const adminForgotPassword = async (email: string) => {
    return api.post<{ success: boolean; message: string; resetToken?: string }>('/admin/auth/forgot-password', { email });
  };

  const adminResetPassword = async (token: string, newPassword: string) => {
    return api.post<{ success: boolean; message: string }>('/admin/auth/reset-password', { token, newPassword });
  };

  const verifyEmail = async (token: string) => {
    return api.post<{ success: boolean; message: string }>('/auth/verify-email', { token });
  };

  const updateUser = async (updatedData: Partial<IUser>) => {
    const res = await api.put<{ success: boolean; user: IUser }>('/auth/profile', updatedData);
    if (res.success && res.user) {
      setUser(res.user);
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isOrganizer = user?.role === 'ORGANIZER';
  const isUser = user?.role === 'USER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        isAdmin,
        isOrganizer,
        isUser,
        login,
        googleLogin,
        adminLogin,
        register,
        logout,
        adminLogout,
        forgotPassword,
        resetPassword,
        adminForgotPassword,
        adminResetPassword,
        verifyEmail,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
