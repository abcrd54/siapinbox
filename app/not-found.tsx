import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="rounded-3xl border border-black/5 bg-white/90 p-10 text-center shadow-panel">
        <h1 className="text-3xl font-semibold">Halaman tidak ditemukan</h1>
        <p className="mt-3 text-sm text-slate-600">Route yang kamu akses belum tersedia atau datanya tidak ada.</p>
        <Link href="/dashboard" className="mt-6 inline-flex rounded-2xl bg-ink px-4 py-2 text-sm text-white">
          Kembali ke dashboard
        </Link>
      </div>
    </main>
  );
}
