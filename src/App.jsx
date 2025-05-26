// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Register from './frontend/users_panel/Register';
import Login from './frontend/users_panel/Login';
import UserDashboard from './frontend/users_panel/UserDashboard';
import DashboardPage from './frontend/admin_panel/dashbord';
import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isLoggedIn, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true });
      return;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
      alert('Access Denied');
      navigate(userRole === 'user' ? '/user-dashboard' : '/login', { replace: true });
    }
  }, [isLoggedIn, userRole, allowedRoles, navigate]);

  if (!isLoggedIn || (allowedRoles && !allowedRoles.includes(userRole))) return null;
  return children;
};

const AppRoutes = ({ isLoggedIn, setIsLoggedIn, userRole, setUserRole }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
      setIsLoggedIn(true);
      setUserRole(role);
    }
  }, [setIsLoggedIn, setUserRole]);

  const handleLoginSuccess = (token, role) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    setIsLoggedIn(true);
    setUserRole(role);
    navigate(role === 'admin' ? '/admin-dashboard' : '/user-dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setUserRole(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userRole, handleLoginSuccess, handleLogout }}>
      <Routes>
        <Route path='/' element={<Navigate to="/login" replace />} />
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route
          path='/user-dashboard'
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin-dashboard'
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthContext.Provider>
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  return (
    <BrowserRouter>
      <AppRoutes
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        userRole={userRole}
        setUserRole={setUserRole}
      />
    </BrowserRouter>
  );
}

export default App;
