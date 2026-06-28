import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-slate-800 mb-4 select-none">404</div>
        <h1 className="text-3xl font-bold text-white mb-3">Page not found</h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          This page doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition">
            Go home
          </Link>
          <Link href="/dashboard" className="px-6 py-3 border border-slate-700 hover:border-slate-500 text-slate-300 font-semibold rounded-xl transition">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
