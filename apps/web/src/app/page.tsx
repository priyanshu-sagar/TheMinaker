export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">🚌 TheMinaker</h1>
        <p className="mt-4 text-lg text-gray-600">
          School ERP &amp; Transit Tracking SaaS
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <a
            href="/login"
            className="rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            School Admin Login
          </a>
          <a
            href="/super-admin/login"
            className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
          >
            Super Admin
          </a>
        </div>
      </div>
    </main>
  );
}
