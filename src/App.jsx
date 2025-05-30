// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Register from './frontend/Authenication/Register';
import Login from './frontend/Authenication/Login';
import UserDashboard from './frontend/users_panel/usersDashboard';
import Dashboard from './frontend/admin_panel/dashbord';
import { useState, useEffect, createContext, useContext } from 'react';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AdminSideBar from './user_components/SideBar/AdminSideBar';
import AdminProfile from './frontend/admin_panel/AdminProfile';

import AddSupervisor from './frontend/admin_panel/AddSupervisor';
import AddMember from './frontend/admin_panel/AddMember';
import TicketManage from './frontend/admin_panel/TicketManage';
import EditMember from './frontend/admin_panel/EditMember';
import Tickets from './frontend/admin_panel/tickets';
import OpenTickets from './frontend/users_panel/openTickets';
import SystemRegistration from './frontend/admin_panel/SystemRegistration';
import TicketCategory from './frontend/admin_panel/TicketCategory';
import UserProfile from './frontend/users_panel/UserProfile';
import TicketViewPage from './frontend/admin_panel/TicketViewPage' 

// Create Auth Context - loggedInUser and setLoggedInUser
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Protected Route Component 
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isLoggedIn, userRole } = useAuth(); // loggedInUser is implicitly available via context
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

// App Routes Component 
const AppRoutes = ({ isLoggedIn, setIsLoggedIn, userRole, setUserRole, loggedInUser, setLoggedInUser }) => {
    const navigate = useNavigate();

    // handleLoginSuccess now accepts the full user object
    const handleLoginSuccess = (user) => {
        setIsLoggedIn(true);
        setUserRole(user.Role); 
        setLoggedInUser(user); // Set the full user object in state
        localStorage.setItem('user', JSON.stringify(user)); // Store full user object in localStorage
        localStorage.setItem('role', user.Role); 

        navigate(user.Role === 'admin' ? '/admin-dashboard' : '/user-dashboard');
    };

    const handleLogout = () => {
        localStorage.removeItem('user'); // Clear the full user object
        localStorage.removeItem('role'); 
        setIsLoggedIn(false);
        setUserRole(null);
        setLoggedInUser(null); // Clear loggedInUser from state
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, userRole, loggedInUser, setLoggedInUser, handleLoginSuccess, handleLogout }}>
            <Routes>
                <Route path='/' element={<Navigate to="/login" replace />} />
                <Route path='/register' element={<Register />} />
                <Route path='/login' element={<Login onLoginSuccess={handleLoginSuccess} />} />
                <Route path='/all-tickets' element={<UserDashboard />} />
                <Route path='/open-tickets' element={<OpenTickets />} />

                <Route
                    path='/user-dashboard'
                    element={
                        <ProtectedRoute allowedRoles={['user']}>
                            <UserDashboard />
                        </ProtectedRoute>
                    }
                />
                
                <Route
                    path='/user-profile'
                    element={
                        // UserProfile can be accessed by both 'user' and 'admin' roles
                        <ProtectedRoute allowedRoles={['user']}>
                            <UserProfile />
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
   <Route
                    path='/admin-dashboard'
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/tickets"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <Tickets />
                        </ProtectedRoute>
                    }
                />

                {/* Admin only routes */}
                <Route
                    path="/supervisor"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AddSupervisor />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/add-member"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AddMember />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ticket-manage"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <TicketManage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/edit-supervisor/:id"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <EditMember />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path='/system_registration'
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <SystemRegistration />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin-profile"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminProfile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path='/ticket_category'
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <TicketCategory />
                        </ProtectedRoute>
                    }
                />

                <Route path='/ticket_view_page/:id' element={[<TicketViewPage />]}/>

            </Routes>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </AuthContext.Provider>
    );
};

// Component to render sidebar conditionally based on route and role 
const RenderWithLayout = ({ isLoggedIn, userRole, setIsLoggedIn, setUserRole, loggedInUser, setLoggedInUser }) => {
    const location = useLocation();

    // Show AdminSideBar only for logged in admin and not on auth routes
    const showAdminSidebar =
        isLoggedIn &&
        userRole === 'admin' &&
        !['/login', '/register', '/'].includes(location.pathname);

    return (
        <div className="flex min-h-screen">
            {showAdminSidebar && <AdminSideBar />}
            <div className="flex-1">
                <AppRoutes
                    isLoggedIn={isLoggedIn}
                    setIsLoggedIn={setIsLoggedIn}
                    userRole={userRole}
                    setUserRole={setUserRole}
                    loggedInUser={loggedInUser} 
                    setLoggedInUser={setLoggedInUser} 
                />
            </div>
        </div>
    );
};

// Main App component 
function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [loggedInUser, setLoggedInUser] = useState(null); 

    useEffect(() => {
        const storedUser = localStorage.getItem('user'); 
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setIsLoggedIn(true);
                setUserRole(user.Role); 
                setLoggedInUser(user); 
            } catch (e) {
                console.error("Failed to parse user from localStorage", e);
               
                localStorage.removeItem('user');
                localStorage.removeItem('role');
                
            }
        }
    }, []);

    return (
        <BrowserRouter>
            <RenderWithLayout
                isLoggedIn={isLoggedIn}
                userRole={userRole}
                setIsLoggedIn={setIsLoggedIn}
                setUserRole={setUserRole}
                loggedInUser={loggedInUser} 
                setLoggedInUser={setLoggedInUser}
            />
        </BrowserRouter>
    );
}

export default App;