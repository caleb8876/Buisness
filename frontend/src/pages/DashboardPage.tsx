import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface Space {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

interface Plan {
  id: string;
  space_id: string;
  status: string;
  created_at: string;
}

export default function DashboardPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    fetch('/api/plans/spaces', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setSpaces).catch(() => {});
    fetch('/api/plans/', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setPlans).catch(() => {});
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Spaces</h1>
        <Link to="/new-space" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
          + New Space
        </Link>
      </div>
      {spaces.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <p className="text-xl text-gray-500 mb-4">No spaces yet</p>
          <Link to="/new-space" className="text-indigo-600 font-semibold">Upload your first space →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaces.map(space => (
            <div key={space.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-2">{space.title}</h3>
              <p className="text-gray-500 text-sm mb-3">{space.description}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs ${space.status === 'planned' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {space.status}
              </span>
              <div className="mt-4">
                <Link to={`/plans/${space.id}`} className="text-indigo-600 text-sm hover:underline">
                  View Plan →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      {plans.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Your Plans</h2>
          <div className="space-y-3">
            {plans.map(plan => (
              <div key={plan.id} className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between">
                <span>Plan for space {plan.space_id.substring(0, 8)}...</span>
                <span className="text-gray-500 text-sm">{plan.created_at}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}