import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };

export function createSiteServer() {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      const pathname = decodeURIComponent(url.pathname);
      if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return; }
      let canonical = pathname;
      if (canonical.endsWith('/index.html')) canonical = canonical.slice(0, -11) || '/';
      else if (canonical.endsWith('.html') && !canonical.endsWith('/404.html')) canonical = canonical.slice(0, -5);
      if (canonical.length > 1 && canonical.endsWith('/')) canonical = canonical.slice(0, -1);
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
