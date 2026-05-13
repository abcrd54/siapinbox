import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="rounded-lg border border-line bg-white p-10 text-center shadow-panel">
        <h1 className="text-3xl font-semibold">Halaman tidak ditemukan</h1>
        <p className="mt-3 text-sm text-slate-600">Route yang kamu akses belum tersedia atau datanya tidak ada.</p>
        <Link href="/dashboard" className="mt-6 inline-flex rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white">
          Kembali ke dashboard
        </Link>
      </div>
    </main>
  );
}
