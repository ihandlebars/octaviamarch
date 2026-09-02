// Minimal static file server — no dependencies.
// Exists only because GoDaddy's Node.js Hosting needs something to run;
// it just serves the site's own files (index.html, css/, js/, assets/) as-is.

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

function sendFile(req, res, filePath, contentType) {
  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    // Support Range requests so the reel video can be scrubbed/seeked
    // instead of always downloading from the start.
    const range = req.headers.range;
    if (range) {
      const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
      const start = parseInt(startStr, 10);
      const end = endStr ? parseInt(endStr, 10) : stats.size - 1;
      const chunkSize = end - start + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': stats.size,
        'Accept-Ranges': 'bytes',
        'Content-Type': contentType,
      });
      fs.createReadStream(filePath).pipe(res);
    }
  });
}

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';

  const filePath = path.normalize(path.join(ROOT, reqPath));

  // Prevent serving anything outside the project root.
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Unknown path — fall back to index.html rather than a bare 404.
      sendFile(req, res, path.join(ROOT, 'index.html'), 'text/html; charset=utf-8');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    sendFile(req, res, filePath, contentType);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Octavia March site serving on port ${PORT}`);
});
