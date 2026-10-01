import { load } from "cheerio";
import MarkdownIt from "markdown-it";

const markdown = new MarkdownIt({ html: true, linkify: false });

export function extractNewsletterLinks(source, { baseUrl = "https://tritonai.ucsd.edu/" } = {}) {
  const $ = load(markdown.render(source), { decodeEntities: false });
  const links = new Set();

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");
    if (!href) return;

    try {
      const url = new URL(href, baseUrl);
      if (!["http:", "https:"].includes(url.protocol)) return;
      url.hash = "";
      links.add(url.href);
    } catch {
      // Invalid destinations are removed by the sync sanitizer before this check.
    }
  });

  return [...links];
}

export async function checkNewsletterLink(
  url,
  { fetchImpl = fetch, timeoutMs = 15_000, userAgent = "TritonAI-Website-Newsletter-Link-Check/1.0" } = {},
) {
  const attempts = [];

  for (const method of ["HEAD", "GET", "GET"]) {
    try {
      const response = await fetchImpl(url, {
        method,
        headers: {
          Accept: "text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8",
          "User-Agent": userAgent,
        },
        redirect: "follow",
        signal: AbortSignal.timeout(timeoutMs),
      });
      const attempt = {
        method,
        status: response.status,
        ok: response.ok,
        finalUrl: response.url || url,
      };
      attempts.push(attempt);
      await response.body?.cancel().catch(() => {});
      if (response.ok) return { url, ok: true, ...attempt, attempts };
    } catch (error) {
      attempts.push({
        method,
        status: "FETCH_ERROR",
        ok: false,
        error: error.name === "TimeoutError" ? "Timed out" : error.message,
      });
    }
  }

  return { url, ok: false, ...attempts.at(-1), attempts };
}

export async function checkNewsletterLinks(urls, { concurrency = 6, ...options } = {}) {
  const results = new Array(urls.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < urls.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await checkNewsletterLink(urls[index], options);
    }
  }

  const workerCount = Math.min(Math.max(1, concurrency), Math.max(1, urls.length));
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}
