import { createBrowserRouter, Navigate } from 'react-router-dom';

// project imports
import MainRoutes from './MainRoutes';
import LoginRoutes from './LoginRoutes';
import authService from '../services/authService/authService';

// This is a simple auth check - replace with your actual auth logic
// const isAuthenticated = () => {
//   return localStorage.getItem('auth_token') !== null;
// };

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
    if (!authService.isAuthenticated()) {
      // Redirect to login if not authenticated
      return <Navigate to="/login" replace />;
    }
  
    return children;
  };

// Modify MainRoutes to include protection
const protectedMainRoutes = {
  ...MainRoutes,
  element: <ProtectedRoute>{MainRoutes.element}</ProtectedRoute>,
  children: MainRoutes.children.map(route => ({
    ...route,
    // You can choose which routes need protection
    element: <ProtectedRoute>{route.element}</ProtectedRoute>
  }))
};

// Public routes (like login) don't need protection
const publicRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: <Navigate to="/login" replace />
    },
    ...LoginRoutes.children
  ]
};

// Create the router with public routes first
const router = createBrowserRouter([publicRoutes, protectedMainRoutes], { 
  basename: import.meta.env.VITE_APP_BASE_NAME 
});

export default router;