import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Auth App</h1>
        <p className="text-xl text-gray-600 mb-8">OAuth Google Integration with Next.js & Express</p>
        <Link
          href="/login"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}