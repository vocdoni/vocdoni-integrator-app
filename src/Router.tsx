import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import OrgGuard from '~/components/Integrator/OrgGuard'
import DashboardLayout from '~/components/Layout/DashboardLayout'
import ProtectedRoute from '~/auth/ProtectedRoute'
import ForgotPassword from '~/pages/auth/ForgotPassword'
import Login from '~/pages/auth/Login'
import Register from '~/pages/auth/Register'
import ResetPassword from '~/pages/auth/ResetPassword'
import Verify from '~/pages/auth/Verify'
import ConfigurationPage from '~/pages/Configuration'
import ManagedOrganizationsPage from '~/pages/ManagedOrganizations'
import OverviewPage from '~/pages/Overview'
import { Routes } from '~/routes'

const router = createBrowserRouter([
  { path: Routes.auth.login, element: <Login /> },
  { path: Routes.auth.register, element: <Register /> },
  { path: Routes.auth.verify, element: <Verify /> },
  { path: Routes.auth.forgotPassword, element: <ForgotPassword /> },
  { path: Routes.auth.resetPassword, element: <ResetPassword /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            element: <OrgGuard />,
            children: [
              { path: Routes.dashboard.overview, element: <OverviewPage /> },
              { path: Routes.dashboard.organizations, element: <ManagedOrganizationsPage /> },
              { path: Routes.dashboard.configuration, element: <ConfigurationPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to={Routes.dashboard.overview} replace /> },
])

export const AppRouter = () => <RouterProvider router={router} />
