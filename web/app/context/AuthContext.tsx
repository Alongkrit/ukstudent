'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch, setAccessToken, getAccessToken } from '../lib/api';

export type UserRole = 'student' | 'expert' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  phone?: string;
  university?: string;
  course?: string;
  yearOfStudy?: string;
  subjects?: string[];
  qualifications?: string;
  bio?: string;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  isAvailable?: boolean;
  ratingAvg?: number;
  paypalEmail?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  
  loginWithGoogle: (credential: string, role?: string) => Promise<{ success: boolean; error?: string; role?: UserRole; isNewUser?: boolean }>;
  registerStudent: (data: {
    name?: string;
    email: string;
    password: string;
    university: string;
    course: string;
    yearOfStudy: string;
  }) => Promise<{ success: boolean; error?: string }>;
  registerExpert: (data: {
    name?: string;
    email: string;
    password: string;
    subjects: string[];
    qualifications: string;
    bio?: string;
    paypalEmail?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: {
    fullName?: string;
    phone?: string;
    university?: string;
    course?: string;
    yearOfStudy?: string;
    bio?: string;
    subjects?: string[];
    qualifications?: string;
    paypalEmail?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  toggleExpertAvailability: () => Promise<void>;
  refreshUser: () => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  token: null,
  loading: true,
  login: async () => ({ success: false }),
  loginWithGoogle: async () => ({ success: false }),
  registerStudent: async () => ({ success: false }),
  registerExpert: async () => ({ success: false }),
  updateProfile: async () => ({ success: false }),
  logout: async () => {},
  toggleExpertAvailability: async () => {},
  refreshUser: async () => null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [token, setToken] = useState<string | null>(getAccessToken());
  const [loading, setLoading] = useState<boolean>(true);

  const mapUserData = (rawUser: any): UserProfile => {
    const formattedRole: UserRole = rawUser.role;
    const nameFromEmail = rawUser.email.split('@')[0].replace('.', ' ');
    const capitalizedName = nameFromEmail
      .split(' ')
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const displayName = rawUser.studentProfile?.fullName || capitalizedName;

    const profile: UserProfile = {
      id: rawUser.id,
      email: rawUser.email,
      role: formattedRole,
      name: displayName,
      phone: rawUser.phone,
      university: rawUser.studentProfile?.university,
      course: rawUser.studentProfile?.course,
      yearOfStudy: rawUser.studentProfile?.yearOfStudy,
      subjects: rawUser.expertProfile?.subjects,
      qualifications: rawUser.expertProfile?.qualifications,
      bio: rawUser.expertProfile?.bio,
      verificationStatus: rawUser.expertProfile?.verificationStatus,
      isAvailable: rawUser.expertProfile?.isAvailable,
      ratingAvg: rawUser.expertProfile?.ratingAvg ? Number(rawUser.expertProfile.ratingAvg) : undefined,
      paypalEmail: rawUser.expertProfile?.paypalEmail,
    };

    setUser(profile);
    setRole(formattedRole);
    return profile;
  };

  const refreshUser = async (): Promise<UserProfile | null> => {
    try {
      const meRes = await apiFetch('/users/me');
      if (meRes.ok) {
        const meData = await meRes.json();
        return mapUserData(meData);
      } else {
        setAccessToken(null);
        setToken(null);
        setUser(null);
        setRole(null);
        return null;
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
      setAccessToken(null);
      setToken(null);
      setUser(null);
      setRole(null);
      return null;
    }
  };

  useEffect(() => {
    async function checkAuth() {
      try {
        const storedToken = getAccessToken();
        if (storedToken) {
          await refreshUser();
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Invalid credentials' }));
        return { success: false, error: errorData.message || 'Login failed' };
      }

      const data = await res.json();
      setAccessToken(data.accessToken);
      setToken(data.accessToken);

      const profile = await refreshUser();
      if (!profile) {
        return { success: false, error: 'Could not fetch user details. Please try again.' };
      }
      return { success: true, role: profile.role };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during login' };
    }
  };

  const loginWithGoogle = async (credential: string, requestedRole = 'student') => {
    try {
      const res = await apiFetch('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential, role: requestedRole }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Google authentication failed' }));
        return { success: false, error: errorData.message || 'Google authentication failed' };
      }

      const data = await res.json();
      setAccessToken(data.accessToken);
      setToken(data.accessToken);

      const profile = await refreshUser();
      if (!profile) {
        return { success: false, error: 'Could not fetch user details after Google login.' };
      }
      return { success: true, role: profile.role, isNewUser: data.isNewUser };
    } catch (err: any) {
      return { success: false, error: err.message || 'Google authentication network error' };
    }
  };

  const registerStudent = async (data: {
    name?: string;
    email: string;
    password: string;
    university: string;
    course: string;
    yearOfStudy: string;
  }) => {
    try {
      const res = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          role: 'student',
          fullName: data.name,
          university: data.university,
          course: data.course,
          yearOfStudy: data.yearOfStudy,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Registration failed' }));
        return { success: false, error: errorData.message || 'Registration failed' };
      }

      return login(data.email, data.password);
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration network error' };
    }
  };

  const registerExpert = async (data: {
    name?: string;
    email: string;
    password: string;
    subjects: string[];
    qualifications: string;
    bio?: string;
    paypalEmail?: string;
  }) => {
    try {
      const res = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          role: 'expert',
          fullName: data.name,
          subjects: data.subjects,
          qualifications: data.qualifications,
          bio: data.bio,
          paypalEmail: data.paypalEmail,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Expert application failed' }));
        return { success: false, error: errorData.message || 'Expert application failed' };
      }

      return login(data.email, data.password);
    } catch (err: any) {
      return { success: false, error: err.message || 'Application network error' };
    }
  };

  const updateProfile = async (data: {
    fullName?: string;
    phone?: string;
    university?: string;
    course?: string;
    yearOfStudy?: string;
    bio?: string;
    subjects?: string[];
    qualifications?: string;
    paypalEmail?: string;
  }) => {
    try {
      const res = await apiFetch('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Profile update failed' }));
        return { success: false, error: errorData.message || 'Profile update failed' };
      }

      const updatedUser = await res.json();
      mapUserData(updatedUser);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error updating profile' };
    }
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setAccessToken(null);
      setToken(null);
      setUser(null);
      setRole(null);
    }
  };

  const toggleExpertAvailability = async () => {
    if (user && user.role === 'expert') {
      const newAvailability = !user.isAvailable;
      setUser({ ...user, isAvailable: newAvailability });
      try {
        await apiFetch('/experts/availability', {
          method: 'PATCH',
          body: JSON.stringify({ isAvailable: newAvailability }),
        });
      } catch (err) {
        console.error('Failed to sync availability with server:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        loading,
        login,
        loginWithGoogle,
        registerStudent,
        registerExpert,
        updateProfile,
        logout,
        toggleExpertAvailability,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
