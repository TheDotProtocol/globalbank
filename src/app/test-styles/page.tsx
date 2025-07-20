import Link from 'next/link';

export default function TestStylesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Tailwind CSS Test Page
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Gradient Background Test */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg text-white">
            <h2 className="text-2xl font-semibold mb-4">Gradient Background</h2>
            <p>This should show a blue to purple gradient background.</p>
          </div>
          
          {/* Animation Test */}
          <div className="bg-white p-6 rounded-lg shadow-lg animate-pulse">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Pulse Animation</h2>
            <p className="text-gray-600">This card should have a pulse animation.</p>
          </div>
          
          {/* Color Test */}
          <div className="bg-red-500 p-6 rounded-lg text-white">
            <h2 className="text-2xl font-semibold mb-4">Red Background</h2>
            <p>This should have a red background.</p>
          </div>
          
          {/* Hover Effect Test */}
          <div className="bg-green-500 p-6 rounded-lg text-white hover:bg-green-600 transition-colors cursor-pointer">
            <h2 className="text-2xl font-semibold mb-4">Hover Effect</h2>
            <p>Hover over this card to see the color change.</p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 