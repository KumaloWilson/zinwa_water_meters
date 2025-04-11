import { createBrowserRouter, Navigate } from 'react-router-dom';

// project imports
import MainRoutes from './MainRoutes';
import LoginRoutes from './LoginRoutes';
import authService from '../services/authService/authService';

// Protected route wrapper with role-based access control
const ProtectedRoute = ({ children }) => {
  if (!authService.isAuthenticated()) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }
  
  // Check if user has required role (admin or super_admin)
  if (!authService.isAuthorized()) {
    // Clear invalid session and redirect to login
    authService.logout();
    return <Navigate 
      to="/login" 
      replace 
      state={{ 
        authError: 'Access denied. Only administrators can access this system.' 
      }} 
    />;
  }
  
  return children;
};

// Modify MainRoutes to include protection
const protectedMainRoutes = { 
  ...MainRoutes, 
  element: <ProtectedRoute>{MainRoutes.element}</ProtectedRoute>,
  children: MainRoutes.children.map(route => ({ 
    ...route, 
    element: <ProtectedRoute>{route.element}</ProtectedRoute> 
  })) 
};

// Public routes (like login) don't need protection
const publicRoutes = { 
  path: '/', 
  children: [
    { path: '/', element: <Navigate to="/login" replace /> },
    ...LoginRoutes.children
  ] 
};

// Create the router with public routes first
const router = createBrowserRouter(
  [publicRoutes, protectedMainRoutes], 
  { basename: import.meta.env.VITE_APP_BASE_NAME }
);

export default router;