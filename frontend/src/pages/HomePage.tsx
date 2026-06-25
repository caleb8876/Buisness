import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Transform Your Space<br />
          <span className="text-indigo-600">In One Click</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          Upload a photo or describe any messy space. Get a custom organization plan 
          with exact product links to buy from Amazon, Target, IKEA, and more.
        </p>
        <div className="flex justify-center space-x-4">
          <Link to="/signup" className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 shadow-lg">
            Get Started — $9.99/plan
          </Link>
          <Link to="/new-space" className="border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-50">
            Try a Demo
          </Link>
        </div>
      </div>
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-3xl mb-4">📸</div>
          <h3 className="text-xl font-semibold mb-2">Snap a Photo</h3>
          <p className="text-gray-600">Upload a photo of your closet, pantry, garage, or any messy space.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-3xl mb-4">🤖</div>
          <h3 className="text-xl font-semibold mb-2">AI Generates a Plan</h3>
          <p className="text-gray-600">Our AI analyzes your space and creates a custom organization layout.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-3xl mb-4">🛒</div>
          <h3 className="text-xl font-semibold mb-2">Shop & Done</h3>
          <p className="text-gray-600">Get exact product links to buy everything you need in one click.</p>
        </div>
      </div>
    </div>
  );
}