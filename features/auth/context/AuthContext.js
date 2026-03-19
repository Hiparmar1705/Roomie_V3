import React, { createContext, useState, useContext } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // active user for the current app session

  const login = async (identifier, role, password = '') => {
    // auth service returns the next mock user shape the whole app reads
    const nextUser = await authService.login({ identifier, role, password });
    setUser(nextUser);
    return nextUser;
  };

  const signup = async (identifier, role, password, displayName) => {
    // signup also logs the user into the session right away in this demo
    const nextUser = await authService.signup({ identifier, role, password, displayName });
    setUser(nextUser);
    return nextUser;
  };

  const updateProfile = async (updates) => {
    if (!user) {
      return null;
    }

    const nextUser = await authService.updateProfile({ user, updates });
    // keep context in sync so profile changes show up everywhere without a reload
    setUser(nextUser);
    return nextUser;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    // keep all auth actions here so screens only need one hook
    <AuthContext.Provider value={{ user, login, signup, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
