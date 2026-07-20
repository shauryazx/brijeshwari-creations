import React, { createContext, useContext, useState } from 'react';

// List of designated Admin Email Addresses / UIDs in code
export const ADMIN_EMAILS = [
  'mtech.nim3@gmail.com',
  'admin@brijeshwari.com',
  'owner@brijeshwari.com',
  'pclaps@brijeshwari.com'
];

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authAnimation, setAuthAnimation] = useState(null);

  const toggleAdminView = () => {
    setIsAdminView(prev => !prev);
  };

  const checkIsAdminEmail = (email) => {
    if (!email) return false;
    const clean = email.trim().toLowerCase();
    return ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === clean) || clean.includes('admin');
  };

  const login = (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const isAdmin = checkIsAdminEmail(cleanEmail);
    const userName = cleanEmail.split('@')[0].toUpperCase();

    const newUser = {
      name: userName,
      email: cleanEmail,
      role: isAdmin ? 'admin' : 'customer'
    };

    setUser(newUser);
    setIsAuthModalOpen(false);

    setAuthAnimation({ type: 'LOGIN', userName });
    setTimeout(() => {
      setAuthAnimation(null);
    }, 2800);
  };

  const register = (fullName, email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const isAdmin = checkIsAdminEmail(cleanEmail);

    const newUser = {
      name: fullName,
      email: cleanEmail,
      role: isAdmin ? 'admin' : 'customer'
    };

    setUser(newUser);
    setIsAuthModalOpen(false);

    setAuthAnimation({ type: 'REGISTER', userName: fullName });
    setTimeout(() => {
      setAuthAnimation(null);
    }, 2800);
  };

  const logout = () => {
    const prevName = user ? user.name : "Patron";
    setUser(null);
    setIsAdminView(false);
    setIsAuthModalOpen(false);

    setAuthAnimation({ type: 'LOGOUT', userName: prevName });
    setTimeout(() => {
      setAuthAnimation(null);
    }, 2500);
  };

  const isAdminUser = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      isAdminUser,
      isAdminView,
      toggleAdminView,
      isAuthModalOpen,
      setIsAuthModalOpen,
      authAnimation,
      login,
      register,
      logout,
      ADMIN_EMAILS
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
