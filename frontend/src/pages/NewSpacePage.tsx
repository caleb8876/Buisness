import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NewSpacePage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('dimensions', dimensions);
      const res = await fetch('/api/plans/spaces', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });
      const space = await res.json();
      // Now generate a plan
      await fetch(`/api/plans/generate/${space.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Describe Your Space</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Space Name *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="e.g., Master Closet, Pantry, Garage"
            className="w-full p-3 border border-gray-300 rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Describe what needs organizing. What's in the space? What's the biggest challenge?"
            className="w-full p-3 border border-gray-300 rounded-lg h-32" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions (approx)</label>
          <input type="text" value={dimensions} onChange={e => setDimensions(e.target.value)}
            placeholder="e.g., 8ft x 10ft"
            className="w-full p-3 border border-gray-300 rounded-lg" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50">
          {loading ? 'Creating Plan...' : 'Generate Organization Plan — $9.99'}
        </button>
      </form>
    </div>
  );
}