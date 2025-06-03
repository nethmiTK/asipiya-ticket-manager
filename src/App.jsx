// src/App.jsx
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Register from "./frontend/Authenication/Register";
import Login from "./frontend/Authenication/Login";
import UserDashboard from "./frontend/users_panel/usersDashboard";
import Dashboard from "./frontend/admin_panel/dashbord";
import { useState, useEffect, createContext, useContext } from "react";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AdminSideBar from "./user_components/SideBar/AdminSideBar";
import AdminProfile from "./frontend/admin_panel/AdminProfile";

import AddSupervisor from "./frontend/admin_panel/AddSupervisor";
import AddMember from "./frontend/admin_panel/AddMember";
import TicketManage from "./frontend/admin_panel/TicketManage";
import EditMember from "./frontend/admin_panel/EditMember";
import Tickets from "./frontend/admin_panel/tickets";
import OpenTickets from "./frontend/users_panel/openTickets";
import SystemRegistration from "./frontend/admin_panel/SystemRegistration";
import TicketCategory from "./frontend/admin_panel/TicketCategory";
import UserProfile from "./frontend/users_panel/UserProfile";
import TicketViewPage from "./frontend/admin_panel/TicketViewPage";
import TicketRequest from "./frontend/admin_panel/TicketRequest";
import ForgotPassword from "./frontend/Authenication/ForgotPassword"; 
import ResetPassword from "./frontend/Authenication/ResetPassword"; 
import PendingTicket from "./frontend/admin_panel/PendingTicket"
import SupervisorAssign from "./frontend/admin_panel/SupervisorAssign"
import TicketView from "./frontend/users_panel/TicketView";

// Create Auth Context - loggedInUser and setLoggedInUser
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isLoggedIn, userRole } = useAuth();
    const navigate = useNavigate();

    // This handles cases where userRole might be null initially or undefined
    const normalizedUserRole = userRole ? userRole.toLowerCase() : '';

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login', { replace: true });
            return;
        }

        // Check if the normalized user role is in the allowedRoles array
        if (allowedRoles && !allowedRoles.includes(normalizedUserRole)) {
            alert('Access Denied');
            if (['admin', 'supervisor', 'manager', 'developer'].includes(normalizedUserRole)) {
                navigate('/admin-dashboard', { replace: true });
            } else if (normalizedUserRole === 'user') {
                navigate('/user-dashboard', { replace: true });
            } else {
                // Fallback for any unknown or non-logged-in roles
                navigate('/login', { replace: true });
            }
            return; 
        }
    }, [isLoggedIn, normalizedUserRole, allowedRoles, navigate]);

    if (!isLoggedIn || (allowedRoles && !allowedRoles.includes(normalizedUserRole))) return null;
    return children;
};

// App Routes Component
const AppRoutes = ({
  isLoggedIn,
  setIsLoggedIn,
  userRole,
  setUserRole,
  loggedInUser,
  setLoggedInUser,
}) => {
  const navigate = useNavigate();

    // handleLoginSuccess now accepts the full user object
    const handleLoginSuccess = (user) => {
        setIsLoggedIn(true);
        const normalizedRole = user.Role.toLowerCase(); 
        setUserRole(normalizedRole);
        setLoggedInUser(user); 
        localStorage.setItem('user', JSON.stringify(user)); 
        localStorage.setItem('role', normalizedRole); 

        // Navigate based on the clarified role logic 
        if (['admin', 'supervisor', 'manager', 'developer'].includes(normalizedRole)) {
            navigate('/admin-dashboard');
        } else if (normalizedRole === 'user') {
            navigate('/user-dashboard');
        } else {
            navigate('/login');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user'); 
        localStorage.removeItem('role');
        setIsLoggedIn(false);
        setUserRole(null);
        setLoggedInUser(null); 
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, userRole, loggedInUser, setLoggedInUser, handleLoginSuccess, handleLogout }}>
            <Routes>
                <Route path='/' element={<Navigate to="/login" replace />} />
                <Route path='/register' element={<Register />} />
                <Route path='/login' element={<Login onLoginSuccess={handleLoginSuccess} />} />
                <Route path='/forgot-password' element={<ForgotPassword />} />
                <Route path='/reset-password' element={<ResetPassword />} /> 
                <Route path='/all-tickets' element={<UserDashboard />} /> 
                <Route path='/open-tickets' element={<OpenTickets />} /> 
                <Route path='/ticket-view' element={<TicketView />} />
                <Route
                    path='/user-dashboard'
                    element={
                        <ProtectedRoute allowedRoles={['user']}> {/* Only 'user' can access user dashboard */}
                            <UserDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path='/user-profile'
                    element={
                        <ProtectedRoute allowedRoles={['user']}>
                            <UserProfile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path='/admin-dashboard'
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'supervisor', 'manager', 'developer']}>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
               
                <Route
                    path="/tickets"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'supervisor', 'manager', 'developer']}>
                            <Tickets />
                        </ProtectedRoute>
                    }
                />

                {/* Admin only routes  */}
                <Route
                    path="/supervisor"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'supervisor', 'manager', 'developer']}>
                            <AddSupervisor />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/add-member"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'supervisor', 'manager', 'developer']}>
                            <AddMember />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ticket-manage"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'supervisor', 'manager', 'developer']}>
                            <TicketManage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/edit-supervisor/:id"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'supervisor', 'manager', 'developer']}>
                            <EditMember />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path='/system_registration'
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'supervisor', 'manager', 'developer']}>
                            <SystemRegistration />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin-profile"
                    element={
                        // AdminProfile accessible to all admin-side roles
                        <ProtectedRoute allowedRoles={['admin', 'supervisor', 'manager', 'developer']}>
                            <AdminProfile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path='/ticket_category'
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'supervisor', 'manager', 'developer']}>
                            <TicketCategory />
                        </ProtectedRoute>
                    }
                />

                <Route path='/ticket_view_page/:id' element={[<TicketViewPage />]} />

                <Route path='/pending_ticket' element={
                    <ProtectedRoute>
                        <PendingTicket />
                    </ProtectedRoute>
                }/>
                <Route path='supervisor_assign/:id' element={[<SupervisorAssign/>]}/>

        <Route path="/ticket_view_page/:id" element={[<TicketViewPage />]} />
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
const RenderWithLayout = ({
  isLoggedIn,
  userRole,
  setIsLoggedIn,
  setUserRole,
  loggedInUser,
  setLoggedInUser,
}) => {
  const location = useLocation();

    // Show AdminSideBar only for logged in admin-side roles and not on auth routes
    const showAdminSidebar =
        isLoggedIn &&
        (userRole ? ['admin', 'supervisor', 'manager', 'developer'].includes(userRole.toLowerCase()) : false) &&
        !['/login', '/register', '/', '/forgot-password', '/reset-password'].includes(location.pathname);

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
                setUserRole(user.Role.toLowerCase());
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
