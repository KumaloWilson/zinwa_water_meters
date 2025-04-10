import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';

// render- Dashboard
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/default')));
const AdminDashboard = Loadable(lazy(() => import('pages/dashboard/admin-dashboard')));


// render - color
const Color = Loadable(lazy(() => import('pages/component-overview/color')));
const RateManagement = Loadable(lazy(() => import('pages/rates/RatesManagement')));
const TokenManagement = Loadable(lazy(() => import('pages/tokens/TokenManagement')));
const PaymentManagement = Loadable(lazy(() => import('pages/payments/PaymentManagement')));
const Properties = Loadable(lazy(() => import('pages/properties/PropertyManagement')));
const Users = Loadable(lazy(() => import('pages/user-management/UserManagement')));
const Typography = Loadable(lazy(() => import('pages/component-overview/typography')));
const Shadow = Loadable(lazy(() => import('pages/component-overview/shadows')));

// render - sample page
const SamplePage = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const LoginPage = Loadable(lazy(() => import('pages/auth/Login')));


// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <DashboardLayout />,
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        },
        
      ]
    },
    // {
    //   path: 'default',
    //   element: <DashboardDefault />
    // },
    {
      path: 'admin-dashboard',
      element: <AdminDashboard />
    },
    {
      path: 'typography',
      element: <Typography />
    },
    {
      path: 'color',
      element: <Color />
    },
    {
      path: 'shadow',
      element: <Shadow />
    },
    {
      path: 'sample-page',
      element: <SamplePage />
    },
    {
      path: 'users',
      element: <Users />
    },
    {
      path: 'properties',
      element: <Properties />
    },
    {
      path: 'payments',
      element: <PaymentManagement />
    },
    {
      path: 'tokens',
      element: <TokenManagement />
    },
    {
      path: 'rates',
      element: <RateManagement />
    },
    // /RateManagement
    

  ]
};

export default MainRoutes;
