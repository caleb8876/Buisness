import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [kpi, setKpi] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('/api/admin/kpi', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setKpi).catch(() => {});
    fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setUsers).catch(() => {});
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      {kpi && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-500 text-sm">Total Users</p>
            <p className="text-3xl font-bold">{kpi.total_users}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-500 text-sm">Total Plans</p>
            <p className="text-3xl font-bold">{kpi.total_plans}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-500 text-sm">Revenue</p>
            <p className="text-3xl font-bold">${kpi.total_revenue?.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-500 text-sm">Active Subs</p>
            <p className="text-3xl font-bold">{kpi.active_subscriptions}</p>
          </div>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-4">Users</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Subscription</th>
              <th className="text-left p-4">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id} className="border-t border-gray-100">
                <td className="p-4">{u.email}</td>
                <td className="p-4">{u.name}</td>
                <td className="p-4">{u.subscription_status}</td>
                <td className="p-4">{u.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}