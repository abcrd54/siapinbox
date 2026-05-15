"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button, Card, Input, Textarea } from "@/components/ui";

type FormMode = "random" | "custom";

const initialState = {
  prefix: "",
  localPart: "",
  label: "",
  project: "",
  purpose: ""
};

export function CreateEmailForms() {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>("random");
  const [state, setState] = useState(initialState);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    const endpoint = mode === "random" ? "/api/email-addresses/random" : "/api/email-addresses";
    const body =
      mode === "random"
        ? {
            prefix: state.prefix || "inbox",
            label: state.label,
            project: state.project,
            purpose: state.purpose
          }
        : {
            local_part: state.localPart,
            label: state.label,
            project: state.project,
            purpose: state.purpose
          };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    const result = await response.json();

    if (!response.ok) {
      setError(result.error || "Gagal membuat email");
      setPending(false);
      return;
    }

    setMessage(result.email_address?.email || result.email || "Berhasil dibuat");
    setState(initialState);
    setPending(false);
    router.refresh();
  }

  return (
    <div className="grid gap-5 2xl:grid-cols-[360px_minmax(0,1fr)]">
      <Card className="space-y-5 rounded-xl border border-line bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
        <div>
          <h2 className="text-lg font-semibold">Create Address</h2>
          <p className="mt-1 text-sm text-white/70">Buat alamat dari prefix atau local part tetap, lalu pantau inbox-nya.</p>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-xl bg-white/10 p-1">
          <button
            type="button"
            onClick={() => setMode("random")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${mode === "random" ? "bg-white text-ink shadow-sm" : "text-white/70 hover:text-white"}`}
          >
            Random
          </button>
          <button
            type="button"
            onClick={() => setMode("custom")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${mode === "custom" ? "bg-white text-ink shadow-sm" : "text-white/70 hover:text-white"}`}
          >
            Custom
          </button>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/10 p-4 text-sm text-white/80">
          {mode === "random"
            ? "Format random: {prefix}NN@domain. Dua digit angka acak akan ditambahkan tanpa tanda pisah."
            : "Format custom: local_part@domain. Cocok untuk inbox tetap seperti support, demo, atau client-specific."}
        </div>

        <div className="grid gap-3 text-sm text-white/80">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Quick Use</div>
            <div className="mt-2">Pakai mode `random` untuk hasil seperti `riskiridho11` atau `otptest42` tanpa tanda `-`.</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Persistent Use</div>
            <div className="mt-2">Pakai `custom` untuk inbox tetap seperti `support`, `sales`, atau alamat client-specific.</div>
          </div>
        </div>
      </Card>

      <Card className="rounded-xl p-0 overflow-hidden">
        <div className="border-b border-line bg-gradient-to-r from-slate-50 to-white px-6 py-5">
          <h3 className="text-lg font-semibold">{mode === "random" ? "Create Random Address" : "Create Custom Address"}</h3>
          <p className="mt-1 text-sm text-muted">Isi metadata seperlunya agar inbox lebih mudah dicari dan dikelola.</p>
        </div>

        <div className="p-6">
        <form className="space-y-4" onSubmit={submit}>
          {mode === "random" ? (
            <div className="space-y-2">
              <label className="text-sm font-semibold">Prefix</label>
              <Input
                value={state.prefix}
                onChange={(event) => setState((current) => ({ ...current, prefix: event.target.value }))}
                placeholder="lead, otp-test, inbox"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-semibold">Local Part</label>
              <Input
                value={state.localPart}
                onChange={(event) => setState((current) => ({ ...current, localPart: event.target.value }))}
                placeholder="support-project-a"
                required
              />
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Label</label>
              <Input
                value={state.label}
                onChange={(event) => setState((current) => ({ ...current, label: event.target.value }))}
                placeholder="Lead Website"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Project</label>
              <Input
                value={state.project}
                onChange={(event) => setState((current) => ({ ...current, project: event.target.value }))}
                placeholder="siapdigital-main"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Purpose</label>
            <Textarea
              value={state.purpose}
              onChange={(event) => setState((current) => ({ ...current, purpose: event.target.value }))}
              placeholder="Kegunaan alamat email ini"
            />
          </div>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          {message ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Berhasil: {message}</p> : null}

          <Button type="submit" disabled={pending}>
            {pending ? "Menyimpan..." : "Create email"}
          </Button>
        </form>
        </div>
      </Card>
    </div>
  );
}
