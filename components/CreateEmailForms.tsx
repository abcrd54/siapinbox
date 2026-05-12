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
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <Card className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Create Address</h2>
          <p className="mt-2 text-sm text-slate-600">Buat alamat random untuk testing cepat atau custom untuk alamat tetap.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMode("random")}
            className={`rounded-2xl px-4 py-3 text-sm font-medium ${mode === "random" ? "bg-ink text-white" : "bg-slate-100 text-slate-700"}`}
          >
            Random
          </button>
          <button
            type="button"
            onClick={() => setMode("custom")}
            className={`rounded-2xl px-4 py-3 text-sm font-medium ${mode === "custom" ? "bg-ink text-white" : "bg-slate-100 text-slate-700"}`}
          >
            Custom
          </button>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          {mode === "random"
            ? "Format random: {prefix}-{random}@domain. Cocok untuk OTP, lead, dan test automation."
            : "Format custom: local_part@domain. Cocok untuk inbox tetap seperti support, demo, atau client-specific."}
        </div>
      </Card>

      <Card>
        <form className="space-y-4" onSubmit={submit}>
          {mode === "random" ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">Prefix</label>
              <Input
                value={state.prefix}
                onChange={(event) => setState((current) => ({ ...current, prefix: event.target.value }))}
                placeholder="lead, otp-test, inbox"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium">Local Part</label>
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
              <label className="text-sm font-medium">Label</label>
              <Input
                value={state.label}
                onChange={(event) => setState((current) => ({ ...current, label: event.target.value }))}
                placeholder="Lead Website"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Project</label>
              <Input
                value={state.project}
                onChange={(event) => setState((current) => ({ ...current, project: event.target.value }))}
                placeholder="siapdigital-main"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Purpose</label>
            <Textarea
              value={state.purpose}
              onChange={(event) => setState((current) => ({ ...current, purpose: event.target.value }))}
              placeholder="Kegunaan alamat email ini"
            />
          </div>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          {message ? <p className="text-sm text-emerald-700">Berhasil: {message}</p> : null}

          <Button type="submit" disabled={pending}>
            {pending ? "Menyimpan..." : "Create email"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
