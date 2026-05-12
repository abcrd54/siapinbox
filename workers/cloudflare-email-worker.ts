interface Env {
  INBOUND_API_URL: string;
  INBOUND_EMAIL_SECRET: string;
}

interface WorkerEmailHeaders {
  get(name: string): string | null;
  [Symbol.iterator](): IterableIterator<[string, string]>;
}

interface ForwardableEmailMessage {
  from: string;
  to: string;
  raw: ReadableStream<Uint8Array>;
  headers: WorkerEmailHeaders;
  setReject(reason: string): void;
}

export default {
  async email(message: ForwardableEmailMessage, env: Env) {
    const rawEmail = await new Response(message.raw).text();

    const payload = {
      message_id: message.headers.get("message-id"),
      from_email: message.from,
      to_email: message.to,
      subject: message.headers.get("subject"),
      text_body: rawEmail,
      raw_headers: Object.fromEntries(message.headers),
      raw_payload: {
        raw: rawEmail
      }
    };

    const response = await fetch(env.INBOUND_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.INBOUND_EMAIL_SECRET}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      message.setReject("Email address not accepted by SiapInbox");
    }
  }
};
