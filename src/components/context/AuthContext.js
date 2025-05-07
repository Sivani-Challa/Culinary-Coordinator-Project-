import React, { createContext, useState, useEffect } from 'react';

// Create the context
export const AuthContext = createContext();

// Create the provider component
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in when component mounts
    const checkLoginStatus = () => {
      try{
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token) {
        setIsLoggedIn(true);
          if (userData) {
            setUser(JSON.parse(userData));
          } else {
            const userName = localStorage.getItem('userName');
            if (userName) {
              setUser({ username: userName });
            }
          }
          } else {
            setIsLoggedIn(false);
            setUser(null);
          }
        } catch (error) {
          console.error('Error checking login status:', error);
          setIsLoggedIn(false);
          setUser(null);
        } finally {
          setAuthLoading(false);
        }
        };
    
        checkLoginStatus();

          // Add event listener for login events
    const handleLoginEvent = () => {
      checkLoginStatus();
    };
    
    window.addEventListener('storage', handleLoginEvent);
    window.addEventListener('auth-login', handleLoginEvent);
    
    return () => {
      window.removeEventListener('storage', handleLoginEvent);
      window.removeEventListener('auth-login', handleLoginEvent);
    };
  }, []);

  const login = (userData, token) => {
    console.log('Login called in AuthContext with:', { userData, token });
    localStorage.setItem('token', token);
    if (userData) {
      if (typeof userData === 'object') {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userName', userData.username || userData.name || '');
      }
    }
    setIsLoggedIn(true);
    setUser(userData);

    // Dispatch a custom event to notify components
    window.dispatchEvent(new Event('auth-login'));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userName');
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;