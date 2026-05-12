import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(217,119,6,0.22),_transparent_28%),radial-gradient(circle_at_bottom,_rgba(20,83,45,0.14),_transparent_32%)]" />
      <LoginForm />
    </main>
  );
}
