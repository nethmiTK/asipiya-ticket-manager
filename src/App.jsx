// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Register from './frontend/Authenication/Register';
import Login from './frontend/Authenication/Login';
import UserDashboard from './frontend/users_panel/usersDashboard';
import Dashboard from './frontend/admin_panel/dashbord';
import { useState, useEffect, createContext, useContext } from 'react';
import './App.css';


import AddSupervisor from './frontend/admin_panel/AddSupervisor';
import AddMember from './frontend/admin_panel/AddMember';
import TicketManage from './frontend/admin_panel/TicketManage';
import EditMember from './frontend/admin_panel/EditMember';

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
    const role = localStorage.getItem('role');
    if (role) {
      setIsLoggedIn(true);
      setUserRole(role);
    }
  }, [setIsLoggedIn, setUserRole]);

  const handleLoginSuccess = (role) => {
    localStorage.setItem('role', role);
    setIsLoggedIn(true);
    setUserRole(role);
    navigate(role === 'admin' ? '/admin-dashboard' : '/user-dashboard');
  };

  const handleLogout = () => {
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
              <Dashboard />
            </ProtectedRoute>
          }
        />
           {/* <Route path="/" element={<Dashboard />} />
        <Route path="/tickets" element={<Tickets />} /> */}
        {/*<Route path="/supervisor" element={<AddSupervisor />} />
        <Route path="/add-member" element={<AddMember />} />
        <Route path="/ticket-manage" element={<TicketManage />} />
        <Route path="/edit-supervisor/:id" element={<EditMember />} />*/}
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
