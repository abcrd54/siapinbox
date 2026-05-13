import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_480px]">
      <section className="hidden border-r border-line bg-ink p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-white text-sm font-bold text-ink">SI</div>
          <h1 className="mt-8 max-w-xl text-4xl font-semibold">Internal inbox untuk address random, OTP, dan API automation.</h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-white/65">
            Dashboard kerja untuk membuat address, membaca pesan masuk, dan menghubungkan Cloudflare Email Routing ke Supabase.
          </p>
        </div>
        <div className="text-xs text-white/45">SiapInbox operational dashboard</div>
      </section>
      <section className="flex items-center justify-center px-4 py-10">
        <LoginForm />
      </section>
    </main>
  );
}
