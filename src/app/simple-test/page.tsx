export default function SimpleTestPage() {
  return (
    <div className="min-h-screen bg-red-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          Tailwind CSS Test
        </h1>
        <p className="text-gray-700">
          If you can see this with red background and blue text, Tailwind is working!
        </p>
        <div className="mt-4">
          <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Test Button
          </button>
        </div>
      </div>
    </div>
  );
} 