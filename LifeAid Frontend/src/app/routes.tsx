import { createBrowserRouter } from 'react-router';
import LandingPage from './pages/LandingPage';
import RoleSelection from './pages/RoleSelection';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import DonorDashboard from './pages/DonorDashboard';
import OrganizationDashboard from './pages/OrganizationDashboard';
import CaseDetails from './pages/CaseDetails';
import PatientOnboarding from './pages/PatientOnboarding';
import PatientMedicalUpload from './pages/PatientMedicalUpload';
import DoctorOnboarding from './pages/DoctorOnboarding';
import DoctorLicenseUpload from './pages/DoctorLicenseUpload';
import VerifiedRequests from './pages/VerifiedRequests';
import DonationCheckout from './pages/DonationCheckout';
import NotificationsPage from './pages/NotificationsPage';
import ChatbotSupportPage from './components/ChatbotSupportPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminRequests from './pages/AdminRequests';
import AdminDoctors from './pages/AdminDoctors';
import ReportsAnalytics from './pages/ReportsAnalytics';
import ProtectedRoute from './components/ProtectedRoute';


export const router = createBrowserRouter([
  {
    path: '/',
    Component: LandingPage,
  },
  {
    path: '/role-selection',
    Component: RoleSelection,
  },
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/register',
    Component: Register,
  },
  {
    path: '/patient-onboarding',
    element: (
      <ProtectedRoute allowedRoles={['patient']}>
        <PatientOnboarding />
      </ProtectedRoute>
    ),
  },
  {
    path: '/patient/upload-docs',
    element: (
      <ProtectedRoute allowedRoles={['patient']}>
        <PatientMedicalUpload />
      </ProtectedRoute>
    ),
  },
  {
    path: '/doctor-onboarding',
    element: (
      <ProtectedRoute allowedRoles={['doctor']}>
        <DoctorOnboarding />
      </ProtectedRoute>
    ),
  },
  {
    path: '/doctor/upload-license',
    element: (
      <ProtectedRoute allowedRoles={['doctor']}>
        <DoctorLicenseUpload />
      </ProtectedRoute>
    ),
  },
  {
    path: '/patient-dashboard',
    element: (
      <ProtectedRoute allowedRoles={['patient']}>
        <PatientDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/doctor-dashboard',
    element: (
      <ProtectedRoute allowedRoles={['doctor']}>
        <DoctorDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/donor-dashboard',
    element: (
      <ProtectedRoute allowedRoles={['donor']}>
        <DonorDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/organization-dashboard',
    element: (
      <ProtectedRoute allowedRoles={['organization']}>
        <OrganizationDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/requests',
    Component: VerifiedRequests,
  },
  {
    path: '/checkout',
    Component: DonationCheckout,
  },
  {
    path: '/notifications',
    element: (
      <ProtectedRoute>
        <NotificationsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/support',
    Component: ChatbotSupportPage,
  },
  {
    path: '/admin-login',
    Component: AdminLogin,
  },
  {
    path: '/admin-dashboard',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/requests',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminRequests />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/doctors',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminDoctors />
      </ProtectedRoute>
    ),
  },
  {
    path: '/reports',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <ReportsAnalytics />
      </ProtectedRoute>
    ),
  },
  
  {
    path: '/case/:id',
    Component: CaseDetails,
  },
]);
