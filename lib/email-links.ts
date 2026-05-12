export interface ExtractedEmailLink {
  url: string;
  text: string;
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function stripTags(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function extractLinksFromHtml(html: string | null | undefined) {
  if (!html) {
    return [] as ExtractedEmailLink[];
  }

  const regex = /<a\b[^>]*href=(?:"([^"]+)"|'([^']+)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/gi;
  const links: ExtractedEmailLink[] = [];
  const seen = new Set<string>();

  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const href = decodeHtmlEntities((match[1] || match[2] || match[3] || "").trim());
    const text = decodeHtmlEntities(stripTags(match[4] || ""));

    if (!href || seen.has(href)) {
      continue;
    }

    seen.add(href);
    links.push({
      url: href,
      text: text || href
    });
  }

  return links;
}

export function pickPrimaryLink(links: ExtractedEmailLink[]) {
  if (!links.length) {
    return null;
  }

  const priorityPatterns = [
    /verify/i,
    /confirm/i,
    /activate/i,
    /reset/i,
    /magic/i,
    /login/i,
    /sign in/i,
    /otp/i
  ];

  for (const pattern of priorityPatterns) {
    const match = links.find((link) => pattern.test(link.text) || pattern.test(link.url));
    if (match) {
      return match;
    }
  }

  return links[0];
}
