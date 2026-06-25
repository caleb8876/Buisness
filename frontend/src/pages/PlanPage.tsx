import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

interface PlanData {
  id: string;
  space_id: string;
  plan_data: { layout: { zones: any[]; recommendations: string[] }; space_title: string };
  shopping_list: { items: any[]; total_estimated: number };
  created_at: string;
}

export default function PlanPage() {
  const { id } = useParams();
  const [plan, setPlan] = useState<PlanData | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`/api/plans/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setPlan).catch(console.error);
  }, [id]);

  if (!plan) return <div className="text-center py-20 text-gray-500">Loading plan...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/dashboard" className="text-indigo-600 mb-4 inline-block">← Back to Dashboard</Link>
      <h1 className="text-3xl font-bold mb-2">{plan.plan_data?.space_title || 'Organization Plan'}</h1>
      <p className="text-gray-500 mb-8">Created {plan.created_at}</p>

      {plan.plan_data?.layout && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Layout Zones</h2>
          <div className="space-y-3">
            {plan.plan_data.layout.zones.map((zone: any, i: number) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium">{zone.name}</h3>
                <p className="text-gray-600 text-sm">{zone.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Recommendations</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {plan.plan_data.layout.recommendations.map((r: string, i: number) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {plan.shopping_list?.items && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Shopping List</h2>
          <div className="space-y-3">
            {plan.shopping_list.items.map((item: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-sm text-gray-500">{item.retailer} · {item.category}</p>
                </div>
                <span className="font-semibold">${item.price?.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-lg font-bold">
            <span>Total Estimated</span>
            <span>${plan.shopping_list.total_estimated?.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}