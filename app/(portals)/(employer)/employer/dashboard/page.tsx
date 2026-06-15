'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import EmployerDashboard from './EmployerDashboard';

export default function EmployerDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const sessionRes = await fetch('/api/auth/me');
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        const role = String(sessionData.user?.role || '').toUpperCase();
        if (!sessionData.user || (role !== 'EMPLOYER' && role !== 'CLIENT')) {
          router.push('/login');
          return;
        }
        const res = await fetch('/api/employer/dashboard');
        if (res.ok) setData(await res.json());
      } else {
        router.push('/login');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    router.push('/');
  };

  if (loading || !data) return <div className="h-screen bg-slate-50 flex items-center justify-center">Loading dashboard...</div>;

  return <EmployerDashboard data={data} user={data.user} onRefresh={fetchDashboardData} onLogout={handleLogout} />;
}
