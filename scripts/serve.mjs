import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleInquiry } from '../lib/inquiry.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
// Mirror the permanent redirects that Vercel applies (vercel.json).
const vercel = JSON.parse(await readFile(path.resolve(root, '../vercel.json'), 'utf8'));
const redirects = new Map((vercel.redirects || []).map(r => [r.source, r.destination]));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };

// Local stand-in for the Vercel function: same checks, but nothing is emailed.
async function previewInquiry(req, res, send) {
  let raw = '';
  for await (const chunk of req) { raw += chunk; if (raw.length > 20000) break; }
  let body;
  try { body = JSON.parse(raw); } catch { body = null; }
  const result = await handleInquiry(body, { send, from: 'preview@localhost', to: 'preview@localhost' });
  res.writeHead(result.status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(result.body));
}

export function createSiteServer({ sendInquiry = async mail => console.log(`[preview] inquiry not sent: ${mail.subject}`) } = {}) {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname === '/api/inquiry' && req.method === 'POST') { await previewInquiry(req, res, sendInquiry); return; }
      const pathname = decodeURIComponent(url.pathname);
      if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return; }
      let canonical = pathname;
      if (canonical.endsWith('/index.html')) canonical = canonical.slice(0, -11) || '/';
      else if (canonical.endsWith('.html') && !canonical.endsWith('/404.html')) canonical = canonical.slice(0, -5);
      if (canonical.length > 1 && canonical.endsWith('/')) canonical = canonical.slice(0, -1);
      if (redirects.has(canonical)) canonical = redirects.get(canonical);
      if (canonical !== pathname) { res.writeHead(308, { Location: canonical + url.search }); res.end(); return; }
      let candidate = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
      if (!candidate.startsWith(root + path.sep)) { res.writeHead(404); res.end(); return; }
      const candidates = path.extname(candidate) ? [candidate] : [candidate + '.html', path.join(candidate, 'index.html')];
      let found;
      for (const filename of candidates) {
        try { if ((await stat(filename)).isFile()) { found = filename; break; } } catch {}
      }
      const status = found ? 200 : 404;
      if (!found) found = path.join(root, pathname.startsWith('/en/') ? 'en/404.html' : '404.html');
      const body = await readFile(found);
      res.writeHead(status, { 'Content-Type': types[path.extname(found)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Bad request');
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await import('./build.mjs');
  const port = Number(process.env.PORT || 4173);
  const server = createSiteServer();
  server.listen(port, '127.0.0.1', () => console.log(`COMMECT preview ready: http://127.0.0.1:${port}`));
}
