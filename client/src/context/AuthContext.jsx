import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cf_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeInstitution, setActiveInstitution] = useState(() => {
    const saved = localStorage.getItem('cf_user');
    try {
      const parsed = saved ? JSON.parse(saved) : null;
      return parsed?.activeInstitution || null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem('cf_token');
      if (!token) {
        setUser(null);
        setActiveInstitution(null);
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data.success && res.data.data.user) {
          const freshUser = res.data.data.user;
          setUser(freshUser);
          setActiveInstitution(freshUser.activeInstitution || null);
          localStorage.setItem('cf_user', JSON.stringify(freshUser));
          if (freshUser.activeInstitution?.id) {
            localStorage.setItem('cf_active_institution_id', freshUser.activeInstitution.id);
          }
        }
      } catch (err) {
        console.warn('Session check failed, clearing state');
        setUser(null);
        setActiveInstitution(null);
        localStorage.removeItem('cf_token');
        localStorage.removeItem('cf_user');
        localStorage.removeItem('cf_active_institution_id');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  const login = async (email, password, institutionId = null) => {
    try {
      const payload = { email, password };
      if (institutionId) payload.institutionId = institutionId;
      const res = await api.post('/auth/login', payload);
      if (res.data.success) {
        const { user: loggedInUser, token } = res.data.data;
        setUser(loggedInUser);
        setActiveInstitution(loggedInUser.activeInstitution || null);
        localStorage.setItem('cf_token', token);
        localStorage.setItem('cf_user', JSON.stringify(loggedInUser));

        if (loggedInUser.activeInstitution?.id) {
          localStorage.setItem('cf_active_institution_id', loggedInUser.activeInstitution.id);
        }

        showToast(`Welcome back, ${loggedInUser.name}!`, 'success');
        return { success: true, user: loggedInUser };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const switchInstitution = async (targetInstitutionId) => {
    try {
      const res = await api.post('/auth/switch-institution', { institutionId: targetInstitutionId });
      if (res.data.success) {
        const { activeInstitution: newInst, role, department, studentId } = res.data.data;

        const updatedUser = {
          ...user,
          activeInstitution: newInst,
          role,
          department,
          studentId,
        };

        setUser(updatedUser);
        setActiveInstitution(newInst);
        localStorage.setItem('cf_user', JSON.stringify(updatedUser));
        localStorage.setItem('cf_active_institution_id', targetInstitutionId);

        showToast(`Switched active institution to ${newInst.name}`, 'info');

        // Route to corresponding role dashboard
        if (updatedUser.isSuperAdmin) {
          window.location.href = '/platform/dashboard';
        } else if (role === 'ADMIN') {
          window.location.href = '/admin/dashboard';
        } else if (role === 'STAFF') {
          window.location.href = '/staff/dashboard';
        } else {
          window.location.href = '/dashboard';
        }

        return { success: true, user: updatedUser };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to switch institution context.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      if (res.data.success) {
        const { user: registeredUser, token } = res.data.data;
        setUser(registeredUser);
        setActiveInstitution(registeredUser.activeInstitution || null);
        localStorage.setItem('cf_token', token);
        localStorage.setItem('cf_user', JSON.stringify(registeredUser));

        if (registeredUser.activeInstitution?.id) {
          localStorage.setItem('cf_active_institution_id', registeredUser.activeInstitution.id);
        }

        showToast('Registration successful! Welcome to CampusSaathi.', 'success');
        return { success: true, user: registeredUser };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your details.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setActiveInstitution(null);
      localStorage.removeItem('cf_token');
      localStorage.removeItem('cf_user');
      localStorage.removeItem('cf_active_institution_id');
      showToast('Logged out successfully.', 'info');
      window.location.href = '/login';
    }
  };

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('cf_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeInstitution,
        memberships: user?.memberships || [],
        loading,
        login,
        register,
        switchInstitution,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
