import { z } from "zod";

const optionalTrimmed = z.string().trim().min(1).max(120).optional().or(z.literal(""));

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
  message_id: z.string().trim().max(255).optional().or(z.literal("")),
  from_email: z.string().email(),
  from_name: z.string().trim().max(255).optional().or(z.literal("")),
  to_email: z.string().email(),
  subject: z.string().trim().max(500).optional().or(z.literal("")),
  text_body: z.string().optional().or(z.literal("")),
  html_body: z.string().optional().or(z.literal("")),
  raw_headers: z.record(z.unknown()).optional(),
  raw_payload: z.record(z.unknown()).optional(),
  attachments: z.array(z.unknown()).optional()
});

export const createApiKeySchema = z.object({
  name: z.string().trim().min(1).max(120),
  project: optionalTrimmed.transform((value) => value || undefined),
  permissions: z.array(z.string().trim().min(1)).min(1)
});
