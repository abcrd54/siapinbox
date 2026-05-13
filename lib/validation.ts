import { z } from "zod";

const optionalTrimmed = z.string().trim().min(1).max(120).optional().or(z.literal(""));
const nullableOptionalString = z.string().optional().nullable().or(z.literal(""));
const looseEmailString = z.string().trim().min(3).max(320).refine(
  (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  "Invalid email"
);

export const createRandomEmailSchema = z.object({
  prefix: z.string().trim().min(1).max(40).optional().default("inbox"),
  label: optionalTrimmed.transform((value) => value || undefined),
  project: optionalTrimmed.transform((value) => value || undefined),
  purpose: z.string().trim().max(240).optional().or(z.literal("")).transform((value) => value || undefined)
});

export const createCustomEmailSchema = z.object({
  local_part: z.string().trim().min(1).max(64),
  label: optionalTrimmed.transform((value) => value || undefined),
  project: optionalTrimmed.transform((value) => value || undefined),
  purpose: z.string().trim().max(240).optional().or(z.literal("")).transform((value) => value || undefined)
});

export const emailMessageUpdateSchema = z.object({
  status: z.enum(["unread", "read", "archived", "spam", "follow_up", "done"]).optional(),
  label: z.string().trim().min(1).max(60).optional()
});

export const inboundEmailSchema = z.object({
  message_id: nullableOptionalString,
  from_email: looseEmailString,
  from_name: nullableOptionalString,
  to_email: looseEmailString,
  subject: nullableOptionalString,
  text_body: nullableOptionalString,
  html_body: nullableOptionalString,
  raw_headers: z.record(z.unknown()).optional().nullable(),
  raw_payload: z.record(z.unknown()).optional().nullable(),
  attachments: z.array(z.unknown()).optional().nullable()
});

export const createApiKeySchema = z.object({
  name: z.string().trim().min(1).max(120),
  project: optionalTrimmed.transform((value) => value || undefined),
  permissions: z.array(z.string().trim().min(1)).min(1)
});
