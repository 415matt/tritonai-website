import http from "node:http";
import { createReadStream, statSync } from "node:fs";
import path from "node:path";

// Range-capable static preview server for dist/. The documented
// `python3 -m http.server` preview cannot serve HTTP range requests, which
// stalls video seeking; use this when previewing pages with media.
//   node scripts/dev-serve.mjs [port]

const root = path.resolve("dist");
const port = Number(process.argv[2] || 4173);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".mp4": "video/mp4",
  ".vtt": "text/vtt",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
};

http
  .createServer((request, response) => {
    let pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    if (pathname.endsWith("/")) pathname += "index.html";
    let file = path.normalize(path.join(root, pathname));
    if (!file.startsWith(root)) {
      response.writeHead(403).end();
      return;
    }
    let stats;
    try {
      stats = statSync(file);
      if (stats.isDirectory()) {
        file = path.join(file, "index.html");
        stats = statSync(file);
      }
    } catch {
      response.writeHead(404).end("not found");
      return;
    }
    const type = types[path.extname(file)] || "application/octet-stream";
    const range = request.headers.range?.match(/bytes=(\d*)-(\d*)/);
    if (range) {
      const start = range[1] ? Number(range[1]) : 0;
      const end = range[2] ? Number(range[2]) : stats.size - 1;
      response.writeHead(206, {
        "Content-Type": type,
        "Accept-Ranges": "bytes",
        "Content-Range": `bytes ${start}-${end}/${stats.size}`,
        "Content-Length": end - start + 1,
      });
      createReadStream(file, { start, end }).pipe(response);
      return;
    }
    response.writeHead(200, { "Content-Type": type, "Accept-Ranges": "bytes", "Content-Length": stats.size });
    createReadStream(file).pipe(response);
  })
  .listen(port, "127.0.0.1", () => console.log(`dist preview with range support on http://127.0.0.1:${port}/`));
