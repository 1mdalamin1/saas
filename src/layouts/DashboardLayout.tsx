import { Navigate, useNavigate } from 'react-router-dom';
import { ActiveModule } from '../types';
import { useAuth } from '../context/AuthContext';
import { useInstructorData } from '../hooks/useInstructorData';
import Dashboard from '../components/Dashboard';
import DiaryView from '../components/DiaryView';
import StudentsView from '../components/StudentsView';
import ProgressView from '../components/ProgressView';
import PaymentsView from '../components/PaymentsView';
import ResourcesView from '../components/ResourcesView';
import ProfilePage from '../pages/ProfilePage';

interface DashboardLayoutProps {
  module: ActiveModule;
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-24">
      <p className="text-sm text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
        Loading your data…
      </p>
    </div>
  );
}

export default function DashboardLayout({ module }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const data = useInstructorData();

  const validModules: ActiveModule[] = [
    'dashboard',
    'diary',
    'students',
    'progress',
    'payments',
    'resources',
    'profile',
  ];

  if (!validModules.includes(module)) {
    return <Navigate to="/dashboard" replace />;
  }

  const instructor = {
    id: user?.id ?? 'local',
    full_name: profile?.full_name ?? user?.email?.split('@')[0] ?? 'Instructor',
    email: user?.email ?? '',
    hourly_rate: profile?.hourly_rate ?? 42,
    avatar: profile?.avatar_url ?? undefined,
  };

  const setActive = (m: ActiveModule) => navigate(`/${m}`);

  if (module === 'profile') return <ProfilePage />;

  if (data.loading) return <LoadingState />;

  if (data.error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-4 text-sm text-red-700">
        {data.error}
      </div>
    );
  }

  if (module === 'dashboard') {
    return (
      <Dashboard
        instructor={instructor}
        students={data.students}
        lessons={data.lessons}
        payments={data.payments}
        onNavigate={setActive}
      />
    );
  }

  if (module === 'diary') {
    return (
      <DiaryView
        lessons={data.lessons}
        students={data.students}
        onAddLesson={data.addLesson}
        onUpdateLesson={data.updateLesson}
      />
    );
  }

  if (module === 'students') {
    return (
      <StudentsView
        students={data.students}
        onAdd={data.addStudent}
        onUpdate={data.updateStudent}
        onDelete={data.deleteStudent}
      />
    );
  }

  if (module === 'progress') {
    return (
      <ProgressView
        students={data.students}
        progress={data.progress}
        onUpdateProgress={data.updateProgress}
      />
    );
  }

  if (module === 'payments') {
    return (
      <PaymentsView
        students={data.students}
        payments={data.payments}
        lessons={data.lessons}
        instructor={instructor}
        onAddPayment={data.addPayment}
        onMarkPaid={data.markPaid}
      />
    );
  }

  if (module === 'resources') {
    return (
      <ResourcesView
        resources={data.resources}
        students={data.students}
        onAdd={data.addResource}
        onDelete={data.deleteResource}
      />
    );
  }

  return null;
}
