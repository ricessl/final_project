import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const isAdminRoute = window.location.pathname === '/admin';

  if (loading) return <div>Загрузка...</div>;

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (isAdminRoute && user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default PrivateRoute;