import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import Login from '@/pages/Login';
import Overview from '@/pages/Overview';
import ActivityPage from '@/pages/Activity';
import Claims from '@/pages/Claims';
import ClaimDetail from '@/pages/ClaimDetail';
import NeedsHuman from '@/pages/NeedsHuman';
import Documents from '@/pages/Documents';
import Queries from '@/pages/Queries';
import Policies from '@/pages/Policies';
import Users from '@/pages/Users';
import Analytics from '@/pages/Analytics';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AppLayout />}>
        <Route index element={<Overview />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="claims" element={<Claims />} />
        <Route path="claims/:id" element={<ClaimDetail />} />
        <Route path="needs-human" element={<NeedsHuman />} />
        <Route path="documents" element={<Documents />} />
        <Route path="queries" element={<Queries />} />
        <Route path="policies" element={<Policies />} />
        <Route path="users" element={<Users />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
