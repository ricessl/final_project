import { createContext, useState, useEffect } from 'react';
import { getUser } from '../services/api.jsx';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await getUser();
          setUser(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = { user, setUser, logout, loading };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <div>Загрузка...</div> : children}
    </AuthContext.Provider>
  );
};